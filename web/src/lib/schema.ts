import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  categoria: z.enum(["VEHICULO", "ACCESORIO", "BATERIA", "SERVICIO"]),
  precio: z.object({
    monto: z.number().nonnegative(),
    moneda: z.string().min(1),
  }),
  descripcion_corta: z.string(),
  especificaciones: z.record(z.string(), z.union([z.number(), z.string()])),
  colores: z.array(z.string()),
  media: z.array(z.string()),
});

export const StockEntrySchema = z.object({
  product_id: z.string().min(1),
  region: z.string().min(1),
  sucursal_id: z.string().min(1),
  cantidad: z.number().int().nonnegative(),
  estado: z.enum(["DISPONIBLE", "BAJO_STOCK", "SIN_STOCK"]),
  ultima_actualizacion: z.string(),
});

export const SucursalSchema = z.object({
  id: z.string().min(1),
  ciudad: z.string().min(1),
  direccion: z.string(),
  horario: z.string(),
  telefono: z.string(),
  maps_url: z.string(),
});

export const TestDriveSlotSchema = z.object({
  region: z.string().min(1),
  sucursal_id: z.string().min(1),
  dias_horarios: z.string().min(1),
  requisitos: z.string(),
});

export const MediaItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().min(1),
  title: z.string(),
  product_id: z.string().min(1),
});

export const TestDriveLeadSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  celular: z.string().regex(/^(\+591)?[67]\d{7}$/, "Celular inválido"),
  ciudad: z.string().min(2, "Ciudad requerida"),
  producto: z.string().min(1, "Producto requerido"),
});

export const DatasetSchema = z.object({
  products: z.array(ProductSchema),
  stock: z.array(StockEntrySchema),
  sucursales: z.array(SucursalSchema),
  test_drive: z.array(TestDriveSlotSchema),
  media: z.array(MediaItemSchema),
});
