# CHEM-IS-TRY — Agent 開發指引

## 反應更動：全庫套用

當一項更動**依條件**影響反應（產物保留、火柴檢驗、動畫、解鎖、加熱需求等），須：

| 步驟 | 動作 |
|------|------|
| 1 | 改共用模組（見下方「關鍵檔案」）優先於逐筆補丁 |
| 2 | 掃描 `manualReactions.js` 與 `generated/elementReactions.js` |
| 3 | 更新 `reactionCatalog.js`（若為示範流程） |
| 4 | 執行 `npm run test:ci` |
| 5 | 執行 `npm run release -- -Message "commit 訊息"` 推送並部署 |

### 關鍵檔案

- `src/utils/postReactionBeaker.js` — 反應後產物保留
- `src/data/matchTestReactions.js` — 火柴檢驗
- `src/utils/verificationAnim.js`、`VerificationStage.jsx` — 火柴／試劑檢驗動畫
- `src/hooks/useLabState.js` — 實驗狀態與 `finishReaction`
- `src/data/manualReactions.js` — 手動反應（覆寫生成結果）
- `src/data/reactions.js` — `getReaction()` 查表
- `scripts/verify-post-reaction.mjs` — 產物保留全庫驗證
- `scripts/verify-reactions.mjs` — 目錄反應鍵驗證

## 自動部署

```
push main → .github/workflows/deploy.yml → https://lyxiui.github.io/CHEM-IS-TRY/
```

本機一鍵發布：

```bash
npm run release -- -Message "feat: 說明更動"
```

流程：測試 → 建置 → commit → push `main` → GitHub Actions 建置並發布 Pages。
