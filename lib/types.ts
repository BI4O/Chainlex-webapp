export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  mode: Mode;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AssetData {
  name?: string;
  type?: string;
  valuation?: number;
  yieldRate?: number;
  legalStructure?: string;
  complianceStatus?: string;
  totalSupply?: number;
}

export type Mode = 'chat' | 'build';
export type Phase = 'whitepaper' | 'contract';
export type PreviewTab = 'whitepaper' | 'contract' | 'arch-map';

export interface LexstudioStore {
  // Mode
  mode: Mode;
  setMode: (mode: Mode) => void;

  // Sessions
  sessions: Session[];
  currentSessionId: string | null;
  createSession: () => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;

  // Build Mode state
  currentStep: number;
  completedSteps: number[];
  phase: Phase;
  previewTab: PreviewTab;
  setCurrentStep: (step: number) => void;
  addCompletedStep: (step: number) => void;
  setPhase: (phase: Phase) => void;
  setPreviewTab: (tab: PreviewTab) => void;

  // Asset data
  assetData: AssetData;
  updateAssetData: (data: Partial<AssetData>) => void;

  // Messages (for current session)
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Generated content
  whitepaperContent: string;
  contractContent: string;
  updateWhitepaper: (content: string) => void;
  updateContract: (content: string) => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // AI generation state
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}
