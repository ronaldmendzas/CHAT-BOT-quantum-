import type { Intent, Product, StockEntry, Sucursal, TestDriveSlot, MediaItem } from "@/lib/types";
import TestDriveForm from "@/components/TestDriveForm";
import WelcomeView from "./showroom/WelcomeView";
import UnknownView from "./showroom/UnknownView";
import ProductCard from "./showroom/ProductCard";
import ProductDetail from "./showroom/ProductDetail";
import SucursalCard from "./showroom/SucursalCard";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Badge,
  SimpleGrid,
  Text,
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

function CatalogHeader() {
  return (
    <Flex align="center" justify="space-between" mb={8}>
      <Heading size="md" color="white" fontWeight="bold">
        Catálogo
      </Heading>
      <Badge
        bg="rgba(0, 230, 180, 0.04)"
        color="#0e5c48"
        border="1px solid rgba(0, 230, 180, 0.06)"
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

  if (intent === "WELCOME") return <WelcomeView />;

  return (
    <Box w="100%" h="100%" overflowY="auto" px={10} py={8}>
      <CatalogHeader />

      {intent === "VEHICLE" && selected && (
        <ProductDetail product={selected} stock={stock} media={media} />
      )}

      {(intent === "VEHICLE" && !selected) || intent === "STOCK" ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} maxW="720px">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              media={media}
              onSelect={() => onSelectProduct(p.id)}
            />
          ))}
        </SimpleGrid>
      ) : null}

      {intent === "SUCURSALES" && (
        <VStack gap={4} align="stretch">
          <Heading size="md" color="white" fontWeight="bold">
            Sucursales
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            {sucursales.map((s) => (
              <SucursalCard key={s.id} data={s} />
            ))}
          </SimpleGrid>
        </VStack>
      )}

      {intent === "TEST_DRIVE" && (
        <TestDriveForm
          products={products}
          slots={testDrive}
          onSubmit={onTestDriveSubmit}
        />
      )}

      {intent === "UNKNOWN" && <UnknownView />}
    </Box>
  );
}
