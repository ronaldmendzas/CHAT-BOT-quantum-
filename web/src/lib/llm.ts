/* ===== LLM client: Groq (primary) -> Hugging Face (auto-fallback) ===== */

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
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
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 512,
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
  return `Sos Bot Quantum, asesor de Quantum Motors Bolivia. Usa SOLO los datos del CATALOGO y HECHOS. Nunca inventes precios ni specs. Si te preguntan algo que no esta en el catalogo, decilo amablemente.

REGLAS:
1. Responde con los datos exactos del CATALOGO.
2. Si te piden "mas barato" o "cuantos", usa los HECHOS del catalogo.
3. Sucursales: Cochabamba, La Paz, El Alto, Oruro, Santa Cruz, Yacuiba.
4. Test drive: licencia vigente + CI, Lun-Sab 09:00-18:00.
5. Habla como un amigo por WhatsApp: calido, con emojis.

${catalog}`;
}

export function getFullCatalogPrompt(
  products: { nombre: string; categoria: string; subcategoria?: string; precio: { monto: number; moneda: string }; descripcion_corta: string; especificaciones: Record<string, unknown>; colores: string[]; garantia?: string }[],
  sucursales: { ciudad: string; direccion: string; telefono: string; horario: string }[]
): string {
  const productList = products.map((p) => {
    const specs = p.especificaciones || {};
    const prest = (specs.PRESTACIONES || {}) as Record<string, any>;
    const motor = (specs.MOTOR || {}) as Record<string, any>;
    const bat = (specs.BATERIA || {}) as Record<string, any>;
    const datos = (specs["DATOS GENERALES"] || {}) as Record<string, any>;
    const dim = (specs["DIMENSIONES Y PESO"] || {}) as Record<string, any>;
    const autonomia = prest.autonomia_maxima || "";
    const vel = prest.velocidad_maxima_kmh || "";
    const potencia = motor.potencia_nominal_w ? motor.potencia_nominal_w + " W" : "";
    const bateria = bat.tipo ? bat.tipo + (bat.capacidad_ah ? " " + bat.capacidad_ah + "Ah" : "") : "";
    const asientos = datos.nro_asientos || "";
    const peso = dim.peso_neto_kg || "";

    let line = `${p.categoria} | ${p.nombre} | $${p.precio.monto} ${p.precio.moneda}`;
    if (p.subcategoria) line += ` | Tipo: ${p.subcategoria}`;
    if (p.descripcion_corta) line += ` | ${p.descripcion_corta}`;
    if (autonomia) line += ` | Autonomía: ${autonomia}`;
    if (vel) line += ` | Vel máx: ${vel}`;
    if (potencia) line += ` | Potencia: ${potencia}`;
    if (bateria) line += ` | Batería: ${bateria}`;
    if (asientos) line += ` | Asientos: ${asientos}`;
    if (peso) line += ` | Peso: ${peso}kg`;
    if (p.colores?.length) line += ` | Colores: ${p.colores.join(", ")}`;
    if (p.garantia) line += ` | Garantía: ${p.garantia}`;
    return line;
  }).join("\n");

  const sucursalList = sucursales.map((s) =>
    `• ${s.ciudad}: ${s.direccion} | ${s.telefono} | ${s.horario}`
  ).join("\n");

  return `Sos Bot Quantum, asesor experto de Quantum Motors Bolivia, primera empresa boliviana de electromovilidad.

CATÁLOGO COMPLETO — USÁ EXACTAMENTE ESTOS DATOS. NUNCA inventes precios, specs, ni porcentajes. Si algo no está acá, decí "no tengo ese dato".

${productList}

SUCURSALES:
${sucursalList}

TEST DRIVE: Licencia vigente + CI. Lun-Sab 09:00-18:00.

REGLAS DE RESPUESTA:
1. Si el usuario describe su SITUACIÓN (ej: "soy estudiante, camino 10 km"), RECOMENDALE el producto más adecuado del catálogo, explicando por qué.
2. Si pregunta por UBICACIONES o SUCURSALES, usá la lista de sucursales.
3. Si pregunta por PRECIOS o PRESUPUESTO, calculá solo con los precios exactos del catálogo. NUNCA inventes descuentos.
4. Si pregunta "más barato" o "más económico", ordená por precio y mostrá el menor.
5. Si confirma un TEST DRIVE o CITA, respondé confirmando y dando indicaciones útiles.
6. HABLÁ COMO UN AMIGO POR WHATSAPP: cálido, con emojis, frases cortas. No repitas el catálogo entero si no te lo piden.
7. Si el usuario dice algo ambiguo, preguntale amablemente qué necesita.`;
}
