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
      w="380px"
      minW="320px"
      flexShrink={0}
      bg="bg.primary"
      borderRight="1px solid"
      borderColor="border.neon"
      display="flex"
      flexDirection="column"
      h="100dvh"
    >
      {/* header */}
      <Flex
        align="center"
        justify="space-between"
        px={5}
        py={4}
        borderBottom="1px solid"
        borderColor="border.subtle"
      >
        <HStack gap={3}>
          <Image src="/logo.png" alt="Quantum" h="28px" w="auto" objectFit="contain" />
        </HStack>
        <IconButton
          aria-label="Limpiar chat"
          variant="ghost"
          size="sm"
          color="text.dim"
          _hover={{ color: "danger", bg: "rgba(255,77,106,0.1)" }}
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
        px={4}
        py={4}
        gap={3}
        align="stretch"
      >
        {messages.map((m, i) => (
          <Box
            key={i}
            maxW="88%"
            px={4}
            py={3}
            borderRadius="lg"
            fontSize="sm"
            lineHeight="tall"
            alignSelf={m.role === "user" ? "flex-end" : "flex-start"}
            bg={m.role === "user" ? "neon-user" : "bg.card"}
            border="1px solid"
            borderColor={m.role === "user" ? "neon-border" : "border.neon"}
            color={m.role === "user" ? "neon" : "text.primary"}
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            _hover={{
              boxShadow: m.role === "user"
                ? "0 0 12px rgba(0, 255, 170, 0.15)"
                : "0 0 12px rgba(0, 255, 170, 0.1)",
            }}
            transition="box-shadow 0.2s"
          >
            {m.content}
          </Box>
        ))}
        <div ref={bottomRef} />
      </VStack>

      {/* input */}
      <Flex
        align="flex-end"
        gap={2}
        px={4}
        py={3}
        borderTop="1px solid"
        borderColor="border.subtle"
      >
        <Textarea
          flex={1}
          rows={2}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe tu consulta..."
          bg="bg.raised"
          borderColor="border.subtle"
          color="text.primary"
          fontSize="sm"
          borderRadius="lg"
          _focus={{ borderColor: "neon", boxShadow: "neon-sm" }}
          _placeholder={{ color: "text.dim" }}
          resize="none"
        />
        <Button
          bg="neon"
          color="bg.primary"
          w="44px"
          h="44px"
          fontSize="lg"
          borderRadius="lg"
          fontWeight="bold"
          _hover={{ boxShadow: "neon-md", transform: "scale(1.05)" }}
          _active={{ transform: "scale(0.95)" }}
          _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
          transition="all 0.15s"
          onClick={onSend}
          disabled={!input.trim()}
        >
          ➤
        </Button>
      </Flex>
    </Box>
  );
}
