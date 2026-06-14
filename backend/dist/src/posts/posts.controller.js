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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const posts_service_1 = require("./posts.service");
const posts_dto_1 = require("./dto/posts.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let PostsController = class PostsController {
    postsService;
    prisma;
    constructor(postsService, prisma) {
        this.postsService = postsService;
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.postsService.createPost(userId, dto);
    }
    async getFeed(userId, algorithm, category) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new Error("University not resolved for user profile");
        }
        return this.postsService.getFeed(profile.universityId, algorithm || "new", category || "FEED");
    }
    async vote(userId, postId, dto) {
        return this.postsService.votePost(userId, postId, dto);
    }
    async votePoll(userId, optionId) {
        return this.postsService.votePoll(userId, optionId);
    }
    async addComment(userId, postId, dto) {
        return this.postsService.createComment(userId, postId, dto);
    }
    async getComments(postId) {
        return this.postsService.getComments(postId);
    }
    async pinComment(userId, commentId) {
        return this.postsService.pinComment(userId, commentId);
    }
    async updatePost(userId, postId, body) {
        return this.postsService.updatePost(userId, postId, body);
    }
    async deletePost(userId, postId) {
        return this.postsService.deletePost(userId, postId);
    }
    async updateComment(userId, commentId, body) {
        return this.postsService.updateComment(userId, commentId, body.content);
    }
    async deleteComment(userId, commentId) {
        return this.postsService.deleteComment(userId, commentId);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, posts_dto_1.CreatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("feed"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Query)("algorithm")),
    __param(2, (0, common_1.Query)("category")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Post)(":id/vote"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, posts_dto_1.VotePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "vote", null);
__decorate([
    (0, common_1.Post)("poll/vote/:optionId"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("optionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "votePoll", null);
__decorate([
    (0, common_1.Post)(":id/comments"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, posts_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(":id/comments"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)("comments/:id/pin"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "pinComment", null);
__decorate([
    (0, common_2.Patch)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updatePost", null);
__decorate([
    (0, common_2.Delete)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "deletePost", null);
__decorate([
    (0, common_2.Patch)("comments/:id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updateComment", null);
__decorate([
    (0, common_2.Delete)("comments/:id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "deleteComment", null);
exports.PostsController = PostsController = __decorate([
    (0, common_1.Controller)("posts"),
    __metadata("design:paramtypes", [posts_service_1.PostsService,
        prisma_service_1.PrismaService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map