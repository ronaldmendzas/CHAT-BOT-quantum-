/* ===== Groq LLM client ===== */

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmResponse = {
  reply: string;
  error?: string;
  rateLimited?: boolean;
};

export async function chatWithLlm(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: options?.temperature ?? 0.9,
      max_tokens: options?.maxTokens ?? 128,
      top_p: 0.9,
    });

    const reply = completion.choices[0]?.message?.content || "";
    return { reply };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Groq API error";
    const rateLimited = msg.includes("rate_limit") || msg.includes("429");
    return {
      reply: "",
      error: msg,
      rateLimited,
    };
  }
}

export function getSystemPrompt(catalog: string): string {
  return `Sos Bot Quantum, asesor de Quantum Motors Bolivia. Habla como un amigo por WhatsApp: calido, con emojis, entende typos. Solo usa datos del catalogo. Si no sabes algo, decilo natural. Catalogo: ${catalog}`;
}
