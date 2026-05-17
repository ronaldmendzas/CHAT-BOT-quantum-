import { promises as fs } from "fs";
import path from "path";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import type { Product, StockEntry, Sucursal, MediaItem, TestDriveSlot } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

export async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content) as T;
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Supabase helpers with local JSON fallback

async function safeSupabaseFetch<T>(fetcher: () => Promise<T>, fallbackFile: string): Promise<T> {
  try {
    const result = await fetcher();
    return result;
  } catch {
    console.warn(`[db] Supabase fetch failed, falling back to ${fallbackFile}`);
    return readJsonFile<T>(fallbackFile);
  }
}

function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    subcategoria: row.subcategoria ?? "",
    marca: row.marca ?? "",
    modelo: row.modelo ?? "",
    precio: { monto: row.precio_monto ?? 0, moneda: row.precio_moneda ?? "BOB" },
    descripcion_corta: row.descripcion_corta ?? "",
    especificaciones: row.especificaciones ?? {},
    colores: row.colores ?? [],
    media: [],
    foto_url: row.foto_url ?? "",
    garantia: row.garantia ?? "",
    garantia_bateria: row.garantia_bateria ?? "",
    servicio_tecnico: row.servicio_tecnico ?? "",
    contacto: row.contacto ?? "",
    ahorro_combustible: row.ahorro_combustible ?? "",
    ahorro_mantenimiento: row.ahorro_mantenimiento ?? "",
    ahorro_impuestos: row.ahorro_impuestos ?? "",
    emisiones_co2: row.emisiones_co2 ?? "",
    recomendaciones_bateria: row.recomendaciones_bateria ?? [],
  };
}

function mapDbStock(row: any): StockEntry {
  return {
    product_id: row.product_id,
    region: row.sucursales?.region ?? "",
    sucursal_id: row.sucursal_id,
    cantidad: row.cantidad,
    estado: row.estado,
    ultima_actualizacion: row.ultima_actualizacion,
  };
}

function mapDbSucursal(row: any): Sucursal {
  return {
    id: row.id,
    ciudad: row.ciudad,
    region: row.region ?? "",
    direccion: row.direccion ?? "",
    horario: row.horario ?? "",
    telefono: row.telefono ?? "",
    maps_url: row.maps_url ?? "",
  };
}

export async function getProducts(): Promise<Product[]> {
  return safeSupabaseFetch(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    return (data ?? []).map(mapDbProduct);
  }, "products.json");
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
    if (error || !data) throw error;
    return mapDbProduct(data);
  } catch {
    const products = await readJsonFile<Product[]>("products.json");
    return products.find((p) => p.id === id) ?? null;
  }
}

export async function getStock(): Promise<StockEntry[]> {
  return safeSupabaseFetch(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("stock").select("*, sucursales(region)");
    if (error) throw error;
    return (data ?? []).map(mapDbStock);
  }, "stock.json");
}

export async function getSucursales(): Promise<Sucursal[]> {
  return safeSupabaseFetch(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("sucursales").select("*");
    if (error) throw error;
    return (data ?? []).map(mapDbSucursal);
  }, "sucursales.json");
}

export async function getMedia(): Promise<MediaItem[]> {
  return safeSupabaseFetch(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("media").select("*");
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      type: row.type,
      url: row.url,
      title: row.title ?? "",
      product_id: row.product_id,
    }));
  }, "media.json");
}

export async function getTestDriveSlots(): Promise<TestDriveSlot[]> {
  return safeSupabaseFetch(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("test_drive_slots").select("*, sucursales(region)");
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      region: row.sucursales?.region ?? "",
      sucursal_id: row.sucursal_id,
      dias_horarios: row.dias_horarios,
      requisitos: row.requisitos,
    }));
  }, "test-drive-slots.json");
}
