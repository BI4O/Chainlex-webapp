# Lexstudio Phase 1: Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up the foundational architecture for Lexstudio, including Next.js frontend with Minimalist Monochrome design system, Python FastAPI backend, and core layout components.

**Architecture:** Next.js 15 (App Router) frontend with Tailwind CSS configured for Minimalist Monochrome design (pure black/white, 0px radius, serif fonts). Python FastAPI backend (port 8000) with LangChain/LangGraph for AI agents. Frontend uses Zustand for state management and localStorage for session persistence.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Zustand, Playfair Display/Source Serif 4 fonts, Python FastAPI, LangChain, LangGraph

**Design System Reference:** `guide/UI_guide.md` (Minimalist Monochrome - pure black/white, 0px radius, serif fonts, no shadows)

---

## Task 1: Next.js Project Configuration

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`
- Create: `app/globals.css`

**Step 1: Configure Tailwind for Minimalist Monochrome**

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        muted: '#F5F5F5',
        mutedForeground: '#525252',
        border: '#000000',
        borderLight: '#E5E5E5',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 2: Set up Google Fonts**

Update `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Lexstudio",
  description: "RWA Asset Modeling Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

**Step 3: Configure global CSS**

Update `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }

  /* Remove all border radius globally */
  * {
    border-radius: 0 !important;
  }

  /* Ensure no shadows */
  * {
    box-shadow: none !important;
  }
}
```

**Step 4: Test the configuration**

Run: `pnpm run dev`
Expected: Server starts on localhost:3000, page loads with serif fonts

**Step 5: Commit**

```bash
git add tailwind.config.ts app/layout.tsx app/globals.css
git commit -m "feat: configure Minimalist Monochrome design system"
```

---

## Task 2: Zustand Store Setup

**Files:**
- Create: `lib/store.ts`
- Create: `lib/types.ts`

**Step 1: Define TypeScript types**

Create `lib/types.ts`:

```typescript
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
```

**Step 2: Create Zustand store**

Create `lib/store.ts`:

```typescript
import { create } from 'zustand';
import { LexstudioStore, Message, AssetData } from './types';

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
```

**Step 3: Install Zustand**

Run: `pnpm add zustand`
Expected: Zustand installed successfully

**Step 4: Test the store**

Create a test component to verify store works (temporary):

```typescript
// app/page.tsx (temporary test)
'use client';
import { useLexstudioStore } from '@/lib/store';

export default function Home() {
  const { mode, setMode } = useLexstudioStore();
  return (
    <div className="p-8">
      <p>Current mode: {mode}</p>
      <button onClick={() => setMode('build')}>Switch to Build</button>
    </div>
  );
}
```

Run: `pnpm run dev`
Expected: Page shows mode, button switches mode

**Step 5: Commit**

```bash
git add lib/store.ts lib/types.ts package.json pnpm-lock.yaml
git commit -m "feat: add Zustand store with localStorage persistence"
```

---

## Task 3: Sidebar Component

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/SidebarNav.tsx`
- Create: `components/layout/SidebarHistory.tsx`
- Create: `components/layout/SidebarUser.tsx`

**Step 1: Create SidebarNav component**

Create `components/layout/SidebarNav.tsx`:

```typescript
'use client';

interface NavItem {
  id: string;
  label: string;
  active: boolean;
}

export function SidebarNav() {
  const navItems: NavItem[] = [
    { id: 'studio', label: 'Studio', active: true },
    { id: 'oracle', label: 'Oracle', active: false },
    { id: 'enforcer', label: 'Enforcer', active: false },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`
            w-full px-4 py-3 text-left font-body text-sm
            transition-colors duration-100
            ${item.active
              ? 'bg-foreground text-background'
              : 'bg-background text-foreground border-2 border-foreground hover:bg-foreground hover:text-background'
            }
          `}
        >
          {item.active && '● '}{item.label}
        </button>
      ))}
    </nav>
  );
}
```

**Step 2: Create SidebarHistory component**

Create `components/layout/SidebarHistory.tsx`:

```typescript
'use client';

interface HistoryItem {
  id: string;
  title: string;
  type: 'chat' | 'build';
}

export function SidebarHistory() {
  const historyItems: HistoryItem[] = [
    { id: '1', title: 'Real Estate Fund', type: 'build' },
    { id: '2', title: 'Tech Startup Token', type: 'build' },
    { id: '3', title: 'Chat: RWA basics', type: 'chat' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <h3 className="px-4 py-2 font-mono text-xs uppercase tracking-widest text-mutedForeground">
        History
      </h3>
      <div className="space-y-1">
        {historyItems.map((item) => (
          <button
            key={item.id}
            className="
              w-full px-4 py-2 text-left font-body text-sm
              hover:border-b-2 hover:border-foreground
              transition-all duration-100
            "
          >
            ▸ {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Create SidebarUser component**

Create `components/layout/SidebarUser.tsx`:

```typescript
'use client';

export function SidebarUser() {
  return (
    <div className="border-t-2 border-foreground p-4">
      <div className="flex items-center justify-between">
        <span className="font-body text-sm">@Founder</span>
        <button className="font-body text-sm hover:underline">
          ⚙
        </button>
      </div>
    </div>
  );
}
```

**Step 4: Create main Sidebar component**

Create `components/layout/Sidebar.tsx`:

```typescript
'use client';
import { useState } from 'react';
import { SidebarNav } from './SidebarNav';
import { SidebarHistory } from './SidebarHistory';
import { SidebarUser } from './SidebarUser';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-0 overflow-hidden">
        {/* Collapsed state - could add a toggle button here */}
      </div>
    );
  }

  return (
    <aside className="w-60 h-screen flex flex-col bg-background border-r-2 border-foreground">
      {/* Header */}
      <div className="p-4 border-b-2 border-foreground flex items-center justify-between">
        <h1 className="font-display text-xl tracking-tight">LEXSTUDIO</h1>
        <button
          onClick={() => setIsCollapsed(true)}
          className="font-mono text-sm hover:opacity-50"
        >
          ≡
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <SidebarNav />
      </div>

      {/* Divider */}
      <div className="h-1 bg-foreground" />

      {/* History */}
      <SidebarHistory />

      {/* Divider */}
      <div className="h-1 bg-foreground" />

      {/* User */}
      <SidebarUser />
    </aside>
  );
}
```

**Step 5: Test Sidebar**

Update `app/page.tsx`:

```typescript
import { Sidebar } from '@/components/layout/Sidebar';

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="font-display text-4xl">Welcome to Lexstudio</h1>
      </main>
    </div>
  );
}
```

Run: `pnpm run dev`
Expected: Sidebar appears on left with navigation, history, and user sections

**Step 6: Commit**

```bash
git add components/layout/ app/page.tsx
git commit -m "feat: add Sidebar with navigation, history, and user sections"
```

---

## Task 4: Python Backend Setup

**Files:**
- Create: `chatbot/main.py`
- Create: `chatbot/requirements.txt`
- Create: `chatbot/.env.example`
- Create: `chatbot/.gitignore`

**Step 1: Create requirements.txt**

Create `chatbot/requirements.txt`:

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
langchain==0.3.0
langchain-openai==0.2.0
langgraph==0.2.0
python-dotenv==1.0.0
pydantic==2.9.0
```

**Step 2: Create .env.example**

Create `chatbot/.env.example`:

```
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
```

**Step 3: Create .gitignore**

Create `chatbot/.gitignore`:

```
venv/
__pycache__/
.env
*.pyc
.pytest_cache/
```

**Step 4: Create FastAPI main.py**

Create `chatbot/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI(title="Lexstudio AI Backend")

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_input: str
    history: List[Dict[str, Any]]

class BuildRequest(BaseModel):
    user_input: str
    current_step: int
    completed_steps: List[int]
    phase: str
    asset_data: Dict[str, Any]
    history: List[Dict[str, Any]]

@app.get("/")
async def root():
    return {"message": "Lexstudio AI Backend", "status": "running"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat Mode API - simple conversation"""
    # TODO: Implement Chat Agent
    return {
        "message": f"Echo: {request.user_input}",
        "history": request.history + [
            {"role": "user", "content": request.user_input},
            {"role": "assistant", "content": f"Echo: {request.user_input}"}
        ]
    }

@app.post("/api/build")
async def build(request: BuildRequest):
    """Build Mode API - task-oriented agent"""
    # TODO: Implement Build Agent
    return {
        "message": f"Build mode echo: {request.user_input}",
        "current_step": request.current_step,
        "completed_steps": request.completed_steps,
        "asset_data": request.asset_data,
        "whitepaper_content": "",
        "contract_content": "",
        "history": request.history + [
            {"role": "user", "content": request.user_input},
            {"role": "assistant", "content": f"Build mode echo: {request.user_input}"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Step 5: Install dependencies and test**

Run:
```bash
cd chatbot
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Expected: Server starts on http://localhost:8000, visit http://localhost:8000 shows {"message": "Lexstudio AI Backend", "status": "running"}

**Step 6: Commit**

```bash
git add chatbot/
git commit -m "feat: initialize Python FastAPI backend with CORS"
```

---

## Task 5: Frontend-Backend Integration

**Files:**
- Create: `lib/api.ts`
- Modify: `app/page.tsx`

**Step 1: Create API client**

Create `lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000';

export interface ChatRequest {
  user_input: string;
  history: any[];
}

export interface BuildRequest {
  user_input: string;
  current_step: number;
  completed_steps: number[];
  phase: string;
  asset_data: Record<string, any>;
  history: any[];
}

export async function sendChatMessage(request: ChatRequest) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function sendBuildMessage(request: BuildRequest) {
  const response = await fetch(`${API_BASE_URL}/api/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
```

**Step 2: Test API integration**

Update `app/page.tsx` to test API:

```typescript
'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { sendChatMessage } from '@/lib/api';

export default function Home() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const result = await sendChatMessage({
        user_input: input,
        history: [],
      });
      setResponse(result.message);
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="font-display text-4xl mb-8">API Test</h1>
        <div className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border-b-2 border-foreground p-2 font-body"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-foreground text-background px-8 py-4 font-mono text-sm uppercase tracking-widest"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
          {response && (
            <div className="border-2 border-foreground p-4 font-body">
              {response}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

**Step 3: Test end-to-end**

1. Start Python backend: `cd chatbot && python main.py`
2. Start Next.js frontend: `pnpm run dev`
3. Visit http://localhost:3000
4. Type a message and click Send

Expected: Message is sent to backend, echo response is displayed

**Step 4: Commit**

```bash
git add lib/api.ts app/page.tsx
git commit -m "feat: integrate frontend with Python backend API"
```

---

## Task 6: Load State from localStorage on Mount

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/StoreInitializer.tsx`

**Step 1: Create StoreInitializer component**

Create `components/StoreInitializer.tsx`:

```typescript
'use client';
import { useEffect } from 'react';
import { useLexstudioStore } from '@/lib/store';

export function StoreInitializer() {
  const loadFromLocalStorage = useLexstudioStore((state) => state.loadFromLocalStorage);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return null;
}
```

**Step 2: Add to layout**

Update `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import { StoreInitializer } from '@/components/StoreInitializer';
import "./globals.css";

// ... (font configurations remain the same)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased bg-background text-foreground">
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
```

**Step 3: Test persistence**

1. Run `pnpm run dev`
2. Switch mode or add data
3. Refresh page
4. Verify state is restored

Expected: State persists across page refreshes

**Step 4: Commit**

```bash
git add components/StoreInitializer.tsx app/layout.tsx
git commit -m "feat: load Zustand state from localStorage on mount"
```

---

## Summary

**Phase 1 Foundation Complete:**
- ✅ Next.js configured with Minimalist Monochrome design system
- ✅ Tailwind CSS with pure black/white colors, 0px radius, serif fonts
- ✅ Zustand store with localStorage persistence
- ✅ Sidebar component with navigation, history, and user sections
- ✅ Python FastAPI backend with CORS
- ✅ Frontend-backend API integration
- ✅ State persistence on page load

**Next Steps:**
- Phase 2: Chat Mode (Chat interface, messages, floating input)
- Phase 3: Build Mode - Whitepaper (55/45 split, AI Console, Asset Workspace)
- Phase 4: Build Mode - Contract (Contract generation, logic linkage)
- Phase 5: Optimization & Testing

**Files Created:**
- `tailwind.config.ts` (modified)
- `app/layout.tsx` (modified)
- `app/globals.css` (modified)
- `lib/store.ts`
- `lib/types.ts`
- `lib/api.ts`
- `components/layout/Sidebar.tsx`
- `components/layout/SidebarNav.tsx`
- `components/layout/SidebarHistory.tsx`
- `components/layout/SidebarUser.tsx`
- `components/StoreInitializer.tsx`
- `chatbot/main.py`
- `chatbot/requirements.txt`
- `chatbot/.env.example`
- `chatbot/.gitignore`

**Total Commits:** 6
