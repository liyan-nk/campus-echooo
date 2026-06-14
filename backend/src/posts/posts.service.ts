import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto, CreateCommentDto, VotePostDto } from "./dto/posts.dto";
import { ModerationService } from "../moderation/moderation.service";
import { EventsGateway } from "../realtime/events.gateway";
import { PostCategory } from "@prisma/client";

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private moderationService: ModerationService,
    private eventsGateway: EventsGateway,
  ) {}

  // 1. Create a Post
  async createPost(userId: string, dto: CreatePostDto) {
    // Fetch user profile to get universityId and departmentId
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException("User profile not found");
    }

    let anonymousProfileId: string | null = null;
    if (dto.anonymous) {
      // Find or create an anonymous profile
      const anonProfile = await this.prisma.anonymousProfile.findFirst({
        where: { userId },
      });
      if (!anonProfile) {
        throw new BadRequestException("No anonymous profile setup for this user");
      }
      anonymousProfileId = anonProfile.id;
    }

    return this.prisma.$transaction(async (tx) => {
      // Create the post
      const post = await tx.post.create({
        data: {
          title: dto.title,
          content: dto.content,
          anonymous: dto.anonymous,
          authorId: userId,
          anonymousProfileId,
          universityId: profile.universityId,
          departmentId: dto.departmentId || profile.departmentId,
          category: dto.category ?? PostCategory.FEED,
          postType: dto.poll ? "POLL" : (dto.mediaUrls?.length ? "IMAGE" : "TEXT"),
          mediaUrls: dto.mediaUrls || [],
        },
      });

      // If a poll is defined, create the poll and options
      if (dto.poll) {
        await tx.poll.create({
          data: {
            question: dto.poll.question,
            expiresAt: new Date(dto.poll.expiresAt),
            postId: post.id,
            options: {
              create: dto.poll.options.map((option) => ({ text: option })),
            },
          },
        });
      }

      // Add to Echo Score for publishing (+10 for official, +5 for anonymous)
      const scoreGain = dto.anonymous ? 5 : 10;
      await tx.profile.update({
        where: { userId },
        data: { echoScore: { increment: scoreGain } },
      });

      // Run AI Auto Flagging check
      await this.moderationService.autoFlagContent("POST", post.id, dto.title + " " + dto.content);

      const createdPost = await tx.post.findUnique({
        where: { id: post.id },
        include: {
          poll: { include: { options: true } },
          anonymousProfile: { select: { alias: true, avatarUrl: true } },
          author: {
            select: {
              profile: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });

      if (createdPost) {
        this.eventsGateway.sendNewPost(createdPost.universityId, createdPost);
      }

      return createdPost;
    });
  }

  // 2. Fetch Feed with algorithms (New, Hot, Trending, Top)
  async getFeed(universityId: string, algorithm: string = "new", category: string = "FEED") {
    const posts = await this.prisma.post.findMany({
      where: {
        universityId,
        category: category as any,
      },
      include: {
        poll: {
          include: {
            options: {
              include: {
                _count: { select: { votes: true } },
              },
            },
          },
        },
        anonymousProfile: { select: { id: true, alias: true, avatarUrl: true } },
        author: {
          select: {
            id: true,
            role: { select: { name: true } },
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        votes: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" }, // default sort
    });

    // Formatting helper
    const formatPosts = (list: any[]) =>
      list.map((post) => {
        const upvotes = post.votes.filter((v: any) => v.type === "UPVOTE").length;
        const downvotes = post.votes.filter((v: any) => v.type === "DOWNVOTE").length;
        const score = upvotes - downvotes;
        
        // Remove author details if anonymous
        const author = post.anonymous
          ? { alias: post.anonymousProfile?.alias || "Anonymous", avatarUrl: post.anonymousProfile?.avatarUrl }
          : {
              name: `${post.author.profile?.firstName} ${post.author.profile?.lastName}`,
              avatarUrl: post.author.profile?.avatarUrl,
              role: post.author.role.name,
            };

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          anonymous: post.anonymous,
          author,
          category: post.category,
          postType: post.postType,
          mediaUrls: post.mediaUrls,
          createdAt: post.createdAt,
          poll: post.poll,
          score,
          commentCount: post._count.comments,
          rawVotes: post.votes,
        };
      });

    const formatted = formatPosts(posts);

    // Apply algorithm sorting
    if (algorithm === "top") {
      return formatted.sort((a, b) => b.score - a.score);
    } else if (algorithm === "hot") {
      // Hot Algorithm: Score / (AgeInHours + 2)^1.5
      const now = new Date().getTime();
      return formatted.sort((a, b) => {
        const ageA = (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
        const ageB = (now - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
        const scoreA = a.score / Math.pow(ageA + 2, 1.5);
        const scoreB = b.score / Math.pow(ageB + 2, 1.5);
        return scoreB - scoreA;
      });
    } else if (algorithm === "trending") {
      // Trending: recent activity (e.g. score weight + comment weight, prioritized for post age < 48 hours)
      const now = new Date().getTime();
      return formatted.sort((a, b) => {
        const ageA = (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
        const ageB = (now - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
        if (ageA > 48 && ageB <= 48) return 1;
        if (ageB > 48 && ageA <= 48) return -1;
        const weightA = a.score * 1.5 + a.commentCount;
        const weightB = b.score * 1.5 + b.commentCount;
        return weightB - weightA;
      });
    }

    return formatted; // returns "new"
  }

  // 3. Vote on a Post
  async votePost(userId: string, postId: string, dto: VotePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return this.prisma.$transaction(async (tx) => {
      // Check existing vote
      const existingVote = await tx.vote.findUnique({
        where: {
          postId_userId: { postId, userId },
        },
      });

      let scoreDiff = 0;

      if (existingVote) {
        if (existingVote.type === dto.type) {
          // Double tap to remove vote
          await tx.vote.delete({
            where: { id: existingVote.id },
          });
          scoreDiff = dto.type === "UPVOTE" ? -5 : 2;
        } else {
          // Change vote type
          await tx.vote.update({
            where: { id: existingVote.id },
            data: { type: dto.type },
          });
          scoreDiff = dto.type === "UPVOTE" ? 7 : -7;
        }
      } else {
        // Create new vote
        await tx.vote.create({
          data: {
            postId,
            userId,
            type: dto.type,
          },
        });
        scoreDiff = dto.type === "UPVOTE" ? 5 : -2;
      }

      // Adjust post author's reputation score (Echo Score)
      await tx.profile.update({
        where: { userId: post.authorId },
        data: { echoScore: { increment: scoreDiff } },
      });

      return { success: true };
    });
  }

  // 4. Poll Voting
  async votePoll(userId: string, optionId: string) {
    const option = await this.prisma.pollOption.findUnique({
      where: { id: optionId },
      include: { poll: true },
    });
    if (!option) {
      throw new NotFoundException("Poll option not found");
    }

    if (new Date() > new Date(option.poll.expiresAt)) {
      throw new BadRequestException("This poll has expired");
    }

    // Check if user already voted in this poll
    const optionsInPoll = await this.prisma.pollOption.findMany({
      where: { pollId: option.pollId },
      select: { id: true },
    });
    const optionIds = optionsInPoll.map((o) => o.id);

    const existingVote = await this.prisma.pollVote.findFirst({
      where: {
        userId,
        optionId: { in: optionIds },
      },
    });

    if (existingVote) {
      throw new BadRequestException("You have already voted in this poll");
    }

    await this.prisma.pollVote.create({
      data: {
        optionId,
        userId,
      },
    });

    // Add +1 Echo Score for participating
    await this.prisma.profile.update({
      where: { userId },
      data: { echoScore: { increment: 1 } },
    });

    return { success: true };
  }

  // 5. Nested Comments
  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    let anonymousProfileId: string | null = null;
    if (dto.anonymous) {
      const anonProfile = await this.prisma.anonymousProfile.findFirst({
        where: { userId },
      });
      if (!anonProfile) {
        throw new BadRequestException("No anonymous profile setup for this user");
      }
      anonymousProfileId = anonProfile.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          content: dto.content,
          postId,
          authorId: userId,
          anonymousProfileId,
          parentId: dto.parentId || null,
        },
      });

      // Run AI Auto Flagging check
      await this.moderationService.autoFlagContent("COMMENT", comment.id, dto.content);

      // Increase commenter Echo Score (+2)
      await tx.profile.update({
        where: { userId },
        data: { echoScore: { increment: 2 } },
      });

      return tx.comment.findUnique({
        where: { id: comment.id },
        include: {
          anonymousProfile: { select: { alias: true, avatarUrl: true } },
          author: {
            select: {
              profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
            },
          },
        },
      });
    });
  }

  // 6. Get Comments for a Post (nested tree)
  async getComments(postId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        anonymousProfile: { select: { alias: true, avatarUrl: true } },
        author: {
          select: {
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
            role: { select: { name: true } },
          },
        },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "asc" }],
    });

    // Structure nested replies in JS
    const commentMap: Record<string, any> = {};
    const rootComments: any[] = [];

    comments.forEach((c) => {
      const author = c.anonymousProfile
        ? { name: c.anonymousProfile.alias, avatarUrl: c.anonymousProfile.avatarUrl, isAnonymous: true }
        : {
            name: `${c.author.profile?.firstName} ${c.author.profile?.lastName}`,
            avatarUrl: c.author.profile?.avatarUrl,
            role: c.author.role.name,
            isAnonymous: false,
          };

      commentMap[c.id] = {
        id: c.id,
        content: c.content,
        pinned: c.pinned,
        createdAt: c.createdAt,
        author,
        replies: [],
      };
    });

    comments.forEach((c) => {
      const mapped = commentMap[c.id];
      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies.push(mapped);
      } else {
        rootComments.push(mapped);
      }
    });

    return rootComments;
  }

  // 7. Pin Comment (Faculty / Admin only)
  async pinComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    // Check if user is Admin or Faculty
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !["SUPER_ADMIN", "FACULTY", "CLASS_MODERATOR"].includes(user.role.name)) {
      throw new ForbiddenException("Only official staff or admins can pin comments");
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { pinned: true },
    });

    return { success: true };
  }

  async updatePost(
    userId: string,
    postId: string,
    data: { title?: string; content?: string },
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException("You can only edit your own posts");
    }

    return this.prisma.post.update({
      where: { id: postId },
      data,
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    const isOwner = post.authorId === userId;
    const isStaff =
      user &&
      ['SUPER_ADMIN', 'FACULTY', 'CLASS_MODERATOR'].includes(user.role.name);

    if (!isOwner && !isStaff) {
      throw new ForbiddenException('Not allowed');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { success: true };
  }

  async updateComment(
  userId: string,
  commentId: string,
  content: string,
) {
  const comment = await this.prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  if (comment.authorId !== userId) {
    throw new ForbiddenException('You can only edit your own comments');
  }

  return this.prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });
}

async deleteComment(userId: string, commentId: string) {
  const comment = await this.prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  const isOwner = comment.authorId === userId;
  const isStaff =
    user &&
    ['SUPER_ADMIN', 'FACULTY', 'CLASS_MODERATOR'].includes(user.role.name);

  if (!isOwner && !isStaff) {
    throw new ForbiddenException('Not allowed');
  }

  await this.prisma.comment.delete({
    where: { id: commentId },
  });

  return { success: true };
}
}
