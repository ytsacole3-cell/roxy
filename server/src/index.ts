import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const allowedOrigin = process.env.ROXY_WEB_ORIGIN ?? "http://localhost:5173";
const apiBase = (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\\/$/, "");

app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "64kb" }));

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(8000),
});
const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    assistant: "Roxy",
    aiConfigured: Boolean(process.env.AI_API_KEY && process.env.AI_MODEL),
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
  if (!apiKey || !model) {
    res.status(503).json({ error: "O cérebro de IA ainda não foi configurado no servidor." });
    return;
  }

  try {
    const upstream = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "Você é Roxy, uma assistente virtual prestativa, acolhedora e honesta. Responda em português brasileiro por padrão. Não afirme que executou ações no computador, acessou arquivos ou salvou memórias se isso não aconteceu. Você não tem acesso a ferramentas do sistema neste estágio.",
          },
          ...parsed.data.messages,
        ],
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!upstream.ok) {
      console.error("AI provider returned status", upstream.status);
      res.status(502).json({ error: "O serviço de IA não respondeu corretamente. Tente novamente." });
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
    res.status(504).json({ error: "A conversa demorou demais. Tente novamente." });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Roxy API listening at http://127.0.0.1:${port}`);
});
