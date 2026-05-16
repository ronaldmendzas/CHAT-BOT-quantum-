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
  Image,
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
    <Box
      w="45vw"
      minW="380px"
      maxW="520px"
      flexShrink={0}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      h="100dvh"
      py={10}
    >
      <VStack
        bg="bg.card"
        borderRadius="lg"
        boxShadow="card-shadow"
        w="100%"
        h="75vh"
        maxH="750px"
        overflow="hidden"
        gap={0}
      >
        {/* header */}
        <Flex
          align="center"
          justify="space-between"
          px={6}
          pt={6}
          pb={4}
          w="100%"
        >
          <HStack gap={3}>
            <Image src="/logo.png" alt="Quantum" h="24px" w="auto" objectFit="contain" />
          </HStack>
          <IconButton
            aria-label="Limpiar chat"
            variant="ghost"
            size="xs"
            color="text.dim"
            _hover={{ color: "danger" }}
            borderRadius="md"
            onClick={onClear}
          >
            ✕
          </IconButton>
        </Flex>

        {/* online indicator */}
        <Flex align="center" gap={2} px={6} pb={5} w="100%">
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="green.dot"
            boxShadow="dot-glow"
            animation="pulseDot 2.5s ease-in-out infinite"
          />
          <Heading size="sm" color="text.primary" fontWeight="bold" fontSize="15px">
            Bot Quantum
          </Heading>
          <Text fontSize="xs" color="text.subtitle" ml={1}>
            Asesor de electromovilidad
          </Text>
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
              borderRadius="md"
              fontSize="14px"
              lineHeight="1.55"
              alignSelf={m.role === "user" ? "flex-end" : "flex-start"}
              bg={m.role === "user" ? "green.user" : "bg.bubble"}
              border={m.role === "user" ? "1px solid" : "none"}
              borderColor={m.role === "user" ? "green.border" : "transparent"}
              color={m.role === "user" ? "green.primary" : "text.primary"}
              whiteSpace="pre-wrap"
              wordBreak="break-word"
            >
              {m.content}
            </Box>
          ))}
          <div ref={bottomRef} />
        </VStack>

        {/* input */}
        <Flex
          align="flex-end"
          gap={2.5}
          px={5}
          py={4}
          w="100%"
        >
          <Textarea
            flex={1}
            rows={2}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu consulta..."
            bg="transparent"
            border="1.5px solid"
            borderColor="green.glow"
            color="text.primary"
            fontSize="sm"
            borderRadius="md"
            _focus={{ borderColor: "green.dot", boxShadow: "0 0 8px rgba(0, 255, 136, 0.2)" }}
            _placeholder={{ color: "text.dim" }}
            resize="none"
          />
          <Button
            bg="green.button"
            color="bg.root"
            w="42px"
            h="42px"
            fontSize="md"
            borderRadius="md"
            fontWeight="bold"
            _hover={{ boxShadow: "btn-glow" }}
            _disabled={{ opacity: 0.25, cursor: "not-allowed" }}
            onClick={onSend}
            disabled={!input.trim()}
          >
            ▶
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
