# Roxy AI ❤️

Roxy é uma assistente virtual em desenvolvimento, com interface React, conversa por texto, reconhecimento de voz e síntese de fala no navegador.

## Estado desta versão

- [x] Interface responsiva em React + TypeScript
- [x] Chat conectado ao backend local
- [x] Backend Node/Express com validação e timeout
- [x] Integração com Ollama local sem chave de API
- [x] Síntese e reconhecimento de voz do navegador, quando disponíveis
- [ ] Memória persistente com controles de privacidade
- [ ] Controle seguro do desktop Linux
- [ ] Voz em tempo real
- [ ] Aplicativo instalável/AppImage

O coração representa emoções simuladas; não significa que a IA tenha sentimentos ou consciência. O botão Ligar ainda não realiza chamadas.

## Requisitos

- Node.js 20 ou superior
- Ollama instalado e um modelo baixado (configuração inicial: `qwen2.5:1.5b`)

## Iniciar no CachyOS

**Terminal 1 — iniciar o modelo local:**

```bash
ollama run qwen2.5:1.5b
```

**Terminal 2 — iniciar a API:**

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

**Terminal 3 — iniciar a interface:**

```bash
npm install
npm run dev
```

Abra o endereço local mostrado pelo Vite (normalmente `http://localhost:5173`). O backend usa `http://127.0.0.1:8787`; o endpoint `/api/health` informa se o servidor está ativo e se o modelo foi configurado.

## Build da interface

```bash
npm run build
```

## Segurança e privacidade

- O modelo roda localmente via Ollama; não é necessária chave de API para essa configuração.
- Se usar um provedor online, mantenha a chave apenas no arquivo `.env` do servidor, nunca no frontend ou no Git.
- A API escuta somente em `127.0.0.1` e limita origem, tamanho e quantidade das mensagens.
- Nesta versão, a Roxy não executa comandos, não controla o desktop e não mantém memória persistente.
- Não exponha o backend diretamente à internet sem autenticação, TLS e controles adicionais.

## Próximas etapas

1. Testar integração no CachyOS.
2. Adicionar memória local com consentimento, exportação e exclusão.
3. Adicionar ferramentas do desktop com permissões e confirmação explícita.
4. Melhorar voz e acessibilidade.
5. Preparar e testar o pacote AppImage.
