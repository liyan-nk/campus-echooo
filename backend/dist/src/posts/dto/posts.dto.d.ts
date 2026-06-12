import { PostCategory } from "@prisma/client";
export declare class CreatePollDto {
    question: string;
    options: string[];
    expiresAt: string;
}
export declare class CreatePostDto {
    title: string;
    content: string;
    anonymous?: boolean;
    departmentId?: string;
    category?: PostCategory;
    mediaUrls?: string[];
    poll?: CreatePollDto;
}
export declare class CreateCommentDto {
    content: string;
    anonymous?: boolean;
    parentId?: string;
}
export declare class VotePostDto {
    type: "UPVOTE" | "DOWNVOTE";
}
