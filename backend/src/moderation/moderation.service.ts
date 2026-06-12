import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  // 1. Get all pending reports
  async getReports() {
    return this.prisma.report.findMany({
      where: { status: "PENDING" },
      include: {
        reporter: {
          select: {
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            anonymous: true,
            authorId: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            authorId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 2. Resolve Report
  async resolveReport(reportId: string, resolverId: string, action: "DELETE" | "DISMISS") {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!report) {
      throw new NotFoundException("Report not found");
    }

    return this.prisma.$transaction(async (tx) => {
      if (action === "DELETE") {
        if (report.postId) {
          // Delete Post (and cascades to votes/comments/reactions via prisma schemas)
          await tx.post.delete({
            where: { id: report.postId },
          });
        } else if (report.commentId) {
          // Delete Comment
          await tx.comment.delete({
            where: { id: report.commentId },
          });
        }
      }

      // Update report status
      await tx.report.update({
        where: { id: reportId },
        data: {
          status: action === "DELETE" ? "RESOLVED" : "DISMISSED",
          resolverId,
        },
      });

      return { success: true };
    });
  }

  // 3. AI / Local Heuristic Auto-Flagging Logic
  async autoFlagContent(type: "POST" | "COMMENT", targetId: string, textToCheck: string) {
    const toxicKeywords = [
      "cheat", "leak", "threat", "harass", "dox", 
      "kill", "hate", "scam", "hack", "hackathon-cheat"
    ];

    const lowerText = textToCheck.toLowerCase();
    const matches = toxicKeywords.filter((word) => lowerText.includes(word));

    if (matches.length > 0) {
      // Find AI System User or default resolver
      let aiUser = await this.prisma.user.findFirst({
        where: { role: { name: "SUPER_ADMIN" } },
      });
      if (!aiUser) return; // Seeding required

      // Create Report automatically
      await this.prisma.report.create({
        data: {
          reason: `AI Moderation: Flagged for potential toxic language / guidelines breach. Matched words: [${matches.join(", ")}]`,
          status: "PENDING",
          reporterId: aiUser.id,
          postId: type === "POST" ? targetId : null,
          commentId: type === "COMMENT" ? targetId : null,
        },
      });

      return true; // flagged
    }

    return false; // clean
  }
}
