import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockUser = {
    id: "user-123",
    email: "student@echostate.edu",
    passwordHash: "",
    status: "ACTIVE",
    role: {
      name: "STUDENT",
      permissions: [
        { permission: { name: "post:create" } },
      ],
    },
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    anonymousProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  const mockJwt = {
    sign: jest.fn(() => "mockToken"),
    verify: jest.fn(() => ({ sub: "user-123" })),
  };

  beforeEach(async () => {
    // Pre-hash mock user password for verification
    const salt = await bcrypt.genSalt(10);
    mockUser.passwordHash = await bcrypt.hash("Password123!", salt);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should successfully validate correct password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser({
        email: "student@echostate.edu",
        password: "Password123!",
      });

      expect(result).toBeDefined();
      expect(result.email).toBe("student@echostate.edu");
    });

    it("should throw UnauthorizedException on wrong credentials", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser({
          email: "student@echostate.edu",
          password: "wrongPassword",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("login", () => {
    it("should generate access and refresh tokens", async () => {
      const result = await service.login(mockUser);
      expect(result.accessToken).toBe("mockToken");
      expect(result.refreshToken).toBe("mockToken");
      expect(result.user.role).toBe("STUDENT");
    });
  });
});
