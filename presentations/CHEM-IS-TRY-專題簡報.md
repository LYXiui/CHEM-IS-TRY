---
marp: true
theme: default
paginate: true
size: 16:9
lang: zh-TW
header: 'CHEM-IS-TRY · 網頁程式設計'
style: |
  section {
    font-family: "Microsoft JhengHei", sans-serif;
    background-image: url('./assets/template-slide15.png');
    background-size: cover;
    background-position: center;
    color: #1e293b;
    font-size: 24px;
    padding: 52px 56px 48px;
  }
  section.lead {
    background-image: url('./assets/template-slide01.png');
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    text-align: center;
    padding: 18% 56px 0;
  }
  section.lead h1 {
    font-size: 2.75em;
    font-weight: 700;
    color: #ffffff;
    background: none;
    margin: 0 0 0.2em;
    letter-spacing: 0.04em;
    text-shadow: 0 2px 10px rgba(15, 23, 42, 0.2);
  }
  section.lead h2 {
    color: #475569;
    font-size: 1.45em;
    font-weight: 400;
    margin: 0;
    text-shadow: none;
  }
  h1 {
    color: #0f766e;
    font-size: 1.45em;
    margin-top: 0.2em;
  }
  h2 { color: #0e7490; font-size: 1.35em; }
  table { font-size: 0.78em; color: #334155; background: rgba(255,255,255,0.88); }
  th { background: #ecfdf5; color: #1e293b; }
  td { background: rgba(255,255,255,0.92); }
  code { background: rgba(241,245,249,0.95); color: #b45309; }
  strong { color: #1e293b; }
  header { color: #64748b; }
  footer { display: none; }
  section::after { color: #64748b; }
---

<!-- _class: lead -->
<!-- _paginate: false -->

# CHEM-IS-TRY

## 網頁程式設計

---

# 1. 專題簡介

- **CHEM-IS-TRY**：虛擬化學實驗台
- 技術本質：**單頁應用程式（SPA）**
- 整合「網頁程式設計」所學之 **HTML / CSS / JavaScript / React / 建置工具**
- 使用者透過週期表、試劑架、實驗台進行模擬實驗，結果寫入筆記本

---

# 2. 技術一覽（18 項運用）

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

**重點：** 語意標籤、文件結構、可存取性

```html
<body>
  <div id="root"></div>   <!-- React 掛載點 -->
  <script type="module" src="/src/main.jsx"></script>
</body>
```

- `lang="zh-Hant"` 指定繁體中文
- `type="module"` 啟用 **ES Module**（現代 JS 模組化）
- 外部字型 `<link>` 載入手寫筆記字體（Google Fonts）

---

# 4. JavaScript ES6+ 模組化

**重點：** `import` / `export`、箭頭函式、樣板字串

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

# 5. React — 元件化設計

**重點：** 函式元件、JSX、元件樹、重用

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

# 6. React Hooks — useState

**重點：** 函式元件中的區域狀態

```javascript
const [beaker, setBeaker] = useState([])
const [notebook, setNotebook] = useState([])
const [lampOn, setLampOn] = useState(false)
```

- 狀態改變 → React **自動重新渲染** 畫面
- 實驗台物質、筆記、器具開關皆用 `useState` 管理
- 符合「宣告式 UI」：描述狀態，而非手動改 DOM

---

# 7. React Hooks — useEffect

**重點：** 副作用、生命週期、依賴陣列

```javascript
useEffect(() => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) { /* 還原筆記與解鎖 */ }
}, [])  // 僅掛載時執行一次

useEffect(() => () => clearInterval(timerRef.current), [])
```

- **掛載時** 從 localStorage 讀取歷史資料
- **卸載時** 清除計時器，避免記憶體洩漏
- 瀏覽器 API 與元件生命週期結合

---

# 8. React Hooks — useCallback / useRef

**重點：** 效能優化、跨渲染保存值

| Hook | 用途 |
|------|------|
| `useCallback` | 快取 `persist`、`logStep`，避免不必要重建 |
| `useRef` | `processLogRef` 累積過程不觸發重渲染 |
| `useRef` | `timerRef` 保存 `setInterval` ID |

```javascript
const processLogRef = useRef([])
processLogRef.current.push({ text: '加入元素 Na' })
```

---

# 9. Props 與事件處理

**重點：** 父子通訊、合成事件

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

# 10. Vite 6 建置工具

| 指令 | 意義 |
|------|------|
| `npm run dev` | 本機開發伺服器 + **HMR** 熱更新 |
| `npm run build` | 打包壓縮輸出 `dist/` 靜態檔 |
| `npm run preview` | 預覽正式建置結果 |

`vite.config.js`：

```javascript
plugins: [react(), tailwindcss()]
base: process.env.VITE_BASE || '/'
```

---

# 11. Tailwind CSS 4

**重點：** Utility-first、與建置流程整合

```css
/* index.css */
@import "tailwindcss";
```

```jsx
<div className="grid xl:grid-cols-[1fr_300px] gap-4">
<div className="flex flex-wrap gap-2">
```

- **原子化 class**：`p-4`、`rounded-xl`、`text-slate-700`
- 與 **自訂 CSS**（`.notebook-paper`、`.anim-flame`）並用
- 延伸：Bootstrap 概念 → Tailwind 更細粒度控制

---

# 12. 資料驅動 UI（反應引擎）

**重點：** 資料與畫面分離、查表法

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
- 對應 **MVC 中 Model 與 View 分離** 思想

---

# 13. Web API — localStorage

**重點：** 瀏覽器儲存、JSON 序列化

```javascript
localStorage.setItem(STORAGE_KEY, JSON.stringify({
  unlocked: ['nacl', 'co2'],
  notebook: [{ resultFormula: 'H₂O', processLog: [...] }]
}))
```

- **字串儲存**：物件需 `JSON.stringify` / `parse`
- 筆記本、解鎖化合物跨工作階段保留
- 限制：僅本機、無法跨裝置（可對比 Cookie、Session）

---

# 14. 自訂 Hook 與模組拆分

**重點：** 邏輯重用、關注點分離

| 檔案 | 職責 |
|------|------|
| `useLabState.js` | 實驗狀態、反應、筆記 |
| `useContextMenu.js` | 右鍵選單座標與內容 |
| `compoundHints.js` | 圖鑑提示演算法 |
| `reactionAnim.js` | 現象 → 動畫對應 |

符合 React **邏輯與 UI 分離**，提升可維護性

---

# 15. 專案目錄結構

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

# 16. 建置與簡報

```bash
npm install
npm run dev      # 開發
npm run build    # 正式版
npm run ppt      # 產生本簡報 PPTX
```

簡報以 **Marp CLI** 從 Markdown 匯出（文件即簡報）

---

# 17. 線上體驗 CHEM-IS-TRY

<div style="display:flex;align-items:center;gap:2.5rem;margin-top:0.5rem;">

<div>

![w:280px](./assets/chem-is-try-qr.png)

</div>

<div>

**掃描 QR Code 開啟虛擬化學實驗台**

- 118 種元素 · 試劑架 · 燒杯反應動畫
- 實驗筆記本 · 一鍵重現實驗
- GitHub Pages 線上版

`https://lyxiui.github.io/CHEM-IS-TRY/`

</div>

</div>

---

<!-- _class: lead -->
<!-- _paginate: false -->

# 謝謝聆聽

# CHEM-IS-TRY

網頁程式設計 · 共 19 頁
