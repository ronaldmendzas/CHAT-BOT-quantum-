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
  if (estado === "DISPONIBLE") return "neon";
  if (estado === "BAJO_STOCK") return "warning";
  return "danger";
};

function NeonCard({ children, glow }: { children: React.ReactNode; glow?: boolean }) {
  return (
    <Box
      p={5}
      bg="bg.card"
      border="1px solid"
      borderColor={glow ? "neon" : "border.neon"}
      borderRadius="xl"
      boxShadow={glow ? "neon-sm" : "none"}
      _hover={{
        borderColor: "neon",
        boxShadow: "neon-md",
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
    <Box flex={1} overflowY="auto" p={8} bg="bg.raised">
      {/* header */}
      <Flex align="center" justify="space-between" mb={8}>
        <HStack gap={3}>
          <Image src="/logo.png" alt="Quantum" h="24px" w="auto" objectFit="contain" />
          <Heading size="md" color="text.primary" fontWeight="bold">
            Web Showroom
          </Heading>
        </HStack>
        <Badge
          bg="neon-soft"
          color="neon"
          border="1px solid"
          borderColor="neon-border"
          borderRadius="full"
          px={3}
          py={1}
          fontSize="xs"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="wide"
        >
          Demo
        </Badge>
      </Flex>

      {/* WELCOME */}
      {intent === "WELCOME" && (
        <VStack align="center" justify="center" flex={1} gap={6} textAlign="center" minH="60vh" position="relative">
          <Box
            position="absolute"
            w="320px"
            h="320px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(0,255,170,0.08) 0%, transparent 70%)"
            top="50%"
            left="50%"
            transform="translate(-50%, -60%)"
            pointerEvents="none"
          />
          <Image
            src="/logo.png"
            alt="Quantum Motors"
            w="280px"
            h="auto"
            objectFit="contain"
            filter="drop-shadow(0 0 20px rgba(0, 255, 170, 0.2))"
          />
          <Heading size="lg" color="text.primary" fontWeight="bold">
            Bienvenido a Quantum Motors
          </Heading>
          <Text color="text.secondary" fontSize="sm" maxW="400px">
            Escribe en el chat: &quot;modelos&quot;, &quot;sucursales&quot; o &quot;agendar test drive&quot;.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} w="full" maxW="720px">
            {products.map((p) => {
              const thumb = media.find((m) => m.product_id === p.id && m.type === "IMAGE");
              return (
              <Button
                key={p.id}
                variant="outline"
                borderColor="border.neon"
                bg="bg.card"
                p={5}
                justifyContent="flex-start"
                flexDirection="column"
                alignItems="flex-start"
                borderRadius="xl"
                _hover={{
                  borderColor: "neon",
                  boxShadow: "neon-md",
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
                    bg="bg.primary"
                  />
                )}
                <Text fontWeight="bold" fontSize="sm" color="text.primary">
                  {p.nombre}
                </Text>
                <Text fontSize="xs" color="neon" fontWeight="bold" mt={1}>
                  {formatBs(p.precio.monto)}
                </Text>
              </Button>
            );
            })}
          </SimpleGrid>
        </VStack>
      )}

      {/* VEHICLE detail */}
      {intent === "VEHICLE" && selected && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="320px"
            borderRadius="xl"
            overflow="hidden"
            bg="bg.primary"
            border="1px solid"
            borderColor="border.neon"
            boxShadow="neon-sm"
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
              fontSize="lg"
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
            <Text color="text.secondary" fontSize="sm">
              {selected.descripcion_corta}
            </Text>

            <HStack gap={2} flexWrap="wrap">
              <Badge
                bg="neon-soft"
                color="neon"
                border="1px solid"
                borderColor="neon-border"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="bold"
              >
                {selected.categoria}
              </Badge>
              <Badge
                bg="neon-soft"
                color="neon"
                border="1px solid"
                borderColor="neon-border"
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
                  <Flex key={k} justify="space-between" fontSize="sm" py={1} borderBottom="1px solid" borderColor="border.subtle">
                    <Text color="text.secondary" textTransform="capitalize">
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
              <Text fontSize="xs" color="text.secondary" fontWeight="bold">Colores:</Text>
              {selected.colores.map((c) => (
                <Badge
                  key={c}
                  bg="neon-soft"
                  color="neon"
                  border="1px solid"
                  borderColor="neon-border"
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
                Stock
              </Text>
              <VStack gap={2} align="stretch">
                {productStock.map((s) => (
                  <Flex key={s.sucursal_id} justify="space-between" align="center" fontSize="sm" py={1} borderBottom="1px solid" borderColor="border.subtle">
                    <Text color="text.secondary">{s.region}</Text>
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
                      {s.cantidad} — {s.estado}
                    </Badge>
                  </Flex>
                ))}
              </VStack>
            </NeonCard>
          </VStack>
        </SimpleGrid>
      )}

      {/* VEHICLE list (no specific product) */}
      {intent === "VEHICLE" && !selected && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} maxW="720px">
          {products.map((p) => {
            const thumb = media.find((m) => m.product_id === p.id && m.type === "IMAGE");
            return (
            <Button
              key={p.id}
              variant="outline"
              borderColor="border.neon"
              bg="bg.card"
              p={5}
              justifyContent="flex-start"
              flexDirection="column"
              alignItems="flex-start"
              borderRadius="xl"
              _hover={{
                borderColor: "neon",
                boxShadow: "neon-md",
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
                  objectFit="cover"
                  borderRadius="md"
                  mb={2}
                />
              )}
              <Text fontWeight="bold" fontSize="sm" color="text.primary">
                {p.nombre}
              </Text>
              <Text fontSize="xs" color="neon" fontWeight="bold" mt={1}>
                {formatBs(p.precio.monto)}
              </Text>
              <Text fontSize="xs" color="text.secondary" mt={2}>
                {p.descripcion_corta}
              </Text>
            </Button>
          );
          })}
        </SimpleGrid>
      )}

      {/* STOCK — redirigido a catálogo */}
      {intent === "STOCK" && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} maxW="720px">
          {products.map((p) => {
            const thumb = media.find((m) => m.product_id === p.id && m.type === "IMAGE");
            return (
            <Button
              key={p.id}
              variant="outline"
              borderColor="border.neon"
              bg="bg.card"
              p={5}
              justifyContent="flex-start"
              flexDirection="column"
              alignItems="flex-start"
              borderRadius="xl"
              _hover={{
                borderColor: "neon",
                boxShadow: "neon-md",
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
                  objectFit="cover"
                  borderRadius="md"
                  mb={2}
                />
              )}
              <Text fontWeight="bold" fontSize="sm" color="text.primary">
                {p.nombre}
              </Text>
              <Text fontSize="xs" color="neon" fontWeight="bold" mt={1}>
                {formatBs(p.precio.monto)}
              </Text>
              <Text fontSize="xs" color="text.secondary" mt={2}>
                {p.descripcion_corta}
              </Text>
            </Button>
          );
          })}
        </SimpleGrid>
      )}

      {/* SUCURSALES */}
      {intent === "SUCURSALES" && (
        <VStack gap={4} align="stretch">
          <Heading size="md" color="text.primary" fontWeight="bold">
            Sucursales
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            {sucursales.map((s) => (
              <NeonCard key={s.id}>
                <Heading size="sm" color="neon" mb={2} fontWeight="bold">
                  {s.ciudad}
                </Heading>
                <Text fontSize="sm" color="text.secondary" mb={1}>
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
          <Image
            src="/logo.png"
            alt="Quantum"
            w="120px"
            h="auto"
            objectFit="contain"
            opacity={0.2}
          />
          <Text color="text.secondary" fontSize="sm">
            Prueba escribir: &quot;modelos&quot;, &quot;sucursales&quot; o
            &quot;agendar test drive&quot;.
          </Text>
        </VStack>
      )}
    </Box>
  );
}
