import { useState } from "react";
import { createTestDriveLead } from "@/lib/api";

export function useTestDrive() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(data: {
    nombre: string;
    celular: string;
    ciudad: string;
    producto: string;
  }) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await createTestDriveLead(data);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error };
}
