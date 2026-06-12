import { Test, TestingModule } from "@nestjs/testing";
import { PostsService } from "./posts.service";
import { PrismaService } from "../prisma/prisma.service";
import { ModerationService } from "../moderation/moderation.service";
import { EventsGateway } from "../realtime/events.gateway";

describe("PostsService", () => {
  let service: PostsService;

  const mockPrisma = {
    post: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    anonymousProfile: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  const mockModeration = {
    autoFlagContent: jest.fn(() => false),
  };

  const mockEvents = {
    sendNewPost: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ModerationService, useValue: mockModeration },
        { provide: EventsGateway, useValue: mockEvents },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createPost", () => {
    it("should successfully create a public post", async () => {
      const mockProfile = { universityId: "univ-1", departmentId: "cs" };
      mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);

      const mockCreated = {
        id: "post-1",
        title: "Testing title",
        content: "Testing body",
        anonymous: false,
        universityId: "univ-1",
      };
      mockPrisma.post.create.mockResolvedValue(mockCreated);
      mockPrisma.post.findUnique.mockResolvedValue(mockCreated);

      const result = await service.createPost("user-1", {
        title: "Testing title",
        content: "Testing body",
        anonymous: false,
      });

      expect(result).toBeDefined();
      expect(result?.title).toBe("Testing title");
      expect(mockModeration.autoFlagContent).toHaveBeenCalled();
    });
  });
});
