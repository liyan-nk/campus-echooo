import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTicketDto, UpdateTicketStatusDto } from "./dto/tickets.dto";
import { TicketStatus } from "@prisma/client";
import { EventsGateway } from "../realtime/events.gateway";
import { AiService } from "../ai/ai.service";

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private aiService: AiService,
  ) {}

  // 1. Create ticket (Student)
  async createTicket(studentId: string, dto: CreateTicketDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: studentId },
    });
    if (!profile) {
      throw new NotFoundException("Profile not found");
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

      // Log action in audit logs
      await tx.auditLog.create({
        data: {
          userId: studentId,
          ticketId: ticket.id,
          action: "TICKET_CREATED",
          details: `Ticket titled "${dto.title}" submitted under category "${dto.category}".`,
        },
      });

      // Broadcast to socket room
      this.eventsGateway.sendTicketUpdate(ticket.universityId, ticket);

      return ticket;
    });
  }

  // 2. Get all university tickets (Staff/Admins)
  async getTickets(universityId: string) {
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

  // 3. Get student's tickets
  async getMyTickets(studentId: string) {
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

  // 4. Update ticket status (Admins/Staff)
  async updateTicketStatus(userId: string, ticketId: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
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

      // Log in Audit Logs
      await tx.auditLog.create({
        data: {
          userId,
          ticketId,
          action: "TICKET_STATUS_UPDATED",
          details: `Status transitioned from ${oldStatus} to ${dto.status}.`,
        },
      });

      // Broadcast to socket room
      this.eventsGateway.sendTicketUpdate(updated.universityId, updated);

      return updated;
    });
  }

  // 5. Get Analytics (Admins)
  async getAnalytics(universityId: string) {
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

    // Calculate real sentiment score using local NLP engine
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
      sentimentIndex: sentimentScore, // live calculated index
      growthRate: 15,
    };
  }
}
