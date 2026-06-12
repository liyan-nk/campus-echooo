import { Injectable } from "@nestjs/common";
// @ts-ignore
import Sentiment from "sentiment";

@Injectable()
export class AiService {
  private sentimentEngine = new Sentiment();

  // 1. Local Sentiment Scoring (returns index 0-100)
  analyzeSentiment(text: string): number {
    if (!text || !text.trim()) return 50; // Neutral fallback

    const result = this.sentimentEngine.analyze(text);
    // result.score is an integer. Positive is good, negative is bad.
    // Map score to a 0-100 range centered at 50.
    const rawScore = result.score; // typically -10 to +10 for short texts
    
    // Sigmoid mapping or simple linear clamping
    const mapped = 50 + rawScore * 5;
    return Math.min(Math.max(mapped, 0), 100);
  }

  // 2. Local Ticket Auto-Tagging
  autoTagTicket(title: string, description: string): string {
    const combined = `${title} ${description}`.toLowerCase();

    const tagsMap: Record<string, string[]> = {
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
}
