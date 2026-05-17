/* ===== Conversational engine with memory ===== */

import type {
  Product,
  ConversationContext,
  ConversationResult,
  UserFilters,
} from "./types";

/* ---------- text utils ---------- */
function norm(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

/* ---------- extractors ---------- */
function extractType(text: string): string | undefined {
  const t = norm(text);
  if (/\b(auto|carro|vehiculo|automovil|sedan|suv|camioneta)\b/.test(t))
    return "auto";
  if (/\b(moto|scooter|trimoto|motocicleta)\b/.test(t)) return "moto";
  if (/\b(bici|bicicleta|bike)\b/.test(t)) return "bici";
  if (/\b(camion|truck|furgon|cargo)\b/.test(t)) return "camion";
  if (/\b(bus|omnibus|micro|minibus)\b/.test(t)) return "bus";
  if (/\b(accesorio|casco|candado|mochila|cajuela|repuesto)\b/.test(t))
    return "accesorio";
  if (/\b(bateria)\b/.test(t)) return "bateria";
  return undefined;
}

function extractUse(text: string): string | undefined {
  const t = norm(text);
  if (/\b(ciudad|urbano|trabajo|diario|diaria|oficina)\b/.test(t))
    return "ciudad";
  if (/\b(delivery|repasto|mensajeria|mensajero|delivery|domicilio|uber)\b/.test(
    t
  ))
    return "delivery";
  if (/\b(carga|transporte|carguero|pesado|mercancia)\b/.test(t))
    return "carga";
  if (/\b(turismo|viaje|largo|carretera|viajar|turista)\b/.test(t))
    return "turismo";
  if (/\b(familia|familiar|ninos|bebes|escuela)\b/.test(t)) return "familia";
  return undefined;
}

function extractBudget(text: string): number | undefined {
  const t = text.toLowerCase();

  // "1 millon", "2 millones"
  const millon = t.match(/(\d+[\.,]?\d*)\s*millon(es)?/);
  if (millon) {
    const n = parseFloat(millon[1].replace(/\./g, "").replace(/,/g, "."));
    return Math.round(n * 1000000);
  }

  // "30 mil", "30.000"
  const mil = t.match(/(\d+[\.,]?\d*)\s*mil\b/);
  if (mil) {
    const n = parseFloat(mil[1].replace(/\./g, "").replace(/,/g, "."));
    return Math.round(n * 1000);
  }

  // Números sueltos: 30000, 30.000, 30,000
  const nums = t.match(/\b\d{1,3}(?:[\.,]\d{3})+|\b\d{4,}\b/g);
  if (nums) {
    const last = nums[nums.length - 1].replace(/\./g, "").replace(/,/g, "");
    return parseInt(last, 10);
  }

  // Si dice un número chico como "30" o "50" sin "mil", asumimos miles en contexto de presupuesto
  const small = t.match(/\bpresupuesto.*?\b(\d{2,3})\b/);
  if (small) return parseInt(small[1], 10) * 1000;

  return undefined;
}

/* ---------- product filtering ---------- */
function filterProducts(products: Product[], filters: UserFilters): Product[] {
  let list = [...products];

  // Filter by category / type
  if (filters.type) {
    const type = filters.type;
    list = list.filter((p) => {
      const n = norm(p.nombre);
      const cat = p.categoria.toLowerCase();
      switch (type) {
        case "auto":
          return (
            cat === "vehiculo" &&
            (n.includes("auto") ||
              n.includes("carro") ||
              n.includes("sedan") ||
              n.includes("suv") ||
              n.includes("camioneta"))
          );
        case "moto":
          return (
            cat === "vehiculo" &&
            (n.includes("moto") ||
              n.includes("scooter") ||
              n.includes("trimoto"))
          );
        case "bici":
          return (
            cat === "vehiculo" &&
            (n.includes("bici") || n.includes("bicicleta"))
          );
        case "camion":
          return (
            cat === "vehiculo" &&
            (n.includes("camion") || n.includes("truck"))
          );
        case "bus":
          return (
            cat === "vehiculo" &&
            (n.includes("bus") || n.includes("omnibus"))
          );
        case "accesorio":
          return cat === "accesorio";
        case "bateria":
          return cat === "bateria";
        default:
          return true;
      }
    });
  }

  // Filter by budget (with 20% upper margin)
  if (filters.budget && filters.budget > 0) {
    const max = filters.budget * 1.2;
    const withBudget = list.filter((p) => p.precio.monto <= max);
    // If nothing fits, show closest cheaper ones
    if (withBudget.length > 0) {
      list = withBudget;
    } else {
      list = list
        .filter((p) => p.precio.monto <= filters.budget! * 1.5)
        .sort((a, b) => b.precio.monto - a.precio.monto)
        .slice(0, 5);
    }
  }

  return list.slice(0, 5);
}

/* ---------- reply builders ---------- */
function askTypeReply(): string {
  return "¿Qué tipo de vehículo te interesa? Tenemos autos, motos, bicicletas, camiones, buses y accesorios.";
}

function askUseReply(type?: string): string {
  const name = type === "auto" ? "el auto" : type === "moto" ? "la moto" : type === "bici" ? "la bici" : "el vehículo";
  return `¿Para qué usarás ${name} principalmente? Por ejemplo: ciudad, delivery, carga, turismo o familia.`;
}

function askBudgetReply(): string {
  return "¿Cuál es tu presupuesto aproximado? Puedes decirlo en números (ej: 35000 o 35 mil).";
}

function buildResultsReply(products: Product[], filters: UserFilters): string {
  if (products.length === 0) {
    return "No encontré modelos que coincidan exactamente con esos filtros. Te muestro opciones similares en el panel.";
  }

  let reply = "Perfecto, basándome en lo que me contaste, estos son los modelos que mejor se adaptan:";

  products.forEach((p, i) => {
    const specs = p.especificaciones;
    const autonomia = specs["Autonomía"] || specs["autonomia"] || "";
    reply += `\n\n${i + 1}. **${p.nombre}** — ${p.precio.moneda} ${p.precio.monto.toLocaleString("es-BO")}`;
    if (autonomia) reply += ` (${autonomia} km)`;
  });

  reply += "\n\nHacé clic en cualquiera para ver más detalles, o escribí el nombre del que te interese.";

  // Value pitch
  if (filters.use === "ciudad") {
    reply += "\n\n💡 Estos modelos son ideales para ciudad: bajo consumo, fácil estacionamiento y cero emisiones.";
  } else if (filters.use === "delivery") {
    reply += "\n\n💡 Para delivery, la autonomía y el bajo costo por kilómetro son clave. ¡Recuperás la inversión rápido!";
  } else if (filters.use === "turismo") {
    reply += "\n\n💡 Perfectos para viajes: gran autonomía, confort y el placer de manejar sin ruido ni humo.";
  } else if (filters.use === "carga") {
    reply += "\n\n💡 Vehículos de carga eléctrica: menos mantenimiento, torque instantáneo y ahorro de combustible.";
  } else {
    reply += "\n\n💡 Todos nuestros vehículos eléctricos reducen costos de mantenimiento y cero emisiones de CO2.";
  }

  return reply;
}

/* ---------- state machine ---------- */
export function processMessage(
  input: string,
  context: ConversationContext,
  products: Product[]
): ConversationResult {
  const t = norm(input);
  const type = extractType(input) || context.filters.type;
  const use = extractUse(input) || context.filters.use;
  const budget = extractBudget(input) ?? context.filters.budget;

  const newFilters: UserFilters = { type, use, budget, currency: "BOB" };

  /* ---- Direct commands (always available) ---- */
  if (t.includes("hola") || t.includes("buenas") || t.includes("hey")) {
    return {
      reply:
        "¡Hola! Soy Bot Quantum, tu asesor de electromovilidad. ¿Qué tipo de vehículo te interesa? Auto, moto, bici, camión, bus o accesorio.",
      context: { step: "ASKING_TYPE", filters: {} },
      intent: "WELCOME",
    };
  }

  if (
    t.includes("sucursal") ||
    t.includes("tienda") ||
    t.includes("donde") ||
    t.includes("ubicacion")
  ) {
    return {
      reply: "Estas son nuestras sucursales en Bolivia. ¿En qué ciudad estás?",
      context: { step: "SUCURSALES", filters: newFilters },
      intent: "SUCURSALES",
    };
  }

  if (
    t.includes("test drive") ||
    t.includes("prueba") ||
    t.includes("agendar") ||
    t.includes("probar")
  ) {
    return {
      reply:
        "¡Excelente decisión! Puedes agendar tu Test Drive en el panel. Solo necesitás licencia vigente y CI.",
      context: { step: "TEST_DRIVE", filters: newFilters },
      intent: "TEST_DRIVE",
    };
  }

  /* ---- Specific product mention ---- */
  const matchedProduct = products.find((p) => {
    const slug = norm(p.nombre);
    return t.includes(slug) || slug.includes(t);
  });
  if (matchedProduct) {
    return {
      reply: `Aquí te muestro el ${matchedProduct.nombre}. Revisa sus especificaciones y disponibilidad en el panel.`,
      context: {
        step: "VEHICLE_DETAIL",
        filters: newFilters,
        lastProductId: matchedProduct.id,
      },
      intent: "VEHICLE",
      productId: matchedProduct.id,
    };
  }

  /* ---- Catalog / all models ---- */
  if (
    t.includes("catalogo") ||
    t.includes("modelos") ||
    t.includes("todos") ||
    t.includes("vehiculos")
  ) {
    return {
      reply:
        "Este es nuestro catálogo completo de electromovilidad. Hacé clic en cualquier modelo para ver detalles.",
      context: { step: "SHOWING_RESULTS", filters: newFilters },
      intent: "VEHICLE",
      productIds: products.map((p) => p.id),
    };
  }

  /* ---- Conversational flow ---- */
  switch (context.step) {
    case "WELCOME":
    case "ASKING_TYPE": {
      if (type) {
        if (!use) {
          return {
            reply: askUseReply(type),
            context: { step: "ASKING_USE", filters: newFilters },
            intent: "VEHICLE",
          };
        }
        if (!budget) {
          return {
            reply: askBudgetReply(),
            context: { step: "ASKING_BUDGET", filters: newFilters },
            intent: "VEHICLE",
          };
        }
        const results = filterProducts(products, newFilters);
        return {
          reply: buildResultsReply(results, newFilters),
          context: {
            step: "SHOWING_RESULTS",
            filters: newFilters,
            results: results.map((p) => p.id),
          },
          intent: "VEHICLE",
          productIds: results.map((p) => p.id),
        };
      }
      return {
        reply: askTypeReply(),
        context: { step: "ASKING_TYPE", filters: newFilters },
        intent: "WELCOME",
      };
    }

    case "ASKING_USE": {
      if (!type && !context.filters.type) {
        return {
          reply: askTypeReply(),
          context: { step: "ASKING_TYPE", filters: newFilters },
          intent: "WELCOME",
        };
      }
      if (use) {
        if (!budget && !context.filters.budget) {
          return {
            reply: askBudgetReply(),
            context: { step: "ASKING_BUDGET", filters: newFilters },
            intent: "VEHICLE",
          };
        }
        const results = filterProducts(products, newFilters);
        return {
          reply: buildResultsReply(results, newFilters),
          context: {
            step: "SHOWING_RESULTS",
            filters: newFilters,
            results: results.map((p) => p.id),
          },
          intent: "VEHICLE",
          productIds: results.map((p) => p.id),
        };
      }
      return {
        reply: askUseReply(type || context.filters.type),
        context: { step: "ASKING_USE", filters: newFilters },
        intent: "VEHICLE",
      };
    }

    case "ASKING_BUDGET": {
      if (budget) {
        const results = filterProducts(products, newFilters);
        return {
          reply: buildResultsReply(results, newFilters),
          context: {
            step: "SHOWING_RESULTS",
            filters: newFilters,
            results: results.map((p) => p.id),
          },
          intent: "VEHICLE",
          productIds: results.map((p) => p.id),
        };
      }
      return {
        reply: askBudgetReply(),
        context: { step: "ASKING_BUDGET", filters: newFilters },
        intent: "VEHICLE",
      };
    }

    case "SHOWING_RESULTS":
    case "VEHICLE_DETAIL": {
      // User might be refining search
      if (type || use || budget) {
        const results = filterProducts(products, newFilters);
        return {
          reply: buildResultsReply(results, newFilters),
          context: {
            step: "SHOWING_RESULTS",
            filters: newFilters,
            results: results.map((p) => p.id),
          },
          intent: "VEHICLE",
          productIds: results.map((p) => p.id),
        };
      }
      // User might want to start over
      if (t.includes("otro") || t.includes("nuevo") || t.includes("cambiar")) {
        return {
          reply: askTypeReply(),
          context: { step: "ASKING_TYPE", filters: {} },
          intent: "WELCOME",
        };
      }
      return {
        reply:
          "¿Te gustaría ver más detalles de alguno? Hacé clic en el panel o escribí el nombre del modelo.",
        context: { ...context, filters: newFilters },
        intent: "VEHICLE",
      };
    }

    default:
      return {
        reply:
          "No estoy seguro de entender. Puedo ayudarte con: catálogo de vehículos, sucursales y Test Drive. ¿Qué te interesa?",
        context: { step: "UNKNOWN", filters: newFilters },
        intent: "UNKNOWN",
      };
  }
}
