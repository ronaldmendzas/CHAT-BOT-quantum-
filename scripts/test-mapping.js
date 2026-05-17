const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rgzfcsyszhuoxnjwulqc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnemZjc3lzemh1b3huand1bHFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk4NzgzNCwiZXhwIjoyMDk0NTYzODM0fQ.Wq84RLtcdqCvfB9koRbxUFLVDB35w5zki9ul8Hn5ciI');

async function test() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) { console.log('Error:', error.message); return; }
  
  const products = data.map(row => ({
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    precio: { monto: row.precio_monto ?? 0, moneda: row.precio_moneda ?? 'BOB' },
    descripcion_corta: row.descripcion_corta ?? '',
    especificaciones: row.especificaciones ?? {},
    colores: row.colores ?? [],
    media: [],
  }));
  
  console.log('Total productos mapeados:', products.length);
  products.forEach(p => {
    const auto = p.especificaciones?.['Autonomía'] || p.especificaciones?.['autonomia'] || '';
    console.log('-', p.nombre, '|', 'Bs ' + p.precio.monto.toLocaleString('es-BO'), p.precio.moneda, '| colores:', p.colores.length);
  });
  
  const msg = 'quiero info del nexus plus';
  const t = msg.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9\s]/g, ' ');
  const matched = products.find(p => {
    const slug = p.nombre.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9\s]/g, ' ');
    return t.includes(slug) || slug.includes(t);
  });
  console.log('\nBuscar msg -> match:', matched ? matched.nombre : 'NO MATCH');
}
test();
