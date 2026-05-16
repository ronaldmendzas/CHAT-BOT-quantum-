"use client";

import { useState } from "react";
import type { Product, TestDriveSlot } from "@/lib/types";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  NativeSelectField,
  Button,
  Badge,
  Image,
} from "@chakra-ui/react";

type Props = {
  products: Product[];
  slots: TestDriveSlot[];
  onSubmit: (data: {
    nombre: string;
    celular: string;
    ciudad: string;
    producto: string;
  }) => void;
};

export default function TestDriveForm({ products, slots, onSubmit }: Props) {
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [producto, setProducto] = useState(products[0]?.id ?? "");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateNombre(v: string) {
    const trimmed = v.trim();
    if (trimmed.length < 2) return "El nombre debe tener al menos 2 caracteres.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) return "Solo letras y espacios.";
    return "";
  }

  function validateCelular(v: string) {
    const trimmed = v.trim().replace(/\s/g, "");
    // Bolivia: +591 7XXXXXXXX o +591 6XXXXXXXX o 7XXXXXXXX o 6XXXXXXXX
    if (!/^(\+591)?[67]\d{7}$/.test(trimmed)) {
      return "Formato: +591 7XXXXXXX o 7XXXXXXX (8 dígitos).";
    }
    return "";
  }

  function validateCiudad(v: string) {
    const trimmed = v.trim();
    if (trimmed.length < 2) return "La ciudad debe tener al menos 2 caracteres.";
    return "";
  }

  const nombreError = validateNombre(nombre);
  const celularError = validateCelular(celular);
  const ciudadError = validateCiudad(ciudad);
  const canSubmit = !nombreError && !celularError && !ciudadError && nombre && celular && ciudad;

  function handleSubmit() {
    if (!canSubmit) {
      setErrors({
        nombre: nombreError,
        celular: celularError,
        ciudad: ciudadError,
      });
      return;
    }
    onSubmit({
      nombre: nombre.trim(),
      celular: celular.trim().replace(/\s/g, ""),
      ciudad: ciudad.trim(),
      producto: producto.trim(),
    });
    setSent(true);
  }

  function handleReset() {
    setNombre("");
    setCelular("");
    setCiudad("");
    setProducto(products[0]?.id ?? "");
    setErrors({});
    setSent(false);
  }

  if (sent) {
    return (
      <VStack
        align="center"
        gap={6}
        p={10}
        bg="#080c08"
        border="1px solid rgba(0, 230, 180, 0.04)"
        borderRadius="lg"
        textAlign="center"
      >
        <Image src="/logo.png" alt="Quantum" w="80px" h="auto" objectFit="contain" opacity={0.5} />
        <Box
          w="64px"
          h="64px"
          borderRadius="full"
          bg="rgba(0, 230, 180, 0.06)"
          border="2px solid #0e5c48"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 0 5px rgba(0, 230, 180, 0.05)"
        >
          <Text fontSize="3xl" color="#0e5c48" fontWeight="bold">✓</Text>
        </Box>
        <Heading size="md" color="white" fontWeight="bold">
          ¡Solicitud registrada!
        </Heading>
        <Text color="#8a9e8a" fontSize="sm">
          Un asesor te contactará por WhatsApp para confirmar tu Test Drive.
        </Text>
        <Button
          bg="#0e5c48"
          color="white"
          fontWeight="bold"
          borderRadius="12px"
          px={6}
          _hover={{ boxShadow: "0 0 6px rgba(0, 230, 180, 0.03)" }}
          onClick={handleReset}
        >
          Agendar otro
        </Button>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={5} maxW="480px">
      <Heading size="md" color="white" fontWeight="bold">
        Agendar Test Drive
      </Heading>
      {slots.length > 0 && (
        <Badge
          bg="rgba(0, 230, 180, 0.06)"
          color="#0e5c48"
          border="1px solid rgba(0, 230, 180, 0.06)"
          borderRadius="full"
          px={4}
          py={2}
          fontSize="sm"
          alignSelf="flex-start"
        >
          📍 {slots[0].dias_horarios}
        </Badge>
      )}

      <VStack
        p={6}
        bg="#080c08"
        border="1px solid rgba(0, 230, 180, 0.04)"
        borderRadius="lg"
        gap={5}
        align="stretch"
      >
        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="#5d705d" textTransform="uppercase" letterSpacing="wide">
            Nombre
          </Text>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
            bg="#050705"
            borderColor="rgba(0, 230, 180, 0.04)"
            color="white"
            borderRadius="12px"
            _focus={{ borderColor: "#0e5c48", boxShadow: "0 0 3px rgba(0, 230, 180, 0.05)" }}
            _placeholder={{ color: "#5d705d" }}
          />
          {(errors.nombre || nombreError) && nombre.length > 0 && (
            <Text fontSize="xs" color="#ff4d6a" mt={1}>
              {errors.nombre || nombreError}
            </Text>
          )}
        </VStack>

        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="#5d705d" textTransform="uppercase" letterSpacing="wide">
            Celular / WhatsApp
          </Text>
          <Input
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="+591 7XXXXXXX"
            bg="#050705"
            borderColor="rgba(0, 230, 180, 0.04)"
            color="white"
            borderRadius="12px"
            _focus={{ borderColor: "#0e5c48", boxShadow: "0 0 3px rgba(0, 230, 180, 0.05)" }}
            _placeholder={{ color: "#5d705d" }}
          />
          {(errors.celular || celularError) && celular.length > 0 && (
            <Text fontSize="xs" color="#ff4d6a" mt={1}>
              {errors.celular || celularError}
            </Text>
          )}
        </VStack>

        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="#5d705d" textTransform="uppercase" letterSpacing="wide">
            Ciudad
          </Text>
          <Input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej: La Paz"
            bg="#050705"
            borderColor="rgba(0, 230, 180, 0.04)"
            color="white"
            borderRadius="12px"
            _focus={{ borderColor: "#0e5c48", boxShadow: "0 0 3px rgba(0, 230, 180, 0.05)" }}
            _placeholder={{ color: "#5d705d" }}
          />
          {(errors.ciudad || ciudadError) && ciudad.length > 0 && (
            <Text fontSize="xs" color="#ff4d6a" mt={1}>
              {errors.ciudad || ciudadError}
            </Text>
          )}
        </VStack>

        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="#5d705d" textTransform="uppercase" letterSpacing="wide">
            Modelo de interés
          </Text>
          <NativeSelectField
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            bg="#050705"
            borderColor="rgba(0, 230, 180, 0.04)"
            color="white"
            borderRadius="12px"
            _focus={{ borderColor: "#0e5c48", boxShadow: "0 0 3px rgba(0, 230, 180, 0.05)" }}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </NativeSelectField>
        </VStack>

        <Button
          bg="#0e5c48"
          color="white"
          fontWeight="bold"
          py={3}
          borderRadius="12px"
          fontSize="sm"
          _hover={{ boxShadow: "0 0 6px rgba(0, 230, 180, 0.03)" }}
          _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Registrar Test Drive
        </Button>
      </VStack>
    </VStack>
  );
}
