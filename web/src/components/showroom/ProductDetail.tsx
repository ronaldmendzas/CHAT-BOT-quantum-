import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { formatBs } from "@/lib/dataset";
import type { Product, StockEntry, MediaItem } from "@/lib/types";
import ImageWithFallback from "./ImageWithFallback";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <Box
      p={5}
      bg="#0c1610"
      border="1px solid rgba(0, 230, 180, 0.05)"
      borderRadius="12px"
      _hover={{
        borderColor: "rgba(0, 230, 180, 0.05)",
        boxShadow: "0 0 6px rgba(0, 230, 180, 0.04)",
      }}
      transition="all 0.2s"
    >
      {children}
    </Box>
  );
}

function formatSpecValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(formatSpecValue).join(", ");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${k.replaceAll("_", " ")}: ${formatSpecValue(v)}`)
      .join(" | ");
  }
  return String(value);
}

type Props = {
  product: Product;
  stock: StockEntry[];
  media: MediaItem[];
};

export default function ProductDetail({ product, stock, media }: Props) {
  const selectedMedia = media.filter((m) => m.product_id === product.id && m.type === "IMAGE");
  const mainImage = selectedMedia[0]?.url || "";

  return (
    <SimpleGrid columns={{ base: 1, sm: 1, md: 2 }} gap={{ base: 4, md: 6 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH={{ base: "200px", md: "320px" }}
        borderRadius="12px"
        overflow="hidden"
        bg="#060906"
        border="1px solid rgba(0, 230, 180, 0.05)"
        position="relative"
        p={{ base: 2, md: 4 }}
      >
        {mainImage && (
          <ImageWithFallback
            src={mainImage}
            alt={product.nombre}
            maxH={{ base: "200px", md: "320px" }}
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
          {product.nombre}
        </Text>
      </Box>

      <VStack gap={4} align="stretch">
        <Heading size="md" color="white" fontWeight="bold">
          {product.nombre}
        </Heading>
        {product.descripcion_corta && (
          <Text color="#8a9e8a" fontSize="sm">
            {product.descripcion_corta}
          </Text>
        )}

        <HStack gap={2} flexWrap="wrap">
          <Badge
            bg="rgba(0, 230, 180, 0.04)"
            color="#0e5c48"
            border="1px solid rgba(0, 230, 180, 0.06)"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            fontWeight="bold"
          >
            {product.categoria}
          </Badge>
          <Badge
            bg="rgba(0, 230, 180, 0.04)"
            color="#0e5c48"
            border="1px solid rgba(0, 230, 180, 0.06)"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            fontWeight="bold"
          >
            {formatBs(product.precio.monto)}
          </Badge>
        </HStack>

        {Object.keys(product.especificaciones).length > 0 && (
          <Card>
            <Text fontSize="xs" color="#5d705d" textTransform="uppercase" letterSpacing="wide" mb={3} fontWeight="bold">
              Especificaciones
            </Text>
            <VStack gap={2} align="stretch">
              {Object.entries(product.especificaciones).map(([k, v]) => (
                <Flex key={k} direction={{ base: "column", sm: "row" }} justify="space-between" fontSize={{ base: "xs", md: "sm" }} py={1} borderBottom="1px solid rgba(0, 230, 180, 0.06)">
                  <Text color="#8a9e8a" textTransform="capitalize" mb={{ base: 0.5, md: 0 }}>
                    {k.replaceAll("_", " ")}
                  </Text>
                  <Text color="white" fontWeight="bold">
                    {formatSpecValue(v)}
                  </Text>
                </Flex>
              ))}
            </VStack>
          </Card>
        )}

        <HStack gap={2} flexWrap="wrap">
          <Text fontSize="xs" color="#8a9e8a" fontWeight="bold">Colores:</Text>
          {product.colores.map((c) => (
            <Badge
              key={c}
              bg="rgba(0, 230, 180, 0.04)"
              color="#0e5c48"
              border="1px solid rgba(0, 230, 180, 0.06)"
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
              .filter((s) => s.product_id === product.id)
              .map((s) => (
                <Flex key={s.sucursal_id} direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "center" }} fontSize={{ base: "xs", md: "sm" }} py={1} borderBottom="1px solid rgba(0, 230, 180, 0.06)">
                  <Text color="#8a9e8a" mb={{ base: 0.5, md: 0 }}>{s.region}</Text>
                  <Badge
                    color="#0e5c48"
                    bg="rgba(0, 230, 180, 0.04)"
                    border="1px solid rgba(0, 230, 180, 0.06)"
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
  );
}
