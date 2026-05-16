"use client";

import { createSystem, defaultConfig, ChakraProvider } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        "quantum.green": { value: "#2fb676" },
        "quantum.dark": { value: "#0e5c48" },
        "quantum.bot": { value: "#080f0a" },
        "quantum.card": { value: "#0c1610" },
        "quantum.bg": { value: "#020302" },
        "quantum.img": { value: "#060906" },
        "quantum.surface": { value: "#080c08" },
        "quantum.input": { value: "#050705" },
        "quantum.textMuted": { value: "#8a9e8a" },
        "quantum.label": { value: "#5d705d" },
        "quantum.error": { value: "#ff4d6a" },
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
