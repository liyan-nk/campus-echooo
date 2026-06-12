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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../realtime/events.gateway");
const ai_service_1 = require("../ai/ai.service");
let TicketsService = class TicketsService {
    prisma;
    eventsGateway;
    aiService;
    constructor(prisma, eventsGateway, aiService) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
        this.aiService = aiService;
    }
    async createTicket(studentId, dto) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId: studentId },
        });
        if (!profile) {
            throw new common_1.NotFoundException("Profile not found");
        }
        let category = dto.category;
        if (category === "OTHERS" || !category) {
            category = this.aiService.autoTagTicket(dto.title, dto.description);
        }
        return this.prisma.$transaction(async (tx) => {
            const ticket = await tx.ticket.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    category,
                    severity: dto.severity || "LOW",
                    studentId,
                    universityId: profile.universityId,
                    departmentId: dto.departmentId || null,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: studentId,
                    ticketId: ticket.id,
                    action: "TICKET_CREATED",
                    details: `Ticket titled "${dto.title}" submitted under category "${dto.category}".`,
                },
            });
            this.eventsGateway.sendTicketUpdate(ticket.universityId, ticket);
            return ticket;
        });
    }
    async getTickets(universityId) {
        return this.prisma.ticket.findMany({
            where: { universityId },
            include: {
                student: {
                    select: {
                        profile: { select: { firstName: true, lastName: true } },
                    },
                },
                assignee: {
                    select: {
                        profile: { select: { firstName: true, lastName: true } },
                    },
                },
                department: { select: { name: true } },
            },
            orderBy: { updatedAt: "desc" },
        });
    }
    async getMyTickets(studentId) {
        return this.prisma.ticket.findMany({
            where: { studentId },
            include: {
                assignee: {
                    select: {
                        profile: { select: { firstName: true, lastName: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async updateTicketStatus(userId, ticketId, dto) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
        });
        if (!ticket) {
            throw new common_1.NotFoundException("Ticket not found");
        }
        return this.prisma.$transaction(async (tx) => {
            const oldStatus = ticket.status;
            const updated = await tx.ticket.update({
                where: { id: ticketId },
                data: {
                    status: dto.status,
                    assigneeId: dto.assigneeId || ticket.assigneeId,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId,
                    ticketId,
                    action: "TICKET_STATUS_UPDATED",
                    details: `Status transitioned from ${oldStatus} to ${dto.status}.`,
                },
            });
            this.eventsGateway.sendTicketUpdate(updated.universityId, updated);
            return updated;
        });
    }
    async getAnalytics(universityId) {
        const totalTickets = await this.prisma.ticket.count({ where: { universityId } });
        const resolvedTickets = await this.prisma.ticket.count({
            where: { universityId, status: "RESOLVED" },
        });
        const inProgressTickets = await this.prisma.ticket.count({
            where: { universityId, status: "IN_PROGRESS" },
        });
        const categoryCounts = await this.prisma.ticket.groupBy({
            by: ["category"],
            where: { universityId },
            _count: { id: true },
        });
        const posts = await this.prisma.post.findMany({
            where: { universityId },
            select: { content: true },
        });
        let totalSentiment = 0;
        posts.forEach((p) => {
            totalSentiment += this.aiService.analyzeSentiment(p.content);
        });
        const sentimentScore = posts.length > 0 ? Math.round(totalSentiment / posts.length) : 75;
        return {
            totalTickets,
            resolvedRate: totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0,
            inProgressCount: inProgressTickets,
            categories: categoryCounts.map((c) => ({
                category: c.category,
                count: c._count.id,
            })),
            sentimentIndex: sentimentScore,
            growthRate: 15,
        };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway,
        ai_service_1.AiService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map