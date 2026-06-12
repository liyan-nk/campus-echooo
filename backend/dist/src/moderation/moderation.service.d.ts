import { PrismaService } from "../prisma/prisma.service";
export declare class ModerationService {
    private prisma;
    constructor(prisma: PrismaService);
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
    resolveReport(reportId: string, resolverId: string, action: "DELETE" | "DISMISS"): Promise<{
        success: boolean;
    }>;
    autoFlagContent(type: "POST" | "COMMENT", targetId: string, textToCheck: string): Promise<boolean | undefined>;
}
