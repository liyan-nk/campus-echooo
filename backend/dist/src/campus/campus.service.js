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
exports.CampusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CampusService = class CampusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createClub(creatorId, dto) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId: creatorId },
        });
        if (!profile) {
            throw new common_1.NotFoundException("Profile not found");
        }
        return this.prisma.$transaction(async (tx) => {
            const club = await tx.club.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    logoUrl: dto.logoUrl,
                    universityId: profile.universityId,
                    creatorId,
                },
            });
            await tx.clubMember.create({
                data: {
                    clubId: club.id,
                    userId: creatorId,
                    role: "ADMIN",
                },
            });
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
    async getClubs(universityId) {
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
    async joinClub(userId, clubId) {
        const club = await this.prisma.club.findUnique({
            where: { id: clubId },
        });
        if (!club) {
            throw new common_1.NotFoundException("Club not found");
        }
        const existingMember = await this.prisma.clubMember.findUnique({
            where: {
                clubId_userId: { clubId, userId },
            },
        });
        if (existingMember) {
            throw new common_1.BadRequestException("You are already a member of this club");
        }
        return this.prisma.$transaction(async (tx) => {
            const member = await tx.clubMember.create({
                data: { clubId, userId, role: "MEMBER" },
            });
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
    async leaveClub(userId, clubId) {
        const membership = await this.prisma.clubMember.findUnique({
            where: {
                clubId_userId: { clubId, userId },
            },
        });
        if (!membership) {
            throw new common_1.BadRequestException("You are not a member of this club");
        }
        if (membership.role === "ADMIN") {
            throw new common_1.BadRequestException("Club admins cannot leave the club before transferring ownership");
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.clubMember.delete({
                where: { id: membership.id },
            });
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
    async createEvent(creatorId, dto) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId: creatorId },
        });
        if (!profile) {
            throw new common_1.NotFoundException("Profile not found");
        }
        if (dto.clubId) {
            const membership = await this.prisma.clubMember.findUnique({
                where: {
                    clubId_userId: { clubId: dto.clubId, userId: creatorId },
                },
            });
            if (!membership || membership.role !== "ADMIN") {
                throw new common_1.ForbiddenException("Only club admins can schedule events for the club");
            }
        }
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
    async getEvents(universityId) {
        return this.prisma.event.findMany({
            where: { universityId },
            include: {
                club: { select: { id: true, name: true, logoUrl: true } },
                _count: { select: { rsvps: true } },
            },
            orderBy: { date: "asc" },
        });
    }
    async rsvpEvent(userId, eventId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException("Event not found");
        }
        const existingRsvp = await this.prisma.eventRSVP.findUnique({
            where: {
                eventId_userId: { eventId, userId },
            },
        });
        if (existingRsvp) {
            await this.prisma.eventRSVP.delete({
                where: { id: existingRsvp.id },
            });
            return { rsvped: false };
        }
        else {
            await this.prisma.eventRSVP.create({
                data: { eventId, userId },
            });
            return { rsvped: true };
        }
    }
    async checkInEvent(hostId, eventId, studentId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException("Event not found");
        }
        if (event.creatorId !== hostId) {
            if (event.clubId) {
                const hostMembership = await this.prisma.clubMember.findUnique({
                    where: { clubId_userId: { clubId: event.clubId, userId: hostId } },
                });
                if (!hostMembership || hostMembership.role !== "ADMIN") {
                    throw new common_1.ForbiddenException("Unauthorized to perform check-in for this event");
                }
            }
            else {
                throw new common_1.ForbiddenException("Unauthorized to perform check-in for this event");
            }
        }
        const rsvp = await this.prisma.eventRSVP.findUnique({
            where: {
                eventId_userId: { eventId, userId: studentId },
            },
        });
        if (!rsvp) {
            throw new common_1.BadRequestException("Student has not RSVP'd to this event");
        }
        await this.prisma.eventRSVP.update({
            where: { id: rsvp.id },
            data: {
                checkedIn: true,
                checkedInAt: new Date(),
            },
        });
        await this.prisma.profile.update({
            where: { userId: studentId },
            data: { echoScore: { increment: 5 } },
        });
        return { success: true };
    }
    async createMarketplaceItem(sellerId, dto) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId: sellerId },
        });
        if (!profile) {
            throw new common_1.NotFoundException("Profile not found");
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
    async getMarketplaceItems(universityId) {
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
    async updateItemStatus(sellerId, itemId, status) {
        const item = await this.prisma.marketplaceItem.findUnique({
            where: { id: itemId },
        });
        if (!item) {
            throw new common_1.NotFoundException("Marketplace item not found");
        }
        if (item.sellerId !== sellerId) {
            throw new common_1.ForbiddenException("You can only edit status for your own listings");
        }
        return this.prisma.marketplaceItem.update({
            where: { id: itemId },
            data: { status },
        });
    }
};
exports.CampusService = CampusService;
exports.CampusService = CampusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampusService);
//# sourceMappingURL=campus.service.js.map