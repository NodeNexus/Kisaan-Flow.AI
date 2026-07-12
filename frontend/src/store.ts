import { create } from 'zustand';

export interface WorkflowEvent {
  type: 'status' | 'thought' | 'result' | 'error';
  agent?: string;
  message?: string;
  data?: any;
  timestamp: number;
}

interface AppState {
  workflowId: string | null;
  status: 'idle' | 'running' | 'completed' | 'failed';
  events: WorkflowEvent[];
  result: string | null;
  
  startWorkflow: (prompt: string, language: string) => Promise<void>;
  connectWebSocket: (workflowId: string) => void;
  reset: () => void;
}

// ── API URL Resolution ────────────────────────────────────────────────
// In production (Render): VITE_API_URL is set to the backend service URL
// In development: falls back to localhost:8000
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// WebSocket protocol: wss:// for https, ws:// for http
const WS_BASE = API_BASE.replace(/^https/, 'wss').replace(/^http/, 'ws');

// ─────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  workflowId: null,
  status: 'idle',
  events: [],
  result: null,

  startWorkflow: async (prompt: string, language: string) => {
    set({ status: 'running', events: [], result: null });
    try {
      const response = await fetch(`${API_BASE}/api/v1/workflows/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language }),
      });
      const data = await response.json();
      if (data.workflow_id) {
        set({ workflowId: data.workflow_id });
        get().connectWebSocket(data.workflow_id);
      } else {
        throw new Error(data.detail ?? 'No workflow_id returned');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to start workflow.';
      set({
        status: 'failed',
        events: [{ type: 'error', message: msg, timestamp: Date.now() }],
      });
    }
  },

  connectWebSocket: (workflowId: string) => {
    const ws = new WebSocket(`${WS_BASE}/ws/workflows/${workflowId}`);

    ws.onerror = () => {
      set((state) => ({
        status: 'failed',
        events: [
          ...state.events,
          { type: 'error', message: 'WebSocket connection failed. Is the backend running?', timestamp: Date.now() },
        ],
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const wfEvent: WorkflowEvent = { ...data, timestamp: Date.now() };

      set((state) => {
        const newEvents = [...state.events, wfEvent];
        let newStatus = state.status;
        let newResult = state.result;

        if (wfEvent.type === 'status' && wfEvent.message?.includes('completed successfully')) {
          newStatus = 'completed';
        }
        if (wfEvent.type === 'result') {
          newResult = wfEvent.data;
          newStatus = 'completed';
        }
        if (wfEvent.type === 'error') {
          newStatus = 'failed';
        }

        return { events: newEvents, status: newStatus, result: newResult };
      });
    };

    ws.onclose = (e) => {
      // Abnormal closure — mark as failed only if we weren't already done
      if (e.code !== 1000) {
        set((state) => {
          if (state.status === 'running') {
            return {
              status: 'failed',
              events: [
                ...state.events,
                { type: 'error', message: 'Connection closed unexpectedly.', timestamp: Date.now() },
              ],
            };
          }
          return {};
        });
      }
    };
  },

  reset: () => set({ workflowId: null, status: 'idle', events: [], result: null }),
}));
