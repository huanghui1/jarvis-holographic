import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static ai: GoogleGenAI | null = null;
  private static modelId = 'gemini-2.5-flash';

  static initialize() {
    if (!this.ai) {
      // API Key is injected via process.env.API_KEY
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }

  static async generateResponse(prompt: string): Promise<string> {
    this.initialize();
    if (!this.ai) return "Systems offline.";

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
        config: {
          systemInstruction: "You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), a highly advanced AI assistant. You are helpful, polite, and slightly robotic but witty. Keep your responses concise (under 2 sentences) and suitable for a Heads-Up Display interface. Do not use markdown formatting like asterisks.",
        }
      });

      return response.text || "I am unable to process that data, sir.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Communication protocols failing, sir.";
    }
  }
}