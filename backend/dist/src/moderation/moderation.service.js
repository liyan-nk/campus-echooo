"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ModerationService = class ModerationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async resolveReport(reportId, resolverId, action) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new common_1.NotFoundException("Report not found");
        }
        return this.prisma.$transaction(async (tx) => {
            if (action === "DELETE") {
                if (report.postId) {
                    await tx.post.delete({
                        where: { id: report.postId },
                    });
                }
                else if (report.commentId) {
                    await tx.comment.delete({
                        where: { id: report.commentId },
                    });
                }
            }
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
    async autoFlagContent(type, targetId, textToCheck) {
        const toxicKeywords = [
            "cheat", "leak", "threat", "harass", "dox",
            "kill", "hate", "scam", "hack", "hackathon-cheat"
        ];
        const lowerText = textToCheck.toLowerCase();
        const matches = toxicKeywords.filter((word) => lowerText.includes(word));
        if (matches.length > 0) {
            let aiUser = await this.prisma.user.findFirst({
                where: { role: { name: "SUPER_ADMIN" } },
            });
            if (!aiUser)
                return;
            await this.prisma.report.create({
                data: {
                    reason: `AI Moderation: Flagged for potential toxic language / guidelines breach. Matched words: [${matches.join(", ")}]`,
                    status: "PENDING",
                    reporterId: aiUser.id,
                    postId: type === "POST" ? targetId : null,
                    commentId: type === "COMMENT" ? targetId : null,
                },
            });
            return true;
        }
        return false;
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModerationService);
//# sourceMappingURL=moderation.service.js.map