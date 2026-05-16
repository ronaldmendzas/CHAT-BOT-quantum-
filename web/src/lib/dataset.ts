import type { Dataset } from "./types";
import { DatasetSchema } from "./schema";
import raw from "@/data/dataset.json";

const parsed = DatasetSchema.safeParse(raw);
if (!parsed.success) {
  console.error("[Dataset] Validación fallida:", parsed.error.issues);
  throw new Error(`Dataset inválido: ${parsed.error.issues[0]?.message}`);
}

export const dataset: Dataset = parsed.data;

export function getProduct(id: string) {
  return dataset.products.find((p) => p.id === id);
}

export function getStockForProduct(productId: string) {
  return dataset.stock.filter((s) => s.product_id === productId);
}

export function getSucursal(id: string) {
  return dataset.sucursales.find((s) => s.id === id);
}

export function formatBs(amount: number) {
  return `Bs ${amount.toLocaleString("es-BO")}`;
}
