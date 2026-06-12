import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(loginDto: LoginDto): Promise<any>;
    login(user: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            permissions: any;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            permissions: any;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
            permissions: any[];
        };
    }>;
    getProfile(userId: string): Promise<{
        anonymousProfiles: {
            id: string;
            createdAt: Date;
            avatarUrl: string | null;
            alias: string;
        }[];
        university: {
            id: string;
            name: string;
            domain: string;
            createdAt: Date;
        };
        department: {
            id: string;
            name: string;
            universityId: string;
        } | null;
        program: {
            id: string;
            name: string;
            departmentId: string;
        } | null;
        batch: {
            id: string;
            name: string;
            programId: string;
        } | null;
        class: {
            id: string;
            name: string;
            batchId: string;
        } | null;
        user: {
            id: string;
            role: {
                name: string;
            };
            createdAt: Date;
            email: string;
        };
        id: string;
        universityId: string;
        departmentId: string | null;
        programId: string | null;
        batchId: string | null;
        userId: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        echoScore: number;
        classId: string | null;
    }>;
}
