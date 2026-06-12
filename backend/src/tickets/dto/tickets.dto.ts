import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { TicketStatus, Severity } from "@prisma/client";

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: "Ticket title is required" })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: "Ticket description is required" })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: "Category is required" })
  category!: string; // ACADEMIC, FACILITIES, FINANCIAL, HOSTEL, OTHERS

  @IsEnum(["LOW", "MEDIUM", "HIGH"], { message: "Severity must be LOW, MEDIUM, or HIGH" })
  @IsOptional()
  severity?: Severity = "LOW";

  @IsString()
  @IsOptional()
  departmentId?: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(
    ["SUBMITTED", "REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"],
    { message: "Invalid ticket status value" }
  )
  status!: TicketStatus;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}
