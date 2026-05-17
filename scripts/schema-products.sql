-- Schema para datos oficiales de Quantum Motors
-- Tablas: products, sucursales, stock, media

-- Tabla de sucursales (compartida entre todos los productos)
CREATE TABLE IF NOT EXISTS public.sucursales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ciudad TEXT NOT NULL UNIQUE,
    region TEXT NOT NULL DEFAULT '',
    direccion TEXT,
    horario TEXT DEFAULT 'Lun - Sáb: 09:00 - 19:00',
    telefono TEXT,
    maps_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('VEHICULO', 'ACCESORIO', 'BATERIA', 'SERVICIO')),
    subcategoria TEXT, -- auto, moto, bici, camion, bus, accesorio
    marca TEXT,
    modelo TEXT,
    descripcion_corta TEXT,
    especificaciones JSONB DEFAULT '{}',
    colores TEXT[] DEFAULT '{}',
    precio_monto NUMERIC,
    precio_moneda TEXT DEFAULT 'BOB',
    foto_url TEXT,
    garantia TEXT,
    garantia_bateria TEXT,
    servicio_tecnico TEXT,
    contacto TEXT,
    ahorro_combustible TEXT,
    ahorro_mantenimiento TEXT,
    ahorro_impuestos TEXT,
    emisiones_co2 TEXT,
    recomendaciones_bateria TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de stock por sucursal
CREATE TABLE IF NOT EXISTS public.stock (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'BAJO_STOCK', 'SIN_STOCK')),
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(product_id, sucursal_id)
);

-- Tabla de media (fotos/videos)
CREATE TABLE IF NOT EXISTS public.media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'IMAGE' CHECK (type IN ('IMAGE', 'VIDEO')),
    url TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de test drive slots
CREATE TABLE IF NOT EXISTS public.test_drive_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sucursal_id UUID NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    dias_horarios TEXT,
    requisitos TEXT DEFAULT 'Licencia de conducir vigente y CI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Permisos
GRANT ALL ON public.sucursales TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.stock TO authenticated;
GRANT ALL ON public.media TO authenticated;
GRANT ALL ON public.test_drive_slots TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RLS policies (permitir lectura pública, escritura solo autenticado)
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_drive_slots ENABLE ROW LEVEL SECURITY;

-- Políticas: permitir SELECT a todos (anónimos + autenticados)
CREATE POLICY "Allow public read sucursales"
  ON public.sucursales FOR SELECT
  USING (true);

CREATE POLICY "Allow public read products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Allow public read stock"
  ON public.stock FOR SELECT
  USING (true);

CREATE POLICY "Allow public read media"
  ON public.media FOR SELECT
  USING (true);

CREATE POLICY "Allow public read test_drive_slots"
  ON public.test_drive_slots FOR SELECT
  USING (true);

-- Políticas: permitir INSERT/UPDATE/DELETE solo a autenticados
CREATE POLICY "Allow authenticated write sucursales"
  ON public.sucursales FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write products"
  ON public.products FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write stock"
  ON public.stock FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write media"
  ON public.media FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write test_drive_slots"
  ON public.test_drive_slots FOR ALL
  USING (auth.role() = 'authenticated');
