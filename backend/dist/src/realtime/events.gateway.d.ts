import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
export declare class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
    handleJoinUniversity(universityId: string, client: Socket): {
        status: string;
    };
    sendNewPost(universityId: string, post: any): void;
    sendTicketUpdate(universityId: string, ticket: any): void;
    sendNewNotification(userId: string, notification: any): void;
}
