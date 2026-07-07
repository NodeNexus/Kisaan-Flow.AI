import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Activity, CheckCircle, AlertTriangle, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { useAppStore } from './store';

export default function Dashboard({ onBack }: { onBack: () => void }) {
  const [prompt, setPrompt] = useState("");
  const store = useAppStore();
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [store.events]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && store.status !== 'running') {
      store.startWorkflow(prompt);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Live Execution Workspace
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Status:</span>
          <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
            store.status === 'running' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse' :
            store.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            store.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            'bg-slate-800 text-slate-400 border border-white/5'
          }`}>
            {store.status}
          </span>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Input and Agents */}
        <div className="flex flex-col gap-6 lg:w-1/3">
          {/* Prompt Input */}
          <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold mb-4">Command the Workforce</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Launch a new fitness app targeting college students..."
                className="bg-black/20 border border-white/10 rounded-xl p-4 text-sm resize-none h-32 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-500"
                disabled={store.status === 'running'}
              />
              <button 
                type="submit" 
                disabled={!prompt.trim() || store.status === 'running'}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:shadow-none flex items-center justify-center gap-2"
              >
                {store.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {store.status === 'running' ? 'Executing...' : 'Launch Workflow'}
              </button>
            </form>
          </div>

          {/* Active Agents Panel */}
          <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex-1">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              Active Agents
            </h2>
            <div className="flex flex-col gap-4">
              {['Chief Executive Officer', 'Market Research Analyst', 'Product Manager'].map((agent, i) => {
                const isActive = store.events.some(e => e.agent === agent && e.type === 'thought') && store.status === 'running';
                return (
                  <div key={i} className={`p-4 rounded-xl border transition-all ${isActive ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/5'}`}>
                    <div className="text-sm font-medium">{agent}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      {isActive ? (
                        <><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Thinking...</>
                      ) : (
                        <><span className="w-2 h-2 rounded-full bg-slate-600" /> Standby</>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Stream and Results */}
        <div className="flex flex-col gap-6 lg:w-2/3 h-[calc(100vh-120px)]">
          <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col overflow-hidden relative">
            
            {store.status === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                <Activity className="w-12 h-12 opacity-20" />
                <p>Awaiting commands. Enter a prompt to begin.</p>
              </div>
            )}

            {(store.status === 'running' || store.events.length > 0) && (
              <div className="flex-1 overflow-y-auto pr-4 space-y-4 font-mono text-sm">
                <AnimatePresence>
                  {store.events.map((ev, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border ${
                        ev.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                        ev.type === 'status' ? 'bg-white/5 border-white/10 text-slate-300' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                        {ev.type === 'error' && <AlertTriangle className="w-3 h-3" />}
                        {ev.type === 'status' && <CheckCircle className="w-3 h-3" />}
                        {ev.type === 'thought' && <Bot className="w-3 h-3" />}
                        <span className="font-semibold uppercase tracking-wider">{ev.agent || 'SYSTEM'}</span>
                        <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="whitespace-pre-wrap">{ev.message}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={eventsEndRef} />
              </div>
            )}
          </div>

          {/* Results Modal/Panel (If completed) */}
          <AnimatePresence>
            {store.result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl max-h-96 overflow-y-auto"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-400">
                  <FileText className="w-5 h-5" />
                  Final Execution Result
                </h2>
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                  {store.result}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
