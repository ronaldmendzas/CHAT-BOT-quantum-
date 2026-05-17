"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, ConversationContext, Intent } from "@/lib/types";
import { useDataset } from "@/hooks/useDataset";
import { useConversations } from "@/hooks/useConversations";
import ChatPanel from "@/components/ChatPanel";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ShowroomPanel from "@/components/ShowroomPanel";
import { Flex, Box, Image, Spinner, Text, Button, Avatar, Menu, HStack } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const WELCOME_CONTENT =
  "¡Hola! Soy Bot Quantum, tu asesor de electromovilidad. ¿Qué tipo de vehículo te interesa? Auto, moto, bici, camión, bus o accesorio.";

const INITIAL_CONTEXT: ConversationContext = {
  step: "WELCOME",
  filters: {},
};

function generateTitle(text: string, intent?: string): string {
  const lower = text.toLowerCase().trim();

  const products: Record<string, string> = {
    "nexus plus": "Nexus Plus",
    nexus: "Nexus",
    trooper: "Trooper",
    urban: "Urban",
    flashride: "FlashRide",
    flash: "FlashRide",
    colibri: "Colibrí",
    colibrí: "Colibrí",
    equte: "Kaiyi Equte",
    "kaiyi equte": "Kaiyi Equte",
    "ion pro": "Ion Pro",
    ion: "Ion",
    a5: "A5",
    ara: "Ara",
    starto: "Starto",
    "luna pro": "Luna Pro",
    "ts street hunter": "TS Street Hunter",
    "street hunter": "TS Street Hunter",
    "tc wanderer": "TC Wanderer",
    wanderer: "TC Wanderer",
    tc: "TC",
    montañero: "E4 Montañero",
    "e4 montañero": "E4 Montañero",
    luna: "Luna",
  };

  for (const [key, title] of Object.entries(products)) {
    if (lower.includes(key)) return title;
  }

  if (lower.includes("test drive") || lower.includes("prueba") || lower.includes("probar") || lower.includes("agendar")) {
    return "Test Drive";
  }
  if (lower.includes("sucursal") || lower.includes("tienda") || lower.includes("donde") || lower.includes("ubicación")) {
    return "Sucursales";
  }
  if (lower.includes("modelo") || lower.includes("catálogo") || lower.includes("catalogo") || lower.includes("vehículo") || lower.includes("vehiculo") || lower.includes("auto") || lower.includes("moto") || lower.includes("bici")) {
    return "Catálogo";
  }
  if (lower.includes("precio") || lower.includes("cuánto") || lower.includes("cuanto") || lower.includes("costo")) {
    return "Precios";
  }
  if (lower.includes("stock") || lower.includes("disponible") || lower.includes("hay")) {
    return "Disponibilidad";
  }
  if (lower.includes("hola") || lower.includes("buenas") || lower.includes("saludos")) {
    return "Bienvenida";
  }

  if (intent === "TEST_DRIVE") return "Test Drive";
  if (intent === "SUCURSALES") return "Sucursales";
  if (intent === "VEHICLE") return "Vehículo";

  const words = text.trim().split(/\s+/).slice(0, 4).join(" ");
  return words.length > 30 ? words.slice(0, 30) + "..." : words || "Nueva conversación";
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<ConversationContext>(INITIAL_CONTEXT);
  const [intent, setIntent] = useState<Intent>("WELCOME");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [resultProductIds, setResultProductIds] = useState<string[] | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showShowroom, setShowShowroom] = useState(false);
  const { data: dataset, loading, error } = useDataset();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const isLoggedIn = !!user;

  const {
    conversations,
    activeConversationId,
    messages: dbMessages,
    loadConversations,
    loadMessages,
    createConversation,
    saveMessage,
    updateConversationTitle,
    deleteConversation,
    ensureActiveConversation,
    setMessages: setDbMessages,
    setActiveConversationId,
    reset,
  } = useConversations(user?.id || null);

  // Set welcome message only on client mount (avoid hydration mismatch)
  useEffect(() => {
    setMounted(true);
    setMessages([{ role: "assistant", content: WELCOME_CONTENT, timestamp: Date.now() }]);
  }, []);

  // Sync DB messages to local state when conversation changes
  useEffect(() => {
    if (isLoggedIn && activeConversationId && dbMessages.length > 0) {
      setMessages(dbMessages);
    }
  }, [isLoggedIn, activeConversationId, dbMessages]);

  // Load conversations when user logs in
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      console.log("[page.tsx] Loading conversations for user:", user.id);
      loadConversations();
    }
  }, [isLoggedIn, user?.id]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !dataset) return;
    setInput("");

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    let currentConvId = activeConversationId;

    // If logged in, ensure we have a conversation to save to
    if (isLoggedIn) {
      if (!currentConvId) {
        currentConvId = await ensureActiveConversation();
      }
      if (currentConvId) {
        await saveMessage(currentConvId, userMsg);
        const conv = conversations.find((c) => c.id === currentConvId);
        if (conv && conv.title === "Nueva conversación") {
          await updateConversationTitle(currentConvId, generateTitle(text));
        }
      }
    }

    await new Promise((r) => setTimeout(r, 800));

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context: conversation, history }),
      });

      if (!res.ok) throw new Error("API error");

      const result = await res.json();

      const botMsg: ChatMessage = {
        role: "assistant",
        content: result.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (isLoggedIn && currentConvId) {
        await saveMessage(currentConvId, botMsg, result.intent);
      }

      if (result.context) setConversation(result.context);
      if (result.intent) setIntent(result.intent);
      if (result.productId) {
        setSelectedProductId(result.productId);
        setResultProductIds(undefined);
      } else if (result.productIds) {
        setResultProductIds(result.productIds);
        setSelectedProductId(undefined);
      } else if (result.intent !== "STOCK") {
        setSelectedProductId(undefined);
        setResultProductIds(undefined);
      }
    } catch {
      const botMsg: ChatMessage = {
        role: "assistant",
        content: "Lo siento, tuve un problema consultando la información. Intenta de nuevo.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (isLoggedIn && currentConvId) {
        await saveMessage(currentConvId, botMsg);
      }
    } finally {
      setIsTyping(false);
    }
  }, [input, dataset, conversation, messages, isLoggedIn, activeConversationId, conversations, ensureActiveConversation]);

  const handleClear = useCallback(async () => {
    setMessages([{ role: "assistant", content: WELCOME_CONTENT, timestamp: Date.now() }]);
    setConversation(INITIAL_CONTEXT);
    setIntent("WELCOME");
    setSelectedProductId(undefined);
    setResultProductIds(undefined);

    if (isLoggedIn) {
      await loadConversations();
      await createConversation("Nueva conversación");
      await loadConversations();
    } else {
      await createConversation("Nueva conversación");
    }
  }, [createConversation, isLoggedIn, loadConversations]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteConversation(id);
    if (isLoggedIn) {
      await loadConversations();
    }
  }, [deleteConversation, isLoggedIn, loadConversations]);

  const handleSelectProduct = useCallback((id: string) => {
    setSelectedProductId(id);
    setIntent("VEHICLE");
    setResultProductIds(undefined);
  }, []);

  const handleTestDrive = useCallback(
    (data: { nombre: string; celular: string; ciudad: string; producto: string }) => {
      const botMsg: ChatMessage = {
        role: "assistant",
        content: `¡Listo, ${data.nombre}! Registré tu solicitud de Test Drive para ${data.producto} en ${data.ciudad}. Un asesor te contactará por WhatsApp al ${data.celular}.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (isLoggedIn && activeConversationId) {
        saveMessage(activeConversationId, botMsg);
      }
    },
    [isLoggedIn, activeConversationId, saveMessage],
  );

  const handleSelectConversation = useCallback(
    async (id: string) => {
      if (isLoggedIn) {
        await loadMessages(id);
      } else {
        setActiveConversationId(id);
      }
    },
    [isLoggedIn, loadMessages, setActiveConversationId],
  );

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Flex h="100dvh" w="100vw" align="center" justify="center" bg="#020302">
        <Spinner size="xl" color="#0e5c48" />
      </Flex>
    );
  }

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
        left={{ base: "16px", md: "300px" }}
        zIndex={10}
        transition="left 0.3s ease"
        filter="drop-shadow(0 0 14px rgba(47, 182, 118, 0.25))"
      />

      {/* auth top-right */}
      <HStack
        position="absolute"
        top={{ base: "12px", md: "36px" }}
        right={{ base: "16px", md: "40px" }}
        zIndex={10}
        gap={2}
      >
        {/* Auth debug indicator */}
        <Text fontSize="10px" color="#5d705d" display={{ base: "none", md: "block" }}>
          {loading ? "auth:loading" : user ? `auth:${user.email}` : "auth:null"}
        </Text>

        {user ? (
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                color="white"
                _hover={{ bg: "rgba(0, 230, 180, 0.06)" }}
              >
                <HStack gap={2}>
                  <Avatar.Root size="2xs">
                    <Avatar.Fallback name={user.user_metadata?.full_name || user.email || "U"} />
                  </Avatar.Root>
                  <Text fontSize="sm">
                    {user.user_metadata?.username || user.user_metadata?.full_name || user.email}
                  </Text>
                </HStack>
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content bg="#0c1610" border="1px solid rgba(0, 230, 180, 0.08)" borderRadius="md" minW="180px">
                <Menu.Item
                  value="logout"
                  color="white"
                  _hover={{ bg: "rgba(0, 230, 180, 0.06)" }}
                  onClick={async () => {
                    await signOut();
                  }}
                >
                  Cerrar sesión
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        ) : (
          <Button
            size="sm"
            bg="rgba(0, 230, 180, 0.06)"
            color="white"
            border="1px solid rgba(0, 230, 180, 0.08)"
            _hover={{ bg: "rgba(0, 230, 180, 0.10)" }}
            onClick={() => router.push("/auth")}
          >
            Iniciar sesión
          </Button>
        )}
      </HStack>

      {/* Sidebar de conversaciones — hide conversations from other users when logged out */}
      <ChatSidebar
        conversations={isLoggedIn ? conversations : []}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleClear}
        onDeleteConversation={handleDelete}
      />

      {/* Mobile drawer overlay */}
      {showShowroom && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(0,0,0,0.6)"
          zIndex={40}
          onClick={() => setShowShowroom(false)}
          display={{ base: "block", md: "none" }}
        />
      )}

      {/* left half — chat (full width on mobile) */}
      <Flex
        w={{ base: "100%", md: isLoggedIn ? "calc(45% - 130px)" : "45%" }}
        h={{ base: "100%", md: "100%" }}
        align="center"
        justify="center"
        position="relative"
        zIndex={1}
        py={{ base: 0, md: 0 }}
      >
        <ChatPanel
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onClear={handleClear}
          isTyping={isTyping}
          user={user}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleClear}
        />
      </Flex>

      {/* right half — showroom */}
      <Flex
        w={{ base: showShowroom ? "100%" : "0%", md: isLoggedIn ? "calc(55% - 130px)" : "55%" }}
        h={{ base: "100%", md: "100%" }}
        align="center"
        justify="center"
        position={{ base: "fixed", md: "relative" }}
        top={0}
        right={0}
        zIndex={{ base: 50, md: 1 }}
        bg="#020302"
        transform={{ base: showShowroom ? "translateX(0)" : "translateX(100%)", md: "none" }}
        transition="transform 0.3s ease"
        overflow="hidden"
      >
        <ShowroomPanel
          intent={intent}
          products={dataset.products}
          stock={dataset.stock}
          sucursales={dataset.sucursales}
          testDrive={dataset.test_drive}
          media={dataset.media}
          selectedProductId={selectedProductId}
          productIds={resultProductIds}
          onSelectProduct={handleSelectProduct}
          onTestDriveSubmit={handleTestDrive}
          onClose={() => setShowShowroom(false)}
        />
      </Flex>

      {/* Floating button to toggle showroom on mobile */}
      <Button
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={60}
        w="56px"
        h="56px"
        borderRadius="full"
        bg="#0e5c48"
        color="white"
        boxShadow="0 4px 12px rgba(0,0,0,0.4)"
        _hover={{ bg: "#0d4a3a" }}
        onClick={() => setShowShowroom(!showShowroom)}
        display={{ base: "flex", md: "none" }}
        alignItems="center"
        justifyContent="center"
        p={0}
      >
        {showShowroom ? "✕" : "🚗"}
      </Button>
    </Flex>
  );
}
