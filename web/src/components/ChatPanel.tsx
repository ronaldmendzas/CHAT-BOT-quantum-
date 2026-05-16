"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import {
  Box,
  Flex,
  Text,
  Heading,
  Textarea,
  Button,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";

type Props = {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClear: () => void;
};

export default function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  onClear,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <VStack
      bg="#080c08"
      borderRadius="16px"
      boxShadow="0 0 40px rgba(0, 230, 118, 0.04), 0 0 80px rgba(0, 230, 118, 0.02)"
      w="100%"
      h="75vh"
      maxH="750px"
      overflow="hidden"
      gap={0}
    >
      {/* header */}
      <Flex align="center" justify="space-between" px={6} pt={6} pb={3} w="100%">
        <HStack gap={2.5}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="#00ff88"
            boxShadow="0 0 10px rgba(0, 255, 136, 0.7)"
            animation="pulseDot 2.5s ease-in-out infinite"
          />
          <VStack gap={0} align="start">
            <Heading size="sm" color="white" fontWeight="bold" fontSize="15px">
              Bot Quantum
            </Heading>
            <Text fontSize="11px" color="#8a9e8a">
              Asesor de electromovilidad
            </Text>
          </VStack>
        </HStack>
        <IconButton
          aria-label="Limpiar chat"
          variant="ghost"
          size="xs"
          color="#8a9e8a"
          _hover={{ color: "#ff4d6a" }}
          borderRadius="md"
          onClick={onClear}
        >
          ✕
        </IconButton>
      </Flex>

      {/* messages */}
      <VStack
        flex={1}
        overflowY="auto"
        px={5}
        py={3}
        gap={3}
        align="stretch"
        w="100%"
      >
        {messages.map((m, i) => (
          <Box
            key={i}
            maxW="85%"
            px={4}
            py={3}
            borderRadius="12px"
            fontSize="14px"
            lineHeight="1.55"
            alignSelf={m.role === "user" ? "flex-end" : "flex-start"}
            bg={m.role === "user" ? "rgba(0, 200, 120, 0.05)" : "#162416"}
            border={m.role === "user" ? "1px solid rgba(0, 200, 120, 0.12)" : "none"}
            color={m.role === "user" ? "#00c853" : "white"}
            whiteSpace="pre-wrap"
            wordBreak="break-word"
          >
            {m.content}
          </Box>
        ))}
        <div ref={bottomRef} />
      </VStack>

      {/* input */}
      <Flex align="center" gap={2.5} px={5} py={4} w="100%">
        <Textarea
          flex={1}
          w="100%"
          rows={1}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe tu consulta..."
          bg="transparent"
          border="1px solid #00e676"
          color="white"
          fontSize="sm"
          borderRadius="8px"
          minH="42px"
          py={2.5}
          _focus={{ boxShadow: "0 0 6px rgba(0, 230, 118, 0.15)" }}
          _placeholder={{ color: "#5d705d" }}
          resize="none"
          overflow="hidden"
        />
        <Button
          bg="#00c853"
          color="white"
          w="42px"
          h="42px"
          minW="42px"
          fontSize="lg"
          borderRadius="8px"
          fontWeight="bold"
          p={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          lineHeight={1}
          _hover={{ boxShadow: "0 0 16px rgba(0, 200, 83, 0.35)" }}
          _disabled={{ opacity: 0.25, cursor: "not-allowed" }}
          onClick={onSend}
          disabled={!input.trim()}
        >
          ▶
        </Button>
      </Flex>
    </VStack>
  );
}
