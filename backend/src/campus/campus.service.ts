import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClubDto, CreateEventDto, CreateMarketplaceItemDto } from "./dto/campus.dto";

@Injectable()
export class CampusService {
  constructor(private prisma: PrismaService) {}

  // ==================== CLUBS ====================

  async createClub(creatorId: string, dto: CreateClubDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: creatorId },
    });
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return this.prisma.$transaction(async (tx) => {
      // Create Club
      const club = await tx.club.create({
        data: {
          name: dto.name,
          description: dto.description,
          logoUrl: dto.logoUrl,
          universityId: profile.universityId,
          creatorId,
        },
      });

      // Creator is automatic leader/admin
      await tx.clubMember.create({
        data: {
          clubId: club.id,
          userId: creatorId,
          role: "ADMIN",
        },
      });

      // Create a messaging channel for the club
      await tx.channel.create({
        data: {
          name: `${dto.name} General`,
          type: "PUBLIC",
          clubId: club.id,
          members: {
            create: {
              userId: creatorId,
            },
          },
        },
      });

      return club;
    });
  }

  async getClubs(universityId: string) {
    return this.prisma.club.findMany({
      where: { universityId },
      include: {
        _count: { select: { members: true } },
        creator: {
          select: {
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async joinClub(userId: string, clubId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });
    if (!club) {
      throw new NotFoundException("Club not found");
    }

    const existingMember = await this.prisma.clubMember.findUnique({
      where: {
        clubId_userId: { clubId, userId },
      },
    });
    if (existingMember) {
      throw new BadRequestException("You are already a member of this club");
    }

    return this.prisma.$transaction(async (tx) => {
      const member = await tx.clubMember.create({
        data: { clubId, userId, role: "MEMBER" },
      });

      // Automatically join the general channel of the club
      const generalChannel = await tx.channel.findFirst({
        where: { clubId },
      });
      if (generalChannel) {
        await tx.channelMember.create({
          data: {
            channelId: generalChannel.id,
            userId,
          },
        });
      }

      return member;
    });
  }

  async leaveClub(userId: string, clubId: string) {
    const membership = await this.prisma.clubMember.findUnique({
      where: {
        clubId_userId: { clubId, userId },
      },
    });
    if (!membership) {
      throw new BadRequestException("You are not a member of this club");
    }
    if (membership.role === "ADMIN") {
      throw new BadRequestException("Club admins cannot leave the club before transferring ownership");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.clubMember.delete({
        where: { id: membership.id },
      });

      // Remove from the club's general channel
      const generalChannel = await tx.channel.findFirst({
        where: { clubId },
      });
      if (generalChannel) {
        await tx.channelMember.deleteMany({
          where: {
            channelId: generalChannel.id,
            userId,
          },
        });
      }

      return { success: true };
    });
  }

  // ==================== EVENTS ====================

  async createEvent(creatorId: string, dto: CreateEventDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: creatorId },
    });
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    if (dto.clubId) {
      // Check if creator is admin of the club
      const membership = await this.prisma.clubMember.findUnique({
        where: {
          clubId_userId: { clubId: dto.clubId, userId: creatorId },
        },
      });
      if (!membership || membership.role !== "ADMIN") {
        throw new ForbiddenException("Only club admins can schedule events for the club");
      }
    }

    // Generate simulated QR Code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=event:${dto.title}:${Date.now()}`;

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        location: dto.location,
        qrCodeUrl,
        clubId: dto.clubId || null,
        universityId: profile.universityId,
        creatorId,
      },
    });
  }

  async getEvents(universityId: string) {
    return this.prisma.event.findMany({
      where: { universityId },
      include: {
        club: { select: { id: true, name: true, logoUrl: true } },
        _count: { select: { rsvps: true } },
      },
      orderBy: { date: "asc" },
    });
  }

  async rsvpEvent(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException("Event not found");
    }

    const existingRsvp = await this.prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (existingRsvp) {
      // Toggle RSVP
      await this.prisma.eventRSVP.delete({
        where: { id: existingRsvp.id },
      });
      return { rsvped: false };
    } else {
      await this.prisma.eventRSVP.create({
        data: { eventId, userId },
      });
      return { rsvped: true };
    }
  }

  async checkInEvent(hostId: string, eventId: string, studentId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException("Event not found");
    }

    // Verify host is creator or admin
    if (event.creatorId !== hostId) {
      if (event.clubId) {
        const hostMembership = await this.prisma.clubMember.findUnique({
          where: { clubId_userId: { clubId: event.clubId, userId: hostId } },
        });
        if (!hostMembership || hostMembership.role !== "ADMIN") {
          throw new ForbiddenException("Unauthorized to perform check-in for this event");
        }
      } else {
        throw new ForbiddenException("Unauthorized to perform check-in for this event");
      }
    }

    const rsvp = await this.prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: { eventId, userId: studentId },
      },
    });
    if (!rsvp) {
      throw new BadRequestException("Student has not RSVP'd to this event");
    }

    await this.prisma.eventRSVP.update({
      where: { id: rsvp.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });

    // Reward student with Echo Score (+5) for attending
    await this.prisma.profile.update({
      where: { userId: studentId },
      data: { echoScore: { increment: 5 } },
    });

    return { success: true };
  }

  // ==================== MARKETPLACE ====================

  async createMarketplaceItem(sellerId: string, dto: CreateMarketplaceItemDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: sellerId },
    });
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return this.prisma.marketplaceItem.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        condition: dto.condition,
        imageUrl: dto.imageUrl,
        sellerId,
        universityId: profile.universityId,
      },
    });
  }

  async getMarketplaceItems(universityId: string) {
    return this.prisma.marketplaceItem.findMany({
      where: {
        universityId,
        status: "AVAILABLE",
      },
      include: {
        seller: {
          select: {
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateItemStatus(sellerId: string, itemId: string, status: "AVAILABLE" | "SOLD") {
    const item = await this.prisma.marketplaceItem.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      throw new NotFoundException("Marketplace item not found");
    }
    if (item.sellerId !== sellerId) {
      throw new ForbiddenException("You can only edit status for your own listings");
    }

    return this.prisma.marketplaceItem.update({
      where: { id: itemId },
      data: { status },
    });
  }
}
