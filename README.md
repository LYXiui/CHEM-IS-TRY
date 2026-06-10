# CHEM-IS-TRY

網頁版虛擬化學實驗台 — 在瀏覽器安全地探索週期表、溶液反應與實驗動畫。

**線上體驗：** https://lyxiui.github.io/CHEM-IS-TRY/

![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-6-646cff)
![License](https://img.shields.io/badge/License-MIT-green)

## 功能特色

- 標準週期表排列與右鍵元素簡介
- 18 種常見溶液／試劑
- 實驗器具：燒杯、酒精燈、火柴、攪拌棒、過濾器、分離器、冷卻器
- 反應動畫：火焰、變色、沉澱、冒泡、攪拌、過濾、分層等
- 手寫風格實驗筆記本（記錄完整過程，可點化學式重現實驗）

## 快速開始

```bash
git clone https://github.com/YOUR_USERNAME/CHEM-IS-TRY.git
cd CHEM-IS-TRY
npm install
npm run dev
```

瀏覽器開啟 http://localhost:5173

## 指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發伺服器 |
| `npm run build` | 建置至 `dist/` |
| `npm run preview` | 預覽建置結果 |
| `npm run ppt` | 產生專題簡報 PPTX（20 頁） |

## 上傳到 GitHub

1. 在 GitHub 建立新 repository（例如 `CHEM-IS-TRY`）
2. 在本資料夾執行：

```bash
git init
git add .
git commit -m "Initial commit: CHEM-IS-TRY virtual chemistry lab"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/CHEM-IS-TRY.git
git push -u origin main
```

3. **不要** commit `node_modules/`（已由 `.gitignore` 排除）

## GitHub Pages 部署

1. 將 `vite.config.js` 中的 `base` 改為你的 repo 名稱：

```js
base: '/CHEM-IS-TRY/',
```

2. 首次需啟用 Pages（擇一）：
   - GitHub → **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**
   - 或執行：`gh api -X POST repos/你的帳號/CHEM-IS-TRY/pages -f build_type=workflow`

或手動建置：

```bash
npm run build
# 將 dist/ 內容部署到 gh-pages 分支
```

本 repo 已含 `.github/workflows/deploy.yml`，push 到 `main` 後會自動部署（需先在 vite.config 設定正確 `base`）。

## 專案結構

```
CHEM-IS-TRY/
├── src/                 # 前端原始碼
├── docs/                # 說明與化學式 txt
├── presentations/       # 專題簡報（單一 md + pptx）
├── public/              # 靜態資源（若有）
├── index.html
├── vite.config.js
└── package.json
```

## 說明文件

| 檔案 | 內容 |
|------|------|
| [docs/更新紀錄.txt](docs/更新紀錄.txt) | 每次版本變更 |
| [docs/CHEM-IS-TRY程式功能說明.txt](docs/CHEM-IS-TRY程式功能說明.txt) | 操作說明 |
| [docs/高中大學化學式一覽.txt](docs/高中大學化學式一覽.txt) | 常見化學式 |
| [docs/化學反應類型與範例.txt](docs/化學反應類型與範例.txt) | 反應分類與例題 |

## 技術棧

- React 19、Vite 6、Tailwind CSS 4
- localStorage 實驗筆記
- Marp CLI 匯出簡報

## 授權

[MIT](LICENSE) — 僅供教學模擬，請遵守實驗室安全規範。

## 更新簡報

```bash
npm run ppt   # 產生 presentations/CHEM-IS-TRY-專題簡報.pptx
```

簡報共 20 頁，介紹專案使用之課堂技術。
