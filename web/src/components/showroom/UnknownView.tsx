import { Text, VStack } from "@chakra-ui/react";

export default function UnknownView() {
  return (
    <VStack align="center" justify="center" gap={6} textAlign="center" minH="60vh">
      <Text color="#8a9e8a" fontSize="sm">
        Prueba escribir: &quot;modelos&quot;, &quot;sucursales&quot; o &quot;agendar test drive&quot;.
      </Text>
    </VStack>
  );
}
