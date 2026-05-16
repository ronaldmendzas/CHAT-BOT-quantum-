"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, Intent } from "@/lib/types";
import { resolveIntent } from "@/lib/intent-engine";
import { useDataset } from "@/hooks/useDataset";
import ChatPanel from "@/components/ChatPanel";
import ShowroomPanel from "@/components/ShowroomPanel";
import { Flex, Box, Image, Spinner, Text } from "@chakra-ui/react";

const WELCOME_MSG: ChatMessage = {
  role: "assistant",
  content:
    "¡Hola! Soy Bot Quantum, tu asesor de electromovilidad. Puedo mostrarte nuestros modelos, sucursales o agendar un Test Drive.",
  timestamp: Date.now(),
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [intent, setIntent] = useState<Intent>("WELCOME");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const { data: dataset, loading, error } = useDataset();

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !dataset) return;
    setInput("");

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800));

    try {
      const result = await resolveIntent(text);
      const botMsg: ChatMessage = {
        role: "assistant",
        content: result.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIntent(result.intent);
      if (result.productId) setSelectedProductId(result.productId);
      else if (result.intent !== "STOCK") setSelectedProductId(undefined);
    } catch {
      const botMsg: ChatMessage = {
        role: "assistant",
        content: "Lo siento, tuve un problema consultando la información. Intenta de nuevo.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, dataset]);

  const handleClear = useCallback(() => {
    setMessages([WELCOME_MSG]);
    setIntent("WELCOME");
    setSelectedProductId(undefined);
  }, []);

  const handleSelectProduct = useCallback((id: string) => {
    setSelectedProductId(id);
    setIntent("VEHICLE");
  }, []);

  const handleTestDrive = useCallback(
    (data: { nombre: string; celular: string; ciudad: string; producto: string }) => {
      const botMsg: ChatMessage = {
        role: "assistant",
        content: `¡Listo, ${data.nombre}! Registré tu solicitud de Test Drive para ${data.producto} en ${data.ciudad}. Un asesor te contactará por WhatsApp al ${data.celular}.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    },
    [],
  );

  if (loading) {
    return (
      <Flex h="100dvh" w="100vw" align="center" justify="center" bg="#020302" direction="column" gap={4}>
        <Spinner size="xl" color="#0e5c48" />
        <Text color="#8a9e8a" fontSize="sm">Cargando showroom...</Text>
      </Flex>
    );
  }

  if (error || !dataset) {
    return (
      <Flex h="100dvh" w="100vw" align="center" justify="center" bg="#020302" direction="column" gap={4}>
        <Text color="#ff4d6a" fontSize="lg" fontWeight="bold">Error al cargar datos</Text>
        <Text color="#8a9e8a" fontSize="sm">{error || "Dataset no disponible"}</Text>
      </Flex>
    );
  }

  return (
    <Flex
      h="100dvh"
      w="100vw"
      position="relative"
      overflow="hidden"
      direction={{ base: "column", md: "row" }}
    >
      {/* base */}
      <Box position="absolute" inset={0} bg="#020302" />
      
      {/* left glow */}
      <Box
        position="absolute"
        inset={0}
        bg="radial-gradient(ellipse at 25% 50%, rgba(0, 230, 180, 0.04) 0%, transparent 60%)"
        pointerEvents="none"
      />
      
      {/* right glow */}
      <Box
        position="absolute"
        inset={0}
        bg="radial-gradient(ellipse at 75% 50%, rgba(0, 230, 180, 0.06) 0%, transparent 55%)"
        pointerEvents="none"
      />

      {/* logo top-left */}
      <Image
        src="/logo.png"
        alt="Quantum"
        h={{ base: "32px", md: "44px" }}
        w="auto"
        objectFit="contain"
        position="absolute"
        top={{ base: "12px", md: "36px" }}
        left={{ base: "16px", md: "40px" }}
        zIndex={10}
        filter="drop-shadow(0 0 14px rgba(47, 182, 118, 0.25))"
      />

      {/* left half — chat */}
      <Flex
        w={{ base: "100%", md: "45%" }}
        h={{ base: "60%", md: "100%" }}
        align="center"
        justify="center"
        position="relative"
        zIndex={1}
        py={{ base: 2, md: 0 }}
      >
        <ChatPanel
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onClear={handleClear}
          isTyping={isTyping}
        />
      </Flex>

      {/* right half — showroom */}
      <Flex
        w={{ base: "100%", md: "55%" }}
        h={{ base: "40%", md: "100%" }}
        align="center"
        justify="center"
        position="relative"
        zIndex={1}
      >
        <ShowroomPanel
          intent={intent}
          products={dataset.products}
          stock={dataset.stock}
          sucursales={dataset.sucursales}
          testDrive={dataset.test_drive}
          media={dataset.media}
          selectedProductId={selectedProductId}
          onSelectProduct={handleSelectProduct}
          onTestDriveSubmit={handleTestDrive}
        />
      </Flex>
    </Flex>
  );
}
