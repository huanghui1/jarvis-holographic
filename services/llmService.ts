export class LLMService {
  private static baseUrl: string | null = null;
  private static apiKey: string | null = null;
  private static modelId: string | null = null;

  static initialize() {
    if (!this.baseUrl) this.baseUrl = process.env.LLM_BASE_URL || null;
    if (!this.apiKey) this.apiKey = process.env.LLM_API_KEY || process.env.API_KEY || null;
    if (!this.modelId) this.modelId = process.env.LLM_MODEL || null;
  }

  static async generateResponse(prompt: string): Promise<string> {
    this.initialize();
    // const useProxy = typeof window !== 'undefined' && window.location.host.startsWith('localhost:3000');
    // if (!useProxy && (!this.baseUrl || !this.apiKey)) return "Systems offline.";

    // const url = useProxy
    const url = false
      ? `/api/llm/chat/completions`
      : `${this.baseUrl!.replace(/\/$/, '')}/responses`;
    const body = {
      model: this.modelId || "auto",
      input: [
        {
          role: "system",
          content: "You need to fully embody JARVIS, the AI system from Marvel movies.Speak concisely and accurately, without rambling."
        },
        { role: "user", content: prompt }
      ],
      stream: false
    };
    debugger
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      // if (!useProxy && this.apiKey) {
      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        return "Communication link unstable.";
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      return typeof text === "string" && text.length > 0
        ? text
        : "I am unable to process that data, sir.";
    } catch (e) {
      return "Communication protocols failing, sir.";
    }
  }
}
