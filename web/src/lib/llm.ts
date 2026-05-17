/* ===== Gemini LLM client ===== */

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmResponse = {
  reply: string;
  error?: string;
  rateLimited?: boolean;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function chatWithLlm(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { reply: "", error: "GEMINI_API_KEY not set" };
  }

  // Gemini expects alternating user/model. We combine system + all history + current user into ONE user message
  const systemMsg = messages.find((m) => m.role === "system");
  const otherMsgs = messages.filter((m) => m.role !== "system");

  const conversationText = otherMsgs
    .map((m) => `${m.role === "assistant" ? "Bot Quantum" : "Usuario"}: ${m.content}`)
    .join("\n\n");

  const fullPrompt = systemMsg
    ? `${systemMsg.content}\n\n${conversationText}\n\nBot Quantum:`
    : `${conversationText}\n\nBot Quantum:`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: fullPrompt }] },
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.9,
          maxOutputTokens: options?.maxTokens ?? 1024,
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
    return { reply };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gemini error";
    return { reply: "", error: msg, rateLimited: msg.includes("429") };
  }
}

export function getSystemPrompt(catalog: string): string {
  return `Sos el Bot Quantum, asesor de Quantum Motors Bolivia. Habla como un amigo por WhatsApp: calido, con emojis, entende typos. Solo usa datos del catalogo. Si no sabes algo, decilo natural. Catalogo: ${catalog}`;
}
