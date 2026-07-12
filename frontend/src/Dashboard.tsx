import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Send, ArrowLeft, Loader2, CheckCircle2,
  Wheat, Cpu, AlertCircle, RotateCcw, Copy,
  ChevronRight, Sprout, BarChart2, Landmark, Truck,
  Heart, MicOff, Volume2, Sparkles
} from 'lucide-react';
import { useAppStore, type WorkflowEvent } from './store';

/* ── Language config ── */
const LANGUAGES = [
  { code: 'Hindi', label: 'हिंदी', emoji: '🇮🇳' },
  { code: 'English', label: 'English', emoji: '🌐' },
  { code: 'Marathi', label: 'मराठी', emoji: '🌿' },
  { code: 'Telugu', label: 'తెలుగు', emoji: '🌾' },
];

/* ── Agent pipeline config ── */
const AGENT_STEPS = [
  { icon: <Sprout size={18} />, label: 'Chief Agronomist', hindi: 'कृषि विज्ञानी', thresholdEvents: 0, color: '#22c55e', glow: 'rgba(34,197,94,0.2)' },
  { icon: <BarChart2 size={18} />, label: 'Agricultural Economist', hindi: 'कृषि अर्थशास्त्री', thresholdEvents: 2, color: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
  { icon: <Landmark size={18} />, label: 'Policy Advisor', hindi: 'योजना सलाहकार', thresholdEvents: 4, color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
  { icon: <Truck size={18} />, label: 'Supply Chain', hindi: 'आपूर्ति श्रृंखला', thresholdEvents: 6, color: '#a855f7', glow: 'rgba(168,85,247,0.2)' },
  { icon: <Heart size={18} />, label: 'Krishi Mitra', hindi: 'कृषि मित्र', thresholdEvents: 8, color: '#f43f5e', glow: 'rgba(244,63,94,0.2)' },
];

/* ── Thought event component ── */
const ThoughtItem = ({ event, idx }: { event: WorkflowEvent; idx: number }) => {
  const isStatus = event.type === 'status';
  const isError = event.type === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.02 }}
      className="thought-item"
      style={isStatus ? { borderLeftColor: 'var(--c-amber-400)', background: 'rgba(251,191,36,0.04)' }
        : isError ? { borderLeftColor: '#f43f5e', background: 'rgba(244,63,94,0.04)' } : {}}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {isStatus && <Sparkles size={12} style={{ color: 'var(--c-amber-400)', flexShrink: 0 }} />}
        {isError && <AlertCircle size={12} style={{ color: '#f43f5e', flexShrink: 0 }} />}
        {!isStatus && !isError && <ChevronRight size={12} style={{ color: 'var(--c-green-500)', flexShrink: 0 }} />}
        {event.agent && (
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {event.agent}
          </span>
        )}
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p style={{ margin: 0, fontFamily: 'var(--font-sans)', color: isError ? '#f87171' : isStatus ? 'rgba(251,191,36,0.8)' : 'inherit' }}>
        {event.message}
      </p>
    </motion.div>
  );
};

/* ── Simple markdown-to-JSX renderer ── */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      nodes.push(<h1 key={i} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'white', marginTop: 24, marginBottom: 12, letterSpacing: '-0.02em' }}>{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      nodes.push(<h2 key={i} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--c-green-400)', marginTop: 28, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(34,197,94,0.15)' }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      nodes.push(<h3 key={i} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', marginTop: 20, marginBottom: 8 }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} style={{ listStyle: 'none', padding: 0, margin: '8px 0 16px' }}>
          {items.map((it, j) => (
            <li key={j} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '4px 0', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              <span style={{ color: 'var(--c-green-500)', fontSize: '0.8rem', flexShrink: 0 }}>▸</span>
              <span dangerouslySetInnerHTML={{ __html: it.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--c-green-400);font-weight:700">$1</strong>') }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} style={{ padding: '0 0 0 4px', margin: '8px 0 16px', listStyle: 'none' }}>
          {items.map((it, j) => (
            <li key={j} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '6px 0', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              <span style={{
                flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: 'var(--c-green-400)',
              }}>{j + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: it.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--c-green-400);font-weight:700">$1</strong>') }} />
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith('---')) {
      nodes.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '24px 0' }} />);
    } else if (line.trim() === '') {
      nodes.push(<div key={i} style={{ height: 8 }} />);
    } else {
      nodes.push(
        <p key={i} style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, margin: '4px 0' }}>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(255,255,255,0.85);font-weight:700">$1</strong>') }} />
        </p>
      );
    }
    i++;
  }
  return nodes;
}

/* ── Sample prompts ── */
const SAMPLE_PROMPTS = [
  { flag: '🌾', text: 'मेरे पास ५ एकड़ ज़मीन है महाराष्ट्र में। काली मिट्टी है। बजट ₹२०,०००। क्या बोएं?' },
  { flag: '🌱', text: 'I have 3 acres in Punjab, sandy soil, budget ₹15,000. What crop should I plant?' },
  { flag: '🌿', text: 'నా దగ్గర 2 ఎకరాల భూమి ఉంది ఆంధ్రప్రదేశ్ లో. నేను ఏమి పండించాలి?' },
];

/* ── Main component ── */
export default function Dashboard({ onBack }: { onBack: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const store = useAppStore();
  const thoughtsEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll thoughts */
  useEffect(() => {
    thoughtsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [store.events]);

  /* Auto-resize textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [prompt]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && store.status !== 'running') {
      store.startWorkflow(prompt, language);
    }
  }, [prompt, language, store]);

  const handleVoice = useCallback(() => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setPrompt(SAMPLE_PROMPTS[0].text);
        setIsListening(false);
      }, 2500);
    }
  }, [isListening]);

  const handleCopy = useCallback(() => {
    if (store.result) {
      navigator.clipboard.writeText(store.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [store.result]);

  const eventCount = store.events.length;

  /* ── Progress % ── */
  const progress = store.status === 'completed' ? 100
    : store.status === 'running' ? Math.min(95, (eventCount / 10) * 100)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-earth-900)', color: 'white', display: 'flex', flexDirection: 'column' }} className="grain-overlay">

      {/* ── Fixed orbs ── */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb orb-green animate-float" style={{ width: 500, height: 500, top: '-10%', right: '-10%', opacity: 0.4 }} />
        <div className="orb orb-amber animate-float-r" style={{ width: 300, height: 300, bottom: '5%', left: '-5%', opacity: 0.3 }} />
        <div className="bg-dots" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 26, 13, 0.85)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onBack}
            className="btn-ghost"
            style={{ padding: '8px 14px', gap: 6 }}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #16a34a, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} className="glow-green">
              <Wheat size={18} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem' }}>
              <span className="text-gradient-green">KisanFlow</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}> AI</span>
            </span>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <div className="amd-chip">
              <Cpu size={12} />
              <span>AMD MI300X</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {store.status === 'running' && (
          <div className="progress-bar" style={{ borderRadius: 0 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      {/* ── Main content ── */}
      <main style={{ position: 'relative', zIndex: 1, flex: 1, maxWidth: 1024, margin: '0 auto', width: '100%', padding: '32px 24px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── INPUT STATE ── */}
        <AnimatePresence mode="wait">
          {(store.status === 'idle' || store.status === 'failed') && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
            >
              {/* Error banner */}
              {store.status === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    marginBottom: 16, padding: '16px 20px', borderRadius: 12,
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: '#f87171',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9rem' }}>Something went wrong. Please check your API key and try again.</span>
                  <button className="btn-ghost" onClick={store.reset} style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '0.8rem', gap: 4 }}>
                    <RotateCcw size={14} /> Reset
                  </button>
                </motion.div>
              )}

              <div className="card-glass" style={{ padding: 'clamp(24px, 4vw, 48px)' }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', letterSpacing: '-0.03em', marginBottom: 8 }}>
                    <span className="text-gradient-green">नमस्ते! 🙏</span>
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.7 }}>
                    Tell us about your farm — soil type, land size, budget, and location. Our 5 AI agents will create your complete farming plan.
                  </p>
                </div>

                {/* Language selector */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                    Advisory Language
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        className={`lang-pill ${language === l.code ? 'active' : ''}`}
                        onClick={() => setLanguage(l.code)}
                        id={`lang-${l.code}`}
                      >
                        {l.emoji} {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="उदाहरण: मेरे पास ५ एकड़ ज़मीन है महाराष्ट्र में, काली मिट्टी है, बजट ₹२०,०००. मुझे क्या बोना चाहिए?&#10;&#10;(Example: I have 5 acres in Maharashtra, black soil, budget ₹20,000. What should I grow?)"
                      className="input-glass"
                      style={{ minHeight: 160, fontSize: '1.05rem', fontFamily: 'var(--font-devanagari)', paddingBottom: 56 }}
                      disabled={isListening}
                      id="farm-prompt-input"
                    />

                    {/* Voice + char count overlay */}
                    <div style={{
                      position: 'absolute', bottom: 14, right: 14, left: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
                        {prompt.length} chars
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isListening && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <div style={{ display: 'flex', gap: 3 }}>
                              {[1, 2, 3, 4].map(j => (
                                <div key={j} style={{
                                  width: 3, height: `${8 + j * 4}px`, borderRadius: 2,
                                  background: 'var(--c-green-400)',
                                  animation: `blink ${0.4 + j * 0.1}s ease-in-out infinite alternate`,
                                }} />
                              ))}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--c-green-400)', fontWeight: 600 }}>सुन रहे हैं...</span>
                          </motion.div>
                        )}
                        <motion.button
                          type="button"
                          onClick={handleVoice}
                          whileTap={{ scale: 0.92 }}
                          style={{
                            width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isListening
                              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                              : 'rgba(255,255,255,0.06)',
                            color: isListening ? 'white' : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.2s',
                            boxShadow: isListening ? '0 0 24px rgba(239,68,68,0.5)' : 'none',
                          }}
                        >
                          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    id="submit-workflow-btn"
                    className="btn-primary shine"
                    disabled={!prompt.trim() || (store.status as string) === 'running'}
                    whileTap={{ scale: 0.97 }}
                    style={{ width: '100%', fontSize: '1.1rem', padding: '18px' }}
                  >
                    <Send size={18} />
                    मेरी खेती की योजना बनाएं (Get My Plan)
                  </motion.button>
                </form>

                {/* Sample prompts */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Or try a sample
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {SAMPLE_PROMPTS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(s.text)}
                        style={{
                          textAlign: 'left', padding: '10px 16px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                          color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', cursor: 'pointer',
                          transition: 'all 0.2s', fontFamily: 'var(--font-devanagari)',
                        }}
                        onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(34,197,94,0.05)'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(34,197,94,0.15)'; (e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
                        onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; }}
                      >
                        {s.flag} {s.text.slice(0, 80)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── RUNNING STATE ── */}
          {store.status === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}
            >
              {/* Left: Agent pipeline */}
              <div className="card-glass" style={{ padding: 24, alignSelf: 'start', position: 'sticky', top: 80 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <div className="loading-ring" style={{ width: 24, height: 24, borderWidth: 2 }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Expert Agents Working</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {AGENT_STEPS.map((agent, i) => {
                    const done = eventCount > agent.thresholdEvents + 1;
                    const active = eventCount > agent.thresholdEvents && !done;
                    return (
                      <div
                        key={i}
                        className={`agent-step ${done ? 'done' : active ? 'active' : 'pending'}`}
                        style={done ? { borderColor: agent.color + '33' } : active ? { borderColor: agent.color + '26' } : {}}
                      >
                        {done ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                            <CheckCircle2 size={20} style={{ color: agent.color, flexShrink: 0 }} />
                          </motion.div>
                        ) : active ? (
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{ color: agent.color }}>{agent.icon}</div>
                            <div className="ping-ring" style={{ inset: -6, border: `1px solid ${agent.color}`, opacity: 0.5 }} />
                          </div>
                        ) : (
                          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: done || active ? 'white' : 'rgba(255,255,255,0.35)' }}>
                            {agent.label}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-devanagari)' }}>{agent.hindi}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Event counter */}
                <div style={{ marginTop: 20, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>AI steps completed</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--c-green-400)' }}>{eventCount}</span>
                </div>
              </div>

              {/* Right: Live thought stream */}
              <div className="card-glass" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <Volume2 size={16} style={{ color: 'var(--c-green-400)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Live Agent Thoughts</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-green-500)', boxShadow: '0 0 8px var(--c-green-500)' }} className="glow-pulse" />
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>LIVE</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 8,
                  maxHeight: 480, overflowY: 'auto', paddingRight: 4,
                }}>
                  {store.events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}>
                      <Loader2 size={24} style={{ animation: 'spin-slow 1s linear infinite', margin: '0 auto 12px' }} />
                      <p style={{ fontSize: '0.85rem' }}>Initializing agents...</p>
                    </div>
                  ) : store.events.map((event, idx) => (
                    <ThoughtItem key={idx} event={event} idx={idx} />
                  ))}
                  <div ref={thoughtsEndRef} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── COMPLETED STATE ── */}
          {store.status === 'completed' && store.result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Success header */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '20px 28px',
                  borderRadius: 16, background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: 20,
                }}
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}>
                  <CheckCircle2 size={28} style={{ color: 'var(--c-green-400)', flexShrink: 0 }} />
                </motion.div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Advisory Complete! 🎉</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>Your personalized farming plan is ready • Generated by 5 AI agents via AMD MI300X</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <motion.button
                    className="btn-ghost"
                    onClick={handleCopy}
                    style={{ padding: '8px 16px', gap: 6, fontSize: '0.8rem' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy size={14} />
                    {copied ? 'Copied!' : 'Copy'}
                  </motion.button>
                  <motion.button
                    className="btn-ghost"
                    onClick={store.reset}
                    style={{ padding: '8px 16px', gap: 6, fontSize: '0.8rem' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw size={14} />
                    New Query
                  </motion.button>
                </div>
              </motion.div>

              {/* Result card */}
              <div className="card-glass" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Gradient accent top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--c-green-600), var(--c-emerald-400), var(--c-amber-400))' }} />

                <div style={{ padding: 'clamp(24px, 4vw, 48px)', paddingTop: 'calc(clamp(24px, 4vw, 48px) + 3px)' }}>
                  {/* Result header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))',
                      border: '1px solid rgba(34,197,94,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>🌾</div>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                        <span className="text-gradient-green">Kisan Advisory Guide</span>
                      </h2>
                      <p style={{ fontFamily: 'var(--font-devanagari)', color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', marginTop: 2 }}>
                        आपकी खेती की पूरी रिपोर्ट
                      </p>
                    </div>
                  </div>

                  {/* Rendered result */}
                  <div className="result-prose">
                    {renderMarkdown(store.result)}
                  </div>

                  {/* Footer actions */}
                  <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <motion.button
                      className="btn-primary"
                      onClick={store.reset}
                      whileTap={{ scale: 0.97 }}
                      style={{ fontSize: '0.95rem', padding: '14px 28px' }}
                    >
                      <Sparkles size={16} />
                      नया सवाल पूछें (Ask Again)
                    </motion.button>
                    <motion.button
                      className="btn-ghost"
                      onClick={handleCopy}
                      whileTap={{ scale: 0.97 }}
                      style={{ fontSize: '0.95rem', padding: '14px 24px' }}
                    >
                      <Copy size={16} />
                      {copied ? 'Copied to clipboard!' : 'Copy full report'}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Powered by AMD badge */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <div className="amd-chip" style={{ display: 'inline-flex' }}>
                  <Cpu size={13} />
                  <span>Generated by 5 CrewAI Agents • AMD Instinct™ MI300X via Fireworks AI</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
