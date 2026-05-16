const fs = require("fs");
const path = require("path");

const RAW_PATH = path.join(__dirname, "..", "data", "raw", "cerebro.json");
const OUTPUT_PATH = path.join(__dirname, "..", "web", "src", "data", "dataset.json");

const raw = JSON.parse(fs.readFileSync(RAW_PATH, "utf-8"));
const items = raw.productos_tienda || [];

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cleanDescription(text) {
  if (!text || text === "No disponible") return "";
  let cleaned = text
    .replace(/<[^>]*>/g, "")
    .replace(/var\s+\w+\s*=.*?;/g, "")
    .replace(/console\.log\([^)]*\);?/g, "")
    .replace(/Oops[^.]*/g, "")
    .replace(/Rendimiento/g, " ")
    .replace(/Tecnología y Seguridad/g, " ")
    .replace(/Motivos para elegir[^]*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  cleaned = cleaned
    .replace(/autonomíadel/g, "autonomía del ")
    .replace(/autonomíade/g, "autonomía de ")
    .replace(/unavelocidad/g, "una velocidad ")
    .replace(/unapotencia/g, "una potencia ")
    .replace(/unacorona/g, "una corona ")
    .replace(/unacorriente/g, "una corriente ")
    .replace(/unatoma/g, "una toma ")
    .replace(/unadiseño/g, "un diseño ")
    .replace(/unexcelente/g, "un excelente ")
    .replace(/unóptimo/g, "un óptimo ")
    .replace(/lacarga/g, "la carga ")
    .replace(/labatería/g, "la batería ")
    .replace(/lapantalla/g, "la pantalla ")
    .replace(/laparte/g, "la parte ")
    .replace(/latransmisión/g, "la transmisión ")
    .replace(/lacapacidad/g, "la capacidad ")
    .replace(/lailuminación/g, "la iluminación ")
    .replace(/lagarantía/g, "la garantía ")
    .replace(/elvehículo/g, "el vehículo ")
    .replace(/elmotor/g, "el motor ")
    .replace(/elsistema/g, "el sistema ")
    .replace(/elservicio/g, "el servicio ")
    .replace(/elcambio/g, "el cambio ")
    .replace(/elcrédito/g, "el crédito ")
    .replace(/delquantum/g, "del Quantum ")
    .replace(/dehasta/g, "de hasta ")
    .replace(/deuna/g, "de una ")
    .replace(/conuna/g, "con una ")
    .replace(/conun/g, "con un ")
    .replace(/porla/g, "por la ")
    .replace(/parala/g, "para la ")
    .replace(/paralos/g, "para los ")
    .replace(/parabrindar/g, "para brindar ")
    .replace(/reduciendo/g, "reduciendo ")
    .replace(/recorridocon/g, "recorrido con ")
    .replace(/máximade/g, "máxima de ")
    .replace(/potenciade/g, "potencia de ")
    .replace(/cargade/g, "carga de ")
    .replace(/soportares/g, "soportar es ")
    .replace(/modernode/g, "moderno de ")
    .replace(/conducción/g, "conducción ")
    .replace(/seguridad/g, "seguridad ")
    .replace(/compatibilidadincluye/g, "compatibilidad incluye ")
    .replace(/panorámica/g, "panorámica ")
    .replace(/parqueo/g, "parqueo. ")
    .replace(/sostenible/g, "sostenible. ")
    .replace(/eficiente/g, "eficiente. ")
    .replace(/220V/g, "220V. ")
    .replace(/\s+/g, " ")
    .trim();

  const sentences = cleaned.split(/(?<=[.])\s+/).filter((s) => s.length > 10);
  return sentences.slice(0, 2).join(" ") || cleaned.substring(0, 150);
}

function extractSpecs(text) {
  const specs = {};
  if (!text) return specs;

  const auton = text.match(/autonomía.*?de hasta\s*([\d.]+)\s*km/i);
  if (auton) specs.autonomia_km = parseInt(auton[1]);

  const vel = text.match(/velocidad máxima.*?de hasta\s*([\d.]+)\s*km/i);
  if (vel) specs.velocidad_max_kmh = parseInt(vel[1]);

  const pot = text.match(/potencia.*?de\s*([\d.]+)\s*Watts/i);
  if (pot) specs.potencia_watts = parseInt(pot[1].replace(".", ""));

  const carga = text.match(/(?:tiempo de carga|carga).*?de\s*(\d+)\s*(?:a|al|y|-)\s*(\d+)\s*horas/i);
  if (carga) specs.carga_horas = `${carga[1]}-${carga[2]}`;

  const bat = text.match(/batería.*?de\s*([\d.]+)V\/([\d.]+)Ah/i);
  if (bat) specs.bateria = `${bat[1]}V/${bat[2]}Ah`;

  const cap = text.match(/capacidad máxima de carga.*?de\s*([\d.]+)\s*kg/i);
  if (cap) specs.carga_maxima_kg = parseInt(cap[1]);

  const puertas = text.match(/(\d+)\s*puertas/i);
  if (puertas) specs.puertas = parseInt(puertas[1]);

  const asientos = text.match(/(\d+)\s*filas?\s*de\s*asientos/i);
  if (asientos) specs.filas_asientos = parseInt(asientos[1]);

  const tipoBat = text.match(/batería\s+de\s+(\w+)/i);
  if (tipoBat && !specs.bateria) specs.tipo_bateria = tipoBat[1];

  return specs;
}

function mapCategory(categorias) {
  if (!categorias || categorias.length === 0) return "VEHICULO";
  const cats = categorias.map((c) => c.toLowerCase());
  if (cats.includes("accesorios")) return "ACCESORIO";
  if (cats.includes("camiones")) return "VEHICULO";
  if (cats.includes("trimotos")) return "VEHICULO";
  if (cats.includes("motocicletas")) return "VEHICULO";
  if (cats.includes("bicimotos y bicicletas") || cats.includes("yadea")) return "VEHICULO";
  if (cats.includes("autos")) return "VEHICULO";
  return "VEHICULO";
}

function getColores(text) {
  if (!text) return ["Por definir"];
  const found = [];
  const colorMap = {
    blanco: "Blanco",
    negro: "Negro",
    rojo: "Rojo",
    azul: "Azul",
    gris: "Gris",
    verde: "Verde",
    plata: "Plata",
    naranja: "Naranja",
  };
  for (const [key, val] of Object.entries(colorMap)) {
    if (text.toLowerCase().includes(key)) found.push(val);
  }
  return found.length > 0 ? found : ["Por definir"];
}

const seenNames = new Set();
const products = [];
const seenAccesorios = new Set();

for (const item of items) {
  const nombre = item.nombre.trim();
  const slug = slugify(nombre);

  if (slug === "cajuela-de-motocicleta" && seenAccesorios.has("cajuela")) continue;
  if (slug === "casco-con-visera" && seenAccesorios.has("casco-visera")) continue;
  if (slug === "casco-con-visera") {
    seenAccesorios.add("casco-visera");
  }
  if (slug === "cajuela-de-motocicleta") {
    seenAccesorios.add("cajuela");
  }

  if (seenNames.has(slug)) continue;
  seenNames.add(slug);

  const precio = parseInt(item.precio_raw, 10);
  if (isNaN(precio)) continue;

  const categoria = mapCategory(item.categorias);
  const desc = cleanDescription(item.descripcion);
  const specs = extractSpecs(item.descripcion);
  const colores = getColores(item.descripcion);

  products.push({
    id: slug,
    nombre: nombre,
    categoria: categoria,
    precio: { monto: precio, moneda: item.moneda || "BOB" },
    descripcion_corta: desc,
    especificaciones: specs,
    colores: colores,
    media: [],
  });
}

const ciudades = [
  { id: "LPZ-01", ciudad: "La Paz", region: "LPZ", direccion: "Av. 6 de Agosto #1234, Sopocachi" },
  { id: "SCZ-01", ciudad: "Santa Cruz", region: "SCZ", direccion: "Av. Cristóbal de Mendoza #567" },
  { id: "CBB-01", ciudad: "Cochabamba", region: "CBB", direccion: "Av. América #890, Cala Cala" },
  { id: "ORU-01", ciudad: "Oruro", region: "ORU", direccion: "Av. 6 de Octubre #234" },
  { id: "TJA-01", ciudad: "Tarija", region: "TJA", direccion: "Av. Circunvalación #456" },
  { id: "SUC-01", ciudad: "Sucre", region: "SUC", direccion: "Av. Buenos Aires #789" },
  { id: "EAL-01", ciudad: "El Alto", region: "LPZ", direccion: "Av. Cívica #321, Zona 16 de Julio" },
  { id: "YAC-01", ciudad: "Yacuiba", region: "TJA", direccion: "Av. Busch #654" },
];

const stock = [];
const now = new Date().toISOString();
for (const prod of products) {
  const numSuc = prod.categoria === "ACCESORIO" ? 2 : 4;
  const shuffled = [...ciudades].sort(() => 0.5 - Math.random()).slice(0, numSuc);
  for (const suc of shuffled) {
    const cantidad = Math.floor(Math.random() * 5) + 1;
    const estado = cantidad >= 3 ? "DISPONIBLE" : cantidad >= 1 ? "BAJO_STOCK" : "SIN_STOCK";
    stock.push({
      product_id: prod.id,
      region: suc.region,
      sucursal_id: suc.id,
      cantidad: estado === "SIN_STOCK" ? 0 : cantidad,
      estado: estado,
      ultima_actualizacion: now,
    });
  }
}

const sucursales = ciudades.map((c) => ({
  id: c.id,
  ciudad: c.ciudad,
  direccion: c.direccion,
  horario: "Lun-Sáb 09:00-18:00",
  telefono: "+591 70000000",
  maps_url: "",
}));

const testDrive = ciudades.slice(0, 4).map((c) => ({
  region: c.region,
  sucursal_id: c.id,
  dias_horarios: "Lun-Sáb 10:00-17:00",
  requisitos: "Licencia vigente y CI.",
}));

const media = products
  .filter((p) => p.categoria === "VEHICULO")
  .map((p) => ({
    id: `media_${p.id}_1`,
    type: "IMAGE",
    url: "",
    title: `${p.nombre} - Vista frontal`,
    product_id: p.id,
  }));

const dataset = {
  products,
  stock,
  sucursales,
  test_drive: testDrive,
  media,
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 2), "utf-8");

console.log(`✅ Dataset generado: ${products.length} productos, ${stock.length} registros de stock`);
console.log(` Vehículos: ${products.filter((p) => p.categoria === "VEHICULO").length}`);
console.log(`🔧 Accesorios: ${products.filter((p) => p.categoria === "ACCESORIO").length}`);
console.log(`🏪 Sucursales: ${sucursales.length}`);
console.log(` Test Drive: ${testDrive.length} regiones`);
