import { Controller, Post, Get, Put, Body, Param, UseGuards } from "@nestjs/common";
import { TicketsService } from "./tickets.service";
import { CreateTicketDto, UpdateTicketStatusDto } from "./dto/tickets.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Controller("tickets")
export class TicketsController {
  constructor(
    private ticketsService: TicketsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  async create(@CurrentUser("userId") userId: string, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(userId, dto);
  }

  @Get("my")
  async getMy(@CurrentUser("userId") userId: string) {
    return this.ticketsService.getMyTickets(userId);
  }

  @Get()
  @Roles("SUPER_ADMIN", "UNIV_ADMIN", "DEPT_ADMIN", "MODERATOR")
  async getAll(@CurrentUser("userId") userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new Error("Profile not found");
    }
    return this.ticketsService.getTickets(profile.universityId);
  }

  @Get("analytics")
  @Roles("SUPER_ADMIN", "UNIV_ADMIN")
  async getAnalytics(@CurrentUser("userId") userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new Error("Profile not found");
    }
    return this.ticketsService.getAnalytics(profile.universityId);
  }

  @Put(":id/status")
  @Roles("SUPER_ADMIN", "UNIV_ADMIN", "DEPT_ADMIN")
  async updateStatus(
    @CurrentUser("userId") userId: string,
    @Param("id") ticketId: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateTicketStatus(userId, ticketId, dto);
  }
}
