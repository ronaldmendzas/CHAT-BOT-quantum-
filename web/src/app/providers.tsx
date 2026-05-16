"use client";

import { createSystem, defaultConfig, ChakraProvider } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        "bg-root": { value: "#080d08" },
        "bg-card": { value: "#0f1a0f" },
        "bg-bubble": { value: "#162416" },
        "green-primary": { value: "#00e676" },
        "green-button": { value: "#00c853" },
        "green-dot": { value: "#00ff88" },
        "green-glow": { value: "rgba(0, 230, 118, 0.18)" },
        "green-border": { value: "rgba(0, 230, 118, 0.22)" },
        "green-soft": { value: "rgba(0, 230, 118, 0.06)" },
        "green-user": { value: "rgba(0, 230, 118, 0.08)" },
        "text-main": { value: "#ffffff" },
        "text-subtitle": { value: "#8a9e8a" },
        "text-dim": { value: "#5d705d" },
        danger: { value: "#ff4d6a" },
        warning: { value: "#ffb84d" },
      },
      radii: {
        sm: { value: "8px" },
        md: { value: "12px" },
        lg: { value: "16px" },
        xl: { value: "48px" },
        full: { value: "9999px" },
      },
      shadows: {
        "card-shadow": { value: "0 0 30px rgba(0, 230, 118, 0.06), 0 0 60px rgba(0, 230, 118, 0.03)" },
        "dot-glow": { value: "0 0 10px rgba(0, 255, 136, 0.7), 0 0 20px rgba(0, 255, 136, 0.4)" },
        "btn-glow": { value: "0 0 18px rgba(0, 230, 118, 0.25)" },
        "card-hover": { value: "0 0 24px rgba(0, 230, 118, 0.12)" },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          root: { value: "{colors.bg-root}" },
          card: { value: "{colors.bg-card}" },
          bubble: { value: "{colors.bg-bubble}" },
        },
        green: {
          primary: { value: "{colors.green-primary}" },
          button: { value: "{colors.green-button}" },
          dot: { value: "{colors.green-dot}" },
          glow: { value: "{colors.green-glow}" },
          border: { value: "{colors.green-border}" },
          soft: { value: "{colors.green-soft}" },
          user: { value: "{colors.green-user}" },
        },
        text: {
          primary: { value: "{colors.text-main}" },
          subtitle: { value: "{colors.text-subtitle}" },
          dim: { value: "{colors.text-dim}" },
        },
      },
    },
    keyframes: {
      pulseDot: {
        "0%, 100%": { boxShadow: "0 0 8px rgba(0, 255, 136, 0.5)" },
        "50%": { boxShadow: "0 0 18px rgba(0, 255, 136, 0.85)" },
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
