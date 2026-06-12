"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        if (user.status === "SUSPENDED") {
            throw new common_1.UnauthorizedException("Your account has been suspended");
        }
        return user;
    }
    async login(user) {
        const permissions = user.role.permissions.map((rp) => rp.permission.name);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role.name,
            permissions,
        };
        return {
            accessToken: this.jwtService.sign(payload, { expiresIn: "15m" }),
            refreshToken: this.jwtService.sign(payload, { expiresIn: "7d" }),
            user: {
                id: user.id,
                email: user.email,
                role: user.role.name,
                permissions,
            },
        };
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException("Email already registered");
        }
        const roleName = dto.roleName || "STUDENT";
        const role = await this.prisma.role.findUnique({
            where: { name: roleName },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role ${roleName} not found`);
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);
        let universityId = dto.universityId;
        if (!universityId) {
            const defaultUniv = await this.prisma.university.findFirst();
            if (!defaultUniv) {
                throw new common_1.NotFoundException("No university seeded in database. Run seeds first.");
            }
            universityId = defaultUniv.id;
        }
        const newUser = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    roleId: role.id,
                },
            });
            await tx.profile.create({
                data: {
                    userId: user.id,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    universityId,
                    departmentId: dto.departmentId,
                    programId: dto.programId,
                    batchId: dto.batchId,
                    classId: dto.classId,
                },
            });
            const adjectives = ["Silent", "Crimson", "Sneaky", "Witty", "Bold", "Mystic", "Swift", "Bright"];
            const nouns = ["Echo", "Scholar", "Owl", "Beacon", "Fox", "Sage", "Pioneer", "Gator"];
            const randomAlias = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(100 + Math.random() * 900)}`;
            await tx.anonymousProfile.create({
                data: {
                    userId: user.id,
                    alias: randomAlias,
                    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${randomAlias}`,
                },
            });
            return user;
        });
        const fullUser = await this.prisma.user.findUnique({
            where: { id: newUser.id },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        return this.login(fullUser);
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!user || user.status === "SUSPENDED") {
                throw new common_1.UnauthorizedException("Invalid session");
            }
            const permissions = user.role.permissions.map((rp) => rp.permission.name);
            const newPayload = {
                sub: user.id,
                email: user.email,
                role: user.role.name,
                permissions,
            };
            return {
                accessToken: this.jwtService.sign(newPayload, { expiresIn: "15m" }),
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role.name,
                    permissions,
                },
            };
        }
        catch {
            throw new common_1.UnauthorizedException("Invalid or expired refresh token");
        }
    }
    async getProfile(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        createdAt: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                university: true,
                department: true,
                program: true,
                batch: true,
                class: true,
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException("Profile not found");
        }
        const anonymousProfiles = await this.prisma.anonymousProfile.findMany({
            where: { userId },
            select: {
                id: true,
                alias: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        return {
            ...profile,
            anonymousProfiles,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map