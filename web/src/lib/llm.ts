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

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

export async function chatWithLlm(
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

  // Gemini doesn't have a system role; first message must be user
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
    return { reply };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gemini error";
    return { reply: "", error: msg, rateLimited: msg.includes("429") };
  }
}

export function getSystemPrompt(catalog: string): string {
  return `Sos Bot Quantum, asesor de Quantum Motors Bolivia. Habla como un amigo por WhatsApp: calido, con emojis, entende typos. Solo usa datos del catalogo. Si no sabes algo, decilo natural. Catalogo: ${catalog}`;
}
