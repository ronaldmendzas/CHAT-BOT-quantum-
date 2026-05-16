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
};

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

    const reply = completion.choices[0]?.message?.content || "";
    return { reply };
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
1. RESPONDE SIEMPRE en español de Bolivia (tuteo amigable pero profesional).
2. Tu meta es ayudar al usuario a encontrar el vehículo electrico ideal y cerrar con un Test Drive.
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

RESPONDE de forma natural y conversacional, como un vendedor experimentado pero sin ser invasivo.`;
}
