"use client";

import { createSystem, defaultConfig, ChakraProvider } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        quantum: {
          green: { value: "quantum.green" },
          dark: { value: "quantum.dark" },
          bot: { value: "quantum.bot" },
          card: { value: "quantum.card" },
          bg: { value: "quantum.bg" },
          img: { value: "quantum.img" },
          surface: { value: "quantum.surface" },
          input: { value: "quantum.input" },
          textMuted: { value: "quantum.textMuted" },
          label: { value: "quantum.label" },
          error: { value: "quantum.error" },
        },
      },
    },
    keyframes: {
      pulseDot: {
        "0%, 100%": { boxShadow: "0 0 3px rgba(0, 230, 180, 0.03)" },
        "50%": { boxShadow: "0 0 5px rgba(0, 230, 180, 0.20)" },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  );
}
