import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Successfully connected to the database.");
    } catch (error: any) {
      this.logger.error("Failed to connect to the database on initialization:");
      this.logger.error(error.message || error);
      this.logger.warn("Continuing application startup. DB operations will fail until connection is resolved.");
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Disconnected from the database.");
  }
}
