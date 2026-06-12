export declare class AiService {
    private sentimentEngine;
    analyzeSentiment(text: string): number;
    autoTagTicket(title: string, description: string): string;
}
