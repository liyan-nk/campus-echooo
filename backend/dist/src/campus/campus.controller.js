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
exports.CampusController = void 0;
const common_1 = require("@nestjs/common");
const campus_service_1 = require("./campus.service");
const campus_dto_1 = require("./dto/campus.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let CampusController = class CampusController {
    campusService;
    prisma;
    constructor(campusService, prisma) {
        this.campusService = campusService;
        this.prisma = prisma;
    }
    async createClub(userId, dto) {
        return this.campusService.createClub(userId, dto);
    }
    async getClubs(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new Error("Profile not found");
        }
        return this.campusService.getClubs(profile.universityId);
    }
    async joinClub(userId, clubId) {
        return this.campusService.joinClub(userId, clubId);
    }
    async leaveClub(userId, clubId) {
        return this.campusService.leaveClub(userId, clubId);
    }
    async createEvent(userId, dto) {
        return this.campusService.createEvent(userId, dto);
    }
    async getEvents(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new Error("Profile not found");
        }
        return this.campusService.getEvents(profile.universityId);
    }
    async rsvpEvent(userId, eventId) {
        return this.campusService.rsvpEvent(userId, eventId);
    }
    async checkInEvent(hostId, eventId, studentId) {
        return this.campusService.checkInEvent(hostId, eventId, studentId);
    }
    async createItem(userId, dto) {
        return this.campusService.createMarketplaceItem(userId, dto);
    }
    async getMarketplaceItems(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new Error("Profile not found");
        }
        return this.campusService.getMarketplaceItems(profile.universityId);
    }
    async updateStatus(userId, itemId, status) {
        return this.campusService.updateItemStatus(userId, itemId, status);
    }
};
exports.CampusController = CampusController;
__decorate([
    (0, common_1.Post)("clubs"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campus_dto_1.CreateClubDto]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "createClub", null);
__decorate([
    (0, common_1.Get)("clubs"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "getClubs", null);
__decorate([
    (0, common_1.Post)("clubs/:id/join"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "joinClub", null);
__decorate([
    (0, common_1.Post)("clubs/:id/leave"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "leaveClub", null);
__decorate([
    (0, common_1.Post)("events"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campus_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Get)("events"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Post)("events/:id/rsvp"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "rsvpEvent", null);
__decorate([
    (0, common_1.Post)("events/:id/checkin/:studentId"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("studentId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "checkInEvent", null);
__decorate([
    (0, common_1.Post)("marketplace"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campus_dto_1.CreateMarketplaceItemDto]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "createItem", null);
__decorate([
    (0, common_1.Get)("marketplace"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "getMarketplaceItems", null);
__decorate([
    (0, common_1.Put)("marketplace/:id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)("userId")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CampusController.prototype, "updateStatus", null);
exports.CampusController = CampusController = __decorate([
    (0, common_1.Controller)("campus"),
    __metadata("design:paramtypes", [campus_service_1.CampusService,
        prisma_service_1.PrismaService])
], CampusController);
//# sourceMappingURL=campus.controller.js.map