import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Sprout, Sun, Cpu, Leaf, ChevronDown,
  Zap, Globe, Users, Star,
  Mic, CheckCircle, Wheat
} from 'lucide-react';
import Dashboard from './Dashboard';

/* ── Particle component ── */
const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: '4px',
      height: '4px',
      background: 'rgba(34, 197, 94, 0.5)',
      animation: `particle-float ${8 + Math.random() * 12}s linear infinite`,
      ...style,
    }}
  />
);

/* ── Agent card data ── */
const AGENTS = [
  {
    emoji: '🌱',
    role: 'Chief Agronomist',
    hindi: 'कृषि विज्ञानी',
    color: 'from-green-600/20 to-green-800/10',
    border: 'rgba(34, 197, 94, 0.2)',
    glow: 'rgba(34, 197, 94, 0.15)',
    desc: 'Analyzes your soil, weather patterns, and climate data to recommend the highest-yield crop varieties.',
    tags: ['Soil Analysis', 'Weather', 'Crop Selection'],
  },
  {
    emoji: '📊',
    role: 'Agricultural Economist',
    hindi: 'कृषि अर्थशास्त्री',
    color: 'from-blue-600/20 to-blue-800/10',
    border: 'rgba(59, 130, 246, 0.2)',
    glow: 'rgba(59, 130, 246, 0.15)',
    desc: 'Researches live Mandi prices via web search to identify the most profitable market opportunity.',
    tags: ['Mandi Prices', 'MSP Rates', 'ROI Analysis'],
  },
  {
    emoji: '🏛️',
    role: 'Policy Advisor',
    hindi: 'योजना सलाहकार',
    color: 'from-amber-600/20 to-amber-800/10',
    border: 'rgba(245, 158, 11, 0.2)',
    glow: 'rgba(245, 158, 11, 0.15)',
    desc: 'Identifies every applicable PM-Kisan, PMFBY, and state subsidy scheme for your specific profile.',
    tags: ['PM-KISAN', 'Crop Insurance', 'Subsidies'],
  },
  {
    emoji: '🚛',
    role: 'Supply Chain Coordinator',
    hindi: 'आपूर्ति श्रृंखला',
    color: 'from-purple-600/20 to-purple-800/10',
    border: 'rgba(168, 85, 247, 0.2)',
    glow: 'rgba(168, 85, 247, 0.15)',
    desc: 'Plans post-harvest logistics, cold storage, and direct-to-buyer channels to eliminate middlemen.',
    tags: ['Cold Storage', 'eNAM', 'FPO Linkage'],
  },
  {
    emoji: '🙏',
    role: 'Krishi Mitra',
    hindi: 'कृषि मित्र',
    color: 'from-rose-600/20 to-rose-800/10',
    border: 'rgba(244, 63, 94, 0.2)',
    glow: 'rgba(244, 63, 94, 0.15)',
    desc: 'Synthesizes all 4 expert reports into a simple, step-by-step guide in your chosen language.',
    tags: ['Hindi', 'Marathi', 'Telugu', 'English'],
  },
];

/* ── Stats data ── */
const STATS = [
  { value: '700M+', label: 'Farmers in India', icon: <Users size={20} /> },
  { value: '< 90s', label: 'Full advisory time', icon: <Zap size={20} /> },
  { value: '5', label: 'Expert AI agents', icon: <Cpu size={20} /> },
  { value: '4', label: 'Indian languages', icon: <Globe size={20} /> },
];

/* ── How it works steps ── */
const HOW_STEPS = [
  {
    step: '01',
    title: 'Describe Your Farm',
    desc: 'Type or speak your land size, soil type, budget, and location in any language.',
    icon: <Mic size={24} />,
  },
  {
    step: '02',
    title: 'AI Workforce Activates',
    desc: '5 specialized agents research, debate, and synthesize data from live sources in real-time.',
    icon: <Cpu size={24} />,
  },
  {
    step: '03',
    title: 'Receive Your Plan',
    desc: 'Get a complete sowing-to-selling guide in Hindi, Marathi, Telugu, or English in under 90 seconds.',
    icon: <Leaf size={24} />,
  },
];

/* ── Marquee tech logos ── */
const TECH_ITEMS = [
  'AMD Instinct™ MI300X', 'Fireworks AI', 'CrewAI', 'LangChain',
  'FastAPI', 'React 19', 'PostgreSQL', 'Qdrant', 'WebSockets',
  'AMD Instinct™ MI300X', 'Fireworks AI', 'CrewAI', 'LangChain',
  'FastAPI', 'React 19', 'PostgreSQL', 'Qdrant', 'WebSockets',
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (view === 'dashboard') {
    return <Dashboard onBack={() => setView('landing')} />;
  }

  return (
    <div className="bg-animate-gradient grain-overlay" style={{ minHeight: '100vh', color: 'white' }}>

      {/* ── Background Orbs ── */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb orb-green animate-float" style={{ width: 700, height: 700, top: '-15%', left: '-10%' }} />
        <div className="orb orb-emerald animate-float-r" style={{ width: 500, height: 500, bottom: '10%', right: '-5%' }} />
        <div className="orb orb-amber animate-float-slow" style={{ width: 400, height: 400, top: '40%', left: '60%' }} />
        {/* Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle key={i} style={{ left: `${5 + i * 5}%`, bottom: '-10px', animationDelay: `${i * 0.7}s` }} />
        ))}
        <div className="bg-dots" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 100,
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          background: scrolled ? 'rgba(10, 26, 13, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          transition: 'all 0.4s ease',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="glow-green" style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #16a34a, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Wheat size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
              <span className="text-gradient-green">KisanFlow</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 2 }}>AI</span>
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="amd-chip" style={{ marginRight: 8 }}>
              <Cpu size={14} />
              <span>AMD MI300X</span>
            </div>
            <button className="btn-ghost" onClick={() => document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' })}>
              Agents
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              How It Works
            </button>
            <motion.button
              className="btn-primary"
              onClick={() => setView('dashboard')}
              whileTap={{ scale: 0.97 }}
              style={{ padding: '10px 24px', fontSize: '0.95rem' }}
            >
              शुरू करें
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 32px 80px', textAlign: 'center', zIndex: 1 }}>
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>

          {/* Badge */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
            <div className="section-label" style={{ marginBottom: 32 }}>
              <Sun size={14} />
              <span>AMD Developer Hackathon 2025</span>
            </div>
          </motion.div>

          {/* Hindi title */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
            <p style={{ fontFamily: 'var(--font-devanagari)', fontSize: '1.25rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16, letterSpacing: '0.02em' }}>
              आपकी खेती का भविष्य, AI के साथ
            </p>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            custom={2} variants={fadeUp} initial="hidden" animate="show"
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              lineHeight: 1.05, letterSpacing: '-0.03em',
              marginBottom: 32, maxWidth: 900, margin: '0 auto 32px',
            }}
          >
            <span className="text-gradient-hero">India's First</span>
            <br />
            <span style={{ color: 'white' }}>Autonomous AI</span>
            <br />
            <span className="text-gradient-green">Farm Advisor</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={3} variants={fadeUp} initial="hidden" animate="show"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.55)',
              maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.75,
            }}
          >
            Five specialized AI agents—agronomist, economist, policy advisor, logistics coordinator, and Krishi Mitra—collaborate in real-time to build your complete farming plan in under <strong style={{ color: 'rgba(255,255,255,0.85)' }}>90 seconds</strong>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={4} variants={fadeUp} initial="hidden" animate="show"
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}
          >
            <motion.button
              className="btn-primary shine"
              onClick={() => setView('dashboard')}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{ fontSize: '1.15rem', padding: '18px 40px' }}
            >
              <Sprout size={20} />
              अपनी खेती की योजना बनाएं
              <ArrowRight size={20} />
            </motion.button>
            <button className="btn-ghost" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              देखें कैसे काम करता है
              <ChevronDown size={16} />
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            custom={5} variants={fadeUp} initial="hidden" animate="show"
            style={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                className="card-glass"
                style={{ padding: '20px 32px', borderRadius: 16, textAlign: 'center', minWidth: 140 }}
              >
                <div style={{ color: 'rgba(34, 197, 94, 0.7)', marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'white', letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            className="animate-float"
            style={{ marginTop: 64, color: 'rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll to explore</span>
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Tech Marquee ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', overflow: 'hidden', padding: '14px 0', zIndex: 1, position: 'relative' }}>
        <div className="animate-marquee" style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', width: 'max-content' }}>
          {TECH_ITEMS.map((t, i) => (
            <span key={i} style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: i % 9 === 0 ? 'var(--c-green-400)' : 'rgba(255,255,255,0.25)' }}>
              {i % 9 === 0 && <Star size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />}
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Agent Showcase ── */}
      <section id="agents" style={{ position: 'relative', zIndex: 1, padding: '120px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <motion.div custom={0} variants={fadeUp}>
            <div className="section-label" style={{ marginBottom: 24 }}>
              <Cpu size={14} />
              <span>The Agentic Workforce</span>
            </div>
          </motion.div>
          <motion.h2 custom={1} variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: 20 }}>
            5 Expert Agents. <span className="text-gradient-green">1 Complete Plan.</span>
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto' }}>
            Each agent is a domain expert. They debate, research live data, and pass their findings to the next agent in a sequential reasoning chain.
          </motion.p>
        </motion.div>

        {/* Sequential pipeline visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 860, margin: '0 auto' }}>
          {AGENTS.map((agent, i) => (
            <motion.div
              key={i}
              custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            >
              <div
                className="card-glass"
                style={{
                  display: 'flex', alignItems: 'center', gap: 24, padding: '24px 28px',
                  borderColor: agent.border,
                  background: `linear-gradient(135deg, ${agent.glow} 0%, transparent 60%)`,
                  position: 'relative',
                }}
              >
                {/* Step number */}
                <div style={{
                  flexShrink: 0, width: 48, height: 48, borderRadius: '50%',
                  background: agent.glow, border: `1px solid ${agent.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  {agent.emoji}
                </div>

                {/* Agent info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>{agent.role}</span>
                    <span style={{ fontFamily: 'var(--font-devanagari)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>{agent.hindi}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>{agent.desc}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {agent.tags.map(t => (
                      <span key={t} style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px',
                        borderRadius: 999, border: `1px solid ${agent.border}`,
                        color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow if not last */}
                {i < AGENTS.length - 1 && (
                  <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', zIndex: 2, color: 'rgba(34, 197, 94, 0.4)' }}>
                    <ChevronDown size={20} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '80px 32px 120px', background: 'rgba(0,0,0,0.2)' }}>
        <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.6, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <motion.div custom={0} variants={fadeUp}>
              <div className="section-label" style={{ marginBottom: 24 }}>
                <Zap size={14} />
                <span>Lightning Fast</span>
              </div>
            </motion.div>
            <motion.h2 custom={1} variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: 16 }}>
              From Question to <span className="text-gradient-gold">Complete Plan</span>
            </motion.h2>
            <motion.p custom={2} variants={fadeUp} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem' }}>
              Three steps. Under 90 seconds. In your language.
            </motion.p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {HOW_STEPS.map((step, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
                <div className="card-glass" style={{ padding: '36px 32px', height: '100%' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--c-green-400)', marginBottom: 20,
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(34, 197, 94, 0.5)', marginBottom: 8 }}>
                    STEP {step.step}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: 12 }}>{step.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AMD Section ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="card-glass"
            style={{
              padding: 'clamp(32px, 5vw, 64px)',
              background: 'linear-gradient(135deg, rgba(237, 27, 27, 0.06) 0%, rgba(10, 26, 13, 0.8) 100%)',
              borderColor: 'rgba(237, 27, 27, 0.15)',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48,
              alignItems: 'center', position: 'relative', overflow: 'hidden',
            }}
          >
            {/* BG decoration */}
            <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,27,27,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div>
              <div className="amd-chip" style={{ marginBottom: 24 }}>
                <Cpu size={16} />
                <span>AMD Instinct™ MI300X</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1 }}>
                AMD MI300X Is<br />
                <span style={{ color: '#ff6b6b' }}>The Foundation.</span><br />
                Not a Feature.
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 24 }}>
                A 5-agent sequential workflow generates 15,000–25,000 tokens per run. At 25 tok/s (commodity GPU), that's a <strong style={{ color: 'rgba(255,255,255,0.8)' }}>10–15 minute wait</strong>. At 100+ tok/s on MI300X via Fireworks AI, it completes in <strong style={{ color: '#ff6b6b' }}>under 90 seconds</strong>.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                AMD MI300X's 192GB HBM3 unified memory and 5.3 TB/s bandwidth enable Fireworks AI to serve LLaMA 3.1 70B at blazing inference speeds — making real-time, multi-agent web apps possible.
              </p>
            </div>

            {/* Spec cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'HBM3 Memory', value: '192 GB', sub: 'Unified GPU + CPU memory' },
                { label: 'Memory Bandwidth', value: '5.3 TB/s', sub: 'World-leading for LLM serving' },
                { label: 'Inference Speed', value: '100+ tok/s', sub: 'LLaMA 3.1 70B on Fireworks AI' },
                { label: 'KisanFlow Runtime', value: '< 90 sec', sub: 'Full 5-agent advisory workflow' },
              ].map((spec, i) => (
                <div key={i} style={{
                  padding: '16px 20px', borderRadius: 12,
                  background: 'rgba(237, 27, 27, 0.06)',
                  border: '1px solid rgba(237, 27, 27, 0.12)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginBottom: 2 }}>{spec.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>{spec.sub}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: '#ff8080' }}>{spec.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Languages ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 32px 120px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div custom={0} variants={fadeUp}>
              <div className="section-label" style={{ marginBottom: 24 }}>
                <Globe size={14} />
                <span>Multilingual</span>
              </div>
            </motion.div>
            <motion.h2 custom={1} variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em', marginBottom: 48 }}>
              Your Language. <span className="text-gradient-green">Your Advisory.</span>
            </motion.h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 600, margin: '0 auto' }}>
            {[
              { lang: 'हिंदी', name: 'Hindi', script: 'आपकी खेती की योजना', color: '#4ade80' },
              { lang: 'मराठी', name: 'Marathi', script: 'तुमच्या शेतीची योजना', color: '#34d399' },
              { lang: 'తెలుగు', name: 'Telugu', script: 'మీ వ్యవసాయ ప్రణాళిక', color: '#fbbf24' },
              { lang: 'English', name: 'English', script: 'Your Farming Plan', color: '#94a3b8' },
            ].map((l, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="card-glass" style={{ padding: '28px', textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-devanagari)', fontSize: '2rem', fontWeight: 800, color: l.color, marginBottom: 8 }}>{l.lang}</div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{l.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-devanagari)' }}>{l.script}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 32px 140px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px)',
            borderRadius: 32, textAlign: 'center', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.15) 0%, rgba(10, 185, 129, 0.08) 50%, rgba(22, 163, 74, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            boxShadow: '0 0 80px rgba(34, 197, 94, 0.08)',
          }}
        >
          <div className="orb orb-green" style={{ width: 400, height: 400, top: '-50%', left: '-10%', opacity: 0.5 }} />
          <div className="orb orb-emerald" style={{ width: 300, height: 300, bottom: '-50%', right: '10%', opacity: 0.5 }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-devanagari)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
              🙏 आज ही शुरू करें
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: 20 }}>
              Get Your <span className="text-gradient-green">Free Advisory</span><br />in Under 90 Seconds
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.75 }}>
              Tell us about your farm. Our 5 AI agents will handle the rest — from soil analysis to subsidy claims to selling strategy.
            </p>
            <motion.button
              className="btn-primary shine"
              onClick={() => setView('dashboard')}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
              style={{ fontSize: '1.25rem', padding: '20px 48px' }}
            >
              <Sprout size={22} />
              अपनी खेती की योजना बनाएं
              <ArrowRight size={22} />
            </motion.button>

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
              {['Free to use', 'No signup required', 'Works on any phone'].map((f) => (
                <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                  <CheckCircle size={14} color="var(--c-green-500)" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wheat size={18} color="var(--c-green-500)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>KisanFlow AI</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', maxWidth: 480 }}>
            Built for the AMD Developer Hackathon 2025. Powered by Fireworks AI running on AMD Instinct™ MI300X accelerators.
          </p>
          <div className="amd-chip" style={{ marginTop: 4 }}>
            <Cpu size={12} />
            <span style={{ fontSize: '0.7rem' }}>AMD Instinct™ MI300X Accelerated</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
