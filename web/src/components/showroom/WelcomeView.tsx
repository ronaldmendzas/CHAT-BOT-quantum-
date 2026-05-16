import { Box, Heading } from "@chakra-ui/react";

export default function WelcomeView() {
  return (
    <Box
      display="flex"
      w="100%"
      h="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="rgba(15, 26, 15, 0.7)"
        border="1px solid rgba(0, 230, 180, 0.06)"
        borderRadius="50px"
        px={14}
        py={7}
        boxShadow="0 0 3px rgba(0, 230, 180, 0.05)"
      >
        <Heading size="lg" color="white" fontWeight="bold" fontSize="28px">
          Bienvenido a Quantum Motors
        </Heading>
      </Box>
    </Box>
  );
}
