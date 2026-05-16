"use client";

import { createSystem, defaultConfig, ChakraProvider } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
  theme: {
    keyframes: {
      pulseDot: {
        "0%, 100%": { boxShadow: "0 0 8px rgba(0, 230, 180, 0.65)" },
        "50%": { boxShadow: "0 0 18px rgba(0, 230, 180, 0.95)" },
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
