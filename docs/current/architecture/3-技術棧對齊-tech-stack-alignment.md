# 3. 技術棧對齊 (Tech Stack Alignment)

## 3.1 維持不變的核心技術棧 (Existing Stack to Maintain)
* **跨平台框架:** Expo SDK 53
* **核心語言:** TypeScript
* **導航:** React Navigation
* **API 客戶端:** Axios

## 3.2 新增的技術棧 (New Tech Additions)
| 技術 | 版本 | 用途 | 理由 | 整合方法 |
| :--- | :--- | :--- | :--- | :--- |
| `@rneui/base`<br>`@rneui/themed` | `latest stable` | 核心 UI 元件庫，用以替換 Gluestack UI。 | 成熟、功能豐富且社群支援良好。 | 透過新建的 `theme.ts` 檔案進行樣式統一管理。 |
| `@expo/vector-icons` | `相容版本` | 為 `React Native Elements` 提供圖示支援。 | Expo 環境下的最佳實踐，可避免字體錯誤。 | **必須**使用 `npx expo install @expo/vector-icons` 進行安裝。 |
| `i18next`<br>`react-i18next` | `latest stable` | 管理所有繁體中文的文字內容。 | 遵循 PRD 的 `FR3` 需求，功能強大且易於擴展。 | 建立語言資源檔案，並在應用程式進入點初始化。 |

---
