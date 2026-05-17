const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, '..', 'productos_definiticos.json');
const raw = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
const catalogo = raw.catalogo;

// --- Helpers ---
function cleanText(text) {
  if (!text) return '';
  return String(text).replace(/\s*\[cite:\s*\d+(?:,\s*\d+)*\]/g, '').trim();
}

function extractPhone(str) {
  if (!str) return '';
  const match = str.match(/Tel:\s*([\d\s\-]+)/);
  return match ? match[1].replace(/\s/g, '') : '';
}

function extractAddress(str) {
  if (!str) return '';
  return str.split('|')[0].trim();
}

function determineCategory(product) {
  const cat = (product.categoria || '').toLowerCase();
  if (cat.includes('accesorio')) return 'ACCESORIO';
  if (cat.includes('servicio')) return 'SERVICIO';
  if (cat.includes('bateria')) return 'BATERIA';
  return 'VEHICULO';
}

function determineSubcategory(product) {
  const sub = (product.subcategoria || '').toLowerCase();
  const tipo = (product.tipo_vehiculo || '').toLowerCase();
  const titulo = (product.titulo || '').toLowerCase();

  if (sub.includes('super soco') || tipo.includes('moto') || titulo.includes('moto')) return 'moto';
  if (sub.includes('nexus') || sub.includes('e-qute') || sub.includes('e4') || tipo.includes('auto') || tipo.includes('sedan') || tipo.includes('hatchback')) return 'auto';
  if (sub.includes('ion') || tipo.includes('camion') || tipo.includes('truck') || tipo.includes('cargo')) return 'camion';
  if (sub.includes('bus') || tipo.includes('bus') || tipo.includes('coaster') || tipo.includes('micro')) return 'bus';
  if (sub.includes('ara') || sub.includes('a5') || sub.includes('starto') || sub.includes('luna') || tipo.includes('bici') || tipo.includes('bicicleta')) return 'bici';
  if (product.categoria?.toLowerCase() === 'accesorios') return 'accesorio';
  return 'moto'; // default
}

// --- Sucursales ---
const sucursales = [];
for (const [ciudad, info] of Object.entries(catalogo.sucursales || {})) {
  const str = String(info);
  sucursales.push({
    ciudad,
    region: '', // Se puede mapear después
    direccion: extractAddress(str),
    horario: 'Lun - Sáb: 09:00 - 19:00',
    telefono: extractPhone(str),
    maps_url: '',
  });
}

// Region map
const regionMap = {
  'Cochabamba': 'CBB',
  'La Paz': 'LPZ',
  'El Alto': 'EAL',
  'Oruro': 'ORU',
  'Santa Cruz': 'SCZ',
  'Yacuiba': 'YAC',
};
sucursales.forEach(s => { s.region = regionMap[s.ciudad] || ''; });

// --- Products ---
const products = [];
const media = [];

for (const p of (catalogo.productos || [])) {
  const cat = determineCategory(p);
  const sub = determineSubcategory(p);

  // Especificaciones JSONB
  const especificaciones = {};

  if (p.datos_generales) especificaciones['DATOS GENERALES'] = p.datos_generales;
  if (p.dimensiones_y_peso) especificaciones['DIMENSIONES Y PESO'] = p.dimensiones_y_peso;
  if (p.prestaciones) especificaciones['PRESTACIONES'] = p.prestaciones;
  if (p.motor) especificaciones['MOTOR'] = p.motor;
  if (p.bateria) especificaciones['BATERIA'] = p.bateria;
  if (p.tecnologia_seguridad) especificaciones['TECNOLOGIA Y SEGURIDAD'] = p.tecnologia_seguridad;
  if (p.emisiones) especificaciones['EMISIONES'] = { emisiones: p.emisiones };
  if (p.especificaciones) especificaciones['ESPECIFICACIONES'] = p.especificaciones;
  if (p.combustible) especificaciones['COMBUSTIBLE'] = { combustible: p.combustible };

  // Colores
  const colores = (p.colores_disponibles || []).map(c => cleanText(c));

  // Garantía
  let garantia = '';
  let garantia_bateria = '';
  let servicio_tecnico = '';
  let contacto = catalogo.contact_center || '';

  if (p.garantia) {
    if (p.garantia.vehiculo) garantia = p.garantia.vehiculo;
    else if (p.garantia.general) garantia = p.garantia.general;
    else garantia = JSON.stringify(p.garantia);

    if (p.garantia.bateria) garantia_bateria = p.garantia.bateria;
    if (p.garantia.servicio_tecnico) servicio_tecnico = p.garantia.servicio_tecnico;
    if (p.garantia.contacto) contacto = p.garantia.contacto;
  }

  // Ahorro
  let ahorro_combustible = '';
  let ahorro_mantenimiento = '';
  let ahorro_impuestos = '';
  if (p.ahorro_estimado_5_años) {
    ahorro_combustible = p.ahorro_estimado_5_años.combustible || '';
    ahorro_mantenimiento = p.ahorro_estimado_5_años.mantenimientos || '';
    ahorro_impuestos = p.ahorro_estimado_5_años.impuestos || '';
  }

  // Emisiones
  let emisiones_co2 = '';
  if (p.impacto_ambiental) {
    emisiones_co2 = p.impacto_ambiental.ahorro_co2_por_año_10000km || '';
  }

  // Recomendaciones
  const recomendaciones_bateria = (p.recomendaciones_bateria || []).map(r => cleanText(r));

  // Precio
  const precio_monto = p.precio_referencial_usd ?? null;
  const precio_moneda = precio_monto ? 'USD' : 'BOB';

  // Foto principal
  const foto_url = p.imagen_portada || (p.fotos && p.fotos[0]) || '';

  const product = {
    nombre: p.titulo || p.id,
    categoria: cat,
    subcategoria: sub,
    marca: p.marca_origen || catalogo.marca || 'Quantum Motors',
    modelo: p.titulo || p.id,
    descripcion_corta: p.descripcion_corta || '',
    especificaciones,
    colores,
    precio_monto,
    precio_moneda,
    foto_url,
    garantia,
    garantia_bateria,
    servicio_tecnico,
    contacto,
    ahorro_combustible,
    ahorro_mantenimiento,
    ahorro_impuestos,
    emisiones_co2,
    recomendaciones_bateria,
  };

  products.push(product);

  // Media (fotos)
  if (p.fotos && Array.isArray(p.fotos)) {
    p.fotos.forEach((url, idx) => {
      if (url) {
        media.push({
          product_nombre: product.nombre,
          type: 'IMAGE',
          url,
          title: idx === 0 ? product.nombre : `${product.nombre} - Foto ${idx + 1}`,
        });
      }
    });
  }
}

// --- Output ---
const output = {
  sucursales,
  products,
  media,
  stock: [],
};

fs.writeFileSync(
  path.resolve(__dirname, 'products-transformed.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log('=== Transformación completada ===');
console.log(`Sucursales: ${sucursales.length}`);
console.log(`Productos: ${products.length}`);
console.log(`Media items: ${media.length}`);
console.log('\n--- Resumen de productos ---');
products.forEach((p, i) => {
  console.log(`${i + 1}. ${p.nombre} | ${p.categoria}/${p.subcategoria} | ${p.precio_monto} ${p.precio_moneda} | fotos: ${media.filter(m => m.product_nombre === p.nombre).length}`);
});
console.log('\nArchivo generado: scripts/products-transformed.json');
