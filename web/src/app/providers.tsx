"use client";

import { createSystem, defaultConfig, ChakraProvider } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
  theme: {
    keyframes: {
      pulseDot: {
        "0%, 100%": { boxShadow: "0 0 3px rgba(0, 230, 180, 0.03)" },
        "50%": { boxShadow: "0 0 5px rgba(0, 230, 180, 0.20)" },
      },
      rotate: {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
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
