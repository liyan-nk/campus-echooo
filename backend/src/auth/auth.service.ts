import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
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
      throw new UnauthorizedException("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.status === "SUSPENDED") {
      throw new UnauthorizedException("Your account has been suspended");
    }

    return user;
  }

  async login(user: any) {
    const permissions = user.role.permissions.map((rp: any) => rp.permission.name);
    const payload: JwtPayload = {
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

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    // 2. Fetch Role
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
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 4. Resolve University
    let universityId = dto.universityId;
    if (!universityId) {
      // Find the first university as fallback or look up by email domain
      const defaultUniv = await this.prisma.university.findFirst();
      if (!defaultUniv) {
        throw new NotFoundException("No university seeded in database. Run seeds first.");
      }
      universityId = defaultUniv.id;
    }

    // 5. Create User & Profile in a Transaction
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

      // Generate random anonymous alias
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

    // Fetch complete user object for logging in
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

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      
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
        throw new UnauthorizedException("Invalid session");
      }

      const permissions = user.role.permissions.map((rp: any) => rp.permission.name);
      const newPayload: JwtPayload = {
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
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async getProfile(userId: string) {
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
      throw new NotFoundException("Profile not found");
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
}
