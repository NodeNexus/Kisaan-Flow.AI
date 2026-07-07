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
  
  startWorkflow: (prompt: string) => Promise<void>;
  connectWebSocket: (workflowId: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  workflowId: null,
  status: 'idle',
  events: [],
  result: null,

  startWorkflow: async (prompt: string) => {
    set({ status: 'running', events: [], result: null });
    try {
      const response = await fetch('http://localhost:8000/api/v1/workflows/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (data.workflow_id) {
        set({ workflowId: data.workflow_id });
        get().connectWebSocket(data.workflow_id);
      }
    } catch (e) {
      set({ status: 'failed', events: [{ type: 'error', message: 'Failed to start workflow.', timestamp: Date.now() }] });
    }
  },

  connectWebSocket: (workflowId: string) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/workflows/${workflowId}`);
    
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
        }
        if (wfEvent.type === 'error') {
          newStatus = 'failed';
        }
        
        return { events: newEvents, status: newStatus, result: newResult };
      });
    };
  },

  reset: () => set({ workflowId: null, status: 'idle', events: [], result: null }),
}));
