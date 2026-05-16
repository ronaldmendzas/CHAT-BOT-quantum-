"use client";

import { createSystem, defaultConfig, ChakraProvider } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
  theme: {
    keyframes: {
      pulseDot: {
        "0%, 100%": { boxShadow: "0 0 8px rgba(47, 182, 118, 0.5)" },
        "50%": { boxShadow: "0 0 18px rgba(47, 182, 118, 0.85)" },
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
