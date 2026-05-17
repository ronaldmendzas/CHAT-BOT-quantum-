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

export type LlmMeta = {
  intent: "WELCOME" | "VEHICLE" | "STOCK" | "SUCURSALES" | "TEST_DRIVE" | "UNKNOWN";
  productId?: string;
  productIds?: string[];
  contextStep?: string;
};

export type LlmResponse = {
  reply: string;
  meta?: LlmMeta;
  error?: string;
};

function extractMeta(text: string): { reply: string; meta?: LlmMeta } {
  const pattern = /---META---\s*([\s\S]*?)\s*---ENDMETA---/;
  const match = text.match(pattern);
  if (!match) return { reply: text };

  const jsonBlock = match[1].trim();
  const cleanReply = text.replace(match[0], "").trim();

  try {
    const parsed = JSON.parse(jsonBlock);
    const meta: LlmMeta = {
      intent: parsed.intent || "UNKNOWN",
      productId: parsed.productId || undefined,
      productIds: Array.isArray(parsed.productIds) ? parsed.productIds : undefined,
      contextStep: parsed.contextStep || undefined,
    };
    return { reply: cleanReply, meta };
  } catch {
    return { reply: text };
  }
}

export async function chatWithLlm(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 512,
      top_p: 0.9,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const { reply, meta } = extractMeta(raw);
    return { reply, meta };
  } catch (err) {
    return {
      reply: "",
      error: err instanceof Error ? err.message : "Groq API error",
    };
  }
}

export function getSystemPrompt(productsJson: string): string {
  return `Sos Bot Quantum, el asesor de electromovilidad de Quantum Motors Bolivia.

REGLAS CRITICAS:
1. RESPONDE SIEMPRE en espanol de Bolivia (tuteo amigable pero profesional).
2. Tu meta es ayudar al usuario a encontrar el vehiculo electrico ideal y cerrar con un Test Drive.
3. NUNCA inventes datos. Usa SOLO la informacion del catalogo que te proporciono.
4. Si no sabes algo, deci "No tengo esa informacion confirmada, pero te puedo ayudar con..."
5. Sos conciso (max 3-4 oraciones por respuesta) pero calido.
6. Cuando muestres productos, inclui precio y autonomia.
7. Si el usuario quiere agendar Test Drive, decile que puede hacerlo en el panel derecho.
8. Mantene el contexto de la conversacion. Si el usuario ya dijo que quiere una moto, no le preguntes de nuevo.

CATALOGO DE PRODUCTOS:
${productsJson}

BENEFICIOS DE ELECTROMOVILIDAD (para mencionar cuando aplica):
- Ahorro: 70% menos en combustible vs gasolina
- Mantenimiento: sin aceite, sin filtros, sin bujias
- Ambiente: cero emisiones de CO2
- Ciudad: silencioso, facil de estacionar, sin restricciones de pico y placa

SUCURSALES: La Paz, Santa Cruz, Cochabamba, Sucre, Tarija, Oruro, Potosi, Trinidad.

REQUISITOS TEST DRIVE: Licencia de conducir vigente y carnet de identidad.

INSTRUCCION TECNICA (el usuario NO debe ver esto):
Al final de cada respuesta inclui EXACTAMENTE este bloque con metadatos para la UI:

---META---
{
  "intent": "WELCOME" | "VEHICLE" | "STOCK" | "SUCURSALES" | "TEST_DRIVE" | "UNKNOWN",
  "productId": "id-del-producto-o-null",
  "productIds": ["id1", "id2"] o null,
  "contextStep": "WELCOME" | "ASKING_TYPE" | "ASKING_USE" | "ASKING_BUDGET" | "SHOWING_RESULTS" | "VEHICLE_DETAIL" | "SUCURSALES" | "TEST_DRIVE" | "UNKNOWN"
}
---ENDMETA---

El usuario NO debe ver el bloque META. Responde de forma natural y conversacional, como un vendedor experimentado pero sin ser invasivo.`;
}
