"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, Intent } from "@/lib/types";
import { dataset } from "@/lib/dataset";
import { resolveIntent } from "@/lib/intent-engine";
import { loadMessages, saveMessages, clearMessages } from "@/lib/memory";
import ChatPanel from "@/components/ChatPanel";
import ShowroomPanel from "@/components/ShowroomPanel";
import { Flex, Box, Image } from "@chakra-ui/react";

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

  useEffect(() => {
    const saved = loadMessages();
    if (saved.length > 0) setMessages(saved);
  }, []);

  useEffect(() => {
    if (messages.length > 1) saveMessages(messages);
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const result = resolveIntent(text, dataset);
    const botMsg: ChatMessage = {
      role: "assistant",
      content: result.reply,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setIntent(result.intent);
    if (result.productId) setSelectedProductId(result.productId);
    else if (result.intent !== "STOCK") setSelectedProductId(undefined);
  }, [input]);

  const handleClear = useCallback(() => {
    clearMessages();
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

  return (
    <Flex
      h="100dvh"
      w="100vw"
      position="relative"
      bg="radial-gradient(ellipse at 30% 50%, #051005 0%, #020302 60%)"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        bg="radial-gradient(ellipse at 80% 50%, #051005 0%, transparent 50%)"
        pointerEvents="none"
      />
      {/* logo top-left */}
      <Image
        src="/logo.png"
        alt="Quantum"
        h="32px"
        w="auto"
        objectFit="contain"
        position="absolute"
        top="40px"
        left="40px"
        zIndex={10}
      />

      {/* left half — chat card centered */}
      <Flex
        flex={1}
        align="center"
        justify="center"
        px={6}
        position="relative"
        zIndex={1}
      >
        <ChatPanel
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onClear={handleClear}
        />
      </Flex>

      {/* right half — showroom */}
      <Flex
        flex={1}
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
