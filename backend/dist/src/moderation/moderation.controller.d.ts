import { ModerationService } from "./moderation.service";
export declare class ModerationController {
    private moderationService;
    constructor(moderationService: ModerationService);
    getReports(): Promise<({
        post: {
            id: string;
            title: string;
            content: string;
            anonymous: boolean;
            authorId: string;
        } | null;
        comment: {
            id: string;
            content: string;
            authorId: string;
        } | null;
        reporter: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReportStatus;
        reason: string;
        reporterId: string;
        resolverId: string | null;
        postId: string | null;
        commentId: string | null;
        ticketId: string | null;
    })[]>;
    resolveReport(userId: string, reportId: string, action: "DELETE" | "DISMISS"): Promise<{
        success: boolean;
    }>;
}
