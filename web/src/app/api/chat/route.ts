/* ===== Chat API — Groq LLM with rule-based fallback ===== */

import { NextRequest, NextResponse } from "next/server";
import { chatWithLlm, getSystemPrompt } from "@/lib/llm";
import { processMessage } from "@/lib/conversation";
import type { ConversationContext } from "@/lib/types";
import { readJsonFile } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      context,
      history,
    }: {
      message: string;
      context: ConversationContext;
      history: { role: "user" | "assistant"; content: string }[];
    } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Load products for system prompt
    let products: any[] = [];
    try {
      products = await readJsonFile<any[]>("products.json");
    } catch {
      // ignore
    }

    const productsJson = JSON.stringify(
      products.map((p) => ({
        nombre: p.nombre,
        categoria: p.categoria,
        precio: p.precio,
        descripcion: p.descripcion_corta,
        autonomia: p.especificaciones?.["Autonomía"] || "",
      })),
      null,
      2
    );

    // Try Groq first
    const messages = [
      { role: "system" as const, content: getSystemPrompt(productsJson) },
      ...history.slice(-8).map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    const llmResult = await chatWithLlm(messages, {
      temperature: 0.7,
      maxTokens: 400,
    });

    if (!llmResult.error && llmResult.reply) {
      return NextResponse.json({
        reply: llmResult.reply,
        source: "groq",
        context: { step: "UNKNOWN", filters: context.filters },
      });
    }

    // Fallback to rule-based engine
    const ruleResult = processMessage(message, context, products);
    return NextResponse.json({
      reply: ruleResult.reply,
      intent: ruleResult.intent,
      productId: ruleResult.productId,
      productIds: ruleResult.productIds,
      context: ruleResult.context,
      source: "rules",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
