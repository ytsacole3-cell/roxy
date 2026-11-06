import { useEffect, useRef, useState } from 'react';
import { Heart, Mic, Send, Sparkles, Volume2, Phone, Menu, Plus, MessageCircle, Settings2 } from 'lucide-react';

type Message = { id: number; from: 'roxy' | 'you'; text: string };
type ApiMessage = { role: 'user' | 'assistant'; content: string };
declare global { interface Window { SpeechRecognition?: any; webkitSpeechRecognition?: any } }

const welcome: Message = { id: 1, from: 'roxy', text: 'Oii! Eu sou a Roxy 💗 Meu cérebro está conectado ao modelo de IA configurado no seu computador. Pode conversar comigo!' };
const API_URL = 'http://127.0.0.1:8787';

export default function App() {
 const [messages, setMessages] = useState<Message[]>([welcome]);
 const [draft, setDraft] = useState('');
 const [listening, setListening] = useState(false);
 const [speaking, setSpeaking] = useState(false);
 const [mood, setMood] = useState('Preparando minha conexão...');
 const [apiOnline, setApiOnline] = useState(false);
 const [sending, setSending] = useState(false);
 const [menuOpen, setMenuOpen] = useState(false);
 const recognition = useRef<any>(null);
 const bottom = useRef<HTMLDivElement>(null);

 useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);
 useEffect(() => {
   let active = true;
   fetch(API_URL + '/api/health').then(r => { if (!r.ok) throw new Error('offline'); return r.json(); })
     .then(data => { if (active) { setApiOnline(true); setMood(data.aiConfigured ? 'Cérebro local conectado' : 'Servidor conectado · configure o modelo'); } })
     .catch(() => { if (active) { setApiOnline(false); setMood('Aguardando o servidor local da Roxy'); } });
   return () => { active = false; };
 }, []);

 function speak(text: string) {
   if (!('speechSynthesis' in window)) { setMood('Voz indisponível neste navegador'); return; }
   window.speechSynthesis.cancel();
   const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-BR'; u.rate = 1; u.pitch = 1.12;
   u.onstart = () => setSpeaking(true); u.onend = () => setSpeaking(false);
   window.speechSynthesis.speak(u);
 }

 async function send(value = draft) {
   const clean = value.trim();
   if (!clean || sending) return;
   const userMessage: Message = { id: Date.now(), from: 'you', text: clean };
   const history = [...messages, userMessage];
   setMessages(history); setDraft(''); setSending(true); setMood('Pensando com meu cérebro de IA...');
   try {
     const payload: ApiMessage[] = history.filter(m => m.id !== 1 || m.from !== 'roxy').slice(-20).map(m => ({
       role: m.from === 'you' ? 'user' : 'assistant', content: m.text
     }));
     const response = await fetch(API_URL + '/api/chat', {
       method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: payload })
     });
     const data = await response.json();
     if (!response.ok) throw new Error(data.error || 'Não consegui conversar com o modelo.');
     const answer = String(data.reply || '').trim();
     if (!answer) throw new Error('O modelo não retornou uma resposta.');
     setMessages(prev => [...prev, { id: Date.now() + 1, from: 'roxy', text: answer }]);
     setMood('Conversando com você');
   } catch (error) {
     const reason = error instanceof Error ? error.message : 'Erro desconhecido';
     setMessages(prev => [...prev, { id: Date.now() + 1, from: 'roxy', text: 'Não consegui alcançar meu cérebro de IA agora. ' + reason + ' Confira se o Ollama, o modelo e o servidor da Roxy estão rodando.' }]);
     setMood('Conexão com a IA precisa de atenção');
   } finally { setSending(false); }
 }

 function toggleMic() {
   if (listening) { recognition.current?.stop(); setListening(false); return; }
   const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
   if (!SR) { setMood('Reconhecimento de voz não suportado neste navegador'); return; }
   const r = new SR(); recognition.current = r; r.lang = 'pt-BR'; r.interimResults = false; r.continuous = false;
   r.onresult = (e: any) => send(e.results[0][0].transcript);
   r.onerror = () => { setListening(false); setMood('Não consegui ouvir. Tente novamente.'); };
   r.onend = () => setListening(false); r.start(); setListening(true); setMood('Estou te ouvindo...');
 }

 return <main className="app-shell">
 <aside className={'sidebar ' + (menuOpen ? 'open' : '')}><div className="brand"><div className="brand-icon"><Heart fill="currentColor" size={20}/></div><span>roxy<span className="brand-ai">.ai</span></span></div><button className="new-chat" onClick={() => setMessages([welcome])}><Plus size={17}/> Nova conversa</button><div className="side-label">ESPAÇO DA ROXY</div><div className="side-item active"><MessageCircle size={17}/> Conversa</div><div className="side-item"><Heart size={17}/> Meu coração</div><div className="side-item"><Settings2 size={17}/> Personalidade</div><div className="sidebar-bottom"><div className="profile-avatar">Y</div><div><strong>Seu espaço</strong><small>Roxy está com você</small></div><Sparkles size={16} className="profile-spark"/></div></aside>
 <section className="main-panel"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu"><Menu/></button><div className="top-title"><span className="online-dot" style={{ background: apiOnline ? '#7ce4bd' : '#e6a35d' }}/>{apiOnline ? 'Cérebro conectado' : 'Roxy aguardando conexão'} <small>· IA local</small></div><button className="call-button" onClick={() => setMood('Chamadas reais serão adicionadas em uma próxima versão')}><Phone size={16}/> <span>Ligar</span></button></header>
 <div className="content"><section className="hero"><div className={'heart-orbit ' + (speaking || listening || sending ? 'active' : '')}><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="heart-glow"><Heart className="big-heart" fill="url(#heartGradient)" strokeWidth={1.1}/><svg width="0" height="0"><defs><linearGradient id="heartGradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ff8db8"/><stop offset="1" stopColor="#a78bfa"/></linearGradient></defs></svg></div><span className="spark spark-a">✦</span><span className="spark spark-b">♡</span><span className="spark spark-c">✧</span></div><div className="hero-kicker"><Sparkles size={13}/> SUA COMPANHEIRA VIRTUAL</div><h1>Oi, eu sou a <span>Roxy</span><Heart size={25} fill="#ff82b2" stroke="none"/></h1><p>Um coração digital, uma conversa de cada vez.</p><div className="mood-pill"><span className="mood-heart">♥</span>{mood}</div></section>
 <section className="chat-card"><div className="chat-heading"><div><strong><span className="tiny-online"/> Nossa conversa</strong><small>{apiOnline ? 'Conectada ao backend local' : 'Conversa aguardando o backend'}</small></div><button className="icon-button" aria-label="Opções"><Sparkles size={17}/></button></div><div className="messages">{messages.map(m => <div key={m.id} className={'message-row ' + (m.from === 'you' ? 'mine' : '')}>{m.from === 'roxy' && <div className="mini-avatar"><Heart fill="currentColor" size={13}/></div>}<div className="bubble"><div className="sender">{m.from === 'roxy' ? 'ROXY' : 'VOCÊ'}</div>{m.text}{m.from === 'roxy' && <button className="speak-message" onClick={() => speak(m.text)} aria-label="Ouvir mensagem"><Volume2 size={13}/></button>}</div></div>)}{sending && <div className="message-row"><div className="mini-avatar"><Heart fill="currentColor" size={13}/></div><div className="bubble"><div className="sender">ROXY</div>Pensando... ✨</div></div>}<div ref={bottom}/></div>
 <div className="composer"><div className="input-wrap"><input value={draft} disabled={sending} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Escreva uma mensagem para a Roxy..." aria-label="Mensagem"/><button className={'mic-button ' + (listening ? 'listening' : '')} onClick={toggleMic} aria-label="Falar"><Mic size={18}/></button></div><button className="send-button" disabled={sending || !draft.trim()} onClick={() => send()} aria-label="Enviar"><Send size={18}/></button></div><div className="chat-foot"><span><span className="lock-dot"/> Mensagens enviadas ao modelo local configurado</span><span>Feita com <Heart size={11} fill="currentColor"/> pela Roxy</span></div></section>
 <div className="quick-prompts"><span>COMECE POR AQUI</span><button onClick={() => send('Oi Roxy, tudo bem?')}>👋 Diga oi</button><button onClick={() => send('Me conte quem você é')}>✨ Quem é você?</button><button onClick={() => send('Quero conversar por voz')}>🎙️ Conversar por voz</button></div></div><footer className="footer-note">ROXY AI <span>·</span> CRESCENDO COM VOCÊ <Heart size={10} fill="currentColor"/></footer></section></main>;
}
