import { PrismaService } from "../prisma/prisma.service";
import { CreateTicketDto, UpdateTicketStatusDto } from "./dto/tickets.dto";
import { EventsGateway } from "../realtime/events.gateway";
import { AiService } from "../ai/ai.service";
export declare class TicketsService {
    private prisma;
    private eventsGateway;
    private aiService;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway, aiService: AiService);
    createTicket(studentId: string, dto: CreateTicketDto): Promise<{
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
    getTickets(universityId: string): Promise<({
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
    getMyTickets(studentId: string): Promise<({
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
    updateTicketStatus(userId: string, ticketId: string, dto: UpdateTicketStatusDto): Promise<{
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
    getAnalytics(universityId: string): Promise<{
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
}
