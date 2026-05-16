import { useState } from "react";
import { Image, Box, Text } from "@chakra-ui/react";

type Props = {
  src: string;
  alt: string;
  maxH?: string;
  w?: string;
  h?: string;
  objectFit?: string;
  borderRadius?: string;
  bg?: string;
  mb?: number;
};

export default function ImageWithFallback({
  src,
  alt,
  maxH = "320px",
  w = "auto",
  h = "auto",
  objectFit = "contain",
  borderRadius = "md",
  bg = "#040604",
  mb = 0,
}: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <Box
        w={w}
        h={h || maxH}
        bg={bg}
        borderRadius={borderRadius}
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={mb}
      >
        <Text fontSize="xs" color="#5d705d" textAlign="center" px={4}>
          Imagen no disponible
        </Text>
      </Box>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      maxW="100%"
      maxH={maxH}
      w={w}
      h={h}
      objectFit={objectFit}
      borderRadius={borderRadius}
      mb={mb}
      bg={bg}
      onError={() => setError(true)}
    />
  );
}
