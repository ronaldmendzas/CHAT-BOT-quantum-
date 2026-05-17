"use client";

import { useState } from "react";
import {
  Button,
  Field,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { createClient } from "@/lib/supabase/browserClient";

export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log("[LoginForm] Starting login...");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      console.log("[LoginForm] Login error:", signInError.message);
      setError(signInError.message);
      return;
    }

    if (!data.session) {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
      return;
    }

    console.log("[LoginForm] Login SUCCESS, user:", data.session.user?.email);
    console.log("[LoginForm] Session exists:", !!data.session);

    // Small delay to ensure localStorage is written before navigation
    setTimeout(() => {
      onSuccess?.();
    }, 300);
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <Stack gap={4}>
        {error && (
          <Text color="#ff4d6a" fontSize="sm" bg="rgba(255, 77, 106, 0.06)" px={3} py={2} borderRadius="md">
            {error}
          </Text>
        )}

        <Field.Root required>
          <Field.Label color="#8a9e8a" fontSize="sm">Correo electrónico</Field.Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            bg="rgba(0, 0, 0, 0.2)"
            border="1px solid rgba(0, 230, 180, 0.08)"
            color="white"
            _placeholder={{ color: "#5d705d" }}
            _focus={{ borderColor: "#0e5c48" }}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label color="#8a9e8a" fontSize="sm">Contraseña</Field.Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            bg="rgba(0, 0, 0, 0.2)"
            border="1px solid rgba(0, 230, 180, 0.08)"
            color="white"
            _placeholder={{ color: "#5d705d" }}
            _focus={{ borderColor: "#0e5c48" }}
          />
        </Field.Root>

        <Button
          type="submit"
          bg="#0e5c48"
          color="white"
          _hover={{ bg: "#0d4a3a" }}
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </Stack>
    </form>
  );
}
