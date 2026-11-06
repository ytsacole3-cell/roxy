# Roxy AI ❤️

Roxy é uma assistente virtual em desenvolvimento, com interface acolhedora, coração animado e conversa por texto e voz.

## Estado atual
- [x] Interface responsiva em React + TypeScript
- [x] Coração animado e personalidade visual
- [x] Chat demonstrativo com respostas locais
- [x] Síntese de voz do navegador, quando disponível
- [x] Reconhecimento de voz do navegador, quando disponível
- [ ] Conectar modelo de IA por backend seguro
- [ ] Memória persistente com controles de privacidade
- [ ] Chamadas de voz em tempo real
- [ ] Aplicativo instalável/PWA

**Importante:** as respostas atuais são demonstrativas e locais. O coração representa emoções simuladas; não significa que a IA tenha sentimentos ou consciência. O botão Ligar indica uma funcionalidade planejada; chamadas reais ainda não estão implementadas.

## Rodar localmente
Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Segurança
Nunca coloque chaves de API, tokens ou senhas no frontend ou no Git. A futura integração com IA será feita por backend, usando variáveis de ambiente e validação no servidor.

## Próximas etapas
1. Criar backend e endpoint de conversa.
2. Conectar o modelo de IA e definir a personalidade da Roxy.
3. Implementar memória com consentimento, exportação e exclusão.
4. Adicionar voz em tempo real.
5. Avaliar provedor de telefonia para chamadas reais.
