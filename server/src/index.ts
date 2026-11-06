import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const allowedOrigin = process.env.ROXY_WEB_ORIGIN ?? "http://localhost:5173";
const apiBase = (process.env.AI_BASE_URL ?? "http://127.0.0.1:11434/v1").replace(/\/$/, "");
const localHost = ["localhost", "127.0.0.1", "::1"].includes(new URL(apiBase).hostname);

app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "64kb" }));

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(8000),
});
const chatSchema = z.object({ messages: z.array(messageSchema).min(1).max(20) });

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    assistant: "Roxy",
    provider: localHost ? "local" : "cloud",
    aiConfigured: Boolean(process.env.AI_MODEL && (localHost || process.env.AI_API_KEY)),
  });
});

app.post("/api/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Envie mensagens válidas para conversar com a Roxy." });
    return;
  }

  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!model || (!localHost && !apiKey)) {
    res.status(503).json({ error: "Configure o modelo e a autenticação do provedor no servidor." });
    return;
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const upstream = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Você é Roxy, uma assistente virtual prestativa, acolhedora e honesta. Responda em português brasileiro. Não diga que executou ações no computador ou salvou memórias se isso não aconteceu. Neste estágio, você não tem ferramentas do sistema.",
          },
          ...parsed.data.messages,
        ],
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(90000),
    });

    if (!upstream.ok) {
      console.error("AI provider returned status", upstream.status);
      res.status(502).json({ error: "O provedor de IA não respondeu corretamente. Verifique se o Ollama está ativo." });
      return;
    }

    const payload = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer = payload.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      res.status(502).json({ error: "A IA retornou uma resposta vazia." });
      return;
    }
    res.json({ reply: answer.trim() });
  } catch (error) {
    console.error("Chat request failed:", error instanceof Error ? error.message : "unknown error");
    res.status(504).json({ error: "Não consegui alcançar o provedor. Confira se o Ollama está rodando." });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Roxy API listening at http://127.0.0.1:${port}`);
});
