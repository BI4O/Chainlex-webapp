import { create } from 'zustand';
import { LexstudioStore, Message, Session, AssetData, Phase } from './types';

// Helper function to generate session title from first message
const generateSessionTitle = (messages: Message[]): string => {
  if (messages.length === 0) return 'New Chat';
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  const title = firstUserMessage.content.slice(0, 30);
  return title.length < firstUserMessage.content.length ? `${title}...` : title;
};

// Extract workspace state from a session (with defaults)
const workspaceFromSession = (session: Session) => ({
  mode: session.mode,
  messages: session.messages,
  assetData: session.assetData ?? {},
  whitepaperContent: session.whitepaperContent ?? '',
  contractContent: session.contractContent ?? '',
  currentStep: session.currentStep ?? 0,
  completedSteps: session.completedSteps ?? [],
  phase: session.phase ?? ('whitepaper' as Phase),
});

// Snapshot current workspace state back into a session object
const snapshotToSession = (session: Session, state: {
  mode: 'chat' | 'build';
  messages: Message[];
  assetData: AssetData;
  whitepaperContent: string;
  contractContent: string;
  currentStep: number;
  completedSteps: number[];
  phase: Phase;
}): Session => ({
  ...session,
  mode: state.mode,
  messages: state.messages,
  assetData: state.assetData,
  whitepaperContent: state.whitepaperContent,
  contractContent: state.contractContent,
  currentStep: state.currentStep,
  completedSteps: state.completedSteps,
  phase: state.phase,
  updatedAt: Date.now(),
});

export const useLexstudioStore = create<LexstudioStore>((set, get) => ({
  // Mode
  mode: 'chat',
  setMode: (mode) => {
    set((state) => ({
      mode,
      showOnboardingModal: mode === 'build',
      // Sync mode into current session
      sessions: state.sessions.map(s =>
        s.id === state.currentSessionId ? { ...s, mode } : s
      ),
    }));
    get().saveToLocalStorage();
  },

  // Sessions
  sessions: [],
  currentSessionId: null,

  createSession: () => {
    const state = get();

    // Only snapshot current session if it has real content
    const currentHasContent = state.messages.length > 0 || state.assetData?.onboardingCompleted;
    const updatedSessions = state.sessions.map(s =>
      s.id === state.currentSessionId && currentHasContent
        ? snapshotToSession(s, state)
        : s
    );

    const isBuild = state.mode === 'build';
    const newSession: Session = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      mode: state.mode,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      assetData: {},
      whitepaperContent: '',
      contractContent: '',
      currentStep: 0,
      completedSteps: [],
      phase: 'whitepaper',
    };

    set({
      sessions: [newSession, ...updatedSessions],
      currentSessionId: newSession.id,
      messages: [],
      assetData: {},
      whitepaperContent: '',
      contractContent: '',
      currentStep: 0,
      completedSteps: [],
      phase: 'whitepaper',
      showOnboardingModal: isBuild,
    });

    get().saveToLocalStorage();
  },

  switchSession: (sessionId) => {
    const state = get();
    const targetSession = state.sessions.find(s => s.id === sessionId);
    if (!targetSession) return;

    // Only snapshot current session if it has real content (messages or completed onboarding)
    const currentHasContent = state.messages.length > 0 || state.assetData?.onboardingCompleted;
    const updatedSessions = state.sessions.map(s =>
      s.id === state.currentSessionId && currentHasContent
        ? snapshotToSession(s, state)
        : s
    );

    // Restore workspace from target session
    set({
      sessions: updatedSessions,
      currentSessionId: sessionId,
      ...workspaceFromSession(targetSession),
      showOnboardingModal: targetSession.mode === 'build' && !targetSession.assetData?.onboardingCompleted,
    });

    get().saveToLocalStorage();
  },

  deleteSession: (sessionId) => {
    const state = get();
    const newSessions = state.sessions.filter(s => s.id !== sessionId);

    if (state.currentSessionId === sessionId) {
      if (newSessions.length > 0) {
        const nextSession = newSessions[0];
        set({
          sessions: newSessions,
          currentSessionId: nextSession.id,
          ...workspaceFromSession(nextSession),
          showOnboardingModal: false,
        });
      } else {
        set({ sessions: newSessions });
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
  previewTab: 'whitepaper',
  setCurrentStep: (step) => {
    set((state) => ({
      currentStep: step,
      sessions: state.sessions.map(s =>
        s.id === state.currentSessionId ? { ...s, currentStep: step } : s
      ),
    }));
    get().saveToLocalStorage();
  },
  addCompletedStep: (step) => {
    set((state) => {
      const newCompleted = [...new Set([...state.completedSteps, step])];
      return {
        completedSteps: newCompleted,
        sessions: state.sessions.map(s =>
          s.id === state.currentSessionId ? { ...s, completedSteps: newCompleted } : s
        ),
      };
    });
    get().saveToLocalStorage();
  },
  setPhase: (phase) => {
    set((state) => ({
      phase,
      currentStep: 0,
      completedSteps: [],
      sessions: state.sessions.map(s =>
        s.id === state.currentSessionId
          ? { ...s, phase, currentStep: 0, completedSteps: [] }
          : s
      ),
    }));
    get().saveToLocalStorage();
  },
  setPreviewTab: (tab) => {
    set({ previewTab: tab });
    get().saveToLocalStorage();
  },

  // Asset data
  assetData: {},
  updateAssetData: (data) => {
    set((state) => {
      const newAssetData = { ...state.assetData, ...data };
      return {
        assetData: newAssetData,
        sessions: state.sessions.map(s =>
          s.id === state.currentSessionId ? { ...s, assetData: newAssetData } : s
        ),
      };
    });
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
      return { messages: newMessages, sessions: updatedSessions };
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
    set((state) => ({
      whitepaperContent: content,
      sessions: state.sessions.map(s =>
        s.id === state.currentSessionId ? { ...s, whitepaperContent: content } : s
      ),
    }));
    get().saveToLocalStorage();
  },
  updateContract: (content) => {
    set((state) => ({
      contractContent: content,
      sessions: state.sessions.map(s =>
        s.id === state.currentSessionId ? { ...s, contractContent: content } : s
      ),
    }));
    get().saveToLocalStorage();
  },

  // Sidebar state
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    get().saveToLocalStorage();
  },

  // Onboarding modal
  showOnboardingModal: false,
  setShowOnboardingModal: (show) => {
    set({ showOnboardingModal: show });
  },

  // AI generation state
  isGenerating: false,
  setIsGenerating: (generating) => {
    set({ isGenerating: generating });
  },

  // Persistence — only sessions array needs to be saved (it carries all workspace state)
  saveToLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const state = get();
    // Snapshot current workspace into current session before saving
    const sessionsToSave = state.sessions.map(s =>
      s.id === state.currentSessionId ? snapshotToSession(s, state) : s
    );
    localStorage.setItem('lexstudio-state', JSON.stringify({
      currentSessionId: state.currentSessionId,
      sessions: sessionsToSave,
      sidebarCollapsed: state.sidebarCollapsed,
      previewTab: state.previewTab,
    }));
  },

  loadFromLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('lexstudio-state');
    if (!saved) {
      get().createSession();
      return;
    }

    const stored = JSON.parse(saved);
    const sessions: Session[] = stored.sessions ?? [];

    if (sessions.length === 0) {
      get().createSession();
      return;
    }

    const currentSessionId = stored.currentSessionId ?? sessions[0].id;
    let currentSession = sessions.find((s: Session) => s.id === currentSessionId) ?? sessions[0];

    // Clean up trailing "..." placeholder messages from interrupted generation
    let messages = [...(currentSession.messages ?? [])];
    while (messages.length > 0 && messages[messages.length - 1]?.content === '...') {
      messages = messages.slice(0, -1);
    }
    currentSession = { ...currentSession, messages };

    const cleanedSessions = sessions.map((s: Session) =>
      s.id === currentSession.id ? currentSession : s
    );

    set({
      sessions: cleanedSessions,
      currentSessionId: currentSession.id,
      sidebarCollapsed: stored.sidebarCollapsed ?? false,
      previewTab: stored.previewTab ?? 'whitepaper',
      isGenerating: false,
      showOnboardingModal: currentSession.mode === 'build' && !currentSession.assetData?.onboardingCompleted,
      ...workspaceFromSession(currentSession),
    });
  },
}));
