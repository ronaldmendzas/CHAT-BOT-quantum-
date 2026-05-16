import { Box, Heading, Text } from "@chakra-ui/react";
import type { Sucursal } from "@/lib/types";

export default function SucursalCard({ data }: { data: Sucursal }) {
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
      <Heading size="sm" color="#0e5c48" mb={2} fontWeight="bold">
        {data.ciudad}
      </Heading>
      <Text fontSize="sm" color="#8a9e8a" mb={1}>
        {data.direccion}
      </Text>
      <Text fontSize="xs" color="#5d705d">
        Horario: {data.horario}
      </Text>
      <Text fontSize="xs" color="#5d705d" mt={0.5}>
        Tel: {data.telefono}
      </Text>
    </Box>
  );
}
