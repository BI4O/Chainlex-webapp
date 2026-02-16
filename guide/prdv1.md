这份 PRD（产品需求文档）旨在为你的 **Lexstudio PoC (概念验证)** 提供清晰的开发框架。它结合了你对 Apple 极简主义的追求、任务型 AI 的逻辑以及 RWA 业务的深度。

---

# Lexstudio PoC 产品需求文档 (PRD)

**项目版本：** v1.0 (Prototype)
**项目目标：** 构建一个引导式的 RWA 资产建模工具，通过任务型 AI 实现白皮书与智能合约的自动化生成。

---

## 1. 产品设计哲学

* **减法原则：** 隐藏 Oracle 和 Enforcer 的复杂后台逻辑，仅在结果确认或风险预警时介入。
* **任务导向：** AI 不是被动回答问题，而是主动推进“7 步走”流程。
* **确定性反馈：** 通过右侧工作区状态的“亮起”，给用户明确的进度心理暗示。

---

## 2. 界面布局 (UI Architecture)

### 2.1 全局侧边栏 (Navigation)

* **Lexstudio:** 核心入口，包含 Chat (闲聊模式) 和 Build (构建模式)。
* **Oracle/Enforcer:** 默认静默，仅作为数据和合规的后台支撑。

### 2.2 构建模式工作区 (Build Mode Workspace)

采用 40/60 分屏布局：

* **左侧 (AI Console):** 任务流对话框，底部输入框随任务状态更新 Placeholder。
* **右侧 (Asset Workspace):** 1.  **Header:** 资产标题 + 简要描述。
2.  **Milestones:** 7 个线性排列的进度点（从灰色到高亮蓝）。
3.  **Preview Area:** 通过 Toggle 切换 `[Whitepaper]`、`[Contract]`、`[Arch-Map]`。
4.  **Action Bar:** `[Export Whitepaper]` 和 `[Deploy Contract]` 按钮。

---

## 3. 核心交互流程：双轨制演进 (Dual-Track)

### 第一阶段：白皮书构建 (Phase 1: Whitepaper)

AI 引导用户完成以下 7 个节点，每个节点确认后，右侧对应的点亮起，同时白皮书内容实时填充。

1. **Asset Onboarding:** 定义底层资产信息。
2. **Valuation:** 接入 Oracle 获取估值数据。
3. **Yield Design:** 设定收益率与分红频率。
4. **Legal Structure:** 选择 SPV 架构与司法管辖区。
5. **Compliance:** Enforcer 介入，确认合格投资者限制。
6. **Tokenomics:** 定义代币总量与分配逻辑。
7. **Final Review:** 全文审阅并确认。

**状态变化：** 当步骤 7 完成，`[Export Whitepaper]` 按钮激活。

### 第二阶段：合约构建 (Phase 2: Contract)

白皮书完成后，AI 提问：“商业逻辑已锁定，是否开始技术建模？”。确认后，进度点翻转进入合约阶段。

1. **Standard Select:** 选择 ERC-3643 或 ERC-1400 等 RWA 标准。
2. **Minting Logic:** 设定铸造权限与上限。
3. **Transfer Rules:** 设置白名单与转账限制。
4. ... (以此类推至第 7 步)

---

## 4. UI 界面演示 (ASCII Prototypes)

### 场景 A：白皮书构建中 (进度 40%)

```text
_______________________________________________________________________________
| NAV |  Lexstudio   Chat  [ BUILD ]                         ( @Founder )     |
|-----|-----------------------------------------------------------------------|
| [L] |  AI CONSOLE                    |  WORKSPACE: RWA BLUEPRINT            |
|     |--------------------------------|--------------------------------------|
| [O] | AI: 我们已经完成了估值。          | # New York Real Estate Fund          |
|     |     现在我们需要确定法律实体。    | Tokenizing a midtown office building.|
| [E] |                                |                                      |
|     | User: 使用开曼 SPV 结构。        | (O)---(O)---[●]---( )---( )---( )---( )|
|-----|                                |   Stage: Legal Structure Definition   |
| [S] | AI: 收到。Enforcer 提示该结构     | ------------------------------------ |
|     |     符合 Reg S 豁免要求。        | [ WHITEPAPER ]  Contract    Arch-Map |
|     |     法律章节已生成，请看右侧。    | |                                  | |
|     |                                | | > Legal Entity: Cayman SPV       | |
|     | [ Enter command...          ]  | | > Regulatory: SEC Reg S          | |
|     |                                | |__________________________________| |
|     |                                |                                      |
|     |                                | [ Export (Grey) ]    [ Deploy (Grey) ]|
|_____|________________________________|______________________________________|

```

### 场景 B：白皮书完成，进入合约阶段

```text
_______________________________________________________________________________
| NAV |  Lexstudio   Chat  [ BUILD ]                         ( @Founder )     |
|-----|-----------------------------------------------------------------------|
| [L] |  AI CONSOLE                    |  WORKSPACE: SMART CONTRACT           |
|     |--------------------------------|--------------------------------------|
| [O] | AI: 商业逻辑已定稿。             | # New York Real Estate Fund          |
|     |     现在我们开始配置代码。        | Generating Solidity Smart Contracts. |
| [E] |                                |                                      |
|     | User: 选择 ERC-3643 标准。      | [●]---( )---( )---( )---( )---( )---( )|
|-----|                                |   Stage: Token Standard Selection    |
| [S] | AI: 已选择标准。由于你在白皮书    | ------------------------------------ |
|     |     中设定了 50M 总量，          | Whitepaper  [ CONTRACT ]    Arch-Map |
|     |     代码中的 MaxSupply 已预填。  | |                                  | |
|     |                                | | contract RWAToken is Mintable {  | |
|     | [ Enter command...          ]  | |    uint256 public maxSupply = 50M| |
|     |                                | |__________________________________| |
|     |                                |                                      |
|     |                                | [ Export (BLUE) ]    [ Deploy (Grey) ]|
|_____|________________________________|______________________________________|

```

---

## 5. 功能逻辑细节 (Functional Logic)

* **Logic Linkage (逻辑关联):** 白皮书阶段确认的任何数值（如：Total Supply = 10,000,000），必须自动同步到合约预览区域的代码中，禁止用户手动输入导致的不一致。
* **Enforcer Silent Check (静默检查):** 当用户在 Chat 提出一个方案时（如：允许匿名转账），Enforcer 在后台进行校验，AI 需以婉转的方式（Apple 风格）提示：“为了确保合规，我们建议将转账权限限制在已认证的白名单内。”
* **State Persistence (状态持久化):** 用户退出再进入，进度点应停留在最后一次点亮的节点。
