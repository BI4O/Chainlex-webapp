# Lexstudio UI 设计准则

**版本：** v1.0
**基准：** 以现行代码实现为准（非原始 PRD）
**设计语言：** Quiet Professional — 极简主义 × Apple HIG × 编辑风格

---

## 一、设计哲学

### 核心信条

这套设计系统的本质是**"减法专业主义"**：通过减少视觉噪音，让用户注意力完全集中在内容和任务本身。它不是极端的纯黑白主义，而是在克制的色彩体系下，借助精准的阴影、圆角和过渡，传递高端工具软件的品质感。

三条底线：
1. **不添加多余颜色** — 整个界面只有两个语义色：`#000000`（前景）和 `#324998`（强调/交互），背景系统由灰度构成。
2. **不制造视觉震动** — 没有高饱和度颜色、没有突兀的动画、没有多余的装饰元素。
3. **状态必须可感知** — 所有交互状态（hover、active、disabled、loading）必须有明确且克制的视觉反馈。

---

## 二、色彩系统

### 基础色盘

| 变量 | 值 | 用途 |
|------|-----|------|
| `--background-canvas` | `#f0f2f5` | 全局画布背景，所有页面底色 |
| `--card-default` | `#FFFFFF` | 卡片、面板、侧边栏底色 |
| `--foreground` | `#000000` | 主文字色 |
| `--foreground-muted` | `#00000080`（50%透明） | 次要文字、占位符 |
| `--foreground-subtle` | `#000000CC`（80%透明） | 辅助说明文字 |
| `--accent` | `#324998` | **唯一强调色**：主按钮、激活状态、链接 |
| `--border-default` | `#E5E7EB` | 卡片边框、分隔线 |
| `--border-hover` | `#000000` | 强调边框（不常用） |

### 使用原则

- **`#f0f2f5` 是画布，`#FFFFFF` 是卡片** — 两者之间形成微妙的层次感，不需要额外阴影就能区分层级。
- **`#324998` 只用于语义性交互** — 按钮、当前激活项、标签下划线、进度点。绝不用于纯装饰目的。
- **禁止引入第三个品牌色** — 如需传递状态（成功/警告/错误），使用绿色/黄色/红色的系统色，但应保持低饱和度。
- **文字透明度是层级工具** — 用 `opacity-50`（次要）和 `opacity-80`（辅助）而不是引入新的灰色值。

### 特殊语境：Build Mode 输入框

Build Mode 下，输入框整体为 `#324998` 深蓝底色，此时内部文字改为白色，按钮反转为白底蓝字。这是整个应用中**唯一一处深色容器**，用于传递"进入构建模式"的强烈状态感知。

---

## 三、圆角系统

| 变量 | 值 | 适用场景 |
|------|-----|---------|
| `--radius-sm` | `8px` (`rounded-lg`) | 按钮、小标签、折叠按钮 |
| `--radius` | `12px` (`rounded-xl`) | 卡片、输入容器、消息气泡、面板 |
| `--radius-lg` | `16px` (`rounded-2xl`) | 模态框、大型浮层 |

**原则：** 圆角是统一的，不混用。同一类型的组件（如所有卡片）使用相同的圆角值。禁止使用 `rounded-full` 于方形元素（仅圆形进度点允许）。

---

## 四、阴影系统

基于 Apple HIG 风格，阴影极其克制，仅用于表达**物理层级**，而不是装饰。

| 变量 | 值 | 用途 |
|------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 静止状态的卡片边框补充 |
| `--shadow` | `0 1px 3px rgba(0,0,0,0.1)` | 默认卡片 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | hover 时的卡片、消息气泡 |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | 浮动输入框、Modal |

**原则：**
- 静止 → `shadow-sm`，hover → `shadow-md`，这条升级规律几乎适用于所有可交互卡片。
- 阴影永远是**黑色低透明度**，禁止有色阴影。
- 不要过度叠加，一个元素只有一个阴影层级。

---

## 五、字体系统

| 变量 | 字体 | 用途 |
|------|------|------|
| `--font-body` | Inter | **所有文字的默认字体** — 正文、按钮、标签、UI 元素 |
| `--font-mono` | JetBrains Mono | 代码块、步骤编号、技术标签 |
| `--font-display` | Inter（Bold） | 大标题（目前与 body 同源，通过字重区分） |

> **注意：** 原始 PRD 设计了 Playfair Display + Source Serif 4 的 Serif 字体组合，但实现版本已统一切换为 Inter 无衬线字体体系。后续新增功能请继续使用 Inter，**不要引入 Serif 字体**。

### 字号与字重规范

- **标题（卡片内）：** `text-base font-semibold` 或 `text-sm font-semibold`
- **正文：** `text-base font-normal`，行高 `leading-relaxed`
- **标签/辅助：** `text-xs font-medium` 或 `text-sm text-gray-500`
- **按钮文字：** `text-sm font-medium`
- **Logo/品牌名：** `text-xl font-bold tracking-tight`（`font-body`）

---

## 六、组件规范

### 6.1 按钮

**Primary（主按钮）— 用于核心操作**
```
bg-[#324998] text-white rounded-lg
hover:bg-[#2a3d7f]
active:scale-[0.98]
shadow-sm hover:shadow-md
transition-all duration-200
```

**Secondary（次要按钮）— 用于辅助操作**
```
bg-white text-black border border-[#E5E7EB] rounded-lg
hover:bg-[#324998] hover:text-white hover:shadow-sm
transition-all duration-200
```

**Disabled 状态（通用）**
```
bg-gray-100 text-gray-400 cursor-not-allowed
（移除所有 hover 效果，移除阴影）
```

**反色按钮（用于深色容器内，如 Build Mode 输入框）**
```
bg-white text-[#324998] border-white rounded-lg
hover:bg-[#324998] hover:text-white
```

### 6.2 卡片

所有卡片遵循统一结构：
```
bg-white rounded-xl border border-[#E5E7EB] shadow-sm
```

hover 可交互卡片加上：
```
hover:shadow-md transition-all duration-200
```

卡片内的分隔线使用 `border-b border-gray-200` 而不是单独的 `<hr>`。

### 6.3 消息气泡

**AI 消息（白色气泡，左对齐）**
```
bg-white text-black
border border-[#E5E7EB]
rounded-xl shadow-md
px-6 py-4
max-w-[85%]
hover:shadow-lg
```

**用户消息（蓝色气泡，右对齐）**
```
bg-[#324998] text-white
rounded-xl shadow-md
px-6 py-4
max-w-[85%]
hover:shadow-lg
```

AI 消息内的 Markdown 使用 `prose prose-sm` 渲染，标题颜色为黑色，`h2` 为 `#324998`。

### 6.4 输入框容器

Chat Mode（白色容器）：
```
bg-white border border-[#E5E7EB] rounded-xl shadow-lg
输入框内文字：text-black placeholder:text-gray-500
发送按钮：bg-[#324998] text-white，hover:bg-black
```

Build Mode（蓝色容器）：
```
bg-[#324998] border border-[#324998] rounded-xl shadow-lg
输入框内文字：text-white placeholder:text-gray-400
发送按钮：bg-white text-[#324998]，hover:bg-[#324998] hover:text-white
```

输入框容器顶部有模式切换栏（Mode toggle），使用 `border-b` 分隔，内含滑块式 Toggle。

### 6.5 Tab 导航

```
激活状态：text-[#324998] + absolute bottom 的 h-0.5 bg-[#324998] 下划线
未激活：text-gray-500，hover:text-gray-700
容器：border-b border-gray-200
```

Tab 文字：`font-body text-sm font-medium`

### 6.6 进度点（Milestone Tracker）

```
点（圆形按钮，w-6 h-6）：
  已完成：bg-[#324998] border-[#324998] text-white
  未完成：bg-white border-[#324998] text-[#324998]
  当前步骤：额外的 ring-2 ring-[#324998] ring-offset-2 ring-offset-[#f0f2f5]

连接线：w-8 h-0.5 bg-[#E5E7EB]

步骤标签：font-body text-sm font-medium text-center text-[#324998]
```

点的 hover 效果：`hover:scale-110 transition-all duration-200`

### 6.7 侧边栏

- 宽度：展开 `w-60`（240px），折叠 `w-8`（32px）
- 背景：`bg-white`
- 右边框：`border-r border-[#E5E7EB] shadow-sm`
- 分隔线：`h-px bg-[#E5E7EB]`
- 导航项激活：`bg-[#324998] text-white shadow-md`
- 导航项默认：`bg-white text-black border border-[#E5E7EB] hover:bg-[#324998] hover:text-white`

### 6.8 空状态（Empty State）

使用居中的图标 + 说明文字：
```
flex flex-col items-center justify-center h-full text-gray-400
图标：w-16 h-16，strokeWidth={1.5}
文字：font-body text-center text-sm max-w-xs
```

图标使用 Heroicons 风格的 SVG（`fill="none"` + `stroke="currentColor"`）。

---

## 七、布局系统

### 整体结构

```
[Sidebar 240px] | [Main Content 剩余宽度]
```

- 画布背景 `#f0f2f5` 作为所有内容的底色
- Chat Mode：单栏，输入框 `fixed` 在底部
- Build Mode：双栏（AI Console 55% | Asset Workspace 45%），中间 `border-r border-[#E5E7EB]`

### 间距规范

- 卡片内边距：`p-6`（24px）或 `px-6 py-4`（小卡片）
- 卡片组之间：`pb-4` 或 `space-y-4`
- 页面边距：`px-6 pt-6 pb-6`
- 输入框底部留白：`bottom-8`（32px）

### Build Mode 工作区

右侧 Asset Workspace 背景为 `bg-[#f0f2f5]`（画布色），内部卡片为白色。这形成了**"画布上放置卡片"**的视觉层次，底部 Action Bar 使用 `bg-gradient-to-t from-[#f0f2f5]` 渐变遮罩。

---

## 八、动画与过渡

### 原则

- **所有 UI 状态切换：** `transition-all duration-200`（200ms）
- **颜色/透明度过渡：** `transition-colors duration-200` 或 `transition-opacity duration-200`
- **侧边栏展开：** `transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1)`（Spring 曲线）

### 页面级动画（定义在 globals.css）

| 类名 | 用途 |
|------|------|
| `animate-fade-in` | 页面/区域出现（0.3s ease-out） |
| `animate-slide-in-right` | 面板从右滑入（0.4s Spring） |
| `animate-slide-in-right-delayed` | 面板延迟滑入，带透明度过渡（0.6s Spring，前20%不动） |

Build Mode 启动时：左侧 AI Console 用 `animate-fade-in`，右侧 Asset Workspace 用 `animate-slide-in-right-delayed`，制造错落感。

### Hover 微交互

- 可交互按钮：`hover:scale-110`（进度点）或 `active:scale-[0.98]`（主按钮按下收缩）
- 阴影升级：静止 `shadow-sm` → hover `shadow-md`
- 颜色翻转（导航/按钮）：白底蓝字 → 蓝底白字

### Loading 状态

输入框发送按钮在 loading 时变为旋转环：
```
inline-block w-5 h-5 border-2 rounded-full animate-spin
Chat Mode：border-[#324998] border-t-transparent
Build Mode：border-white border-t-transparent
```

---

## 九、图标规范

- **风格：** Heroicons（`outline` 变体，`fill="none" stroke="currentColor"`）
- **线宽：** `strokeWidth={2}`（常规）或 `strokeWidth={1.5}`（大图标/空状态）
- **尺寸：** 按钮内 `w-4 h-4`，空状态 `w-16 h-16`
- **颜色：** 继承父级 `currentColor`，不硬编码颜色

---

## 十、交互状态完整清单

任何新增可交互元素，必须覆盖以下所有状态：

| 状态 | 处理方式 |
|------|---------|
| **默认** | 基础样式 |
| **Hover** | 颜色翻转或阴影升级，duration-200 |
| **Active/Press** | `active:scale-[0.98]`（按钮）|
| **Focus** | 依赖 ring（进度点使用 ring-offset），输入框使用 `outline-none` |
| **Disabled** | `bg-gray-100 text-gray-400 cursor-not-allowed`，移除所有 hover |
| **Loading** | 旋转圆环替代图标，`opacity-50` 降低容器透明度 |

---

## 十一、禁止事项

1. **禁止引入第三个品牌色**（除系统状态色绿/黄/红外）
2. **禁止使用 `transition-none`** — 所有状态变化都要有过渡
3. **禁止混用 `rounded-full` 和 `rounded-xl`** 于同类型组件
4. **禁止使用有色阴影** — 所有 `box-shadow` 必须是黑色低透明度
5. **禁止在白色容器内使用白色文字**（反之亦然）— 色彩对比必须清晰
6. **禁止让深色容器（Build Mode 蓝色输入框）以外的区域使用深色背景**
7. **禁止不提供 disabled 样式** — 所有有操作语义的按钮必须处理不可用状态

---

## 十二、设计决策备忘

### 为何从原始 PRD 演化

原始 PRD 定义了纯 Minimalist Monochrome 风格（0px 圆角、纯黑白、无阴影、Serif 字体）。实现版本演化为当前的 Quiet Professional 风格，原因如下：

- `#324998` 海军蓝让交互焦点更清晰，比纯黑色更友好
- `rounded-xl` + 细阴影提升了触感和现代感，不影响专业调性
- Inter 替代 Serif 在小字号下可读性更好
- Apple HIG 阴影系统让层级感自然，不需要依赖粗边框

**核心气质没有改变：** 克制、专业、高密度信息展示、无装饰主义。

### Build Mode 蓝色输入框的设计意图

这是**唯一的模式状态指示器** — 通过整个输入容器的颜色反转（白→蓝），让用户始终清楚自己处于哪个工作模式。这个设计比 Tab 标签或文字提示更直觉。
