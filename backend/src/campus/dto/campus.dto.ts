import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum } from "class-validator";
import { ItemCondition } from "@prisma/client";

export class CreateClubDto {
  @IsString()
  @IsNotEmpty({ message: "Club name is required" })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: "Club description is required" })
  description!: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: "Event title is required" })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: "Event description is required" })
  description!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty({ message: "Event location is required" })
  location!: string;

  @IsString()
  @IsOptional()
  clubId?: string;
}

export class CreateMarketplaceItemDto {
  @IsString()
  @IsNotEmpty({ message: "Item title is required" })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: "Item description is required" })
  description!: string;

  @IsNumber()
  price!: number;

  @IsEnum(["NEW", "LIKE_NEW", "GOOD", "FAIR"], { message: "Condition must be NEW, LIKE_NEW, GOOD or FAIR" })
  condition!: ItemCondition;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
