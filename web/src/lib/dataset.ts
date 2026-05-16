import type { Dataset } from "./types";
import raw from "@/data/dataset.json";

export const dataset: Dataset = raw as unknown as Dataset;

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
