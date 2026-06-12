import { Controller, Post, Get, Put, Body, Param, UseGuards } from "@nestjs/common";
import { CampusService } from "./campus.service";
import { CreateClubDto, CreateEventDto, CreateMarketplaceItemDto } from "./dto/campus.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Controller("campus")
export class CampusController {
  constructor(
    private campusService: CampusService,
    private prisma: PrismaService,
  ) {}

  // ==================== CLUBS ====================

  @Post("clubs")
  async createClub(@CurrentUser("userId") userId: string, @Body() dto: CreateClubDto) {
    return this.campusService.createClub(userId, dto);
  }

  @Get("clubs")
  async getClubs(@CurrentUser("userId") userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new Error("Profile not found");
    }
    return this.campusService.getClubs(profile.universityId);
  }

  @Post("clubs/:id/join")
  async joinClub(@CurrentUser("userId") userId: string, @Param("id") clubId: string) {
    return this.campusService.joinClub(userId, clubId);
  }

  @Post("clubs/:id/leave")
  async leaveClub(@CurrentUser("userId") userId: string, @Param("id") clubId: string) {
    return this.campusService.leaveClub(userId, clubId);
  }

  // ==================== EVENTS ====================

  @Post("events")
  async createEvent(@CurrentUser("userId") userId: string, @Body() dto: CreateEventDto) {
    return this.campusService.createEvent(userId, dto);
  }

  @Get("events")
  async getEvents(@CurrentUser("userId") userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new Error("Profile not found");
    }
    return this.campusService.getEvents(profile.universityId);
  }

  @Post("events/:id/rsvp")
  async rsvpEvent(@CurrentUser("userId") userId: string, @Param("id") eventId: string) {
    return this.campusService.rsvpEvent(userId, eventId);
  }

  @Post("events/:id/checkin/:studentId")
  async checkInEvent(
    @CurrentUser("userId") hostId: string,
    @Param("id") eventId: string,
    @Param("studentId") studentId: string,
  ) {
    return this.campusService.checkInEvent(hostId, eventId, studentId);
  }

  // ==================== MARKETPLACE ====================

  @Post("marketplace")
  async createItem(@CurrentUser("userId") userId: string, @Body() dto: CreateMarketplaceItemDto) {
    return this.campusService.createMarketplaceItem(userId, dto);
  }

  @Get("marketplace")
  async getMarketplaceItems(@CurrentUser("userId") userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new Error("Profile not found");
    }
    return this.campusService.getMarketplaceItems(profile.universityId);
  }

  @Put("marketplace/:id")
  async updateStatus(
    @CurrentUser("userId") userId: string,
    @Param("id") itemId: string,
    @Body("status") status: "AVAILABLE" | "SOLD",
  ) {
    return this.campusService.updateItemStatus(userId, itemId, status);
  }
}
