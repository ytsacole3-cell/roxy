# Roxy API

Backend inicial para conectar a interface da Roxy a um provedor de IA compatível com a API de chat completions.

## Requisitos

- Node.js 20 ou superior
- Uma chave de API de um provedor compatível

## Configuração

```bash
cd server
npm install
cp .env.example .env
```

Edite `.env` e configure `AI_API_KEY`, `AI_MODEL` e, se necessário, `AI_BASE_URL`. A chave fica somente no servidor; nunca a coloque no React ou em arquivos versionados.

## Executar

```bash
npm run dev
```

A API fica em `http://127.0.0.1:8787`. Verifique `GET /api/health` e envie `POST /api/chat` com JSON no formato:

```json
{
  "messages": [
    { "role": "user", "content": "Oi, Roxy!" }
  ]
}
```

## Limites de segurança desta primeira etapa

- CORS limitado à origem configurada em `ROXY_WEB_ORIGIN`.
- Corpo JSON limitado a 64 KB; até 20 mensagens e 8.000 caracteres por mensagem.
- A chave do provedor nunca é enviada ao navegador.
- Sem execução de comandos, acesso a arquivos ou memória persistente nesta etapa.
- A API escuta somente em `127.0.0.1`; não a exponha diretamente à internet sem autenticação, TLS e controles adicionais.
