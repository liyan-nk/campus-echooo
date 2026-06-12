import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto, CreateCommentDto, VotePostDto } from "./dto/posts.dto";
import { ModerationService } from "../moderation/moderation.service";
import { EventsGateway } from "../realtime/events.gateway";
export declare class PostsService {
    private prisma;
    private moderationService;
    private eventsGateway;
    constructor(prisma: PrismaService, moderationService: ModerationService, eventsGateway: EventsGateway);
    createPost(userId: string, dto: CreatePostDto): Promise<({
        anonymousProfile: {
            alias: string;
            avatarUrl: string | null;
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
        title: string;
        content: string;
        anonymous: boolean;
        authorId: string;
        anonymousProfileId: string | null;
        universityId: string;
        departmentId: string | null;
        category: import("@prisma/client").$Enums.PostCategory;
        postType: import("@prisma/client").$Enums.PostType;
        mediaUrls: string[];
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    getFeed(universityId: string, algorithm?: string, category?: string): Promise<{
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
    votePost(userId: string, postId: string, dto: VotePostDto): Promise<{
        success: boolean;
    }>;
    votePoll(userId: string, optionId: string): Promise<{
        success: boolean;
    }>;
    createComment(userId: string, postId: string, dto: CreateCommentDto): Promise<({
        anonymousProfile: {
            alias: string;
            avatarUrl: string | null;
        } | null;
        author: {
            profile: {
                avatarUrl: string | null;
                firstName: string;
                lastName: string;
            } | null;
        };
    } & {
        id: string;
        content: string;
        authorId: string;
        anonymousProfileId: string | null;
        createdAt: Date;
        updatedAt: Date;
        postId: string;
        parentId: string | null;
        pinned: boolean;
    }) | null>;
    getComments(postId: string): Promise<any[]>;
    pinComment(userId: string, commentId: string): Promise<{
        success: boolean;
    }>;
}
