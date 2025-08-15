```markdown
# JCTOPV2 Brownfield Enhancement Architecture

## 1. 介紹 (Introduction)

本文件 outlines the architectural approach for enhancing JCTOPV2. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development of new features while ensuring seamless integration with the existing system.

### 1.1 現有專案分析 (Existing Project Analysis)

* **現有技術棧 (Current Tech Stack):** 我們將在現有的 Expo (SDK 53) + Node.js (Express) + PostgreSQL 的 Monorepo 結構上進行開發。
* **架構風格 (Architecture Style):** 前端為元件化架構，後端為分層服務架構。API 透過 JWT 進行驗證。
* **關鍵約束 (Key Constraint):** 所有工作都必須在不破壞現有後端 API 合約、導航邏輯和狀態管理邏輯的前提下進行。

### 1.2 變更日誌 (Change Log)

| 日期 | 版本 | 描述 | 作者 |
| :--- | :--- | :--- | :--- |
| 2025年8月5日 | 1.0 | 建立前端重構專案的技術架構草案。 | Winston (Architect) |

---

## 2. 增強範圍與整合策略 (Enhancement Scope and Integration Strategy)

### 2.1 增強概覽 (Enhancement Overview)

* **增強類型:** UI 現代化 (UI Modernization) 與 設計更新 (Design Refresh)。
* **整合衝擊:** 重大影響 (Significant Impact) - 所有前端畫面都將被修改。

### 2.2 整合方式 (Integration Approach)

* **程式碼整合策略:** 採取**漸進式替換 (Progressive Replacement)** 的策略，以**畫面 (Screen)** 為單位進行重構，降低風險。
* **API 整合:** **無變更。** 嚴格遵守 PRD 中的 `CR1` 相容性需求。
* **UI 整合:** 新的 `React Native Elements` 元件將被整合到現有的 React Navigation 結構中，只替換畫面元件的內部實作。

### 2.3 相容性需求 (Compatibility Requirements)

* **API 相容性:** 確保所有 API 請求和回應的資料結構完全不變。
* **UI/UX 一致性:** 核心使用者流程、按鈕位置和資訊架構保持一致。
* **效能衝擊:** 在重構前後對關鍵畫面的渲染速度進行基準測試。

---

## 3. 技術棧對齊 (Tech Stack Alignment)

### 3.1 維持不變的核心技術棧 (Existing Stack to Maintain)
* **跨平台框架:** Expo SDK 53
* **核心語言:** TypeScript
* **導航:** React Navigation
* **API 客戶端:** Axios

### 3.2 新增的技術棧 (New Tech Additions)
| 技術 | 版本 | 用途 | 理由 | 整合方法 |
| :--- | :--- | :--- | :--- | :--- |
| `@rneui/base`<br>`@rneui/themed` | `latest stable` | 核心 UI 元件庫，用以替換 Gluestack UI。 | 成熟、功能豐富且社群支援良好。 | 透過新建的 `theme.ts` 檔案進行樣式統一管理。 |
| `@expo/vector-icons` | `相容版本` | 為 `React Native Elements` 提供圖示支援。 | Expo 環境下的最佳實踐，可避免字體錯誤。 | **必須**使用 `npx expo install @expo/vector-icons` 進行安裝。 |
| `i18next`<br>`react-i18next` | `latest stable` | 管理所有繁體中文的文字內容。 | 遵循 PRD 的 `FR3` 需求，功能強大且易於擴展。 | 建立語言資源檔案，並在應用程式進入點初始化。 |

---

## 4. 資料模型與 Schema 變更 (Data Models and Schema Changes)

根據 PRD 和核心約束，本次前端重構**不會對現有的後端資料模型或資料庫 Schema 產生任何變更**。

---

## 5. 元件架構 (Component Architecture)

採用**原子設計 (Atomic Design)** 的原則來組織元件，分為原子、分子、組織等層級。

### 5.1 新元件的檔案結構 (New Component File Structure)
```

apps/client/src/components/
├── atoms/
├── molecules/
└── organisms/

````

### 5.2 元件層級關係圖 (Component Hierarchy Diagram)
```mermaid
graph TD
    subgraph Pages (頁面)
        P1[活動詳情頁]
    end
    subgraph Templates (模板)
        T1[頁面佈局]
    end
    subgraph Organisms (組織)
        O1[Header]
        O2[EventCard]
    end
    subgraph Molecules (分子)
        M1[FormField]
    end
    subgraph Atoms (原子)
        A1[Button]
        A2[Input]
        A3[StyledText]
    end
    T1 --> P1
    O1 & O2 --> T1
    M1 --> O1 & O2
    A1 & A2 & A3 --> M1
````

-----

## 6\. 源碼樹整合 (Source Tree Integration)

### 6.1 新增檔案的組織規劃 (New File Organization Plan)

```
apps/client/src/
├── ... (existing folders)
├── components/
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── theme/
│   └── index.ts
├── localization/
│   ├── index.ts
│   └── locales/
│       └── zh-TW.json
└── ... (existing folders)
```

### 6.2 整合指南 (Integration Guidelines)

1.  **元件引用:** 畫面 (`screens`) 應優先引用 `components/` 目錄中的可複用元件。
2.  **樣式與主題:** 所有元件樣式必須透過 `theme/index.ts` 獲取，嚴禁硬編碼。
3.  **文字內容:** 所有靜態文字必須透過 i18n 函數呈現，嚴禁硬編碼。

-----

## 7\. 系統整合遵循原則 (System Integration Adherence)

對於**基礎設施與部署**、**編碼標準**、**測試策略**和**安全性**，核心原則是**完全遵循並整合至現有系統**。

  * **部署:** 不變更現有 CI/CD 流程。
  * **標準:** 新程式碼需通過現有 Linter 和 Formatter 檢查。
  * **測試:** 新元件的單元測試需使用現有測試框架。

<!-- end list -->

