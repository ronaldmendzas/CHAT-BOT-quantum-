import { useEffect, useState } from "react";
import type { TestDriveSlot } from "@/lib/types";
import { getTestDriveSlots } from "@/lib/api";

export function useTestDriveSlots() {
  const [slots, setSlots] = useState<TestDriveSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestDriveSlots()
      .then((res) => setSlots(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { slots, loading };
}
