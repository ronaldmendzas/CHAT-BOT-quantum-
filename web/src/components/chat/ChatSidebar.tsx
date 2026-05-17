"use client";

import type { Conversation } from "@/hooks/useConversations";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

type Props = {
  conversations: Conversation[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: string) => void;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Ayer";
  if (days < 7) return d.toLocaleDateString("es-BO", { weekday: "short" });
  return d.toLocaleDateString("es-BO", { day: "numeric", month: "short" });
}

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: Props) {
  return (
    <VStack
      bg="#080f0a"
      borderRight="1px solid rgba(0, 230, 180, 0.05)"
      w="260px"
      h="100%"
      py={4}
      px={3}
      gap={3}
      align="stretch"
      flexShrink={0}
      display={{ base: "none", md: "flex" }}
    >
      {/* Header / New Chat */}
      <Button
        variant="outline"
        borderColor="rgba(0, 230, 180, 0.12)"
        color="white"
        bg="transparent"
        _hover={{ bg: "rgba(0, 230, 180, 0.06)", borderColor: "rgba(0, 230, 180, 0.20)" }}
        _active={{ bg: "rgba(0, 230, 180, 0.10)" }}
        borderRadius="10px"
        py={2.5}
        h="auto"
        justifyContent="flex-start"
        gap={2}
        fontSize="sm"
        fontWeight="medium"
        onClick={onNewConversation}
        transition="all 0.2s"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nuevo chat
      </Button>

      {/* Conversations list */}
      <Stack gap={1} flex={1} overflowY="auto" overflowX="hidden" py={1}>
        {conversations.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={8} gap={2} opacity={0.5}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a9e8a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <Text fontSize="xs" color="#5d705d" textAlign="center">
              No hay conversaciones aún
            </Text>
          </Flex>
        ) : (
          conversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            return (
              <Flex
                key={conv.id}
                align="center"
                gap={2}
                px={3}
                py={2.5}
                borderRadius="10px"
                cursor="pointer"
                transition="all 0.15s ease"
                bg={isActive ? "rgba(0, 230, 180, 0.08)" : "transparent"}
                border={isActive ? "1px solid rgba(0, 230, 180, 0.12)" : "1px solid transparent"}
                _hover={!isActive ? { bg: "rgba(0, 230, 180, 0.04)" } : undefined}
                onClick={() => onSelectConversation(conv.id)}
                position="relative"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#0e5c48" : "#5d705d"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <Box flex={1} minW={0}>
                  <Text
                    fontSize="13px"
                    fontWeight={isActive ? "semibold" : "normal"}
                    color={isActive ? "white" : "#8a9e8a"}
                    truncate
                    lineHeight="1.4"
                  >
                    {conv.title}
                  </Text>
                  <Text fontSize="10px" color="#5d705d" mt="2px">
                    {formatDate(conv.updated_at || conv.created_at)}
                  </Text>
                </Box>
                <IconButton
                  aria-label="Eliminar conversación"
                  variant="ghost"
                  size="2xs"
                  color="#5d705d"
                  _hover={{ color: "#ff4d6a", bg: "rgba(255, 77, 106, 0.06)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation?.(conv.id);
                  }}
                  flexShrink={0}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </IconButton>
              </Flex>
            );
          })
        )}
      </Stack>

      {/* Footer info */}
      <Box pt={2} borderTop="1px solid rgba(0, 230, 180, 0.05)">
        <Text fontSize="10px" color="#3d4d3d" textAlign="center">
          Quantum Guide v2.0
        </Text>
      </Box>
    </VStack>
  );
}
