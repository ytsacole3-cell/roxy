# Roxy API

Backend local da Roxy com suporte ao Ollama e a provedores compatíveis com a API OpenAI Chat Completions.

## Requisitos

- Node.js 20 ou superior
- Ollama instalado e modelo baixado (padrão: `qwen2.5:1.5b`)

## Configuração local sem chave de API

Na raiz do repositório, inicie o modelo:

```bash
ollama run qwen2.5:1.5b
```

Em outro terminal:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

O arquivo de exemplo já aponta para o Ollama em `http://127.0.0.1:11434/v1`. Se necessário, altere `AI_MODEL` no arquivo `.env`. Não é preciso configurar `AI_API_KEY` para um provedor local.

## Provedor online opcional

Configure `AI_BASE_URL`, `AI_MODEL` e `AI_API_KEY` no arquivo `.env`. Nunca coloque a chave no frontend nem a versione no Git.

## API

- `GET /api/health`: estado do servidor e configuração do provedor.
- `POST /api/chat`: recebe `{ "messages": [{ "role": "user", "content": "Oi, Roxy!" }] }` e retorna `{ "reply": "..." }`.

## Segurança e limites

- CORS limitado à origem configurada em `ROXY_WEB_ORIGIN`.
- Corpo JSON limitado a 64 KB; até 20 mensagens e 8.000 caracteres por mensagem.
- Chaves de provedores online são mantidas no servidor.
- O backend escuta somente em `127.0.0.1`.
- Ainda não executa comandos, acessa arquivos ou mantém memória persistente.
- Não exponha o backend diretamente à internet sem autenticação, TLS e controles adicionais.
