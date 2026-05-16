"use client";

import { createSystem, defaultConfig, ChakraProvider } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        neon: { value: "#00ffaa" },
        "neon-dim": { value: "#00cc88" },
        "neon-glow": { value: "rgba(0, 255, 170, 0.35)" },
        "neon-soft": { value: "rgba(0, 255, 170, 0.08)" },
        "neon-border": { value: "rgba(0, 255, 170, 0.25)" },
        "neon-user": { value: "rgba(0, 255, 170, 0.12)" },
        surface: { value: "#0b0f14" },
        "surface-raised": { value: "#111820" },
        "surface-card": { value: "rgba(17, 24, 32, 0.85)" },
        "text-main": { value: "#e8ecf1" },
        "text-muted": { value: "#8b95a5" },
        "text-dim": { value: "#5a6577" },
        danger: { value: "#ff4d6a" },
        warning: { value: "#ffb84d" },
      },
      radii: {
        sm: { value: "8px" },
        md: { value: "14px" },
        lg: { value: "20px" },
        xl: { value: "28px" },
        full: { value: "9999px" },
      },
      shadows: {
        "neon-sm": { value: "0 0 8px rgba(0, 255, 170, 0.3)" },
        "neon-md": { value: "0 0 16px rgba(0, 255, 170, 0.25), 0 0 32px rgba(0, 255, 170, 0.1)" },
        "neon-lg": { value: "0 0 20px rgba(0, 255, 170, 0.35), 0 0 60px rgba(0, 255, 170, 0.15)" },
        "neon-dot": { value: "0 0 10px rgba(0, 255, 170, 0.7), 0 0 20px rgba(0, 255, 170, 0.4)" },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          primary: { value: "{colors.surface}" },
          raised: { value: "{colors.surface-raised}" },
          card: { value: "{colors.surface-card}" },
        },
        text: {
          primary: { value: "{colors.text-main}" },
          secondary: { value: "{colors.text-muted}" },
          dim: { value: "{colors.text-dim}" },
        },
        border: {
          subtle: { value: "rgba(255, 255, 255, 0.06)" },
          neon: { value: "{colors.neon-border}" },
        },
      },
    },
    keyframes: {
      pulseGlow: {
        "0%, 100%": { boxShadow: "0 0 10px rgba(0, 255, 170, 0.3)" },
        "50%": { boxShadow: "0 0 24px rgba(0, 255, 170, 0.55)" },
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
