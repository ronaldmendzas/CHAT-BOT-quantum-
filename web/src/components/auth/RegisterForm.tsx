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

export default function RegisterForm({ onSuccess }: { onSuccess?: (needsConfirmation: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    // Usar nuestro endpoint de registro que salta la confirmación por email
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
        username: username.trim() || undefined,
        full_name: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const rawMsg = data.error || "";
      const msg = rawMsg.toLowerCase();

      // Si el usuario ya existe (status 409 o mensaje de duplicado)
      if (res.status === 409 || msg.includes("ya está registrado") || msg.includes("already registered") || msg.includes("user already")) {
        setError("Este correo ya está registrado. Usa la pestaña 'Iniciar sesión' para entrar.");
        return;
      }

      setError(rawMsg || "Error al crear cuenta");
      return;
    }

    // Registro exitoso, loguear automáticamente
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("Cuenta creada, pero hubo un error al iniciar sesión. Intenta iniciar sesión manualmente.");
      return;
    }

    console.log("[RegisterForm] Login success after registration");
    // Delay to ensure localStorage/cookies are fully written before navigation
    setTimeout(() => {
      onSuccess?.(false);
    }, 800);
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <Stack gap={3}>
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

        <Field.Root>
          <Field.Label color="#8a9e8a" fontSize="sm">Nombre de usuario</Field.Label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuario123"
            bg="rgba(0, 0, 0, 0.2)"
            border="1px solid rgba(0, 230, 180, 0.08)"
            color="white"
            _placeholder={{ color: "#5d705d" }}
            _focus={{ borderColor: "#0e5c48" }}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label color="#8a9e8a" fontSize="sm">Nombre completo</Field.Label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Juan Pérez"
            bg="rgba(0, 0, 0, 0.2)"
            border="1px solid rgba(0, 230, 180, 0.08)"
            color="white"
            _placeholder={{ color: "#5d705d" }}
            _focus={{ borderColor: "#0e5c48" }}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label color="#8a9e8a" fontSize="sm">Celular</Field.Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="71234567"
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
            placeholder="Mínimo 8 caracteres"
            bg="rgba(0, 0, 0, 0.2)"
            border="1px solid rgba(0, 230, 180, 0.08)"
            color="white"
            _placeholder={{ color: "#5d705d" }}
            _focus={{ borderColor: "#0e5c48" }}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label color="#8a9e8a" fontSize="sm">Confirmar contraseña</Field.Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
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
          {loading ? "Registrando..." : "Crear cuenta"}
        </Button>
      </Stack>
    </form>
  );
}
