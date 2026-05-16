import { useEffect, useState } from "react";
import type { StockEntry } from "@/lib/types";
import { getStock } from "@/lib/api";

export function useStock(productId?: string, region?: string) {
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStock({ product_id: productId, region })
      .then((res) => setStock(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId, region]);

  return { stock, loading, error };
}
