import { PostsService } from "./posts.service";
import { CreatePostDto, CreateCommentDto, VotePostDto } from "./dto/posts.dto";
import { PrismaService } from "../prisma/prisma.service";
export declare class PostsController {
    private postsService;
    private prisma;
    constructor(postsService: PostsService, prisma: PrismaService);
    create(userId: string, dto: CreatePostDto): Promise<({
        anonymousProfile: {
            avatarUrl: string | null;
            alias: string;
        } | null;
        poll: ({
            options: {
                id: string;
                text: string;
                pollId: string;
            }[];
        } & {
            id: string;
            question: string;
            expiresAt: Date;
            postId: string;
        }) | null;
        author: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        universityId: string;
        departmentId: string | null;
        updatedAt: Date;
        title: string;
        content: string;
        anonymous: boolean;
        category: import("@prisma/client").$Enums.PostCategory;
        mediaUrls: string[];
        authorId: string;
        anonymousProfileId: string | null;
        postType: import("@prisma/client").$Enums.PostType;
    }) | null>;
    getFeed(userId: string, algorithm?: string, category?: string): Promise<{
        id: any;
        title: any;
        content: any;
        anonymous: any;
        author: {
            alias: any;
            avatarUrl: any;
            name?: undefined;
            role?: undefined;
        } | {
            name: string;
            avatarUrl: any;
            role: any;
            alias?: undefined;
        };
        category: any;
        postType: any;
        mediaUrls: any;
        createdAt: any;
        poll: any;
        score: number;
        commentCount: any;
        rawVotes: any;
    }[]>;
    vote(userId: string, postId: string, dto: VotePostDto): Promise<{
        success: boolean;
    }>;
    votePoll(userId: string, optionId: string): Promise<{
        success: boolean;
    }>;
    addComment(userId: string, postId: string, dto: CreateCommentDto): Promise<({
        anonymousProfile: {
            avatarUrl: string | null;
            alias: string;
        } | null;
        author: {
            profile: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        parentId: string | null;
        postId: string;
        authorId: string;
        anonymousProfileId: string | null;
        pinned: boolean;
    }) | null>;
    getComments(postId: string): Promise<any[]>;
    pinComment(userId: string, commentId: string): Promise<{
        success: boolean;
    }>;
    updatePost(userId: string, postId: string, body: {
        title?: string;
        content?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        universityId: string;
        departmentId: string | null;
        updatedAt: Date;
        title: string;
        content: string;
        anonymous: boolean;
        category: import("@prisma/client").$Enums.PostCategory;
        mediaUrls: string[];
        authorId: string;
        anonymousProfileId: string | null;
        postType: import("@prisma/client").$Enums.PostType;
    }>;
    deletePost(userId: string, postId: string): Promise<{
        success: boolean;
    }>;
    updateComment(userId: string, commentId: string, body: {
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        parentId: string | null;
        postId: string;
        authorId: string;
        anonymousProfileId: string | null;
        pinned: boolean;
    }>;
    deleteComment(userId: string, commentId: string): Promise<{
        success: boolean;
    }>;
}
