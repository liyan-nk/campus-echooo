import { PrismaService } from "../prisma/prisma.service";
import { CreateClubDto, CreateEventDto, CreateMarketplaceItemDto } from "./dto/campus.dto";
export declare class CampusService {
    private prisma;
    constructor(prisma: PrismaService);
    createClub(creatorId: string, dto: CreateClubDto): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        universityId: string;
        logoUrl: string | null;
        creatorId: string;
    }>;
    getClubs(universityId: string): Promise<({
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
    createEvent(creatorId: string, dto: CreateEventDto): Promise<{
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
    getEvents(universityId: string): Promise<({
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
    createMarketplaceItem(sellerId: string, dto: CreateMarketplaceItemDto): Promise<{
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
    getMarketplaceItems(universityId: string): Promise<({
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
    updateItemStatus(sellerId: string, itemId: string, status: "AVAILABLE" | "SOLD"): Promise<{
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
