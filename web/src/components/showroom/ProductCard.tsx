import { Button, Text } from "@chakra-ui/react";
import { formatBs } from "@/lib/dataset";
import type { Product, MediaItem } from "@/lib/types";
import ImageWithFallback from "./ImageWithFallback";

type Props = {
  product: Product;
  media: MediaItem[];
  onSelect: () => void;
};

export default function ProductCard({ product, media, onSelect }: Props) {
  const thumb = media.find((m) => m.product_id === product.id && m.type === "IMAGE");

  return (
    <Button
      variant="outline"
      borderColor="rgba(0, 230, 180, 0.05)"
      bg="#0c1610"
      p={5}
      justifyContent="flex-start"
      flexDirection="column"
      alignItems="flex-start"
      borderRadius="12px"
      _hover={{
        borderColor: "rgba(0, 230, 180, 0.05)",
        boxShadow: "0 0 6px rgba(0, 230, 180, 0.04)",
        transform: "translateY(-2px)",
      }}
      _active={{ transform: "scale(0.98)" }}
      transition="all 0.2s"
      onClick={onSelect}
      h="auto"
      overflow="hidden"
    >
      {thumb?.url && (
        <ImageWithFallback
          src={thumb.url}
          alt={product.nombre}
          w="100%"
          h="120px"
          mb={2}
        />
      )}
      <Text fontWeight="bold" fontSize="sm" color="white">
        {product.nombre}
      </Text>
      <Text fontSize="xs" color="#0e5c48" fontWeight="bold" mt={1}>
        {formatBs(product.precio.monto)}
      </Text>
    </Button>
  );
}
