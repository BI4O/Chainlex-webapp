export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
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

export interface LexstudioStore {
  // Mode
  mode: Mode;
  setMode: (mode: Mode) => void;

  // Build Mode state
  currentStep: number;
  completedSteps: number[];
  phase: Phase;
  setCurrentStep: (step: number) => void;
  addCompletedStep: (step: number) => void;
  setPhase: (phase: Phase) => void;

  // Asset data
  assetData: AssetData;
  updateAssetData: (data: Partial<AssetData>) => void;

  // Messages
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Generated content
  whitepaperContent: string;
  contractContent: string;
  updateWhitepaper: (content: string) => void;
  updateContract: (content: string) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}
