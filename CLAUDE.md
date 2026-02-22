# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lexstudio** (Chainlex.ai) is an AI-powered RWA (Real-World Asset) tokenization modeling tool. It guides users through a structured 7-step workflow to generate whitepapers and smart contracts for tokenized assets.

## Commands

### Frontend (Next.js)
```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server at localhost:3000
pnpm run build        # Production build
pnpm run lint         # ESLint check
```

### Backend (FastAPI + Python)
```bash
cd chatbot
python -m venv venv
source venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
python main.py                # Start at localhost:8000
```

### Environment Variables
- Frontend: `NEXT_PUBLIC_API_URL=http://localhost:8000` (`.env.local`)
- Backend (`.env` in `chatbot/`): `MODEL_NAME`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`

## Architecture

### Dual-Mode Application
The app has two primary modes managed by Zustand:
- **Chat Mode** (`components/chat/`): Free-form AI consultation
- **Build Mode** (`components/build/`): Guided 7-step workflow (Whitepaper → Contract phases)

### Directory Structure
```
app/                    # Next.js App Router pages
components/
  layout/               # Sidebar, nav, history
  chat/                 # Chat mode UI
  build/                # Build mode UI (split-pane: AIConsole 55% + AssetWorkspace 45%)
lib/
  store.ts              # Zustand global state (single source of truth)
  types.ts              # TypeScript interfaces
  api.ts                # HTTP client (base: localhost:8000)
chatbot/                # Python FastAPI backend
  main.py               # FastAPI app, CORS, all routes
  agents/
    chat_agent.py       # Chat mode LangChain agent
    build_agent.py      # Build mode agent (7-step workflow, step-specific prompts)
guide/                  # PRD and design documentation
```

### State Management (Zustand — `lib/store.ts`)
All UI and session state lives in a single Zustand store with localStorage persistence (key: `'lexstudio-state'`). Key state slices:
- `mode`: `'chat' | 'build'`
- `currentStep` / `completedSteps`: Build workflow position (0–6)
- `phase`: `'whitepaper' | 'contract'`
- `assetData`: Collected asset metadata across steps
- `sessions` / `currentSessionId`: Multi-session chat history
- `whitepaperContent` / `contractContent`: AI-generated documents
- `isGenerating`: Streaming state flag

### Streaming Architecture
`components/chat/InputBox.tsx` implements streaming via `fetch() + response.body.getReader()` (SSE). It:
1. Adds a placeholder `"..."` message to the store
2. Reads the SSE stream character-by-character
3. Updates the placeholder in-place
4. Falls back to non-streaming on error
5. Saves to localStorage on completion

### Backend API Routes
| Endpoint | Purpose |
|----------|---------|
| `POST /api/chat/stream` | Chat mode streaming |
| `POST /api/chat` | Chat mode non-streaming |
| `POST /api/build/stream` | Build mode streaming |
| `POST /api/build` | Build mode non-streaming |
| `POST /api/build/content` | Generate step-specific content |
| `POST /api/build/title` | Generate project title |

Build requests include `current_step`, `completed_steps`, `phase`, and `asset_data` so the backend applies step-specific prompts.

### Build Workflow Steps
**Whitepaper Phase**: Asset Onboarding → Valuation → Yield Design → Legal Structure → Compliance → Tokenomics → Final Review

**Contract Phase**: Standard Select → Minting Logic → Transfer Rules → Compliance Integration → Oracle Integration → Testing → Final Review

## Design System

Full UI design principles are documented in **`guide/ui_guide.md`** — read this before adding any new UI components to maintain visual consistency.

CSS custom properties are defined in `app/globals.css`. Key values:
- **Colors**: Background `#f0f2f5`, Cards `#FFFFFF`, Text `#000000`, Accent `#324998` (navy — the only brand color)
- **Fonts**: Inter (all UI text), JetBrains Mono (code/labels)
- **Border radius**: `8px` (buttons), `12px` (cards/inputs), `16px` (large panels)
- **Shadows**: Apple HIG style — `shadow-sm` at rest, `shadow-md` on hover
- **Messages**: AI = white bg + `border-[#E5E7EB]` + `rounded-xl`, left-aligned; User = `bg-[#324998]` + white text + `rounded-xl`, right-aligned
- **Build Mode input**: Entire input container inverts to `bg-[#324998]` as a mode indicator
