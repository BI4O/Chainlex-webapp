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
  // Per-session workspace state
  assetData?: AssetData;
  whitepaperContent?: string;
  contractContent?: string;
  currentStep?: number;
  completedSteps?: number[];
  phase?: Phase;
  archMapContent?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;   // text extracted from file (for AI context), truncated to 2000 chars
  uploadedAt: number;
}

export interface AssetData {
  name?: string;
  type?: string;
  description?: string;
  valuation?: number;
  yieldRate?: number;
  legalStructure?: string;
  complianceStatus?: string;
  totalSupply?: number;
  jurisdictions?: string[];
  uploadedFiles?: UploadedFile[];
  onboardingCompleted?: boolean;
  // New unified fields
  tokenSymbol?: string;
  issuerLegalName?: string;
  offeringRoute?: string;
  kycProvider?: string;
  navPerToken?: number;
  deployNetwork?: string;
  auditFirm?: string;
  multisigConfig?: string;
  upgradeStrategy?: string;
}

export type Mode = 'chat' | 'build';
export type Phase = 'whitepaper' | 'contract' | 'unified';
export type PreviewTab = 'whitepaper' | 'contract' | 'arch-map';

export interface ContractDiff {
  added: number[];
  modified: number[];
}

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
  archMapContent: string;
  updateWhitepaper: (content: string) => void;
  updateContract: (content: string) => void;
  updateArchMap: (content: string) => void;

  // Contract diff (not persisted, for transient highlight)
  contractDiff: ContractDiff;
  setContractDiff: (diff: ContractDiff) => void;
  clearContractDiff: () => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Onboarding modal
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;

  // AI generation state
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}
