"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { createClient } from "@/lib/supabase/browserClient";

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type DbMessage = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  created_at: string;
};

const LOCAL_STORAGE_KEY = "quantum_chat_anonymous";

function loadLocalConversations(): { conversations: Conversation[]; messages: ChatMessage[]; activeId: string | null } {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        conversations: parsed.conversations || [],
        messages: parsed.messages || [],
        activeId: parsed.activeId || null,
      };
    }
  } catch {
    // ignore
  }
  return { conversations: [], messages: [], activeId: null };
}

function saveLocalConversations(conversations: Conversation[], messages: ChatMessage[], activeId: string | null) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ conversations, messages, activeId }));
  } catch {
    // ignore
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function useConversations(userId: string | null) {
  const isLoggedIn = !!userId;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Track current user to avoid race conditions from old requests
  const currentUserRef = useRef<string | null>(userId);
  useEffect(() => {
    currentUserRef.current = userId;
  }, [userId]);

  const reset = useCallback(() => {
    console.log("[useConversations] RESET called");
    setConversations([]);
    setMessages([]);
    setActiveConversationId(null);
  }, []);

  // Track if user was EVER logged in during this session
  // If they were, we NEVER save to localStorage (privacy)
  const wasLoggedInRef = useRef(false);
  useEffect(() => {
    if (isLoggedIn) {
      wasLoggedInRef.current = true;
    }
  }, [isLoggedIn]);

  // When user changes, clear everything immediately
  useEffect(() => {
    console.log("[useConversations] userId changed to:", userId);
    reset();
    wasLoggedInRef.current = false;

    if (!isLoggedIn) {
      // Load from localStorage ONLY for anonymous users
      const local = loadLocalConversations();
      setConversations(local.conversations);
      setMessages(local.messages);
      setActiveConversationId(local.activeId);
    }
  }, [userId, isLoggedIn, reset]);

  // Save to localStorage ONLY when anonymous user changes data
  // AND the user was never logged in during this session
  useEffect(() => {
    if (!isLoggedIn && !wasLoggedInRef.current) {
      saveLocalConversations(conversations, messages, activeConversationId);
    }
  }, [conversations, messages, activeConversationId, isLoggedIn]);

  async function loadConversations() {
    if (!isLoggedIn) return;
    const requestUserId = currentUserRef.current;
    console.log("[useConversations] loadConversations starting for user:", requestUserId);
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/conversations", { headers });
      if (res.ok) {
        const { data } = await res.json();
        // CRITICAL: ignore result if user changed while request was in flight
        if (currentUserRef.current !== requestUserId) {
          console.log("[useConversations] IGNORING stale result for user:", requestUserId, "current:", currentUserRef.current);
          return;
        }
        console.log("[useConversations] Loaded", data?.length || 0, "conversations for user", requestUserId);
        setConversations(data || []);
      } else {
        console.error("Failed to load conversations", res.status);
      }
    } catch (e) {
      console.error("Error loading conversations", e);
    }
    setLoading(false);
  }

  async function loadMessages(conversationId: string) {
    if (!isLoggedIn) return;
    const requestUserId = currentUserRef.current;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/messages?conversation_id=${conversationId}`, { headers });
      if (res.ok) {
        const { data } = await res.json();
        if (currentUserRef.current !== requestUserId) {
          console.log("[useConversations] IGNORING stale messages for user:", requestUserId);
          return;
        }
        const mapped: ChatMessage[] = (data || []).map((m: DbMessage) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).getTime(),
        }));
        setMessages(mapped);
        setActiveConversationId(conversationId);
      }
    } catch (e) {
      console.error("Error loading messages", e);
    }
    setLoading(false);
  }

  async function createConversation(title?: string): Promise<Conversation | null> {
    if (!isLoggedIn) {
      const newConv: Conversation = {
        id: `local-${Date.now()}`,
        user_id: "anonymous",
        title: title || "Nueva conversación",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
      return newConv;
    }

    const requestUserId = currentUserRef.current;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers,
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        const { data } = await res.json();
        if (currentUserRef.current !== requestUserId) {
          console.log("[useConversations] IGNORING stale create for user:", requestUserId);
          return null;
        }
        setConversations((prev) => [data, ...prev]);
        setActiveConversationId(data.id);
        setMessages([]);
        return data;
      } else {
        console.error("Failed to create conversation", res.status);
      }
    } catch (e) {
      console.error("Error creating conversation", e);
    }
    return null;
  }

  async function ensureActiveConversation(): Promise<string | null> {
    if (activeConversationId) return activeConversationId;
    if (conversations.length > 0) {
      const firstId = conversations[0].id;
      setActiveConversationId(firstId);
      if (isLoggedIn) {
        await loadMessages(firstId);
      }
      return firstId;
    }
    const newConv = await createConversation("Nueva conversación");
    return newConv?.id || null;
  }

  async function saveMessage(conversationId: string, message: ChatMessage, intent?: string) {
    if (!isLoggedIn) return;
    try {
      const headers = await getAuthHeaders();
      await fetch("/api/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          intent,
        }),
      });
    } catch (e) {
      console.error("Error saving message", e);
    }
  }

  async function updateConversationTitle(conversationId: string, title: string) {
    if (!isLoggedIn) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, title, updated_at: new Date().toISOString() } : c))
      );
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        const { data } = await res.json();
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, ...data } : c))
        );
      }
    } catch (e) {
      console.error("Error updating title", e);
    }
  }

  async function deleteConversation(id: string) {
    if (!isLoggedIn) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE", headers });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
      } else {
        console.error("Failed to delete conversation", res.status);
      }
    } catch (e) {
      console.error("Error deleting conversation", e);
    }
  }

  return {
    conversations,
    activeConversationId,
    messages,
    loading,
    loadConversations,
    loadMessages,
    createConversation,
    ensureActiveConversation,
    saveMessage,
    updateConversationTitle,
    deleteConversation,
    setMessages,
    setActiveConversationId,
    reset,
  };
}
