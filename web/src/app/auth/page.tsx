"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  Button,
} from "@chakra-ui/react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    message: string;
    email: string;
  } | null>(null);

  function handleLoginSuccess() {
    setLoginSuccess(true);
  }

  function handleRegisterSuccess(needsConfirmation: boolean) {
    if (needsConfirmation) {
      setRegistrationSuccess({
        message: "Te enviamos un correo de confirmación. Revisa tu bandeja de entrada (y spam) y haz clic en el enlace para activar tu cuenta.",
        email: "",
      });
      setTab("login");
    } else {
      setLoginSuccess(true);
    }
  }

  function goToHome() {
    // Full reload to ensure auth session is detected on home page
    window.location.href = "/";
  }

  return (
    <Flex
      h="100dvh"
      w="100vw"
      align="center"
      justify="center"
      bg="#020302"
      position="relative"
    >
      {/* Glow background */}
      <Box
        position="absolute"
        inset={0}
        bg="radial-gradient(ellipse at 50% 50%, rgba(0, 230, 180, 0.04) 0%, transparent 60%)"
        pointerEvents="none"
      />

      <Box
        position="relative"
        zIndex={1}
        w="100%"
        maxW="420px"
        p={8}
        borderRadius="20px"
        bg="rgba(12, 22, 16, 0.8)"
        border="1px solid rgba(0, 230, 180, 0.06)"
        backdropFilter="blur(8px)"
      >
        <Flex direction="column" align="center" mb={6}>
          <Heading size="md" color="white" fontWeight="bold" mb={2}>
            Bot Quantum
          </Heading>
          <Text fontSize="sm" color="#8a9e8a">
            {tab === "login" ? "Inicia sesión para continuar" : "Crea tu cuenta gratis"}
          </Text>
        </Flex>

        {loginSuccess && (
          <Box
            bg="rgba(0, 230, 180, 0.08)"
            border="1px solid rgba(0, 230, 180, 0.15)"
            borderRadius="md"
            px={4}
            py={5}
            mb={4}
            textAlign="center"
          >
            <Text fontSize="md" color="#0e5c48" fontWeight="bold" mb={2}>
              ¡Login exitoso!
            </Text>
            <Text fontSize="sm" color="#8a9e8a" mb={4}>
              Tu sesión está activa. Haz clic abajo para ir al inicio.
            </Text>
            <Button
              w="100%"
              bg="#0e5c48"
              color="white"
              _hover={{ bg: "#0d4a3a" }}
              onClick={goToHome}
            >
              Ir al inicio →
            </Button>
          </Box>
        )}

        {registrationSuccess && tab === "login" && !loginSuccess && (
          <Box
            bg="rgba(0, 230, 180, 0.06)"
            border="1px solid rgba(0, 230, 180, 0.12)"
            borderRadius="md"
            px={4}
            py={3}
            mb={4}
          >
            <Text fontSize="sm" color="#0e5c48" fontWeight="bold" mb={1}>
              ¡Registro exitoso!
            </Text>
            <Text fontSize="sm" color="#8a9e8a">
              {registrationSuccess.message}
            </Text>
          </Box>
        )}

        {!loginSuccess && (
          <>
            <Flex gap={2} mb={6}>
              <Button
                flex={1}
                variant="ghost"
                bg={tab === "login" ? "rgba(0, 230, 180, 0.06)" : "transparent"}
                color={tab === "login" ? "white" : "#8a9e8a"}
                borderBottom={tab === "login" ? "2px solid #0e5c48" : "2px solid transparent"}
                borderRadius="0"
                _hover={{ bg: "rgba(0, 230, 180, 0.04)" }}
                onClick={() => setTab("login")}
              >
                Iniciar sesión
              </Button>
              <Button
                flex={1}
                variant="ghost"
                bg={tab === "register" ? "rgba(0, 230, 180, 0.06)" : "transparent"}
                color={tab === "register" ? "white" : "#8a9e8a"}
                borderBottom={tab === "register" ? "2px solid #0e5c48" : "2px solid transparent"}
                borderRadius="0"
                _hover={{ bg: "rgba(0, 230, 180, 0.04)" }}
                onClick={() => {
                  setTab("register");
                  setRegistrationSuccess(null);
                }}
              >
                Registrarse
              </Button>
            </Flex>

            {tab === "login" ? (
              <LoginForm onSuccess={handleLoginSuccess} />
            ) : (
              <RegisterForm onSuccess={handleRegisterSuccess} />
            )}
          </>
        )}
      </Box>
    </Flex>
  );
}
