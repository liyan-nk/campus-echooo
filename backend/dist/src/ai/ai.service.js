"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const sentiment_1 = __importDefault(require("sentiment"));
let AiService = class AiService {
    sentimentEngine = new sentiment_1.default();
    analyzeSentiment(text) {
        if (!text || !text.trim())
            return 50;
        const result = this.sentimentEngine.analyze(text);
        const rawScore = result.score;
        const mapped = 50 + rawScore * 5;
        return Math.min(Math.max(mapped, 0), 100);
    }
    autoTagTicket(title, description) {
        const combined = `${title} ${description}`.toLowerCase();
        const tagsMap = {
            FACILITIES: ["water", "leak", "broken", "light", "door", "window", "ac", "aircon", "chair", "desk", "maintenance", "wifi", "internet", "router"],
            ACADEMIC: ["grade", "course", "class", "exam", "syllabus", "professor", "credits", "lecture", "waiver", "prerequisite", "major"],
            FINANCIAL: ["tuition", "fee", "payment", "scholarship", "refund", "billing", "charges", "receipt"],
            HOSTEL: ["room", "hostel", "mess", "food", "bed", "roommate", "dorm", "laundry"],
        };
        for (const [category, keywords] of Object.entries(tagsMap)) {
            const matched = keywords.filter((word) => combined.includes(word));
            if (matched.length >= 1) {
                return category;
            }
        }
        return "OTHERS";
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map