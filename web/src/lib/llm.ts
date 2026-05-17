/* ===== LLM client: Groq (primary) -> Hugging Face (auto-fallback) ===== */

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const HF_MODEL = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmResponse = {
  reply: string;
  error?: string;
  rateLimited?: boolean;
  source?: "groq" | "huggingface" | "rules";
};

/* ---------- Groq ---------- */
async function chatWithGroq(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: options?.temperature ?? 0.9,
      max_tokens: options?.maxTokens ?? 256,
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

/* ---------- Hugging Face (free fallback) ---------- */
async function chatWithHuggingFace(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return { reply: "", error: "HF_API_KEY not set" };
  }

  // Build prompt in Mistral chat format
  const systemMsg = messages.find((m) => m.role === "system");
  const conversation = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "assistant" ? "Bot Quantum" : "Usuario"}: ${m.content}`)
    .join("\n\n");

  const prompt = systemMsg
    ? `${systemMsg.content}\n\n${conversation}\n\nBot Quantum:`
    : `${conversation}\n\nBot Quantum:`;

  const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: options?.temperature ?? 0.9,
          max_new_tokens: options?.maxTokens ?? 256,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        reply: "",
        error: `HF ${res.status}: ${text}`,
        rateLimited: res.status === 429,
      };
    }

    const data = await res.json();
    // HF returns array: [{ generated_text: "..." }]
    const reply = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : "";
    return { reply, source: "huggingface" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "HF error";
    return { reply: "", error: msg, rateLimited: msg.includes("429") };
  }
}

/* ---------- Unified entry ---------- */
export async function chatWithLlm(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  // Try Groq first
  const groqResult = await chatWithGroq(messages, options);
  if (!groqResult.error && groqResult.reply) {
    return groqResult;
  }

  // If Groq rate limited or failed, try Hugging Face automatically
  if (groqResult.rateLimited || groqResult.error) {
    const hfResult = await chatWithHuggingFace(messages, options);
    if (!hfResult.error && hfResult.reply) {
      return hfResult;
    }
    // Return Groq error but note we tried HF
    return {
      ...groqResult,
      error: `Groq: ${groqResult.error}. HF: ${hfResult.error}`,
    };
  }

  return groqResult;
}

export function getSystemPrompt(catalog: string): string {
  return `Sos el Bot Quantum, asesor de Quantum Motors Bolivia. Habla como un amigo por WhatsApp: calido, con emojis, entende typos. Solo usa datos del catalogo. Si no sabes algo, decilo natural. Catalogo: ${catalog}`;
}
