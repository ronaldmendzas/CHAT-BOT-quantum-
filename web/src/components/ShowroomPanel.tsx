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

const stockColor = (estado: string) => {
  if (estado === "DISPONIBLE") return "green.primary";
  if (estado === "BAJO_STOCK") return "warning";
  return "danger";
};

function Glow() {
  return (
    <>
      <Box
        position="absolute"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(0,230,118,0.07) 0%, transparent 70%)"
        top="30%"
        left="20%"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(0,230,118,0.05) 0%, transparent 70%)"
        bottom="20%"
        right="25%"
        pointerEvents="none"
      />
    </>
  );
}

function NeonCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      p={5}
      bg="bg.card"
      border="1px solid"
      borderColor="green.border"
      borderRadius="lg"
      _hover={{
        borderColor: "green.primary",
        boxShadow: "card-hover",
        transform: "translateY(-2px)",
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
  const mainImage = selectedMedia[0]?.url || "/logo.png";
  const productStock = selected
    ? stock.filter((s) => s.product_id === selected.id)
    : stock;

  return (
    <Box flex={1} overflowY="auto" bg="bg.root" position="relative">
      <Glow />

      {/* WELCOME — minimal pill badge centered */}
      {intent === "WELCOME" && (
        <Flex align="center" justify="center" minH="100dvh">
          <Box
            bg="rgba(17, 17, 17, 0.55)"
            border="1px solid"
            borderColor="green.border"
            borderRadius="xl"
            px={10}
            py={5}
            boxShadow="card-shadow"
          >
            <Heading size="lg" color="text.primary" fontWeight="bold" fontSize="28px">
              Bienvenido a Quantum Motors
            </Heading>
          </Box>
        </Flex>
      )}

      {/* VEHICLE list */}
      {intent !== "WELCOME" && (
        <Box p={8}>
          {/* header */}
          <Flex align="center" justify="space-between" mb={8}>
            <HStack gap={3}>
              <Image src="/logo.png" alt="Quantum" h="22px" w="auto" objectFit="contain" />
              <Heading size="md" color="text.primary" fontWeight="bold">
                Catálogo
              </Heading>
            </HStack>
            <Badge
              bg="green.soft"
              color="green.primary"
              border="1px solid"
              borderColor="green.border"
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
        </Box>
      )}

      {/* VEHICLE detail */}
      {intent === "VEHICLE" && selected && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} px={8} pb={8}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="320px"
            borderRadius="lg"
            overflow="hidden"
            bg="bg.root"
            border="1px solid"
            borderColor="green.border"
            boxShadow="card-shadow"
            position="relative"
            p={4}
          >
            <Image
              src={mainImage}
              alt={selected.nombre}
              maxW="100%"
              maxH="320px"
              objectFit="contain"
            />
            <Text
              fontSize="md"
              color="text.primary"
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
            <Heading size="md" color="text.primary" fontWeight="bold">
              {selected.nombre}
            </Heading>
            <Text color="text.subtitle" fontSize="sm">
              {selected.descripcion_corta}
            </Text>

            <HStack gap={2} flexWrap="wrap">
              <Badge
                bg="green.soft"
                color="green.primary"
                border="1px solid"
                borderColor="green.border"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="bold"
              >
                {selected.categoria}
              </Badge>
              <Badge
                bg="green.soft"
                color="green.primary"
                border="1px solid"
                borderColor="green.border"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="bold"
              >
                {formatBs(selected.precio.monto)}
              </Badge>
            </HStack>

            {/* specs */}
            <NeonCard>
              <Text fontSize="xs" color="text.dim" textTransform="uppercase" letterSpacing="wide" mb={3} fontWeight="bold">
                Especificaciones
              </Text>
              <VStack gap={2} align="stretch">
                {Object.entries(selected.especificaciones).map(([k, v]) => (
                  <Flex key={k} justify="space-between" fontSize="sm" py={1} borderBottom="1px solid" borderColor="green.border">
                    <Text color="text.subtitle" textTransform="capitalize">
                      {k.replaceAll("_", " ")}
                    </Text>
                    <Text color="text.primary" fontWeight="bold">
                      {v}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </NeonCard>

            {/* colors */}
            <HStack gap={2} flexWrap="wrap">
              <Text fontSize="xs" color="text.subtitle" fontWeight="bold">Colores:</Text>
              {selected.colores.map((c) => (
                <Badge
                  key={c}
                  bg="green.soft"
                  color="green.primary"
                  border="1px solid"
                  borderColor="green.border"
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

            {/* stock mini */}
            <NeonCard>
              <Text fontSize="xs" color="text.dim" textTransform="uppercase" letterSpacing="wide" mb={3} fontWeight="bold">
                Disponibilidad
              </Text>
              <VStack gap={2} align="stretch">
                {productStock.map((s) => (
                  <Flex key={s.sucursal_id} justify="space-between" align="center" fontSize="sm" py={1} borderBottom="1px solid" borderColor="green.border">
                    <Text color="text.subtitle">{s.region}</Text>
                    <Badge
                      color={stockColor(s.estado)}
                      bg={`${stockColor(s.estado)}15`}
                      border="1px solid"
                      borderColor={`${stockColor(s.estado)}40`}
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
            </NeonCard>
          </VStack>
        </SimpleGrid>
      )}

      {/* VEHICLE list + STOCK fallback */}
      {(intent === "VEHICLE" && !selected || intent === "STOCK") && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} maxW="720px" px={8} pb={8}>
          {products.map((p) => {
            const thumb = media.find((m) => m.product_id === p.id && m.type === "IMAGE");
            return (
            <Button
              key={p.id}
              variant="outline"
              borderColor="green.border"
              bg="bg.card"
              p={5}
              justifyContent="flex-start"
              flexDirection="column"
              alignItems="flex-start"
              borderRadius="lg"
              _hover={{
                borderColor: "green.primary",
                boxShadow: "card-hover",
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
                  bg="bg.root"
                />
              )}
              <Text fontWeight="bold" fontSize="sm" color="text.primary">
                {p.nombre}
              </Text>
              <Text fontSize="xs" color="green.primary" fontWeight="bold" mt={1}>
                {formatBs(p.precio.monto)}
              </Text>
              <Text fontSize="xs" color="text.subtitle" mt={2}>
                {p.descripcion_corta}
              </Text>
            </Button>
          );
          })}
        </SimpleGrid>
      )}

      {/* SUCURSALES */}
      {intent === "SUCURSALES" && (
        <Box px={8} pb={8}>
          <VStack gap={4} align="stretch">
            <Heading size="md" color="text.primary" fontWeight="bold">
              Sucursales
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
              {sucursales.map((s) => (
                <NeonCard key={s.id}>
                  <Heading size="sm" color="green.primary" mb={2} fontWeight="bold">
                    {s.ciudad}
                  </Heading>
                  <Text fontSize="sm" color="text.subtitle" mb={1}>
                    {s.direccion}
                  </Text>
                  <Text fontSize="xs" color="text.dim">
                    🕐 {s.horario}
                  </Text>
                  <Text fontSize="xs" color="text.dim" mt={0.5}>
                    📞 {s.telefono}
                  </Text>
                </NeonCard>
              ))}
            </SimpleGrid>
          </VStack>
        </Box>
      )}

      {/* TEST DRIVE */}
      {intent === "TEST_DRIVE" && (
        <Box px={8} pb={8}>
          <TestDriveForm
            products={products}
            slots={testDrive}
            onSubmit={onTestDriveSubmit}
          />
        </Box>
      )}

      {/* UNKNOWN */}
      {intent === "UNKNOWN" && (
        <Box px={8} pb={8}>
          <VStack align="center" justify="center" gap={6} textAlign="center" minH="60vh">
            <Image
              src="/logo.png"
              alt="Quantum"
              w="100px"
              h="auto"
              objectFit="contain"
              opacity={0.15}
            />
            <Text color="text.subtitle" fontSize="sm">
              Prueba escribir: &quot;modelos&quot;, &quot;sucursales&quot; o &quot;agendar test drive&quot;.
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
