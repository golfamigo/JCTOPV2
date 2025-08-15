# JCTOPV2 文檔導航

## 文檔結構說明

本專案文檔採用版本化管理，以區分不同階段的技術實作：

### 📁 `/docs/current/` - 當前版本文檔 (React Native Elements)
包含目前正在使用的技術架構和實作文檔：
- **architecture.md** - 基於 React Native Elements 的架構設計
- **prd.md** - 產品需求文檔（重構版本）
- **front-end-spec.md** - 前端技術規格

### 📁 `/docs/legacy/` - 舊版文檔 (Gluestack UI)
保存原始版本的文檔，供參考和回滾使用：
- **architecture/** - 原始架構文檔
- **prd/** - 原始產品需求文檔
- **UIUX/** - 原始 UI/UX 設計文檔
- **stories/** - 原始用戶故事

### 📁 `/docs/migration/` - 遷移文檔
記錄從 Gluestack UI 到 React Native Elements 的遷移過程：
- **migration-log.md** - 遷移進度追蹤
- **compatibility-checklist.md** - 相容性檢查清單

### 📁 `/docs/` - 其他文檔
- **infrastructure-architecture.md** - 基礎設施架構（不受 UI 框架影響）
- **deployment-*.md** - 部署相關文檔

## 快速導航

- 🚀 **開始新功能開發** → 查看 `/docs/current/`
- 🔍 **查詢原始設計** → 查看 `/docs/legacy/`
- 📋 **追蹤遷移進度** → 查看 `/docs/migration/migration-log.md`
- ✅ **檢查相容性** → 查看 `/docs/migration/compatibility-checklist.md`

## 版本歷史

| 版本 | UI 框架 | 狀態 | 文檔位置 |
|------|---------|------|----------|
| v2.0 | React Native Elements | 當前版本 | `/docs/current/` |
| v1.0 | Gluestack UI | 已歸檔 | `/docs/legacy/` |

## 注意事項

1. **開發新功能時**，請參考 `current/` 資料夾中的文檔
2. **查找歷史資訊時**，可以在 `legacy/` 資料夾中尋找
3. **進行遷移工作時**，請更新 `migration/` 中的相關文檔
4. 所有 API 相關的文檔保持不變，因為後端架構未受影響