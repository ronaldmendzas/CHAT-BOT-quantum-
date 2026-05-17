const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rgzfcsyszhuoxnjwulqc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY no está definido');
  console.error('Ejecuta: set SUPABASE_SERVICE_ROLE_KEY=eyJ... && node scripts/seed-supabase.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const dataPath = path.resolve(__dirname, 'products-transformed.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function seed() {
  console.log('=== Iniciando seed de Supabase ===\n');

  // 1. Insertar sucursales
  console.log('Insertando sucursales...');
  const { data: insertedSucursales, error: sucError } = await supabase
    .from('sucursales')
    .insert(data.sucursales)
    .select('*');

  if (sucError) {
    console.error('Error insertando sucursales:', sucError.message);
    return;
  }

  const sucursalMap = new Map();
  for (const s of insertedSucursales) {
    sucursalMap.set(s.ciudad, s.id);
    console.log(`  ✓ ${s.ciudad} -> ${s.id}`);
  }

  // 2. Insertar productos
  console.log('\nInsertando productos...');
  const productsToInsert = data.products.map((p) => ({
    nombre: p.nombre,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    marca: p.marca,
    modelo: p.modelo,
    descripcion_corta: p.descripcion_corta,
    especificaciones: p.especificaciones,
    colores: p.colores,
    precio_monto: p.precio_monto,
    precio_moneda: p.precio_moneda,
    foto_url: p.foto_url,
    garantia: p.garantia,
    garantia_bateria: p.garantia_bateria,
    servicio_tecnico: p.servicio_tecnico,
    contacto: p.contacto,
    ahorro_combustible: p.ahorro_combustible,
    ahorro_mantenimiento: p.ahorro_mantenimiento,
    ahorro_impuestos: p.ahorro_impuestos,
    emisiones_co2: p.emisiones_co2,
    recomendaciones_bateria: p.recomendaciones_bateria,
  }));

  const { data: insertedProducts, error: prodError } = await supabase
    .from('products')
    .insert(productsToInsert)
    .select('*');

  if (prodError) {
    console.error('Error insertando productos:', prodError.message);
    return;
  }

  const productMap = new Map();
  for (const p of insertedProducts) {
    productMap.set(p.nombre, p.id);
    console.log(`  ✓ ${p.nombre} -> ${p.id}`);
  }

  // 3. Insertar media
  console.log('\nInsertando media...');
  const mediaToInsert = data.media.map((m) => ({
    product_id: productMap.get(m.product_nombre),
    type: m.type,
    url: m.url,
    title: m.title,
  })).filter((m) => m.product_id);

  if (mediaToInsert.length > 0) {
    const { error: mediaError } = await supabase.from('media').insert(mediaToInsert);
    if (mediaError) {
      console.error('Error insertando media:', mediaError.message);
    } else {
      console.log(`  ✓ ${mediaToInsert.length} items de media insertados`);
    }
  }

  // 4. Generar e insertar stock (demo)
  console.log('\nInsertando stock (demo)...');
  const stockEntries = [];
  for (const product of insertedProducts) {
    for (const sucursal of insertedSucursales) {
      stockEntries.push({
        product_id: product.id,
        sucursal_id: sucursal.id,
        cantidad: Math.floor(Math.random() * 8) + 1,
        estado: 'DISPONIBLE',
      });
    }
  }

  const { error: stockError } = await supabase.from('stock').insert(stockEntries);
  if (stockError) {
    console.error('Error insertando stock:', stockError.message);
  } else {
    console.log(`  ✓ ${stockEntries.length} registros de stock insertados`);
  }

  // 5. Insertar test drive slots
  console.log('\nInsertando test drive slots...');
  const slotsToInsert = insertedSucursales.map((s) => ({
    sucursal_id: s.id,
    dias_horarios: 'Lunes a Sábado: 09:00 - 18:00',
    requisitos: 'Licencia de conducir vigente y CI',
  }));

  const { error: slotsError } = await supabase.from('test_drive_slots').insert(slotsToInsert);
  if (slotsError) {
    console.error('Error insertando slots:', slotsError.message);
  } else {
    console.log(`  ✓ ${slotsToInsert.length} slots de test drive insertados`);
  }

  console.log('\n=== Seed completado exitosamente ===');
}

seed().catch((err) => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
