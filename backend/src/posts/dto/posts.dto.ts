import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, IsEnum, ValidateNested, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { PostCategory } from "@prisma/client";

export class CreatePollDto {
  @IsString()
  @IsNotEmpty({ message: "Poll question is required" })
  question!: string;

  @IsArray()
  @IsString({ each: true })
  options!: string[];

  @IsDateString()
  expiresAt!: string;
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: "Post title is required" })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: "Post content is required" })
  content!: string;

  @IsBoolean()
  @IsOptional()
  anonymous?: boolean = false;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsEnum(PostCategory)
  @IsOptional()
  category?: PostCategory = PostCategory.FEED; // FEED, ANNOUNCEMENT, CLUBS

  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePollDto)
  poll?: CreatePollDto;
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: "Comment content is required" })
  content!: string;

  @IsBoolean()
  @IsOptional()
  anonymous?: boolean = false;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class VotePostDto {
  @IsEnum(["UPVOTE", "DOWNVOTE"], { message: "Vote type must be UPVOTE or DOWNVOTE" })
  type!: "UPVOTE" | "DOWNVOTE";
}
