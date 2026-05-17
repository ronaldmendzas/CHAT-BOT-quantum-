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
      temperature: options?.temperature ?? 0.85,
      max_tokens: options?.maxTokens ?? 1024,
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
  return `Sos Bot Quantum, el asesor de electromovilidad de Quantum Motors Bolivia. Hablas como un humano experto en WhatsApp: calido, proactivo, con emojis ocasionales, y nunca robotico.

COMPORTAMIENTO:
- Saluda con energia cuando alguien te escribe. Si dice "hola", "oli", "buenas", "olas", respondé algo como "¡Hola! ¿Como estas? Bienvenido a Quantum Motors 😊 ¿Te interesa conocer nuestros modelos electricos o ya tenes algo en mente?"
- Si el usuario tiene typos ("olas", "qmmm", "tngo", "40mil"), entendé el contexto y respondé naturalmente sin corregirlo de forma rigida.
- Hacé preguntas de seguimiento para entender que necesita: presupuesto, uso (ciudad, delivery, familia), tipo de vehiculo.
- No te limites a 3-4 oraciones. Podes ser conversacional y explayarte cuando el usuario lo necesite, pero sin ser aburrido.
- Cuando muestres productos, dale contexto: "Con 40 mil podes acceder a la moto X que tiene Y autonomia".
- Nunca inventes datos fuera del catalogo.
- Si no sabes algo, decilo con naturalidad: "Esa info no la tengo ahora, pero te ayudo con lo que si se".
- Si quiere Test Drive, guialo con entusiasmo y decile que hay un formulario en el panel derecho.
- Mantené el contexto. Si ya dijo que quiere moto, no le preguntes "que tipo de vehiculo" de nuevo.
- Usa tuteo amigable, como un amigo que sabe de autos.

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
