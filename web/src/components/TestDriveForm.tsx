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

  const canSubmit =
    nombre.trim().length > 1 &&
    celular.trim().length > 5 &&
    ciudad.trim().length > 1;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      nombre: nombre.trim(),
      celular: celular.trim(),
      ciudad: ciudad.trim(),
      producto: producto.trim(),
    });
    setSent(true);
  }

  if (sent) {
    return (
      <VStack
        align="center"
        gap={6}
        p={10}
        bg="bg.card"
        border="1px solid"
        borderColor="neon-border"
        borderRadius="xl"
        boxShadow="neon-sm"
        textAlign="center"
      >
        <Image
          src="/logo.png"
          alt="Quantum"
          w="80px"
          h="auto"
          objectFit="contain"
          filter="drop-shadow(0 0 12px rgba(0, 255, 170, 0.2))"
        />
        <Box
          w="64px"
          h="64px"
          borderRadius="full"
          bg="neon-soft"
          border="2px solid"
          borderColor="neon"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="neon-md"
        >
          <Text fontSize="3xl" color="neon" fontWeight="bold">✓</Text>
        </Box>
        <Heading size="md" color="text.primary" fontWeight="bold">
          ¡Solicitud registrada!
        </Heading>
        <Text color="text.secondary" fontSize="sm">
          Un asesor te contactará por WhatsApp para confirmar tu Test Drive.
        </Text>
        <Button
          bg="neon"
          color="bg.primary"
          fontWeight="bold"
          borderRadius="lg"
          px={6}
          _hover={{ boxShadow: "neon-md", transform: "scale(1.05)" }}
          _active={{ transform: "scale(0.95)" }}
          transition="all 0.15s"
          onClick={() => setSent(false)}
        >
          Agendar otro
        </Button>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={5} maxW="480px">
      <HStack gap={3}>
        <Image src="/logo.png" alt="Quantum" h="24px" w="auto" objectFit="contain" />
        <Heading size="md" color="text.primary" fontWeight="bold">
          Agendar Test Drive
        </Heading>
      </HStack>
      {slots.length > 0 && (
        <Badge
          bg="neon-soft"
          color="neon"
          border="1px solid"
          borderColor="neon-border"
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
        bg="bg.card"
        border="1px solid"
        borderColor="border.neon"
        borderRadius="xl"
        gap={5}
        align="stretch"
      >
        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="text.dim" textTransform="uppercase" letterSpacing="wide">
            Nombre
          </Text>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
            bg="bg.raised"
            borderColor="border.subtle"
            color="text.primary"
            borderRadius="lg"
            _focus={{ borderColor: "neon", boxShadow: "neon-sm" }}
            _placeholder={{ color: "text.dim" }}
          />
        </VStack>

        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="text.dim" textTransform="uppercase" letterSpacing="wide">
            Celular / WhatsApp
          </Text>
          <Input
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="+591 7XXXXXXX"
            bg="bg.raised"
            borderColor="border.subtle"
            color="text.primary"
            borderRadius="lg"
            _focus={{ borderColor: "neon", boxShadow: "neon-sm" }}
            _placeholder={{ color: "text.dim" }}
          />
        </VStack>

        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="text.dim" textTransform="uppercase" letterSpacing="wide">
            Ciudad
          </Text>
          <Input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej: La Paz"
            bg="bg.raised"
            borderColor="border.subtle"
            color="text.primary"
            borderRadius="lg"
            _focus={{ borderColor: "neon", boxShadow: "neon-sm" }}
            _placeholder={{ color: "text.dim" }}
          />
        </VStack>

        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="text.dim" textTransform="uppercase" letterSpacing="wide">
            Modelo de interés
          </Text>
          <NativeSelectField
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            bg="bg.raised"
            borderColor="border.subtle"
            color="text.primary"
            borderRadius="lg"
            _focus={{ borderColor: "neon", boxShadow: "neon-sm" }}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </NativeSelectField>
        </VStack>

        <Button
          bg="neon"
          color="bg.primary"
          fontWeight="bold"
          py={3}
          borderRadius="lg"
          fontSize="sm"
          _hover={{ boxShadow: "neon-md", transform: "scale(1.02)" }}
          _active={{ transform: "scale(0.98)" }}
          _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
          transition="all 0.15s"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Registrar Test Drive
        </Button>
      </VStack>
    </VStack>
  );
}
