# Lexstudio PoC 产品需求文档 v2.0

**项目版本：** v2.0 (Prototype)
**更新日期：** 2026-02-16
**项目目标：** 构建一个引导式的 RWA 资产建模工具，通过任务型 AI 实现白皮书与智能合约的自动化生成。

---

## 1. 产品设计哲学

### 1.1 核心原则

* **减法原则：** 隐藏 Oracle 和 Enforcer 的复杂后台逻辑，仅在结果确认或风险预警时介入。
* **任务导向：** AI 不是被动回答问题，而是主动推进"7 步走"流程。
* **确定性反馈：** 通过右侧工作区状态的"亮起"，给用户明确的进度心理暗示。
* **模式分离：** Chat Mode（闲聊）和 Build Mode（构建）完全分离，用户手动切换。

### 1.2 设计风格

**Minimalist Monochrome（极简主义单色）**

- **颜色**：纯黑白（#000000 和 #FFFFFF），无任何其他颜色
- **字体**：Serif 字体（Playfair Display、Source Serif 4、JetBrains Mono）
- **圆角**：0px，所有元素都是尖角
- **阴影**：无阴影，使用边框和反转创建层次
- **线条**：1px、2px、4px、8px 黑色边框
- **动画**：极简且即时（0-100ms 过渡）
- **负空间**：大量留白（py-24、py-32、py-40）

**视觉参考：** 高端时尚杂志、现代艺术画廊、建筑专著

---

## 2. 技术架构

### 2.1 技术栈

**前端：**
- Next.js 15 (App Router)
- React 19
- Zustand (状态管理)
- Tailwind CSS（自定义配置，遵循 Minimalist Monochrome）
- 自定义组件（不使用 shadcn/ui 默认样式）
- localStorage (会话持久化)

**字体：**
- Playfair Display (Display/Headlines)
- Source Serif 4 (Body)
- JetBrains Mono (Mono/Labels)

**后端：**
- Python FastAPI（独立后端服务，端口 8000）
- LangChain + LangGraph（任务型 Agent）
- OpenAI/Claude API
- 部署在 `chatbot/` 文件夹

### 2.2 技术方案

**混合方案：前端状态 + 后端智能**

**架构原理：**
- 前端：Zustand 管理进度、UI 状态、生成内容
- 后端：LangChain + 上下文感知 Prompt（根据前端传来的状态动态生成）

**数据流：**
```
前端维护：当前步骤、已完成步骤、用户输入
         ↓
后端接收：{ currentStep, completedSteps, userInput, history }
         ↓
LangChain 生成：根据步骤加载对应的 Prompt 模板 + 历史数据
         ↓
前端更新：对话内容 + 生成的白皮书/合约片段
         ↓
localStorage 持久化
```

**优势：**
- 清晰的关注点分离：前端管理 UI 和进度，后端管理 AI 生成
- 可控性强：进度状态明确，不依赖 AI 推断
- 灵活性高：支持自由跳转（前端直接切换 currentStep）
- 易于调试：状态清晰可见

### 2.3 目录结构

```
lexstudio/
├── app/
│   ├── page.tsx                 # 主页（Chat Mode）
│   ├── api/
│   │   ├── chat/route.ts        # Chat Mode API
│   │   └── build/route.ts       # Build Mode API
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx              # 左侧导航栏
│   │   ├── SidebarNav.tsx           # 导航栏目（Studio/Oracle/Enforcer）
│   │   ├── SidebarHistory.tsx       # 历史记录列表
│   │   └── SidebarUser.tsx          # 用户信息
│   ├── chat/
│   │   ├── ChatInterface.tsx        # Chat Mode 主界面
│   │   ├── MessageList.tsx
│   │   ├── Message.tsx              # 单条消息（黑白样式）
│   │   └── InputBox.tsx             # 悬浮岛输入框 + 模式切换
│   └── build/
│       ├── BuildInterface.tsx       # Build Mode 主界面（55/45 分屏）
│       ├── AIConsole.tsx            # 左侧 AI 对话（55%）
│       ├── AssetWorkspace.tsx       # 右侧工作区（45%）
│       ├── MilestoneTracker.tsx     # 进度点（●━━○━━○）
│       ├── PreviewTabs.tsx          # Tab 切换（Whitepaper/Contract/Arch-Map）
│       └── PreviewArea.tsx          # 预览区
├── lib/
│   ├── store.ts                 # Zustand 状态管理
│   ├── langchain.ts             # LangChain 配置
│   └── prompts/
│       ├── whitepaper/          # 白皮书 7 步 Prompt 模板
│       └── contract/            # 合约 7 步 Prompt 模板
└── types/
    └── index.ts                 # TypeScript 类型定义
```

---

## 3. 界面设计

### 3.1 整体布局（三栏结构）

```
┌────────┬─────────────────────────────────────────────┐
│        │                                             │
│  侧边栏 │              主内容区                        │
│ (240px)│         (Chat Mode / Build Mode)            │
│        │                                             │
│ 可收起  │                                             │
│        │                                             │
└────────┴─────────────────────────────────────────────┘
```

### 3.2 左侧导航栏（Sidebar）

**结构：**
```
┌──────────────────┐
│  LEXSTUDIO    [≡]│ ← Logo + 收起按钮
├──────────────────┤
│                  │
│  ● Studio        │ ← 当前页面（黑底白字）
│  ○ Oracle        │ ← 预留（白底黑字，2px 边框）
│  ○ Enforcer      │ ← 预留（白底黑字，2px 边框）
│                  │
├──────────────────┤ ← 4px 黑色横线分隔
│  HISTORY         │ ← 小标题（JetBrains Mono）
│                  │
│  ▸ Real Estate   │ ← 历史项目（可折叠）
│    Fund          │
│  ▸ Tech Startup  │
│    Token         │
│  ▸ Chat: RWA...  │ ← 历史对话
│                  │
│  [滚动区域]       │
│                  │
├──────────────────┤ ← 4px 黑色横线分隔
│  [@Founder]      │ ← 用户信息（底部固定）
│  Settings  ⚙     │
└──────────────────┘
```

**样式规范：**
- 宽度：240px（展开）/ 0px（收起）
- 背景：#FFFFFF
- 右边框：2px solid #000000
- 导航项：
  - 激活状态：黑底白字（反转）
  - 未激活：白底黑字，hover 时反转（100ms 过渡）
- 历史记录：
  - 字体：Source Serif 4，14px
  - Hover：底部 2px 黑色边框
- 用户信息：
  - 固定在底部
  - 上边框：2px solid #000000

### 3.3 Chat Mode（主内容区）

**布局：**
```
┌────────┬─────────────────────────────────────────────┐
│        │                                             │
│  侧边栏 │  [对话消息列表]                              │
│        │  - AI 消息：左对齐，白底黑字，2px 黑色边框    │
│        │  - 用户消息：右对齐，黑底白字                │
│        │                                             │
│        │                                             │
│        │                                             │
│        │  ┌─────────────────────────────────────┐   │
│        │  │ [CHAT MODE] | Build Mode           │   │ ← 模式切换
│        │  ├─────────────────────────────────────┤   │
│        │  │ Type your message...          [→]  │   │ ← 悬浮岛输入框
│        │  └─────────────────────────────────────┘   │
│        │                                             │
└────────┴─────────────────────────────────────────────┘
```

**消息样式：**
- AI 消息：
  - 背景：#FFFFFF
  - 文字：#000000
  - 边框：2px solid #000000
  - 对齐：左对齐
  - 字体：Source Serif 4，16px
- 用户消息：
  - 背景：#000000
  - 文字：#FFFFFF
  - 边框：无
  - 对齐：右对齐
  - 字体：Source Serif 4，16px

**悬浮岛输入框：**
- 位置：`fixed bottom-8 left-[240px] right-8`
- 边框：2px solid #000000
- 背景：#FFFFFF
- 底部留白：mb-8（32px）
- 无阴影，无圆角

### 3.4 Build Mode（主内容区 - 55/45 分屏）

**布局：**
```
┌────────┬──────────────────────┬──────────────────────┐
│        │  AI CONSOLE          │  ASSET WORKSPACE     │
│  侧边栏 │  (55%)               │  (45%)               │
│        ├──────────────────────┼──────────────────────┤
│        │                      │  # Asset Title       │
│        │  [对话消息]           │  Brief description   │
│        │                      │                      │
│        │  AI: 我们已经完成...  │  ●━━○━━○━━○━━○━━○━━○ │
│        │                      │  Step 1/7            │
│        │  User: 使用开曼 SPV   │                      │
│        │                      │  ┌──────────────────┐│
│        │  AI: 收到。Enforcer  │  │[Whitepaper]      ││
│        │      提示...         │  │  Contract        ││
│        │                      │  ├──────────────────┤│
│        │                      │  │                  ││
│        │  ┌──────────────────┐│  │  [预览内容]       ││
│        │  │ Type message... →││  │  - Asset Info    ││
│        │  └──────────────────┘│  │  - Valuation     ││
│        │                      │  │                  ││
│        │                      │  └──────────────────┘│
│        │                      │                      │
│        │                      │  [EXPORT]  [DEPLOY]  │
└────────┴──────────────────────┴──────────────────────┘
```

**分屏比例：**
- 左侧 AI Console：55%
- 右侧 Asset Workspace：45%
- 中间分隔线：2px solid #000000

**AI Console（左侧 55%）：**
- 对话消息列表（与 Chat Mode 相同样式）
- 悬浮岛输入框：`absolute bottom-8 left-8 right-8`（只在 AI Console 内）

**Asset Workspace（右侧 45%）：**

1. **Header（顶部）：**
   - 资产标题：Playfair Display，4xl（40px），tracking-tight
   - 简要描述：Source Serif 4，lg（18px）

2. **Milestones（进度点）：**
   ```
   ●━━○━━○━━○━━○━━○━━○
   Step 1/7: Asset Onboarding
   ```
   - 已完成：黑色实心圆（●）
   - 未完成：白色空心圆（○）
   - 连接线：2px 黑色实线
   - 当前步骤：下方显示步骤名称（JetBrains Mono，tracking-widest）

3. **Preview Area（预览区）：**
   - Tab 切换：`[Whitepaper] | Contract | Arch-Map`
   - 激活状态：底部 2px 黑色边框
   - 内容区：
     - 背景：#FFFFFF
     - 边框：2px solid #000000
     - 内边距：p-6
     - 字体：Source Serif 4，base（16px）

4. **Action Bar（操作栏）：**
   - `[EXPORT WHITEPAPER]` 按钮：
     - 默认：灰色（#525252）
     - 激活：黑底白字，hover 反转
   - `[DEPLOY CONTRACT]` 按钮：
     - 默认：灰色（#525252）
     - 激活：黑底白字，hover 反转

---

## 4. 核心交互流程

### 4.1 模式切换

**Chat Mode ↔ Build Mode：**
- 位置：输入框上方
- 样式：
  - 激活状态：底部 2px 黑色边框
  - 未激活：灰色文字（#525252）
  - 字体：JetBrains Mono，text-sm，tracking-widest，uppercase
- 切换逻辑：
  - 用户点击切换按钮
  - 前端 Zustand Store 更新 `mode` 状态
  - 界面重新渲染（Chat Mode ↔ Build Mode）

### 4.2 双轨制演进（Build Mode）

**第一阶段：白皮书构建（Phase 1: Whitepaper）**

AI 引导用户完成以下 7 个节点，每个节点确认后，右侧对应的点亮起，同时白皮书内容实时填充。

1. **Asset Onboarding：** 定义底层资产信息
2. **Valuation：** 接入 Oracle 获取估值数据
3. **Yield Design：** 设定收益率与分红频率
4. **Legal Structure：** 选择 SPV 架构与司法管辖区
5. **Compliance：** Enforcer 介入，确认合格投资者限制
6. **Tokenomics：** 定义代币总量与分配逻辑
7. **Final Review：** 全文审阅并确认

**状态变化：** 当步骤 7 完成，`[EXPORT WHITEPAPER]` 按钮激活（黑底白字）。

**第二阶段：合约构建（Phase 2: Contract）**

白皮书完成后，AI 提问："商业逻辑已锁定，是否开始技术建模？"。确认后，进度点翻转进入合约阶段。

1. **Standard Select：** 选择 ERC-3643 或 ERC-1400 等 RWA 标准
2. **Minting Logic：** 设定铸造权限与上限
3. **Transfer Rules：** 设置白名单与转账限制
4. **Compliance Integration：** 集成 Enforcer 合规检查
5. **Oracle Integration：** 集成 Oracle 数据源
6. **Testing：** 合约测试与验证
7. **Final Review：** 全文审阅并确认

**状态变化：** 当步骤 7 完成，`[DEPLOY CONTRACT]` 按钮激活（黑底白字）。

### 4.3 自由流程（可跳转）

**特性：**
- 用户可以随意跳转到任何步骤（点击进度点）
- AI 会提示哪些步骤还未完成
- 前端维护 `completedSteps` 数组，后端根据此数组生成对应的 Prompt

**跳转逻辑：**
```typescript
// 用户点击进度点
const handleStepClick = (stepIndex: number) => {
  // 更新当前步骤
  setCurrentStep(stepIndex)

  // 后端请求
  const response = await fetch('/api/build', {
    method: 'POST',
    body: JSON.stringify({
      currentStep: stepIndex,
      completedSteps: store.completedSteps,
      userInput: '',
      history: store.messages
    })
  })

  // AI 提示
  // "您跳转到了步骤 3：Yield Design。
  //  注意：步骤 1 和 2 尚未完成，可能影响后续内容生成。"
}
```

---

## 5. 功能逻辑细节

### 5.1 Logic Linkage（逻辑关联）

白皮书阶段确认的任何数值（如：Total Supply = 10,000,000），必须自动同步到合约预览区域的代码中，禁止用户手动输入导致的不一致。

**实现方式：**
- 前端 Zustand Store 维护 `assetData` 对象
- 白皮书阶段：AI 生成的数据存入 `assetData`
- 合约阶段：后端 Prompt 模板从 `assetData` 读取数据，预填充到合约代码中

**示例：**
```typescript
// Zustand Store
interface AssetData {
  name: string
  totalSupply: number
  yieldRate: number
  legalStructure: string
  // ...
}

// 合约 Prompt 模板
const contractPrompt = `
Generate a Solidity smart contract with the following parameters:
- Token Name: ${assetData.name}
- Total Supply: ${assetData.totalSupply}
- Legal Structure: ${assetData.legalStructure}
...
`
```

### 5.2 Enforcer Silent Check（静默检查）

当用户在 Chat 提出一个方案时（如：允许匿名转账），Enforcer 在后台进行校验，AI 需以婉转的方式（Apple 风格）提示：

> "为了确保合规，我们建议将转账权限限制在已认证的白名单内。"

**实现方式：**
- 后端 LangChain 集成 Enforcer 规则引擎
- 用户输入 → 后端检查 → AI 生成响应时包含合规提示

### 5.3 State Persistence（状态持久化）

用户退出再进入，进度点应停留在最后一次点亮的节点。

**实现方式：**
- 使用 localStorage 存储：
  - `currentStep`：当前步骤
  - `completedSteps`：已完成步骤数组
  - `assetData`：资产数据
  - `messages`：对话历史
  - `whitepaperContent`：白皮书内容
  - `contractContent`：合约内容

**存储时机：**
- 每次用户输入后
- 每次 AI 响应后
- 每次步骤切换后

**恢复时机：**
- 页面加载时，从 localStorage 读取数据并恢复状态

---

## 6. UI 组件样式规范

### 6.1 按钮（Buttons）

**Primary Button（黑底白字）：**
```tsx
<button className="
  bg-black text-white
  border-0
  px-8 py-4
  font-mono text-sm uppercase tracking-widest font-medium
  hover:bg-white hover:text-black hover:border-2 hover:border-black
  transition-none
">
  EXPORT WHITEPAPER
</button>
```

**Secondary Button（白底黑字，黑色边框）：**
```tsx
<button className="
  bg-transparent text-black
  border-2 border-black
  px-8 py-4
  font-mono text-sm uppercase tracking-widest font-medium
  hover:bg-black hover:text-white
  transition-colors duration-100
">
  CANCEL
</button>
```

### 6.2 输入框（Input）

**悬浮岛输入框：**
```tsx
<div className="border-2 border-black bg-white p-4">
  <input
    className="
      w-full
      border-b-2 border-black
      bg-transparent
      font-body text-base
      placeholder:text-mutedForeground placeholder:italic
      focus:border-b-4 focus:outline-none
    "
    placeholder="Type your message..."
  />
</div>
```

### 6.3 消息卡片（Message Card）

**AI 消息：**
```tsx
<div className="
  bg-white text-black
  border-2 border-black
  p-6
  font-body text-base leading-relaxed
">
  {content}
</div>
```

**用户消息：**
```tsx
<div className="
  bg-black text-white
  p-6
  font-body text-base leading-relaxed
">
  {content}
</div>
```

### 6.4 进度点（Milestone Tracker）

```tsx
<div className="flex items-center gap-2">
  {steps.map((step, index) => (
    <React.Fragment key={index}>
      {/* 进度点 */}
      <button
        onClick={() => handleStepClick(index)}
        className={`
          w-4 h-4 rounded-full border-2 border-black
          ${completedSteps.includes(index) ? 'bg-black' : 'bg-white'}
          hover:scale-110 transition-transform duration-100
        `}
      />

      {/* 连接线 */}
      {index < steps.length - 1 && (
        <div className="w-8 h-0.5 bg-black" />
      )}
    </React.Fragment>
  ))}
</div>

{/* 当前步骤名称 */}
<p className="font-mono text-xs uppercase tracking-widest mt-2">
  Step {currentStep + 1}/7: {steps[currentStep].name}
</p>
```

---

## 7. 技术实现细节

### 7.1 Zustand Store 结构

```typescript
interface LexstudioStore {
  // 模式
  mode: 'chat' | 'build'
  setMode: (mode: 'chat' | 'build') => void

  // Build Mode 状态
  currentStep: number
  completedSteps: number[]
  phase: 'whitepaper' | 'contract'

  // 资产数据
  assetData: AssetData
  updateAssetData: (data: Partial<AssetData>) => void

  // 对话历史
  messages: Message[]
  addMessage: (message: Message) => void

  // 生成内容
  whitepaperContent: string
  contractContent: string
  updateWhitepaper: (content: string) => void
  updateContract: (content: string) => void

  // 持久化
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}
```

### 7.2 API 路由设计

**Chat Mode API：**
```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { userInput, history } = await req.json()

  // LangChain 简单对话
  const response = await chatChain.call({
    input: userInput,
    history: history
  })

  return Response.json({ message: response.text })
}
```

**Build Mode API：**
```typescript
// app/api/build/route.ts
export async function POST(req: Request) {
  const { currentStep, completedSteps, userInput, history, assetData } = await req.json()

  // 加载对应步骤的 Prompt 模板
  const promptTemplate = loadPromptTemplate(currentStep)

  // LangChain 生成响应
  const response = await buildChain.call({
    input: userInput,
    history: history,
    assetData: assetData,
    promptTemplate: promptTemplate
  })

  return Response.json({
    message: response.text,
    updatedAssetData: response.assetData,
    whitepaperFragment: response.whitepaperFragment,
    contractFragment: response.contractFragment
  })
}
```

### 7.3 Prompt 模板结构

**白皮书步骤 1：Asset Onboarding**
```typescript
// lib/prompts/whitepaper/01-asset-onboarding.ts
export const assetOnboardingPrompt = `
You are an expert RWA (Real World Asset) consultant helping a user tokenize their asset.

Current Step: Asset Onboarding (Step 1/7)
Objective: Define the underlying asset information.

Ask the user the following questions one by one:
1. What type of asset are you tokenizing? (Real Estate, Art, Commodities, etc.)
2. What is the asset's current valuation?
3. Where is the asset located?
4. What is the asset's legal ownership structure?

Based on the user's answers, generate a structured asset profile and update the whitepaper.

User Input: {userInput}
History: {history}
Asset Data: {assetData}

Response Format:
- Conversational AI message
- Updated asset data (JSON)
- Whitepaper fragment (Markdown)
`
```

---

## 8. 后端 Chatbot 架构（参考 taskbot_example.py）

### 8.1 架构概述

**独立 Python 后端服务：**
- 位置：`chatbot/` 文件夹（项目根目录）
- 框架：FastAPI
- 端口：8000
- 技术栈：LangChain + LangGraph（任务型 Agent）

**与前端通信：**
```
Next.js Frontend (localhost:3000)
         ↓ HTTP POST
FastAPI Backend (localhost:8000)
         ↓ LangChain/LangGraph
OpenAI/Claude API
```

### 8.2 目录结构

```
chatbot/
├── main.py                      # FastAPI 主入口
├── requirements.txt             # Python 依赖
├── .env                         # 环境变量（API Keys）
├── agents/
│   ├── __init__.py
│   ├── chat_agent.py            # Chat Mode Agent
│   └── build_agent.py           # Build Mode Agent
├── states/
│   ├── __init__.py
│   ├── chat_state.py            # Chat Mode State
│   └── build_state.py           # Build Mode State（参考 CustomState）
├── tools/
│   ├── __init__.py
│   ├── save_whitepaper_step.py  # 保存白皮书步骤信息
│   ├── save_contract_step.py    # 保存合约步骤信息
│   └── enforcer_check.py        # Enforcer 合规检查
├── prompts/
│   ├── __init__.py
│   ├── whitepaper/              # 白皮书 7 步 Prompt
│   │   ├── step1_asset_onboarding.py
│   │   ├── step2_valuation.py
│   │   ├── step3_yield_design.py
│   │   ├── step4_legal_structure.py
│   │   ├── step5_compliance.py
│   │   ├── step6_tokenomics.py
│   │   └── step7_final_review.py
│   └── contract/                # 合约 7 步 Prompt
│       ├── step1_standard_select.py
│       ├── step2_minting_logic.py
│       ├── step3_transfer_rules.py
│       ├── step4_compliance_integration.py
│       ├── step5_oracle_integration.py
│       ├── step6_testing.py
│       └── step7_final_review.py
└── utils/
    ├── __init__.py
    └── helpers.py               # 辅助函数
```

### 8.3 核心实现（参考 taskbot_example.py）

**1. Build Mode State（参考 CustomState）**

```python
# chatbot/states/build_state.py
from langgraph.graph import AgentState
from typing import Optional, Literal, Dict, List

class BuildState(AgentState):
    """Build Mode 的自定义状态"""

    # 当前步骤和阶段
    current_step: Optional[int] = 0  # 0-6（7 个步骤）
    completed_steps: Optional[List[int]] = []
    phase: Optional[Literal["whitepaper", "contract"]] = "whitepaper"

    # 资产数据（类似 taskbot 的 jack_sizes, pant_sizes）
    asset_name: Optional[str] = None
    asset_type: Optional[str] = None
    asset_valuation: Optional[float] = None
    yield_rate: Optional[float] = None
    legal_structure: Optional[str] = None
    compliance_status: Optional[str] = None
    total_supply: Optional[int] = None

    # 生成内容
    whitepaper_content: Optional[str] = ""
    contract_content: Optional[str] = ""

    # 状态标记
    whitepaper_completed: Optional[bool] = False
    contract_completed: Optional[bool] = False
```

**2. System Prompt（参考 taskbot 的 SYSTEM）**

```python
# chatbot/prompts/whitepaper/step1_asset_onboarding.py
ASSET_ONBOARDING_PROMPT = """
You are an expert RWA (Real World Asset) consultant helping a user tokenize their asset.

Current Step: Asset Onboarding (Step 1/7)
Phase: Whitepaper Construction
Objective: Define the underlying asset information.

IMPORTANT RULES:
- Ask questions ONE AT A TIME to gather information
- Be conversational and professional
- Once user confirms all information, call save_whitepaper_step tool
- Generate a whitepaper fragment based on collected information

Questions to ask (in order):
1. What type of asset are you tokenizing? (Real Estate, Art, Commodities, Securities, etc.)
2. What is the asset's current valuation?
3. Where is the asset located?
4. What is the asset's legal ownership structure?

Available Options:
- Asset Types: Real Estate, Art, Commodities, Securities, Intellectual Property
- Valuation: Any positive number (USD)
- Location: Any country/region
- Ownership: Individual, Corporate, Trust, SPV

Example: When user says "yes, that's correct", immediately call save_whitepaper_step(
    asset_type="Real Estate",
    asset_valuation=5000000,
    location="New York",
    ownership="SPV"
).
"""
```

**3. Tools（参考 taskbot 的 save_all_info）**

```python
# chatbot/tools/save_whitepaper_step.py
from langchain.tools import tool, ToolRuntime
from langgraph.types import Command
from langchain.messages import ToolMessage

@tool
def save_whitepaper_step(
    step: int,
    asset_type: str = None,
    asset_valuation: float = None,
    yield_rate: float = None,
    legal_structure: str = None,
    compliance_status: str = None,
    total_supply: int = None,
    runtime: ToolRuntime = None
) -> Command:
    """Save whitepaper step information and update state"""

    tool_call_id = runtime.tool_call_id

    # 生成白皮书片段
    whitepaper_fragment = generate_whitepaper_fragment(
        step=step,
        asset_type=asset_type,
        asset_valuation=asset_valuation,
        # ...
    )

    # 更新状态
    update_dict = {
        "messages": [
            ToolMessage(
                content=f"Step {step} information saved successfully.",
                tool_call_id=tool_call_id
            )
        ],
        "completed_steps": runtime.state.get("completed_steps", []) + [step],
        "whitepaper_content": runtime.state.get("whitepaper_content", "") + whitepaper_fragment
    }

    # 添加具体字段
    if asset_type:
        update_dict["asset_type"] = asset_type
    if asset_valuation:
        update_dict["asset_valuation"] = asset_valuation
    # ...

    return Command(update=update_dict)
```

**4. Agent 创建（参考 taskbot 的 create_agent）**

```python
# chatbot/agents/build_agent.py
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from states.build_state import BuildState
from tools.save_whitepaper_step import save_whitepaper_step
from tools.save_contract_step import save_contract_step
from tools.enforcer_check import enforcer_check
from prompts.whitepaper.step1_asset_onboarding import ASSET_ONBOARDING_PROMPT

load_dotenv()
llm = ChatOpenAI(model="gpt-4")

def create_build_agent(current_step: int, phase: str):
    """根据当前步骤和阶段创建对应的 Agent"""

    # 加载对应的 Prompt
    if phase == "whitepaper":
        system_prompt = load_whitepaper_prompt(current_step)
        tools = [save_whitepaper_step, enforcer_check]
    else:
        system_prompt = load_contract_prompt(current_step)
        tools = [save_contract_step, enforcer_check]

    # 创建 Agent
    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_prompt,
        state_schema=BuildState,
    )

    return agent
```

**5. FastAPI 端点**

```python
# chatbot/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.chat_agent import create_chat_agent
from agents.build_agent import create_build_agent

app = FastAPI()

# CORS 配置（允许 Next.js 前端访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_input: str
    history: list

class BuildRequest(BaseModel):
    user_input: str
    current_step: int
    completed_steps: list
    phase: str
    asset_data: dict
    history: list

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat Mode API"""
    agent = create_chat_agent()
    state = agent.invoke({
        "messages": request.history + [request.user_input]
    })

    return {
        "message": state["messages"][-1].content,
        "history": state["messages"]
    }

@app.post("/api/build")
async def build(request: BuildRequest):
    """Build Mode API"""
    agent = create_build_agent(
        current_step=request.current_step,
        phase=request.phase
    )

    # 构建初始状态
    initial_state = {
        "messages": request.history + [request.user_input],
        "current_step": request.current_step,
        "completed_steps": request.completed_steps,
        "phase": request.phase,
        **request.asset_data
    }

    # 调用 Agent
    state = agent.invoke(initial_state)

    return {
        "message": state["messages"][-1].content,
        "current_step": state.get("current_step"),
        "completed_steps": state.get("completed_steps"),
        "asset_data": {
            "asset_type": state.get("asset_type"),
            "asset_valuation": state.get("asset_valuation"),
            "yield_rate": state.get("yield_rate"),
            "legal_structure": state.get("legal_structure"),
            "total_supply": state.get("total_supply"),
            # ...
        },
        "whitepaper_content": state.get("whitepaper_content"),
        "contract_content": state.get("contract_content"),
        "history": state["messages"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 8.4 前端集成

**Next.js API 代理（可选）：**

```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const body = await req.json()

  // 转发到 Python 后端
  const response = await fetch('http://localhost:8000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await response.json()
  return Response.json(data)
}
```

**或直接从前端调用：**

```typescript
// lib/api.ts
export async function sendChatMessage(userInput: string, history: any[]) {
  const response = await fetch('http://localhost:8000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_input: userInput, history })
  })

  return response.json()
}

export async function sendBuildMessage(params: BuildRequest) {
  const response = await fetch('http://localhost:8000/api/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })

  return response.json()
}
```

### 8.5 部署与运行

**开发环境：**

```bash
# 1. 启动 Python 后端
cd chatbot
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py  # 运行在 localhost:8000

# 2. 启动 Next.js 前端
cd ..
pnpm install
pnpm run dev  # 运行在 localhost:3000
```

**requirements.txt：**
```
fastapi==0.115.0
uvicorn==0.32.0
langchain==0.3.0
langchain-openai==0.2.0
langgraph==0.2.0
python-dotenv==1.0.0
pydantic==2.9.0
```

**.env 示例：**
```
OPENAI_API_KEY=sk-...
# 或
ANTHROPIC_API_KEY=sk-ant-...
```

### 8.6 关键优势（参考 taskbot_example.py）

1. **任务型 AI**：使用 LangGraph 的 create_agent，AI 主动推进流程
2. **状态管理**：自定义 State 清晰管理所有数据
3. **Tool 调用**：通过 Tool 保存确认信息，触发状态更新
4. **灵活切换**：根据 current_step 和 phase 动态加载 Prompt
5. **独立部署**：Python 后端独立运行，易于扩展和维护

---

## 9. 开发优先级

### Phase 1：基础架构（Week 1）
1. Next.js 项目初始化
2. Tailwind 配置（Minimalist Monochrome）
3. 字体集成（Playfair Display、Source Serif 4、JetBrains Mono）
4. Zustand Store 设置
5. 左侧导航栏组件
6. **Python 后端初始化（chatbot/ 文件夹）**
7. **FastAPI 基础设置 + CORS 配置**

### Phase 2：Chat Mode（Week 2）
1. Chat 界面布局
2. 消息组件（AI/用户消息）
3. 悬浮岛输入框
4. **Chat Agent 实现（参考 taskbot_example.py）**
5. **前后端集成（Next.js ↔ FastAPI）**
6. localStorage 持久化

### Phase 3：Build Mode - 白皮书（Week 3-4）
1. Build Mode 布局（55/45 分屏）
2. AI Console 组件
3. Asset Workspace 组件
4. 进度点组件
5. **Build Agent 实现（自定义 State + Tools）**
6. **白皮书 7 步 Prompt 模板**
7. 白皮书预览区
8. **save_whitepaper_step Tool 实现**

### Phase 4：Build Mode - 合约（Week 5-6）
1. **合约 7 步 Prompt 模板**
2. 合约预览区
3. 逻辑关联（白皮书 → 合约）
4. **Enforcer 静默检查 Tool**
5. **save_contract_step Tool 实现**
6. 导出/部署功能

### Phase 5：优化与测试（Week 7）
1. UI 细节优化
2. 动画与交互优化
3. 响应式设计
4. **后端性能优化**
5. 测试与 Bug 修复

---

## 10. 成功标准

### 9.1 功能完整性
- ✅ Chat Mode 和 Build Mode 可以正常切换
- ✅ 白皮书 7 步流程可以完整走通
- ✅ 合约 7 步流程可以完整走通
- ✅ 进度点可以自由跳转
- ✅ 白皮书和合约数据自动同步
- ✅ 状态可以持久化（localStorage）

### 9.2 UI 设计一致性
- ✅ 严格遵循 Minimalist Monochrome 设计原则
- ✅ 纯黑白配色，无其他颜色
- ✅ 0px 圆角，无阴影
- ✅ Serif 字体（Playfair Display、Source Serif 4）
- ✅ 悬浮岛输入框效果
- ✅ 左侧导航栏可收起

### 9.3 用户体验
- ✅ AI 引导流程清晰自然
- ✅ 进度反馈明确（进度点亮起）
- ✅ 实时预览白皮书/合约内容
- ✅ 交互响应迅速（0-100ms 过渡）
- ✅ 界面简洁优雅，符合高端品牌调性

---

## 10. 附录

### 10.1 Tailwind 配置示例

```javascript
// tailwind.config.js
module.exports = {
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
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
}
```

### 10.2 字体引入示例

```typescript
// app/layout.tsx
import { Playfair_Display, Source_Serif_4, JetBrains_Mono } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  )
}
```

---

**文档结束**
