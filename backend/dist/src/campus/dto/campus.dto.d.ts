import { ItemCondition } from "@prisma/client";
export declare class CreateClubDto {
    name: string;
    description: string;
    logoUrl?: string;
}
export declare class CreateEventDto {
    title: string;
    description: string;
    date: string;
    location: string;
    clubId?: string;
}
export declare class CreateMarketplaceItemDto {
    title: string;
    description: string;
    price: number;
    condition: ItemCondition;
    imageUrl?: string;
}
