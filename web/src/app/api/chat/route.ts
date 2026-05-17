/* ===== Chat API — Factual answers computed server-side, Groq only for style ===== */

import { NextRequest, NextResponse } from "next/server";
import { chatWithLlm, getSystemPrompt } from "@/lib/llm";
import type { ConversationContext, Product, Sucursal } from "@/lib/types";
import { getProducts, getSucursales } from "@/lib/db";

function norm(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function detectIntent(message: string): string {
  const t = norm(message);
  
  if (/\b(test drive|prueba|agendar|probar|cita|testdrive)\b/.test(t)) return "TEST_DRIVE";
  if (/\b(sucursales?|tiendas?|donde|ubicacion|direccion|local|zona)\b/.test(t)) return "SUCURSALES";
  if (/\b(precio|cuanto|cuesta|valor|costo)\b/.test(t) && /\b(barato|barata|economico|economica|menor|mas bajo)\b/.test(t)) return "CHEAPEST";
  if (/\b(cuantos|cuantas|cantidad|total|productos|modelos|items)\b/.test(t)) return "COUNT";
  if (/\b(ahorro|ahorrar|gasto|gastos|combustible|mantenimiento|impuestos|co2|porcentaje)\b/.test(t)) return "SAVINGS";
  if (/\b(autos?|carro|sedan|suv|camioneta)\b/.test(t)) return "AUTOS";
  if (/\b(motos?|scooter|trimoto)\b/.test(t)) return "MOTOS";
  if (/\b(bicis?|bicicleta)\b/.test(t)) return "BICIS";
  if (/\b(accesorios?|casco|candado|mochila|cajuela|enchufe)\b/.test(t)) return "ACCESORIOS";
  if (/\b(ion|camion|truck|cargo)\b/.test(t)) return "CAMIONES";
  if (/\b(diferencia|comparar|comparacion|versus|vs)\b/.test(t)) return "COMPARE";
  if (/\b(stock|disponible|hay|tienen|tenes)\b/.test(t) && /\b(modelo|producto|vehiculo)\b/.test(t)) return "STOCK";
  
  return "WELCOME";
}

function findProductByName(message: string, products: Product[]): Product | undefined {
  const t = norm(message);
  const sorted = [...products].sort((a, b) => b.nombre.length - a.nombre.length);
  return sorted.find((p) => {
    const slug = norm(p.nombre);
    return t.includes(slug);
  });
}

function findTwoProducts(message: string, products: Product[]): [Product | undefined, Product | undefined] {
  const t = norm(message);
  const sorted = [...products].sort((a, b) => b.nombre.length - a.nombre.length);
  const found: Product[] = [];
  for (const p of sorted) {
    if (found.length >= 2) break;
    const slug = norm(p.nombre);
    if (t.includes(slug)) {
      found.push(p);
    }
  }
  return [found[0], found[1]];
}

function getSpec(p: Product, keyPath: string[]): string {
  let val: unknown = p.especificaciones;
  for (const key of keyPath) {
    if (val && typeof val === "object" && key in val) {
      val = (val as Record<string, unknown>)[key];
    } else {
      return "";
    }
  }
  if (val === null || val === undefined) return "";
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    return Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" / ");
  }
  return String(val);
}

function formatProductInfo(p: Product): string {
      const specs = (p.especificaciones || {}) as Record<string, Record<string, unknown>>;
      const prest = specs.PRESTACIONES || {};
      const motor = specs.MOTOR || {};
      const bat = specs.BATERIA || {};
      const datos = specs["DATOS GENERALES"] || {};
      const dim = specs["DIMENSIONES Y PESO"] || {};
      
      const autonomia = String(prest.autonomia_maxima || "");
      const vel = prest.velocidad_maxima_kmh;
      const velocidad = vel ? (typeof vel === "object" && vel !== null ? Object.values(vel as Record<string, unknown>).join("/") + " km/h" : String(vel) + " km/h") : "";
      const potencia = motor.potencia_nominal_w ? String(motor.potencia_nominal_w) + " W" : "";
      const bateria = bat.tipo ? String(bat.tipo) + (bat.capacidad_ah ? ` ${String(bat.capacidad_ah)}Ah` : "") : "";
      const asientos = String(datos.nro_asientos || "");
      const peso = String(dim.peso_neto_kg || "");
  const colores = p.colores?.length ? p.colores.join(", ") : "";
  
  let info = `${p.nombre} - $${p.precio.monto} ${p.precio.moneda}`;
  if (p.descripcion_corta) info += `. ${p.descripcion_corta}`;
  if (autonomia) info += `. Autonomía: ${autonomia}`;
  if (velocidad) info += `. Velocidad: ${velocidad}`;
  if (potencia) info += `. Potencia: ${potencia}`;
  if (bateria) info += `. Batería: ${bateria}`;
  if (asientos) info += `. Asientos: ${asientos}`;
  if (peso) info += `. Peso: ${peso}`;
  if (colores) info += `. Colores: ${colores}`;
  if (p.garantia) info += `. Garantía: ${p.garantia}`;
  return info;
}

function generateAnswer(products: Product[], sucursales: Sucursal[], message: string): { reply: string; intent: string; productId?: string; productIds?: string[] } {
  const intent = detectIntent(message);
  const matched = findProductByName(message, products);
  const vehiculos = products.filter(p => p.categoria === "VEHICULO");
  // Use name-based detection since DB subcategoria has errors (E4 is 'moto', CAJUELA is 'moto')
  const autos = vehiculos.filter(p => {
    const n = norm(p.nombre);
    return n.includes("nexus") || n.includes("equte") || n.includes("e4") || n.includes("corona");
  });
  const motos = vehiculos.filter(p => {
    const n = norm(p.nombre);
    return ["trooper", "urban", "flashride", "street", "hunter", "tc", "wanderer", "colibri", "luna", "starto"].some(k => n.includes(k));
  });
  const bicis = vehiculos.filter(p => {
    const n = norm(p.nombre);
    return n.includes("ara") || n.includes("a5");
  });
  const camiones = vehiculos.filter(p => {
    const n = norm(p.nombre);
    return n.includes("ion");
  });
  const accesorios = products.filter(p => p.categoria === "ACCESORIO");

  switch (intent) {
    case "TEST_DRIVE": {
      return {
        reply: `¡Genial! 🚗 Para agendar un Test Drive necesitás licencia de conducir vigente y CI. Tenemos sucursales en: ${sucursales.map(s => s.ciudad).join(", ")}. ¿En qué ciudad querés probar?`,
        intent: "TEST_DRIVE"
      };
    }

    case "SUCURSALES": {
      const lista = sucursales.map(s => 
        `• ${s.ciudad}: ${s.direccion} (Tel: ${s.telefono}) - ${s.horario}`
      ).join("\n");
      return {
        reply: `📍 Nuestras sucursales:\n\n${lista}\n\n¿Te interesa agendar un Test Drive en alguna?`,
        intent: "SUCURSALES"
      };
    }

    case "CHEAPEST": {
      const t = norm(message);
      let filtered = [...vehiculos];
      if (/\b(auto|carro|sedan|suv|camioneta)\b/.test(t)) filtered = autos;
      else if (/\b(moto|scooter|trimoto)\b/.test(t)) filtered = motos;
      else if (/\b(bici|bicicleta)\b/.test(t)) filtered = bicis;
      else if (/\b(camion|truck|ion)\b/.test(t)) filtered = camiones;
      else if (/\b(accesorio|casco|candado|mochila|cajuela|enchufe)\b/.test(t)) filtered = accesorios as unknown as Product[];
      
      filtered.sort((a, b) => a.precio.monto - b.precio.monto);
      const cheapest = filtered[0];
      if (!cheapest) {
        return { reply: "No encontré productos en esa categoría 😕", intent: "WELCOME" };
      }
      return {
        reply: `💰 El más económico es el **${cheapest.nombre}** a **$${cheapest.precio.monto} ${cheapest.precio.moneda}**\n\n${formatProductInfo(cheapest)}`,
        intent: "VEHICLE",
        productId: cheapest.id
      };
    }

    case "COUNT": {
      return {
        reply: `📦 Tenemos **${products.length} productos** en total:\n• ${vehiculos.length} vehículos (${autos.length} autos, ${motos.length} motos, ${bicis.length} bicis, ${camiones.length} camiones)\n• ${accesorios.length} accesorios\n\n¿Querés ver alguno en particular?`,
        intent: "WELCOME"
      };
    }

    case "SAVINGS": {
      const ref = products.find(p => p.nombre.includes("TS STREET HUNTER PRO")) || products[0];
      if (ref?.ahorro_combustible) {
        return {
          reply: `💡 Con una moto eléctrica como la **${ref.nombre}** ahorrás aproximadamente:\n\n⛽ Combustible: **${ref.ahorro_combustible}**\n🔧 Mantenimientos: **${ref.ahorro_mantenimiento || "N/A"}**\n💸 Impuestos: **${ref.ahorro_impuestos || "N/A"}**\n🌱 CO2 ahorrado: **${ref.emisiones_co2 || "N/A"}**\n\n¿Querés saber más sobre algún modelo?`,
          intent: "WELCOME"
        };
      }
      return { reply: "Tengo datos de ahorro para nuestros modelos Super Soco. ¿Te interesa alguno en particular?", intent: "WELCOME" };
    }

    case "AUTOS": {
      const lista = autos.map(p => `• ${p.nombre}: $${p.precio.monto} ${p.precio.moneda}`).join("\n");
      return {
        reply: `🚗 Nuestros autos eléctricos:\n\n${lista}\n\n¿Te interesa alguno?`,
        intent: "VEHICLE",
        productIds: autos.map(p => p.id)
      };
    }

    case "MOTOS": {
      const lista = motos.map(p => `• ${p.nombre}: $${p.precio.monto} ${p.precio.moneda}`).join("\n");
      return {
        reply: `🏍️ Nuestras motos eléctricas:\n\n${lista}\n\n¿Te interesa alguna?`,
        intent: "VEHICLE",
        productIds: motos.map(p => p.id)
      };
    }

    case "BICIS": {
      const lista = bicis.map(p => `• ${p.nombre}: $${p.precio.monto} ${p.precio.moneda}`).join("\n");
      return {
        reply: `🚲 Nuestras bicicletas eléctricas:\n\n${lista}\n\n¿Te interesa alguna?`,
        intent: "VEHICLE",
        productIds: bicis.map(p => p.id)
      };
    }

    case "ACCESORIOS": {
      const lista = accesorios.map(p => `• ${p.nombre}: $${p.precio.monto} ${p.precio.moneda}`).join("\n");
      return {
        reply: `🎒 Nuestros accesorios:\n\n${lista}\n\n¿Te interesa alguno?`,
        intent: "VEHICLE",
        productIds: accesorios.map(p => p.id)
      };
    }

    case "CAMIONES": {
      const camiones = vehiculos.filter(p => p.subcategoria === "camion");
      const lista = camiones.map(p => `• ${p.nombre}: $${p.precio.monto} ${p.precio.moneda}`).join("\n");
      return {
        reply: `🚛 Nuestros camiones eléctricos:\n\n${lista}\n\n¿Te interesa alguno?`,
        intent: "VEHICLE",
        productIds: camiones.map(p => p.id)
      };
    }

    case "COMPARE": {
      const [p1, p2] = findTwoProducts(message, products);
      if (p1 && p2) {
        return {
          reply: `📊 Comparación:\n\n**${p1.nombre}** ($${p1.precio.monto})\n${formatProductInfo(p1)}\n\n**${p2.nombre}** ($${p2.precio.monto})\n${formatProductInfo(p2)}`,
          intent: "VEHICLE",
          productIds: [p1.id, p2.id]
        };
      }
      if (p1) {
        return {
          reply: `Te muestro info de **${p1.nombre}**:\n${formatProductInfo(p1)}`,
          intent: "VEHICLE",
          productId: p1.id
        };
      }
      break;
    }

    case "STOCK": {
      return {
        reply: `✅ ¡Sí! Tenemos stock disponible en nuestras 6 sucursales (Cochabamba, La Paz, El Alto, Oruro, Santa Cruz, Yacuiba). ¿Qué modelo te interesa?`,
        intent: "WELCOME"
      };
    }
  }

  // Producto específico
  if (matched) {
    return {
      reply: `${formatProductInfo(matched)}\n\n¿Querés más info o agendar un Test Drive? 🚗`,
      intent: "VEHICLE",
      productId: matched.id
    };
  }

  // Fallback a Groq solo para preguntas genéricas
  return { reply: "", intent: "WELCOME" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context, history }:
      { message: string; context: ConversationContext; history: { role: "user" | "assistant"; content: string }[] } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    let products: Product[] = [];
    let sucursales: Sucursal[] = [];
    try { products = await getProducts(); } catch { /* ignore */ }
    try { sucursales = await getSucursales(); } catch { /* ignore */ }

    // Generate factual answer directly from DB
    const factual = generateAnswer(products, sucursales, message);

    // If we have a factual answer, return it directly
    if (factual.reply) {
      return NextResponse.json({
        reply: factual.reply,
        intent: factual.intent,
        productId: factual.productId || null,
        productIds: factual.productIds || null,
        source: "database",
        context: { step: factual.intent === "WELCOME" ? "ASKING_TYPE" : context.step, filters: context.filters },
      });
    }

    // Otherwise, use Groq for generic/conversational responses
    const catalog = `Vehiculos: ${products.filter(p=>p.categoria==="VEHICULO").map(p=>p.nombre).join(", ")}. Accesorios: ${products.filter(p=>p.categoria==="ACCESORIO").map(p=>p.nombre).join(", ")}.`;
    const systemPrompt = getSystemPrompt(catalog);

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.slice(-6).map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
      { role: "user" as const, content: message },
    ];

    const llmResult = await chatWithLlm(messages, { temperature: 0.7, maxTokens: 300 });

    if (!llmResult.error && llmResult.reply) {
      return NextResponse.json({
        reply: llmResult.reply,
        intent: "WELCOME",
        productId: null,
        productIds: null,
        source: "groq",
        context: { step: "ASKING_TYPE", filters: context.filters },
      });
    }

    return NextResponse.json({
      reply: "¡Hola! Soy Bot Quantum, tu asesor de electromovilidad. ¿En qué puedo ayudarte? Tenemos autos, motos, bicis, camiones y accesorios eléctricos.",
      intent: "WELCOME",
      productId: null,
      source: "fallback",
      context: { step: "ASKING_TYPE", filters: context.filters },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
