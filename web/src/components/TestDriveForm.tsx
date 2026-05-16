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
        bg="#0b110b"
        border="1px solid rgba(0, 230, 118, 0.12)"
        borderRadius="lg"
        textAlign="center"
      >
        <Image src="/logo.png" alt="Quantum" w="80px" h="auto" objectFit="contain" opacity={0.5} />
        <Box
          w="64px"
          h="64px"
          borderRadius="full"
          bg="rgba(0, 230, 118, 0.06)"
          border="2px solid #00e676"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 0 14px rgba(0, 230, 118, 0.2)"
        >
          <Text fontSize="3xl" color="#00e676" fontWeight="bold">✓</Text>
        </Box>
        <Heading size="md" color="white" fontWeight="bold">
          ¡Solicitud registrada!
        </Heading>
        <Text color="#8a9e8a" fontSize="sm">
          Un asesor te contactará por WhatsApp para confirmar tu Test Drive.
        </Text>
        <Button
          bg="#00c853"
          color="white"
          fontWeight="bold"
          borderRadius="12px"
          px={6}
          _hover={{ boxShadow: "0 0 16px rgba(0, 200, 83, 0.35)" }}
          onClick={() => setSent(false)}
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
          bg="rgba(0, 230, 118, 0.06)"
          color="#00e676"
          border="1px solid rgba(0, 230, 118, 0.22)"
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
        bg="#0b110b"
        border="1px solid rgba(0, 230, 118, 0.12)"
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
            bg="#060a06"
            borderColor="rgba(0, 230, 118, 0.12)"
            color="white"
            borderRadius="12px"
            _focus={{ borderColor: "#00e676", boxShadow: "0 0 8px rgba(0, 230, 118, 0.2)" }}
            _placeholder={{ color: "#5d705d" }}
          />
        </VStack>

        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="#5d705d" textTransform="uppercase" letterSpacing="wide">
            Celular / WhatsApp
          </Text>
          <Input
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="+591 7XXXXXXX"
            bg="#060a06"
            borderColor="rgba(0, 230, 118, 0.12)"
            color="white"
            borderRadius="12px"
            _focus={{ borderColor: "#00e676", boxShadow: "0 0 8px rgba(0, 230, 118, 0.2)" }}
            _placeholder={{ color: "#5d705d" }}
          />
        </VStack>

        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="#5d705d" textTransform="uppercase" letterSpacing="wide">
            Ciudad
          </Text>
          <Input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej: La Paz"
            bg="#060a06"
            borderColor="rgba(0, 230, 118, 0.12)"
            color="white"
            borderRadius="12px"
            _focus={{ borderColor: "#00e676", boxShadow: "0 0 8px rgba(0, 230, 118, 0.2)" }}
            _placeholder={{ color: "#5d705d" }}
          />
        </VStack>

        <VStack gap={1.5} align="stretch">
          <Text fontSize="xs" fontWeight="bold" color="#5d705d" textTransform="uppercase" letterSpacing="wide">
            Modelo de interés
          </Text>
          <NativeSelectField
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            bg="#060a06"
            borderColor="rgba(0, 230, 118, 0.12)"
            color="white"
            borderRadius="12px"
            _focus={{ borderColor: "#00e676", boxShadow: "0 0 8px rgba(0, 230, 118, 0.2)" }}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </NativeSelectField>
        </VStack>

        <Button
          bg="#00c853"
          color="white"
          fontWeight="bold"
          py={3}
          borderRadius="12px"
          fontSize="sm"
          _hover={{ boxShadow: "0 0 16px rgba(0, 200, 83, 0.35)" }}
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
