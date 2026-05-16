import { useEffect, useState } from "react";
import type { Dataset } from "@/lib/types";
import { getProducts, getStock, getSucursales, getTestDriveSlots } from "@/lib/api";

async function getMedia() {
  const res = await fetch("/api/media");
  if (!res.ok) throw new Error("Failed to load media");
  return res.json();
}

export function useDataset() {
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getStock(),
      getSucursales(),
      getTestDriveSlots(),
      getMedia(),
    ])
      .then(([productsRes, stockRes, sucursalesRes, slotsRes, mediaRes]) => {
        setData({
          products: productsRes.data,
          stock: stockRes.data,
          sucursales: sucursalesRes.data,
          test_drive: slotsRes.data,
          media: mediaRes.data,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
