import { TicketsService } from "./tickets.service";
import { CreateTicketDto, UpdateTicketStatusDto } from "./dto/tickets.dto";
import { PrismaService } from "../prisma/prisma.service";
export declare class TicketsController {
    private ticketsService;
    private prisma;
    constructor(ticketsService: TicketsService, prisma: PrismaService);
    create(userId: string, dto: CreateTicketDto): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        universityId: string;
        departmentId: string | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        updatedAt: Date;
        title: string;
        category: string;
        studentId: string;
        severity: import("@prisma/client").$Enums.Severity;
        assigneeId: string | null;
    }>;
    getMy(userId: string): Promise<({
        assignee: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        } | null;
    } & {
        id: string;
        description: string;
        createdAt: Date;
        universityId: string;
        departmentId: string | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        updatedAt: Date;
        title: string;
        category: string;
        studentId: string;
        severity: import("@prisma/client").$Enums.Severity;
        assigneeId: string | null;
    })[]>;
    getAll(userId: string): Promise<({
        department: {
            name: string;
        } | null;
        student: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        };
        assignee: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        } | null;
    } & {
        id: string;
        description: string;
        createdAt: Date;
        universityId: string;
        departmentId: string | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        updatedAt: Date;
        title: string;
        category: string;
        studentId: string;
        severity: import("@prisma/client").$Enums.Severity;
        assigneeId: string | null;
    })[]>;
    getAnalytics(userId: string): Promise<{
        totalTickets: number;
        resolvedRate: number;
        inProgressCount: number;
        categories: {
            category: string;
            count: number;
        }[];
        sentimentIndex: number;
        growthRate: number;
    }>;
    updateStatus(userId: string, ticketId: string, dto: UpdateTicketStatusDto): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        universityId: string;
        departmentId: string | null;
        status: import("@prisma/client").$Enums.TicketStatus;
        updatedAt: Date;
        title: string;
        category: string;
        studentId: string;
        severity: import("@prisma/client").$Enums.Severity;
        assigneeId: string | null;
    }>;
}
