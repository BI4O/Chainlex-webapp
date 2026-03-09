import { create } from 'zustand';
import { LexstudioStore, Message, Session, AssetData, Phase, ContractDiff } from './types';
import { createExampleSession, hasExampleSession } from './exampleSession';

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
  archMapContent: session.archMapContent ?? '',
  currentStep: session.currentStep ?? 0,
  completedSteps: session.completedSteps ?? [],
  phase: session.phase ?? ('unified' as Phase),
});

// Snapshot current workspace state back into a session object
const snapshotToSession = (session: Session, state: {
  mode: 'chat' | 'build';
  messages: Message[];
  assetData: AssetData;
  whitepaperContent: string;
  contractContent: string;
  archMapContent: string;
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
  archMapContent: state.archMapContent,
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
      phase: mode === 'build' ? 'unified' : state.phase,
      // Don't show onboarding modal immediately when switching modes
      // It will be triggered when user tries to send a message in build mode
      showOnboardingModal: false,
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

    // New session always starts in Chat Mode
    const newSession: Session = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      mode: 'chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      assetData: {},
      whitepaperContent: '',
      contractContent: '',
      archMapContent: '',
      currentStep: 0,
      completedSteps: [],
      phase: 'unified',
    };

    set({
      sessions: [newSession, ...updatedSessions],
      currentSessionId: newSession.id,
      mode: 'chat',
      messages: [],
      assetData: {},
      whitepaperContent: '',
      contractContent: '',
      archMapContent: '',
      currentStep: 0,
      completedSteps: [],
      phase: 'unified',
      showOnboardingModal: false,
      contractDiff: { added: [], modified: [] },
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
      contractDiff: { added: [], modified: [] },
      showOnboardingModal: targetSession.mode === 'build' && !targetSession.assetData?.onboardingCompleted,
    });

    get().saveToLocalStorage();
  },

  deleteSession: (sessionId) => {
    const state = get();

    // Prevent deletion of example session
    const targetSession = state.sessions.find(s => s.id === sessionId);
    if (targetSession?.isExample) {
      return;
    }

    const newSessions = state.sessions.filter(s => s.id !== sessionId);

    if (state.currentSessionId === sessionId) {
      if (newSessions.length > 0) {
        const nextSession = newSessions[0];
        set({
          sessions: newSessions,
          currentSessionId: nextSession.id,
          ...workspaceFromSession(nextSession),
          showOnboardingModal: nextSession.mode === 'build' && !nextSession.assetData?.onboardingCompleted,
          contractDiff: { added: [], modified: [] },
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
  phase: 'unified',
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
  archMapContent: '',
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
    set((state) => {
      // Compute diff vs existing content
      const oldLines = state.contractContent.split('\n');
      const newLines = content.split('\n');
      const added: number[] = [];
      const modified: number[] = [];

      newLines.forEach((line, idx) => {
        if (idx >= oldLines.length) {
          added.push(idx);
        } else if (line !== oldLines[idx]) {
          modified.push(idx);
        }
      });

      return {
        contractContent: content,
        contractDiff: { added, modified },
        sessions: state.sessions.map(s =>
          s.id === state.currentSessionId ? { ...s, contractContent: content } : s
        ),
      };
    });
    get().saveToLocalStorage();

    // Auto-clear diff after 3 seconds
    setTimeout(() => {
      get().clearContractDiff();
    }, 3000);
  },
  updateArchMap: (content) => {
    set((state) => ({
      archMapContent: content,
      sessions: state.sessions.map(s =>
        s.id === state.currentSessionId ? { ...s, archMapContent: content } : s
      ),
    }));
    get().saveToLocalStorage();
  },

  // Contract diff (not persisted)
  contractDiff: { added: [], modified: [] },
  setContractDiff: (diff: ContractDiff) => {
    set({ contractDiff: diff });
  },
  clearContractDiff: () => {
    set({ contractDiff: { added: [], modified: [] } });
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
      // contractDiff is NOT persisted
    }));
  },

  loadFromLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('lexstudio-state');
    if (!saved) {
      // First time user: create example session + new session
      const exampleSession = createExampleSession();
      set({
        sessions: [exampleSession],
        currentSessionId: exampleSession.id,
        ...workspaceFromSession(exampleSession),
        showOnboardingModal: false,
        contractDiff: { added: [], modified: [] },
      });
      return;
    }

    const stored = JSON.parse(saved);
    let sessions: Session[] = stored.sessions ?? [];

    // Ensure example session exists and is at the beginning
    if (!hasExampleSession(sessions)) {
      const exampleSession = createExampleSession();
      sessions = [exampleSession, ...sessions];
    } else {
      // Move example session to the front if not already
      const exampleIndex = sessions.findIndex(s => s.id === 'example-session');
      if (exampleIndex > 0) {
        const [exampleSession] = sessions.splice(exampleIndex, 1);
        sessions = [exampleSession, ...sessions];
      }
    }

    if (sessions.length === 0) {
      const exampleSession = createExampleSession();
      set({
        sessions: [exampleSession],
        currentSessionId: exampleSession.id,
        ...workspaceFromSession(exampleSession),
        showOnboardingModal: false,
        contractDiff: { added: [], modified: [] },
      });
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
      contractDiff: { added: [], modified: [] },
      showOnboardingModal: currentSession.mode === 'build' && !currentSession.assetData?.onboardingCompleted,
      ...workspaceFromSession(currentSession),
    });
  },
}));
