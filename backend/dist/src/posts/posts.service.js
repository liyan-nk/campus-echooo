"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const moderation_service_1 = require("../moderation/moderation.service");
const events_gateway_1 = require("../realtime/events.gateway");
const client_1 = require("@prisma/client");
let PostsService = class PostsService {
    prisma;
    moderationService;
    eventsGateway;
    constructor(prisma, moderationService, eventsGateway) {
        this.prisma = prisma;
        this.moderationService = moderationService;
        this.eventsGateway = eventsGateway;
    }
    async createPost(userId, dto) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException("User profile not found");
        }
        let anonymousProfileId = null;
        if (dto.anonymous) {
            const anonProfile = await this.prisma.anonymousProfile.findFirst({
                where: { userId },
            });
            if (!anonProfile) {
                throw new common_1.BadRequestException("No anonymous profile setup for this user");
            }
            anonymousProfileId = anonProfile.id;
        }
        return this.prisma.$transaction(async (tx) => {
            const post = await tx.post.create({
                data: {
                    title: dto.title,
                    content: dto.content,
                    anonymous: dto.anonymous,
                    authorId: userId,
                    anonymousProfileId,
                    universityId: profile.universityId,
                    departmentId: dto.departmentId || profile.departmentId,
                    category: dto.category ?? client_1.PostCategory.FEED,
                    postType: dto.poll ? "POLL" : (dto.mediaUrls?.length ? "IMAGE" : "TEXT"),
                    mediaUrls: dto.mediaUrls || [],
                },
            });
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
            const scoreGain = dto.anonymous ? 5 : 10;
            await tx.profile.update({
                where: { userId },
                data: { echoScore: { increment: scoreGain } },
            });
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
    async getFeed(universityId, algorithm = "new", category = "FEED") {
        const posts = await this.prisma.post.findMany({
            where: {
                universityId,
                category: category,
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
            orderBy: { createdAt: "desc" },
        });
        const formatPosts = (list) => list.map((post) => {
            const upvotes = post.votes.filter((v) => v.type === "UPVOTE").length;
            const downvotes = post.votes.filter((v) => v.type === "DOWNVOTE").length;
            const score = upvotes - downvotes;
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
        if (algorithm === "top") {
            return formatted.sort((a, b) => b.score - a.score);
        }
        else if (algorithm === "hot") {
            const now = new Date().getTime();
            return formatted.sort((a, b) => {
                const ageA = (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
                const ageB = (now - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
                const scoreA = a.score / Math.pow(ageA + 2, 1.5);
                const scoreB = b.score / Math.pow(ageB + 2, 1.5);
                return scoreB - scoreA;
            });
        }
        else if (algorithm === "trending") {
            const now = new Date().getTime();
            return formatted.sort((a, b) => {
                const ageA = (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
                const ageB = (now - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
                if (ageA > 48 && ageB <= 48)
                    return 1;
                if (ageB > 48 && ageA <= 48)
                    return -1;
                const weightA = a.score * 1.5 + a.commentCount;
                const weightB = b.score * 1.5 + b.commentCount;
                return weightB - weightA;
            });
        }
        return formatted;
    }
    async votePost(userId, postId, dto) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException("Post not found");
        }
        return this.prisma.$transaction(async (tx) => {
            const existingVote = await tx.vote.findUnique({
                where: {
                    postId_userId: { postId, userId },
                },
            });
            let scoreDiff = 0;
            if (existingVote) {
                if (existingVote.type === dto.type) {
                    await tx.vote.delete({
                        where: { id: existingVote.id },
                    });
                    scoreDiff = dto.type === "UPVOTE" ? -5 : 2;
                }
                else {
                    await tx.vote.update({
                        where: { id: existingVote.id },
                        data: { type: dto.type },
                    });
                    scoreDiff = dto.type === "UPVOTE" ? 7 : -7;
                }
            }
            else {
                await tx.vote.create({
                    data: {
                        postId,
                        userId,
                        type: dto.type,
                    },
                });
                scoreDiff = dto.type === "UPVOTE" ? 5 : -2;
            }
            await tx.profile.update({
                where: { userId: post.authorId },
                data: { echoScore: { increment: scoreDiff } },
            });
            return { success: true };
        });
    }
    async votePoll(userId, optionId) {
        const option = await this.prisma.pollOption.findUnique({
            where: { id: optionId },
            include: { poll: true },
        });
        if (!option) {
            throw new common_1.NotFoundException("Poll option not found");
        }
        if (new Date() > new Date(option.poll.expiresAt)) {
            throw new common_1.BadRequestException("This poll has expired");
        }
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
            throw new common_1.BadRequestException("You have already voted in this poll");
        }
        await this.prisma.pollVote.create({
            data: {
                optionId,
                userId,
            },
        });
        await this.prisma.profile.update({
            where: { userId },
            data: { echoScore: { increment: 1 } },
        });
        return { success: true };
    }
    async createComment(userId, postId, dto) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException("Post not found");
        }
        let anonymousProfileId = null;
        if (dto.anonymous) {
            const anonProfile = await this.prisma.anonymousProfile.findFirst({
                where: { userId },
            });
            if (!anonProfile) {
                throw new common_1.BadRequestException("No anonymous profile setup for this user");
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
            await this.moderationService.autoFlagContent("COMMENT", comment.id, dto.content);
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
    async getComments(postId) {
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
        const commentMap = {};
        const rootComments = [];
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
            }
            else {
                rootComments.push(mapped);
            }
        });
        return rootComments;
    }
    async pinComment(userId, commentId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException("Comment not found");
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });
        if (!user || !["SUPER_ADMIN", "FACULTY", "UNIV_ADMIN"].includes(user.role.name)) {
            throw new common_1.ForbiddenException("Only official staff or admins can pin comments");
        }
        await this.prisma.comment.update({
            where: { id: commentId },
            data: { pinned: true },
        });
        return { success: true };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        moderation_service_1.ModerationService,
        events_gateway_1.EventsGateway])
], PostsService);
//# sourceMappingURL=posts.service.js.map