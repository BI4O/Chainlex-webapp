import { create } from 'zustand';
import { LexstudioStore, Message, Session } from './types';

// Helper function to generate session title from first message
const generateSessionTitle = (messages: Message[]): string => {
  if (messages.length === 0) return 'New Chat';
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  const title = firstUserMessage.content.slice(0, 30);
  return title.length < firstUserMessage.content.length ? `${title}...` : title;
};

export const useLexstudioStore = create<LexstudioStore>((set, get) => ({
  // Mode
  mode: 'chat',
  setMode: (mode) => {
    set({ mode });
    get().saveToLocalStorage();
  },

  // Sessions
  sessions: [],
  currentSessionId: null,

  createSession: () => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      mode: get().mode,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: newSession.id,
      messages: [],
    }));

    get().saveToLocalStorage();
  },

  switchSession: (sessionId) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (session) {
      set({
        currentSessionId: sessionId,
        messages: session.messages,
        mode: session.mode,
      });
      get().saveToLocalStorage();
    }
  },

  deleteSession: (sessionId) => {
    const state = get();
    const newSessions = state.sessions.filter(s => s.id !== sessionId);

    // If deleting current session, switch to another or create new
    if (state.currentSessionId === sessionId) {
      if (newSessions.length > 0) {
        set({
          sessions: newSessions,
          currentSessionId: newSessions[0].id,
          messages: newSessions[0].messages,
        });
      } else {
        // Create a new session if no sessions left
        get().createSession();
        return;
      }
    } else {
      set({ sessions: newSessions });
    }

    get().saveToLocalStorage();
  },

  updateSessionTitle: (sessionId, title) => {
    set((state) => ({
      sessions: state.sessions.map(s =>
        s.id === sessionId ? { ...s, title, updatedAt: Date.now() } : s
      ),
    }));
    get().saveToLocalStorage();
  },

  // Build Mode state
  currentStep: 0,
  completedSteps: [],
  phase: 'whitepaper',
  setCurrentStep: (step) => {
    set({ currentStep: step });
    get().saveToLocalStorage();
  },
  addCompletedStep: (step) => {
    set((state) => ({
      completedSteps: [...new Set([...state.completedSteps, step])],
    }));
    get().saveToLocalStorage();
  },
  setPhase: (phase) => {
    set({ phase, currentStep: 0, completedSteps: [] });
    get().saveToLocalStorage();
  },

  // Asset data
  assetData: {},
  updateAssetData: (data) => {
    set((state) => ({
      assetData: { ...state.assetData, ...data },
    }));
    get().saveToLocalStorage();
  },

  // Messages (for current session)
  messages: [],
  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    set((state) => {
      const newMessages = [...state.messages, newMessage];

      // Update current session
      const updatedSessions = state.sessions.map(s =>
        s.id === state.currentSessionId
          ? {
              ...s,
              messages: newMessages,
              title: s.messages.length === 0 ? generateSessionTitle(newMessages) : s.title,
              updatedAt: Date.now(),
            }
          : s
      );

      return {
        messages: newMessages,
        sessions: updatedSessions,
      };
    });

    get().saveToLocalStorage();
  },

  clearMessages: () => {
    set({ messages: [] });
    get().saveToLocalStorage();
  },

  // Generated content
  whitepaperContent: '',
  contractContent: '',
  updateWhitepaper: (content) => {
    set({ whitepaperContent: content });
    get().saveToLocalStorage();
  },
  updateContract: (content) => {
    set({ contractContent: content });
    get().saveToLocalStorage();
  },

  // Persistence
  saveToLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const state = get();
    localStorage.setItem('lexstudio-state', JSON.stringify({
      mode: state.mode,
      sessions: state.sessions,
      currentSessionId: state.currentSessionId,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      phase: state.phase,
      assetData: state.assetData,
      whitepaperContent: state.whitepaperContent,
      contractContent: state.contractContent,
    }));
  },

  loadFromLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('lexstudio-state');
    if (saved) {
      const state = JSON.parse(saved);

      // If no sessions, create a default one
      if (!state.sessions || state.sessions.length === 0) {
        get().createSession();
      } else {
        set({
          ...state,
          messages: state.sessions.find((s: Session) => s.id === state.currentSessionId)?.messages || [],
        });
      }
    } else {
      // First time - create initial session
      get().createSession();
    }
  },
}));
