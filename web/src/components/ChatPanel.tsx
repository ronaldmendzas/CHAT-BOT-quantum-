"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import type { Conversation } from "@/hooks/useConversations";
import type { User } from "@supabase/supabase-js";
import {
  Box,
  Flex,
  Text,
  Heading,
  Textarea,
  Button,
  VStack,
  IconButton,
  Stack,
} from "@chakra-ui/react";

type Props = {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClear: () => void;
  isTyping?: boolean;
  user?: User | null;
  conversations?: Conversation[];
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onNewConversation?: () => void;
};

export default function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  onClear,
  isTyping,
  user,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
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
      bg="#0c1610"
      border="1px solid rgba(0, 230, 180, 0.05)"
      borderRadius="16px"
      boxShadow="0 0 3px rgba(0, 230, 180, 0.06), inset 0 0 40px rgba(0, 0, 0, 0.2)"
      w="100%"
      maxW={{ base: "100%", md: "480px" }}
      h={{ base: "100%", md: "75vh" }}
      overflow="hidden"
      gap={0}
    >
      {/* header */}
      <Flex align="center" justify="space-between" px={6} pt={6} pb={3} w="100%">
        <Flex align="center" gap={2.5}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="#0e5c48"
            boxShadow="0 0 4px rgba(0, 230, 180, 0.20)"
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
        </Flex>
        <Flex gap={1}>
          {user && (
            <>
              <Button
                size="xs"
                variant="ghost"
                color="#8a9e8a"
                _hover={{ color: "#0e5c48", bg: "rgba(0, 230, 180, 0.04)" }}
                onClick={onNewConversation}
                fontSize="12px"
                px={2}
                display={{ base: "flex", md: "none" }}
              >
                + Nuevo
              </Button>
              <Stack
                gap={0.5}
                display={{ base: "flex", md: "none" }}
                maxW="120px"
                overflowX="auto"
                direction="row"
              >
                {conversations.slice(0, 3).map((conv) => (
                  <Button
                    key={conv.id}
                    size="2xs"
                    variant="ghost"
                    color={activeConversationId === conv.id ? "white" : "#5d705d"}
                    bg={activeConversationId === conv.id ? "rgba(0, 230, 180, 0.06)" : "transparent"}
                    _hover={{ bg: "rgba(0, 230, 180, 0.04)" }}
                    px={1.5}
                    py={0.5}
                    h="auto"
                    fontSize="10px"
                    onClick={() => onSelectConversation?.(conv.id)}
                  >
                    {conv.title.length > 12 ? conv.title.slice(0, 12) + "..." : conv.title}
                  </Button>
                ))}
              </Stack>
            </>
          )}
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
            bg={m.role === "user" ? "#0e5c48" : "#080f0a"}
            border={m.role === "user" ? "1px solid rgba(0, 230, 180, 0.06)" : "none"}
            color={m.role === "user" ? "white" : "white"}
            whiteSpace="pre-wrap"
            wordBreak="break-word"
          >
            {m.content}
          </Box>
        ))}
        {isTyping && (
          <Flex
            alignSelf="flex-start"
            align="center"
            gap={2}
            px={4}
            py={2}
            borderRadius="12px"
            bg="#080f0a"
            fontSize="13px"
            color="#8a9e8a"
          >
            <Box
              w="6px"
              h="6px"
              borderRadius="full"
              bg="#0e5c48"
              animation="pulseDot 1.2s ease-in-out infinite"
            />
            <Text>Bot Quantum está escribiendo...</Text>
          </Flex>
        )}
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
          bg="rgba(0, 0, 0, 0.2)"
          border="1px solid rgba(0, 230, 180, 0.05)"
          color="white"
          fontSize="sm"
          borderRadius="8px"
          minH="42px"
          py={2.5}
          _focus={{ borderColor: "#0e5c48", boxShadow: "0 0 3px rgba(0, 230, 180, 0.05)" }}
          _placeholder={{ color: "#5d705d" }}
          resize="none"
          overflow="hidden"
        />
        <Button
          bg="#0e5c48"
          color="white"
          w="42px"
          h="42px"
          minW="42px"
          borderRadius="8px"
          fontWeight="bold"
          p={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          lineHeight={1}
          _hover={{ boxShadow: "0 0 6px rgba(0, 230, 180, 0.03)" }}
          _disabled={{ opacity: 0.25, cursor: "not-allowed" }}
          onClick={onSend}
          disabled={!input.trim()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 2L11 13"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </Flex>
    </VStack>
  );
}
