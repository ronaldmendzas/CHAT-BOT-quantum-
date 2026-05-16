import { useEffect, useState } from "react";
import type { Sucursal } from "@/lib/types";
import { getSucursales } from "@/lib/api";

export function useSucursales() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSucursales()
      .then((res) => setSucursales(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { sucursales, loading, error };
}
