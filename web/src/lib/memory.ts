import type { ChatMessage } from "./types";

const STORAGE_KEY = "quantum_chat_history";

export function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* quota exceeded — silently ignore for demo */
  }
}

export function clearMessages() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
