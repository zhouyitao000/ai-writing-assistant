# AI Writing Assistant - Product Requirement Document (PRD)

> **Status**: Live / Vercel Deployed  
> **Version**: 1.4 (Comprehensive Design Specs)  
> **Role**: Senior Product Designer & Architect  
> **Date**: 2026-01-25

---

## 1. 核心战略 (Strategy)

### 🎯 Mission (核心目标)
**解放大学生作业压力，打造“图灵测试级”的个性化短篇作业助手。**  
不仅要帮学生写完作业，更要写得**像学生自己写的**——有瑕疵、有人味、安全过关。

### 1.2 用户场景与需求 (User Scenarios & Needs)
基于市场调研，我们识别出学术写作生态中的四类关键角色及其痛点，本产品目前**核心聚焦于“学生/研究生”群体**，同时兼顾“内容营销”场景的潜在需求。

| 用户群体 (User) | 典型任务 (Typical Task) | 关键痛点 (Key Pain Points) | 本产品解决方案 (Our Solution) |
| :--- | :--- | :--- | :--- |
| **学生 / 研究生**<br>*(核心用户)* | **平时作业 & 期末论文**<br>覆盖 Weekly Discussion, Reflection Paper 到 Final Essay 的全场景。 | 1. **高频低效**：平时作业量大琐碎，挤占时间。<br>2. **检测焦虑**：无论是 300 字短文还是长论文，都怕被查。<br>3. **多语态切换**：不同作业对 Formal/Casual 要求不同。 | **Quick Generate**: 针对短作业的极速模式。<br>**Tone Slider**: 随意调节 Discussion(口语) 或 Essay(学术) 语态。<br>**AI Rate Badge**: 每一次提交都安心。 |
| **大学教师 / 辅导员**<br>*(对立面/参考)* | **日常批改 & 论文检测**<br>从周常作业到期末大作业的持续评估。 | 1. **批改疲劳**：日常作业数量巨大，重复性高。<br>2. **原文留痕**：需要快速定位 AI 生成的段落证据。 | *支持生成符合日常作业规范（如 Discussion Post 格式）的文本，避免因“用力过猛”写得太像论文而被怀疑。* |
| **内容营销团队**<br>*(潜在拓展)* | **SEO 文章一键 Humanize**<br>批量生产博客/推广文。 | 1. **维持关键词密度**：改写后 SEO 词丢失。<br>2. **API 批量**：人工操作效率低。 | **Persona Config**: 调节 Tone 为 "Casual" 可适配营销文风。<br>**Outline Control**: 确保关键词段落不被遗漏。 |
| **学术出版 / 机构**<br>*(高端市场)* | **稿件审校流程**<br>期刊录用前的合规检查。 | 1. **合规性**：版权与伦理风险。<br>2. **私有化部署**：数据安全。<br>3. **多人协作**：修订记录混乱。 | *暂不涉及，但代码结构预留了私有化部署的可能性。* |

### 1.3 核心用户画像 (Target Persona)
尽管覆盖上述场景，我们现阶段最关注的细分画像是：

*   **The Overwhelmed Student (作业繁重的在校大学生)**
    *   **特征**: 非英语母语(ESL) 或 赶 Due 战士。
    *   **核心诉求**: "Don't make me sound like Shakespeare, just help me pass." (不需要写得像莎士比亚，只要能过就行。)
    *   **Behavior**: 习惯在 Google/Wiki 找资料，然后试图用自己的话重写，但效率极低。

---

## 2. 详细功能说明 (Detailed Features)

### 2.1 双模式输入引擎 (Dual-Mode Engine)

#### A. 生成模式 (Generate Mode) - "从零开始"
用户提供题目和要求，AI 生成大纲并撰写全文。
*   **输入项**:
    *   **Topic (必填)**: 文本输入框，支持单行文本 (e.g., "The impact of AI on education").
    *   **Requirements (选填)**: 多行文本域，用于补充具体要求 (e.g., "Mention 3 pros and 2 cons, approx 800 words").
*   **流程**: Input -> Outline Review -> Essay Generation.

#### B. 润色模式 (Refine Mode) - "拯救初稿"
用户提供已有的草稿，AI 进行润色、纠错和风格调整。
*   **输入项**:
    *   **Refinement Requirements (选填)**: 指导 AI 如何修改 (e.g., "Make it more academic", "Fix grammar but keep my tone").
    *   **Draft Content (必填)**: 大文本域，支持粘贴文本。
*   **流程**: Input -> Essay Refinement (Stream).

### 2.2 个性化配置 (Persona Configuration)
全局配置，影响所有生成结果。
*   **Student Level (年级)**:
    *   `Freshman`: 简单词汇，偶尔逻辑跳跃，语气充满好奇但缺乏深度。
    *   `Junior`: 标准大学生水平，逻辑清晰，词汇量中等。
    *   `Grad`: 学术性强，从句复杂，词汇专业，引用规范。
*   **Tone Slider (语气滑块)**:
    *   `0-30` (Casual): 口语化，第一人称多 ("I think", "In my opinion")。
    *   `30-70` (Standard): 平衡语气。
    *   `70-100` (Academic): 正式，客观，第三人称 ("The data suggests").

### 2.3 智能大纲交互 (Interactive Outline)
仅在 Generate Mode 下触发。
*   **展示形式**: 卡片列表，每张卡片代表一个段落/章节。
*   **交互逻辑**:
    *   **查看**: 显示序号、标题、简短描述。
    *   **删除**: 点击卡片右侧 `X` 按钮移除该节点。
    *   **新增**: 点击列表底部的 `+ Add Section` 按钮，追加一个空节点（标题为 "New Section"）。
    *   **确认**: 点击底部 `Confirm & Write Essay` 按钮，将当前大纲结构发送给后端进行全文生成。

### 2.4 对话式修改 (Conversational Refinement)
文章生成后的增强功能，允许用户通过自然语言迭代修改文章。
*   **入口**: 仅在 `step === 'writing'` 且文章生成完毕后显示。
*   **UI**: 底部悬浮的 Chat Bar (Glassmorphism 风格)。
*   **交互**:
    *   用户输入指令 (e.g., "第二段太长了，缩短一点")。
    *   点击发送或回车。
    *   **Loading State**: 发送按钮变为 Spinner，输入框禁用。
    *   **Response**: 页面主体的文章内容区域被重置，AI 基于 `Current Content` + `Instruction` 重新流式生成全文。

### 2.5 结果处理与辅助功能 (Post-Generation & Utils)
文章生成后的相关功能。
*   **AI Detection Rate (AI 率检测)**:
    *   **位置**: 文章纸张区域的右上角悬浮 Badge。
    *   **逻辑**: 生成完成后自动计算（目前为模拟数据）。
    *   **视觉反馈**:
        *   `< 20%`: 绿色 (Safe, Shield Icon).
        *   `20% - 50%`: 黄色 (Moderate, Alert Icon).
        *   `> 50%`: 红色 (High Risk, Alert Icon).
*   **Action Buttons**:
    *   位置: 文章底部的操作栏。
    *   **Copy Text**: 一键复制全文到剪贴板。
    *   **Export as PDF**: 将当前文章导出为 PDF 格式（UI 已就绪，逻辑待实现）。

---

## 3. UI/UX 设计规范 (Design Specs)

### 3.1 布局框架 (Layout)
采用经典的 **Sidebar + Canvas** 布局。
*   **Sidebar (Left, Fixed, w-[400px])**:
    *   背景: White (`bg-white`), 右侧边框 (`border-r`).
    *   内容: Logo, Mode Switcher (Tab), Persona Config, Input Fields, Action Button (Bottom Fixed).
*   **Main Canvas (Right, Fluid)**:
    *   背景: Light Gray (`bg-gray-50/50`).
    *   内容: Header (Steps), Centered Paper (Max-width 3xl), Floating Elements.

### 3.2 关键组件状态 (Component States)

#### Button: "Create Outline" / "Start Refining"
*   **Default**: Indigo background (`bg-indigo-600`), White text.
*   **Disabled**: Opacity 50%, Cursor not-allowed. (Triggered when inputs empty or `isStreaming`).
*   **Loading**: Text changes to "Thinking..." / "Refining...".

#### Outline Item
*   **Default**: White card, gray border.
*   **Hover**: Border color changes to Indigo (`hover:border-indigo-300`), Shadow appears. `X` button and Edit icon become visible (`opacity-100`).

#### AI Rate Badge
*   **Position**: Absolute, Top-Right of the paper.
*   **Animation**: Fade-in + Zoom-in when generation completes.

### 3.3 动画与过渡 (Animations)
*   **Streaming Text**: 打字机效果，光标闪烁 (`animate-pulse`).
*   **Step Transition**: 
    *   Outline view slides in from bottom (`slide-in-from-bottom-4`).
    *   Chat bar slides in from bottom.

---

## 4. 前后端交互逻辑 (Interaction Logic)

### 4.1 API 错误处理 (Error Handling)
前端统一捕获 `fetch` 异常。
*   **Network Error**: `alert("Is the backend running?")`.
*   **HTTP Error (4xx/5xx)**: 解析 Response Body，抛出具体错误信息 (e.g., "Request failed: 500 Internal Server Error").
*   **JSON Parse Error**: Console log error, fallback UI logic.

### 4.2 数据流 (Data Flow)

#### Scenario A: Generate Outline
1.  **User**: Inputs Topic -> Clicks "Create Outline".
2.  **Frontend**: 
    *   Validates `topic` is not empty.
    *   Sets `isStreaming = true`.
    *   `POST /api/outline` with `{ topic, requirements, student_level, tone }`.
3.  **Backend**:
    *   Calls LLM (non-stream).
    *   Returns JSON: `{ outline: [...] }`.
4.  **Frontend**:
    *   Sets `outline` state.
    *   Sets `step = 'outline'`.
    *   Sets `isStreaming = false`.

#### Scenario B: Write Essay (from Outline)
1.  **User**: Reviews Outline -> Clicks "Confirm & Write".
2.  **Frontend**:
    *   Sets `step = 'writing'`.
    *   Sets `isStreaming = true`.
    *   Clears `essayContent`.
    *   `POST /api/generate` with `{ topic, student_level, tone }` (Note: V2 needs to send outline).
3.  **Backend**:
    *   Calls LLM (stream=True).
    *   Returns `StreamingResponse` (text/event-stream).
4.  **Frontend**:
    *   Reads stream chunks via `response.body.getReader()`.
    *   Appends chunks to `essayContent` state in real-time.
5.  **Completion**:
    *   Stream ends.
    *   `isStreaming = false`.
    *   Calculates/Fetches `aiRate`.

#### Scenario C: Chat Edit
1.  **User**: Inputs instruction -> Hits Enter/Send.
2.  **Frontend**:
    *   Sets `isChatEditing = true`.
    *   Clears `essayContent` (Visual feedback of rewriting).
    *   `POST /api/chat-edit` with `{ current_content, instruction, ... }`.
3.  **Backend**:
    *   Constructs prompt with "Original Essay" + "Instruction".
    *   Streams back the *full* rewritten essay.
4.  **Frontend**:
    *   Streams response into `essayContent`.
    *   Resets `chatInstruction` to empty.
    *   Sets `isChatEditing = false`.

---

## 5. 技术栈与环境 (Tech Stack)

*   **Frontend**: Next.js 14 (React Server Components), Tailwind CSS, Lucide React.
*   **Backend**: Python FastAPI (Standard ASGI), Uvicorn.
*   **LLM Integration**: OpenAI Python SDK (Async), targeting DeepSeek API.
*   **Deployment**: Vercel (Frontend & Serverless Functions).
    *   `vercel.json`: Rewrites `/api/*` -> `/api/index.py` (Double-route handling for robustness).
    *   `next.config.mjs`: Local proxy for development.

---

## 6. 已知限制与边界情况 (Constraints)
*   **Context Window**: 目前每次修改都是全量重写，长文章可能会遇到 Token 限制或响应变慢。
*   **State Loss**: 刷新页面会丢失当前进度（无本地存储/数据库持久化）。
*   **Outline Edit**: 目前大纲仅支持删除/新增，不支持拖拽排序或修改单项内容（V2 待优化）。
*   **Mock Data**: AI 检测率目前为随机生成的模拟数据，尚未接入真实检测 API。
