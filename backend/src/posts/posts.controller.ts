import { Controller, Post, Get, Body, Param, Query, UseGuards } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto, CreateCommentDto, VotePostDto } from "./dto/posts.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { Patch, Delete } from "@nestjs/common";

@Controller("posts")
export class PostsController {
  constructor(
    private postsService: PostsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  async create(@CurrentUser("userId") userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.createPost(userId, dto);
  }

  @Get("feed")
  async getFeed(
    @CurrentUser("userId") userId: string,
    @Query("algorithm") algorithm?: string,
    @Query("category") category?: string,
  ) {
    // Resolve user's university ID
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new Error("University not resolved for user profile");
    }

    return this.postsService.getFeed(profile.universityId, algorithm || "new", category || "FEED");
  }

  @Post(":id/vote")
  async vote(
    @CurrentUser("userId") userId: string,
    @Param("id") postId: string,
    @Body() dto: VotePostDto,
  ) {
    return this.postsService.votePost(userId, postId, dto);
  }

  @Post("poll/vote/:optionId")
  async votePoll(
    @CurrentUser("userId") userId: string,
    @Param("optionId") optionId: string,
  ) {
    return this.postsService.votePoll(userId, optionId);
  }

  @Post(":id/comments")
  async addComment(
    @CurrentUser("userId") userId: string,
    @Param("id") postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.createComment(userId, postId, dto);
  }

  @Get(":id/comments")
  async getComments(@Param("id") postId: string) {
    return this.postsService.getComments(postId);
  }

  @Post("comments/:id/pin")
  async pinComment(
    @CurrentUser("userId") userId: string,
    @Param("id") commentId: string,
  ) {
    return this.postsService.pinComment(userId, commentId);
  }

  @Patch(":id")
  async updatePost(
    @CurrentUser("userId") userId: string,
    @Param("id") postId: string,
    @Body() body: { title?: string; content?: string },
  ) {
    return this.postsService.updatePost(userId, postId, body);
  }

  @Delete(":id")
  async deletePost(
    @CurrentUser("userId") userId: string,
    @Param("id") postId: string,
  ) {
    return this.postsService.deletePost(userId, postId);
  }

  @Patch("comments/:id")
  async updateComment(
    @CurrentUser("userId") userId: string,
    @Param("id") commentId: string,
    @Body() body: { content: string },
  ) {
    return this.postsService.updateComment(userId, commentId, body.content);
  }

  @Delete("comments/:id")
  async deleteComment(
    @CurrentUser("userId") userId: string,
    @Param("id") commentId: string,
  ) {
    return this.postsService.deleteComment(userId, commentId);
  }
  }
