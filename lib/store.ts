import { create } from 'zustand';
import { LexstudioStore, Message } from './types';

export const useLexstudioStore = create<LexstudioStore>((set, get) => ({
  // Mode
  mode: 'chat',
  setMode: (mode) => {
    set({ mode });
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

  // Messages
  messages: [],
  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
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
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      phase: state.phase,
      assetData: state.assetData,
      messages: state.messages,
      whitepaperContent: state.whitepaperContent,
      contractContent: state.contractContent,
    }));
  },
  loadFromLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('lexstudio-state');
    if (saved) {
      const state = JSON.parse(saved);
      set(state);
    }
  },
}));
