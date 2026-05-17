/* ===== Gemini LLM client (primary) with Groq fallback ===== */

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmResponse = {
  reply: string;
  error?: string;
  rateLimited?: boolean;
  source?: "gemini" | "groq" | "fallback";
};

/* ---------- Gemini ---------- */
async function chatWithGemini(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { reply: "", error: "GEMINI_API_KEY not set" };
  }

  // Convert OpenAI-style messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Gemini doesn't have a system role; prepend system prompt as first user message
  if (contents.length > 0 && contents[0].role === "model") {
    contents[0].role = "user" as const;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.9,
          maxOutputTokens: options?.maxTokens ?? 128,
          topP: 0.9,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        reply: "",
        error: `Gemini ${res.status}: ${text}`,
        rateLimited: res.status === 429,
      };
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { reply, source: "gemini" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gemini error";
    return { reply: "", error: msg, rateLimited: msg.includes("429") };
  }
}

/* ---------- Groq fallback ---------- */
async function chatWithGroq(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: options?.temperature ?? 0.9,
      max_tokens: options?.maxTokens ?? 128,
      top_p: 0.9,
    });

    const reply = completion.choices[0]?.message?.content || "";
    return { reply, source: "groq" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Groq API error";
    const rateLimited = msg.includes("rate_limit") || msg.includes("429");
    return { reply: "", error: msg, rateLimited };
  }
}

/* ---------- Unified entry ---------- */
export async function chatWithLlm(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  // Try Gemini first (free, generous limits)
  const geminiResult = await chatWithGemini(messages, options);
  if (!geminiResult.error && geminiResult.reply) {
    return geminiResult;
  }

  // Fallback to Groq
  const groqResult = await chatWithGroq(messages, options);
  if (!groqResult.error && groqResult.reply) {
    return groqResult;
  }

  // Both failed
  return {
    reply: "",
    error: groqResult.error || geminiResult.error || "All LLM providers failed",
    rateLimited: groqResult.rateLimited || geminiResult.rateLimited,
  };
}

export function getSystemPrompt(catalog: string): string {
  return `Sos Bot Quantum, asesor de Quantum Motors Bolivia. Habla como un amigo por WhatsApp: calido, con emojis, entende typos. Solo usa datos del catalogo. Si no sabes algo, decilo natural. Catalogo: ${catalog}`;
}
