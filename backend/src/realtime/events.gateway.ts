import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayInit, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  afterInit(server: Server) {
    this.logger.log("Socket.io Gateway Initialized.");
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // 1. Join a university room
  @SubscribeMessage("joinUniversity")
  handleJoinUniversity(
    @MessageBody() universityId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`univ:${universityId}`);
    this.logger.log(`Client ${client.id} joined room: univ:${universityId}`);
    return { status: "joined" };
  }

  // Helper methods to broadcast events from NestJS services

  sendNewPost(universityId: string, post: any) {
    this.server.to(`univ:${universityId}`).emit("newPost", post);
  }

  sendTicketUpdate(universityId: string, ticket: any) {
    this.server.to(`univ:${universityId}`).emit("ticketUpdate", ticket);
  }

  sendNewNotification(userId: string, notification: any) {
    // We can emit to a specific user socket room
    this.server.to(`user:${userId}`).emit("notification", notification);
  }
}
