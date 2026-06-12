import { TicketStatus, Severity } from "@prisma/client";
export declare class CreateTicketDto {
    title: string;
    description: string;
    category: string;
    severity?: Severity;
    departmentId?: string;
}
export declare class UpdateTicketStatusDto {
    status: TicketStatus;
    assigneeId?: string;
}
