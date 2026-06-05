---
marp: true
theme: default
paginate: true
size: 16:9
lang: zh-TW
header: 'CHEM-IS-TRY · 網頁程式設計'
footer: '專題簡報 · 課堂技術'
style: |
  section {
    font-family: "Microsoft JhengHei", sans-serif;
    background: linear-gradient(145deg, #0f172a, #1e293b);
    color: #e2e8f0;
    font-size: 26px;
  }
  h1 {
    background: linear-gradient(90deg, #67e8f9, #a78bfa);
    -webkit-background-clip: text;
    color: transparent;
  }
  h2 { color: #22d3ee; font-size: 1.35em; }
  table { font-size: 0.82em; }
  th { background: #1e3a5f; color: #7dd3fc; }
  code { background: #334155; color: #fde68a; }
---

<!-- _class: lead -->
<!-- _paginate: false -->

# CHEM-IS-TRY

## 網頁程式設計專題簡報

**重點：本專案運用之課堂技術**

![w:140](https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=http%3A%2F%2Flocalhost%3A5173)

---

# 1. 專題簡介

- **CHEM-IS-TRY**：虛擬化學實驗台（Chemistry + IS + TRY）
- 技術本質：**單頁應用程式（SPA）**，純前端、無後端資料庫
- 課程定位：整合「網頁程式設計」所學之 **HTML / CSS / JavaScript / React / 建置工具**
- 使用者透過週期表、試劑架、實驗台進行模擬實驗，結果寫入筆記本

---

# 2. 課堂技術一覽（18 項運用）

| 類別 | 技術 | 專案中用途 |
|------|------|------------|
| 標記 | HTML5 | 語意結構、`index.html` 進入點 |
| 樣式 | CSS3 | 動畫、漸層、Flex／Grid 版面 |
| 腳本 | JavaScript ES6+ | 模組、箭頭函式、解構、展開運算 |
| 框架 | React 19 | 元件化 UI、Hooks 狀態 |
| 建置 | Vite 6 | 開發伺服器、打包 `dist/` |
| 樣式庫 | Tailwind CSS 4 | 快速排版與響應式 |
| 儲存 | localStorage | 實驗筆記持久化 |

---

# 3. HTML5 語意結構

**課堂重點：** 語意標籤、文件結構、可存取性

```html
<body>
  <div id="root"></div>   <!-- React 掛載點 -->
  <script type="module" src="/src/main.jsx"></script>
</body>
```

- `lang="zh-Hant"` 指定繁體中文
- `type="module"` 啟用 **ES Module**（課堂：現代 JS 模組化）
- 外部字型 `<link>` 載入手寫筆記字體（Google Fonts）

---

# 4. CSS3 — 版面與視覺

**課堂重點：** 選擇器、盒模型、Flexbox、Grid、漸層

- **Flexbox**：試劑瓶、實驗器具橫向排列
- **CSS Grid**：週期表 18 欄標準排列（`grid-template-columns`）
- **自訂屬性** `--lab-glow`、`--lab-deep` 統一主題色
- **漸層背景** `linear-gradient`、`radial-gradient` 營造實驗室氛圍
- **媒體查詢概念**：Tailwind 的 `md:`、`xl:` 斷點（響應式）

---

# 5. CSS3 — 動畫與過渡

**課堂重點：** `@keyframes`、`transition`、`animation`

| 動畫 class | 技術 | 對應現象 |
|------------|------|----------|
| `anim-flame` | keyframes | 燃燒火焰 |
| `anim-precipitate` | transform + opacity | 沉澱下落 |
| `anim-color-wave` | opacity 漸變 | 溶液變色 |
| `chip-sink` / `chip-float` | translateY | 元素加入 |

元件 `ExperimentAnimations.jsx` 依 **狀態** 條件渲染動畫層（React 條件顯示）

---

# 6. JavaScript ES6+ 模組化

**課堂重點：** `import` / `export`、箭頭函式、樣板字串

```javascript
// 資料與邏輯分離
import { compounds } from './data/compounds.js'
import { getReaction } from './data/reactions.js'

export function reactionKey(items) { ... }
```

- **箭頭函式** `() => {}` 用於事件與 Hooks 回呼
- **展開運算** `[...beaker, newItem]` 不可變更新陣列
- **解構** `const { effects, compoundId } = reaction`
- **可選鏈** `entry?.snapshot?.items`

---

# 7. React — 元件化設計

**課堂重點：** 函式元件、JSX、元件樹、重用

```
App
 ├── PeriodicTable      （週期表）
 ├── LabBench           （實驗台 + 試劑）
 ├── CompoundAtlas      （圖鑑）
 ├── Notebook           （筆記本）
 └── ContextMenu        （右鍵選單）
```

- 每個 `.jsx` 檔 = 一個 UI 模組
- **JSX** 在 JavaScript 中撰寫類 HTML 語法
- **單向資料流**：父元件 `App` 持有狀態，以 **props** 傳給子元件

---

# 8. React Hooks — useState

**課堂重點：** 函式元件中的區域狀態

```javascript
const [beaker, setBeaker] = useState([])
const [notebook, setNotebook] = useState([])
const [lampOn, setLampOn] = useState(false)
```

- 狀態改變 → React **自動重新渲染** 畫面
- 實驗台物質、筆記、器具開關皆用 `useState` 管理
- 符合課堂「宣告式 UI」：描述狀態，而非手動改 DOM

---

# 9. React Hooks — useEffect

**課堂重點：** 副作用、生命週期、依賴陣列

```javascript
useEffect(() => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) { /* 還原筆記與解鎖 */ }
}, [])  // 僅掛載時執行一次

useEffect(() => () => clearInterval(timerRef.current), [])
```

- **掛載時** 從 localStorage 讀取歷史資料
- **卸載時** 清除計時器，避免記憶體洩漏
- 課堂對應：瀏覽器 API 與元件生命週期結合

---

# 10. React Hooks — useCallback / useRef

**課堂重點：** 效能優化、跨渲染保存值

| Hook | 用途 |
|------|------|
| `useCallback` | 快取 `persist`、`logStep`，避免不必要重建 |
| `useRef` | `processLogRef` 累積過程不觸發重渲染 |
| `useRef` | `timerRef` 保存 `setInterval`  ID |

```javascript
const processLogRef = useRef([])
processLogRef.current.push({ text: '加入元素 Na' })
```

---

# 11. Props 與事件處理

**課堂重點：** 父子通訊、合成事件

```jsx
<PeriodicTable
  onSelect={lab.addToBeaker}
  onContextMenu={showIntro}
/>
<LabBench onMix={() => lab.runReaction('mix')} />
```

- **Props 回呼**：子元件 `onClick` 呼叫父層傳入的函式
- **原生事件**：`onClick`、`onContextMenu`（右鍵簡介）
- **自訂 Hook** `useContextMenu()` 封裝右鍵選單邏輯（進階模組化）

---

# 12. Vite 6 建置工具

**課堂重點：** 現代前端工程化、開發體驗

| 指令 | 課堂意義 |
|------|----------|
| `npm run dev` | 本機開發伺服器 + **HMR** 熱更新 |
| `npm run build` | 打包壓縮輸出 `dist/` 靜態檔 |
| `npm run preview` | 預覽正式建置結果 |

`vite.config.js`：

```javascript
plugins: [react(), tailwindcss()]
base: process.env.VITE_BASE || '/'
```

---

# 13. Tailwind CSS 4

**課堂重點：** Utility-first、與建置流程整合

```css
/* index.css */
@import "tailwindcss";
```

```jsx
<div className="grid xl:grid-cols-[1fr_300px] gap-4">
<div className="flex flex-wrap gap-2">
```

- **原子化 class**：`p-4`、`rounded-xl`、`text-cyan-300`
- 與 **自訂 CSS**（`.notebook-paper`、`.anim-flame`）並用
- 課堂延伸：Bootstrap 概念 → Tailwind 更細粒度控制

---

# 14. 資料驅動 UI（反應引擎）

**課堂重點：** 資料與畫面分離、查表法

```javascript
// reactions.js — 純資料物件
'H+O': { compoundId: 'h2o', type: 'mix', effects: ['liquid'] }
'Mg+O': { compoundId: 'mgo', type: 'burn', needsHeat: false }
```

```javascript
export function getReaction(items, mode) {
  const key = reactionKey(items)  // 排序後 "H+O"
  return reactions[key]
}
```

- 新增反應 = **改 JSON 資料**，不必改 UI 結構
- 對應課堂：**MVC 中 Model 與 View 分離** 思想

---

# 15. Web API — localStorage

**課堂重點：** 瀏覽器儲存、JSON 序列化

```javascript
localStorage.setItem(STORAGE_KEY, JSON.stringify({
  unlocked: ['nacl', 'co2'],
  notebook: [{ resultFormula: 'H₂O', processLog: [...] }]
}))
```

- **字串儲存**：物件需 `JSON.stringify` / `parse`
- 筆記本、解鎖化合物跨工作階段保留
- 限制：僅本機、無法跨裝置（課堂可對比 Cookie、Session）

---

# 16. 自訂 Hook 與模組拆分

**課堂重點：** 邏輯重用、關注點分離

| 檔案 | 職責 |
|------|------|
| `useLabState.js` | 實驗狀態、反應、筆記 |
| `useContextMenu.js` | 右鍵選單座標與內容 |
| `compoundHints.js` | 圖鑑提示演算法 |
| `reactionAnim.js` | 現象 → 動畫對應 |

符合 React 課堂：**邏輯與 UI 分離**，提升可維護性

---

# 17. 專案目錄結構

```
CHEM-IS-TRY/
├── index.html          ← HTML5 進入
├── vite.config.js      ← Vite 設定
├── src/
│   ├── main.jsx        ← React 根掛載
│   ├── App.jsx         ← 根元件
│   ├── index.css       ← 全域 CSS + Tailwind
│   ├── components/     ← React 元件
│   ├── hooks/          ← 自訂 Hooks
│   ├── data/           ← 靜態資料（元素、反應）
│   └── utils/          ← 工具函式
└── presentations/      ← Marp 簡報原始檔
```

---

# 18. 建置、簡報與 QR Code

```bash
npm install
npm run dev      # 開發
npm run build    # 正式版
npm run ppt      # 產生本簡報 PPTX
```

![w:120 right](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=http%3A%2F%2Flocalhost%3A5173)

掃描開啟本機實驗台 · 簡報以 **Marp CLI** 從 Markdown 匯出（課堂：文件即簡報）

---

# 19. 技術總結

| 課堂單元 | 專案實踐 |
|----------|----------|
| HTML/CSS | 版面、動畫、手寫筆記風格 |
| JavaScript | 模組、事件、資料處理 |
| React | 元件、Hooks、Props |
| 工程化 | Vite、npm、GitHub |
| 瀏覽器 API | localStorage |

**CHEM-IS-TRY** 將化學模擬與網頁程式設計技術完整結合。

---

<!-- _class: lead -->
<!-- _paginate: false -->

# 謝謝聆聽

# CHEM-IS-TRY

![w:160](https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=http%3A%2F%2Flocalhost%3A5173)

網頁程式設計專題 · 共 20 頁
