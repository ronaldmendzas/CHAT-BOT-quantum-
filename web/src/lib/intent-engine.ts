import type { IntentResult, Product } from "./types";
import { getProducts, getStock } from "./api";

function norm(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

let productCache: Product[] | null = null;

async function fetchProducts(): Promise<Product[]> {
  if (productCache) return productCache;
  const res = await getProducts();
  productCache = res.data;
  return res.data;
}

export async function resolveIntent(input: string): Promise<IntentResult> {
  const t = norm(input);

  /* Test Drive */
  if (
    t.includes("test drive") ||
    t.includes("prueba") ||
    t.includes("agendar") ||
    t.includes("probar")
  ) {
    return {
      intent: "TEST_DRIVE",
      reply:
        "¡Genial! Puedes agendar tu Test Drive en el panel. Solo necesitas licencia vigente y CI.",
    };
  }

  /* Sucursales */
  if (
    t.includes("sucursal") ||
    t.includes("tienda") ||
    t.includes("donde") ||
    t.includes("direccion") ||
    t.includes("ubicacion")
  ) {
    return {
      intent: "SUCURSALES",
      reply: "Tenemos sucursales en Bolivia. Te las muestro en el panel.",
    };
  }

  /* Product match — consulta API fresca */
  const products = await fetchProducts();
  const matched = products.find((p) => {
    const slug = norm(p.nombre);
    const idLow = norm(p.id);
    return t.includes(slug) || t.includes(idLow) || slug.includes(t);
  });

  if (matched) {
    const stockRes = await getStock({ product_id: matched.id });
    const hasStock = stockRes.data.some((s) => s.estado === "DISPONIBLE");
    const stockMsg = hasStock
      ? " Hay stock disponible en varias sucursales."
      : "";
    return {
      intent: "VEHICLE",
      reply: `Te presento el ${matched.nombre}. Revisa sus especificaciones en el panel.${stockMsg}`,
      productId: matched.id,
    };
  }

  /* Vehicle keywords */
  if (
    t.includes("scooter") ||
    t.includes("moto") ||
    t.includes("vehiculo") ||
    t.includes("modelo") ||
    t.includes("auto") ||
    t.includes("camion") ||
    t.includes("bicicleta") ||
    t.includes("trimoto")
  ) {
    return {
      intent: "VEHICLE",
      reply:
        "Tenemos varios modelos eléctricos. Te los muestro en el panel para que elijas el que más te guste.",
    };
  }

  /* Accesorios */
  if (
    t.includes("bateria") ||
    t.includes("repuesto") ||
    t.includes("accesorio") ||
    t.includes("casco") ||
    t.includes("mochila") ||
    t.includes("candado") ||
    t.includes("cajuela")
  ) {
    const accessory = products.find((p) => p.categoria === "ACCESORIO");
    return {
      intent: "VEHICLE",
      reply: "Te muestro nuestros accesorios disponibles.",
      productId: accessory?.id,
    };
  }

  /* Greetings */
  if (
    t.includes("hola") ||
    t.includes("buenas") ||
    t.includes("hey") ||
    t.includes("hi") ||
    t.length < 4
  ) {
    return {
      intent: "WELCOME",
      reply:
        "¡Hola! Soy Bot Quantum, tu asesor de electromovilidad. Puedo mostrarte nuestros modelos, sucursales o agendar un Test Drive. ¿En qué te ayudo?",
    };
  }

  /* Redirigir "stock" a vehículos */
  if (
    t.includes("stock") ||
    t.includes("disponible") ||
    t.includes("disponibilidad") ||
    t.includes("hay")
  ) {
    return {
      intent: "VEHICLE",
      reply: "Todos nuestros modelos están disponibles en Quantum. Te muestro el catálogo completo.",
    };
  }

  /* Fallback */
  return {
    intent: "UNKNOWN",
    reply:
      "No estoy seguro de entender. Puedo ayudarte con: catálogo de vehículos, sucursales y Test Drive. ¿Qué te interesa?",
  };
}
