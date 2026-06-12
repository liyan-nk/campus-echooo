import { Module } from "@nestjs/common";
import { CampusService } from "./campus.service";
import { CampusController } from "./campus.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [CampusController],
  providers: [CampusService],
  exports: [CampusService],
})
export class CampusModule {}
