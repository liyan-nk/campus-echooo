import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { ModerationService } from "./moderation.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("moderation")
@Roles("MODERATOR", "SUPER_ADMIN", "UNIV_ADMIN")
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Get("reports")
  async getReports() {
    return this.moderationService.getReports();
  }

  @Post("reports/:id/resolve")
  async resolveReport(
    @CurrentUser("userId") userId: string,
    @Param("id") reportId: string,
    @Body("action") action: "DELETE" | "DISMISS",
  ) {
    return this.moderationService.resolveReport(reportId, userId, action);
  }
}
