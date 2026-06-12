import { CampusService } from "./campus.service";
import { CreateClubDto, CreateEventDto, CreateMarketplaceItemDto } from "./dto/campus.dto";
import { PrismaService } from "../prisma/prisma.service";
export declare class CampusController {
    private campusService;
    private prisma;
    constructor(campusService: CampusService, prisma: PrismaService);
    createClub(userId: string, dto: CreateClubDto): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        universityId: string;
        logoUrl: string | null;
        creatorId: string;
    }>;
    getClubs(userId: string): Promise<({
        _count: {
            members: number;
        };
        creator: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        };
    } & {
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        universityId: string;
        logoUrl: string | null;
        creatorId: string;
    })[]>;
    joinClub(userId: string, clubId: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.ClubRole;
        createdAt: Date;
        userId: string;
        clubId: string;
    }>;
    leaveClub(userId: string, clubId: string): Promise<{
        success: boolean;
    }>;
    createEvent(userId: string, dto: CreateEventDto): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        universityId: string;
        title: string;
        date: Date;
        location: string;
        clubId: string | null;
        creatorId: string;
        qrCodeUrl: string | null;
    }>;
    getEvents(userId: string): Promise<({
        club: {
            id: string;
            name: string;
            logoUrl: string | null;
        } | null;
        _count: {
            rsvps: number;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        universityId: string;
        title: string;
        date: Date;
        location: string;
        clubId: string | null;
        creatorId: string;
        qrCodeUrl: string | null;
    })[]>;
    rsvpEvent(userId: string, eventId: string): Promise<{
        rsvped: boolean;
    }>;
    checkInEvent(hostId: string, eventId: string, studentId: string): Promise<{
        success: boolean;
    }>;
    createItem(userId: string, dto: CreateMarketplaceItemDto): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        universityId: string;
        status: import("@prisma/client").$Enums.MarketplaceStatus;
        title: string;
        price: number;
        condition: import("@prisma/client").$Enums.ItemCondition;
        imageUrl: string | null;
        sellerId: string;
    }>;
    getMarketplaceItems(userId: string): Promise<({
        seller: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        universityId: string;
        status: import("@prisma/client").$Enums.MarketplaceStatus;
        title: string;
        price: number;
        condition: import("@prisma/client").$Enums.ItemCondition;
        imageUrl: string | null;
        sellerId: string;
    })[]>;
    updateStatus(userId: string, itemId: string, status: "AVAILABLE" | "SOLD"): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        universityId: string;
        status: import("@prisma/client").$Enums.MarketplaceStatus;
        title: string;
        price: number;
        condition: import("@prisma/client").$Enums.ItemCondition;
        imageUrl: string | null;
        sellerId: string;
    }>;
}
