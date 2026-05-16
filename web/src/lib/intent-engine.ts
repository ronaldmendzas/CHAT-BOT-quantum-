import type { IntentResult, Dataset } from "./types";

function norm(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function resolveIntent(
  input: string,
  data: Dataset,
): IntentResult {
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
        "¡Genial! Puedes agendar tu Test Drive en el panel de la derecha. Solo necesitas licencia vigente y CI.",
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
      reply:
        "Te muestro nuestras sucursales disponibles en el panel derecho.",
    };
  }

  /* Stock */
  const wantsStock =
    t.includes("stock") ||
    t.includes("disponible") ||
    t.includes("disponibilidad") ||
    t.includes("hay");

  /* Product match */
  const matched = data.products.find((p) => {
    const slug = norm(p.nombre);
    const idLow = norm(p.id);
    return t.includes(slug) || t.includes(idLow) || slug.includes(t);
  });

  if (matched && wantsStock) {
    return {
      intent: "STOCK",
      reply: `Aquí tienes el stock disponible de ${matched.nombre}.`,
      productId: matched.id,
    };
  }

  if (matched) {
    return {
      intent: "VEHICLE",
      reply: `Te presento el ${matched.nombre}. Revisa sus especificaciones en el panel.`,
      productId: matched.id,
    };
  }

  if (wantsStock) {
    return {
      intent: "STOCK",
      reply: "Te muestro el stock de todos nuestros productos.",
    };
  }

  /* Keyword product search */
  if (
    t.includes("scooter") ||
    t.includes("moto") ||
    t.includes("vehiculo") ||
    t.includes("modelo")
  ) {
    return {
      intent: "VEHICLE",
      reply:
        "Tenemos varios modelos eléctricos. Te los muestro en el panel para que elijas el que más te guste.",
    };
  }

  if (
    t.includes("bateria") ||
    t.includes("repuesto") ||
    t.includes("accesorio")
  ) {
    const bat = data.products.find((p) => p.categoria === "BATERIA");
    return {
      intent: "VEHICLE",
      reply: "Te muestro nuestras baterías y accesorios disponibles.",
      productId: bat?.id,
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
        "¡Hola! Soy Bot Quantum, tu asesor de electromovilidad. ¿En qué puedo ayudarte? Puedo mostrarte modelos, stock, sucursales o agendar un Test Drive.",
    };
  }

  /* Fallback */
  return {
    intent: "UNKNOWN",
    reply:
      "No estoy seguro de entender. Puedo ayudarte con: modelos, stock, sucursales y Test Drive. ¿Qué te interesa?",
  };
}
