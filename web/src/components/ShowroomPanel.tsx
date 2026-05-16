"use client";

import type { Intent, Product, StockEntry, Sucursal, TestDriveSlot, MediaItem } from "@/lib/types";
import { formatBs } from "@/lib/dataset";
import TestDriveForm from "./TestDriveForm";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  SimpleGrid,
  Button,
  Image,
} from "@chakra-ui/react";

type Props = Readonly<{
  intent: Intent;
  products: Product[];
  stock: StockEntry[];
  sucursales: Sucursal[];
  testDrive: TestDriveSlot[];
  media: MediaItem[];
  selectedProductId?: string;
  onSelectProduct: (id: string) => void;
  onTestDriveSubmit: (data: {
    nombre: string;
    celular: string;
    ciudad: string;
    producto: string;
  }) => void;
}>;

function Card({ children }: { children: React.ReactNode }) {
  return (
    <Box
      p={5}
      bg="#0c1610"
      border="1px solid rgba(14, 92, 72, 0.08)"
      borderRadius="12px"
      _hover={{
        borderColor: "rgba(14, 92, 72, 0.15)",
        boxShadow: "0 0 20px rgba(14, 92, 72, 0.05)",
      }}
      transition="all 0.2s"
    >
      {children}
    </Box>
  );
}

export default function ShowroomPanel({
  intent,
  products,
  stock,
  sucursales,
  testDrive,
  media,
  selectedProductId,
  onSelectProduct,
  onTestDriveSubmit,
}: Props) {
  const selected = products.find((p) => p.id === selectedProductId);
  const selectedMedia = selected
    ? media.filter((m) => m.product_id === selected.id && m.type === "IMAGE")
    : [];
  const mainImage = selectedMedia[0]?.url || "";

  /* ========== WELCOME ========== */
  if (intent === "WELCOME") {
    return (
      <Flex w="100%" h="100%" align="center" justify="center">
        <Box
          bg="rgba(15, 26, 15, 0.7)"
          border="1px solid rgba(14, 92, 72, 0.12)"
          borderRadius="50px"
          px={14}
          py={7}
          boxShadow="0 0 40px rgba(14, 92, 72, 0.04)"
        >
          <Heading size="lg" color="white" fontWeight="bold" fontSize="28px">
            Bienvenido a Quantum Motors
          </Heading>
        </Box>
      </Flex>
    );
  }

  /* ========== CONTENT VIEWS ========== */
  return (
    <Box w="100%" h="100%" overflowY="auto" px={10} py={8}>
      {/* header */}
      <Flex align="center" justify="space-between" mb={8}>
        <Heading size="md" color="white" fontWeight="bold">
          Catálogo
        </Heading>
        <Badge
          bg="rgba(14, 92, 72, 0.05)"
          color="#0e5c48"
          border="1px solid rgba(14, 92, 72, 0.12)"
          borderRadius="full"
          px={3}
          py={1}
          fontSize="xs"
          fontWeight="bold"
          textTransform="uppercase"
        >
          Demo
        </Badge>
      </Flex>

      {/* VEHICLE detail */}
      {intent === "VEHICLE" && selected && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="320px"
            borderRadius="12px"
            overflow="hidden"
            bg="#060906"
            border="1px solid rgba(14, 92, 72, 0.08)"
            position="relative"
            p={4}
          >
            {mainImage && (
              <Image
                src={mainImage}
                alt={selected.nombre}
                maxW="100%"
                maxH="320px"
                objectFit="contain"
              />
            )}
            <Text
              fontSize="md"
              color="white"
              fontWeight="bold"
              position="absolute"
              bottom={4}
              left={0}
              right={0}
              textAlign="center"
              bg="rgba(0,0,0,0.6)"
              py={2}
            >
              {selected.nombre}
            </Text>
          </Box>

          <VStack gap={4} align="stretch">
            <Heading size="md" color="white" fontWeight="bold">
              {selected.nombre}
            </Heading>
            {selected.descripcion_corta && (
              <Text color="#8a9e8a" fontSize="sm">
                {selected.descripcion_corta}
              </Text>
            )}

            <HStack gap={2} flexWrap="wrap">
              <Badge
                bg="rgba(14, 92, 72, 0.05)"
                color="#0e5c48"
                border="1px solid rgba(14, 92, 72, 0.12)"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="bold"
              >
                {selected.categoria}
              </Badge>
              <Badge
                bg="rgba(14, 92, 72, 0.05)"
                color="#0e5c48"
                border="1px solid rgba(14, 92, 72, 0.12)"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="bold"
              >
                {formatBs(selected.precio.monto)}
              </Badge>
            </HStack>

            {Object.keys(selected.especificaciones).length > 0 && (
              <Card>
                <Text fontSize="xs" color="#5d705d" textTransform="uppercase" letterSpacing="wide" mb={3} fontWeight="bold">
                  Especificaciones
                </Text>
                <VStack gap={2} align="stretch">
                  {Object.entries(selected.especificaciones).map(([k, v]) => (
                    <Flex key={k} justify="space-between" fontSize="sm" py={1} borderBottom="1px solid rgba(14, 92, 72, 0.06)">
                      <Text color="#8a9e8a" textTransform="capitalize">
                        {k.replaceAll("_", " ")}
                      </Text>
                      <Text color="white" fontWeight="bold">
                        {v}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              </Card>
            )}

            <HStack gap={2} flexWrap="wrap">
              <Text fontSize="xs" color="#8a9e8a" fontWeight="bold">Colores:</Text>
              {selected.colores.map((c) => (
                <Badge
                  key={c}
                  bg="rgba(14, 92, 72, 0.05)"
                  color="#0e5c48"
                  border="1px solid rgba(14, 92, 72, 0.12)"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {c}
                </Badge>
              ))}
            </HStack>

            <Card>
              <Text fontSize="xs" color="#5d705d" textTransform="uppercase" letterSpacing="wide" mb={3} fontWeight="bold">
                Disponibilidad
              </Text>
              <VStack gap={2} align="stretch">
                {stock
                  .filter((s) => s.product_id === selected.id)
                  .map((s) => (
                    <Flex key={s.sucursal_id} justify="space-between" align="center" fontSize="sm" py={1} borderBottom="1px solid rgba(14, 92, 72, 0.06)">
                      <Text color="#8a9e8a">{s.region}</Text>
                      <Badge
                        color="#0e5c48"
                        bg="rgba(14, 92, 72, 0.05)"
                        border="1px solid rgba(14, 92, 72, 0.12)"
                        borderRadius="full"
                        px={3}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {s.estado}
                      </Badge>
                    </Flex>
                  ))}
              </VStack>
            </Card>
          </VStack>
        </SimpleGrid>
      )}

      {/* VEHICLE list + STOCK fallback */}
      {(intent === "VEHICLE" && !selected) || intent === "STOCK" ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} maxW="720px">
          {products.map((p) => {
            const thumb = media.find((m) => m.product_id === p.id && m.type === "IMAGE");
            return (
              <Button
                key={p.id}
                variant="outline"
                borderColor="rgba(14, 92, 72, 0.08)"
                bg="#0c1610"
                p={5}
                justifyContent="flex-start"
                flexDirection="column"
                alignItems="flex-start"
                borderRadius="12px"
                _hover={{
                  borderColor: "rgba(14, 92, 72, 0.15)",
                  boxShadow: "0 0 20px rgba(14, 92, 72, 0.05)",
                  transform: "translateY(-2px)",
                }}
                _active={{ transform: "scale(0.98)" }}
                transition="all 0.2s"
                onClick={() => onSelectProduct(p.id)}
                h="auto"
                overflow="hidden"
              >
                {thumb?.url && (
                  <Image
                    src={thumb.url}
                    alt={p.nombre}
                    w="100%"
                    h="120px"
                    objectFit="contain"
                    borderRadius="md"
                    mb={2}
                    bg="#040604"
                  />
                )}
                <Text fontWeight="bold" fontSize="sm" color="white">
                  {p.nombre}
                </Text>
                <Text fontSize="xs" color="#0e5c48" fontWeight="bold" mt={1}>
                  {formatBs(p.precio.monto)}
                </Text>
              </Button>
            );
          })}
        </SimpleGrid>
      ) : null}

      {/* SUCURSALES */}
      {intent === "SUCURSALES" && (
        <VStack gap={4} align="stretch">
          <Heading size="md" color="white" fontWeight="bold">
            Sucursales
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            {sucursales.map((s) => (
              <Card key={s.id}>
                <Heading size="sm" color="#0e5c48" mb={2} fontWeight="bold">
                  {s.ciudad}
                </Heading>
                <Text fontSize="sm" color="#8a9e8a" mb={1}>
                  {s.direccion}
                </Text>
                <Text fontSize="xs" color="#5d705d">
                  🕐 {s.horario}
                </Text>
                <Text fontSize="xs" color="#5d705d" mt={0.5}>
                  📞 {s.telefono}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      )}

      {/* TEST DRIVE */}
      {intent === "TEST_DRIVE" && (
        <TestDriveForm
          products={products}
          slots={testDrive}
          onSubmit={onTestDriveSubmit}
        />
      )}

      {/* UNKNOWN */}
      {intent === "UNKNOWN" && (
        <VStack align="center" justify="center" gap={6} textAlign="center" minH="60vh">
          <Text color="#8a9e8a" fontSize="sm">
            Prueba escribir: &quot;modelos&quot;, &quot;sucursales&quot; o &quot;agendar test drive&quot;.
          </Text>
        </VStack>
      )}
    </Box>
  );
}
