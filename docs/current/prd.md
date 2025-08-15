# JCTOPV2 Brownfield Enhancement PRD

## 1. 介紹、專案分析與背景 (Intro, Project Analysis and Context)

### 1.1 增強範圍定義 (Enhancement Scope Definition)

#### 增強類型 (Enhancement Type)
* UI 現代化 (UI Modernization)
* 設計更新 (Design Refresh)
* 本地化 (Localization)

#### 增強描述 (Enhancement Description)
本專案旨在對現有的 JCTOPV2 行動應用程式進行全面的前端重構。主要目標是將 UI 元件庫從 Gluestack UI 遷移到 React Native Elements，並將所有使用者介面在地化為繁體中文，以提升使用者體驗與程式碼品質。

#### 影響評估 (Impact Assessment)
* [x] **重大影響 (Significant Impact)**
    * **理由：** 選擇「重大影響」是因為此專案涉及到替換整個 UI 函式庫，這會對所有前端畫面 (`screens`) 和元件 (`components`) 產生實質性的、大規模的程式碼變更，但核心的後端架構和業務邏輯保持不變。

### 1.2 目標與背景 (Goals and Background Context)

#### 目標 (Goals)
* **提升開發者體驗與程式碼可維護性：** 透過導入 `React Native Elements`，建立一套標準化、易於維護的 UI 元件系統。
* **統一應用程式的視覺與互動體驗：** 確保所有介面都有一致的設計語言，提升產品質感與專業度。
* **全面支援繁體中文，優化在地使用者體驗：** 將所有介面文字在地化，使其更貼近目標用戶的語言習慣。
* **為未來的產品迭代建立一個更穩固、更易於擴展的前端基礎。**

#### 背景 (Background Context)
目前的 JCTOPV2 應用程式採用 Gluestack UI，經評估後發現其與專案的長期發展目標匹配不佳，且缺乏對繁體中文使用者的最佳化支援。為了提升產品的市場競爭力、改善開發效率並提供更卓越的使用者體驗，本次重構將專注於將前端 UI 框架全面遷移至 React Native Elements，並完成徹底的繁體中文化。

#### 變更日誌 (Change Log)
| 日期 | 版本 | 描述 | 作者 |
| :--- | :--- | :--- | :--- |
| 2025年8月5日 | 1.0 | 建立 UI 重構與本地化專案的 PRD 草案。 | John (PM) |

---

## 2. 需求 (Requirements)

### 2.1 功能性需求 (Functional Requirements)
1.  **FR1:** 應用程式中所有由 Gluestack UI 建立的 UI 元件，都必須被替換為對應的 React Native Elements 元件。
2.  **FR2:** 應用程式內所有面向使用者的靜態文字，都必須轉換為繁體中文。
3.  **FR3:** 應導入一個業界標準的國際化 (i18n) 函式庫 (例如 i18next)，用於管理所有繁體中文文字，以便未來擴展其他語系。
4.  **FR4:** 替換後的元件功能必須與原始元件功能完全一致，不得有任何功能上的減損。

### 2.2 非功能性需求 (Non-Functional Requirements)
1.  **NFR1:** 新導入的 React Native Elements 元件樣式，必須建立一個統一的、可重複使用的主題 (Theme) 檔案進行管理。
2.  **NFR2:** 所有程式碼必須遵循專案現有的 ESLint 和 Prettier 規則，以確保程式碼風格一致。

### 2.3 相容性需求 (Compatibility Requirements)
1.  **CR1:** UI 重構不得影響現有的 API 端點合約及後端服務的任何行為。
2.  **CR2:** 現有的導航結構 (Navigation Structure) 和路由邏輯必須保持不變，僅替換頁面內的 UI 元件。
3.  **CR3:** 使用者狀態管理 (State Management) 的邏輯應盡可能保持不變，避免因 UI 替換而進行大規模的狀態邏輯重寫。

---

## 3. 使用者介面增強目標 (User Interface Enhancement Goals)

### 3.1 設計理念 (Design Philosophy)
1.  **簡潔現代 (Modern & Clean):** 採用簡潔、現代的設計語言，注重內容本身，減少不必要的裝飾，打造一個清晰、無干擾的使用者介面。
2.  **直觀易用 (Intuitive & User-Centric):** 以使用者為中心，確保操作流程直觀、易於學習，降低新用戶的上手門檻，並提升現有用戶的操作效率。
3.  **生動有趣 (Vibrant & Engaging):** 使用明亮、有活力的色彩，搭配流暢的微交互動畫，提升應用的吸引力與使用樂趣。

### 3.2 色彩方案建議 (Color Palette Proposal)
* **主色 (Primary):** `#007BFF` (活力藍) - 用於主要按鈕、活動元素和品牌標識。
* **中性色 (Neutrals):**
    * `#FFFFFF` (純白) - 主要背景色。
    * `#F8F9FA` (淺灰) - 卡片、區塊背景。
    * `#6C757D` (中灰) - 次要文字。
    * `#212529` (深黑) - 主要標題和內文。
* **輔助色 (Accents):**
    * `#28A745` (成功綠) - 成功提示。
    * `#DC3545` (危險紅) - 錯誤訊息、警示操作。
    * `#FFC107` (警告黃) - 警告提示。

### 3.3 字體排印建議 (Typography Proposal)
建議使用系統預設字體（iOS: San Francisco, Android: Roboto），以確保最佳的效能與平台原生感。字體大小和行高將建立一個清晰的視覺層級，易於閱讀。

### 3.4 UI 一致性需求 (UI Consistency Requirements)
1.  **全域主題 (Global Theme):** 所有 `React Native Elements` 元件的樣式都將由一個新建的全域主題檔案統一控制。
2.  **元件一致性 (Component Consistency):** 同類元件（如所有主要按鈕、輸入框）在整個應用中必須有統一的視覺和互動表現。
3.  **設計系統化 (Systematic Design):** 確保所有設計決策（間距、圓角、陰影）都遵循系統化的規則，而非個案處理。

---

## 4. 技術約束與整合需求 (Technical Constraints and Integration Requirements)

### 4.1 現有技術棧 (Existing Technology Stack)
重構工作將基於 Winston 分析出的現有技術棧。所有新程式碼都必須與以下核心技術相容：
* **前端:** React Native (Expo), React Navigation, Axios, Zod
* **後端:** Node.js / Express, PostgreSQL, JWT, Bcrypt
* **工具:** Turborepo, TypeScript

### 4.2 整合方式 (Integration Approach)
1.  **資料庫整合:** **無變更。**
2.  **API 整合:** **維持現有合約。**
3.  **前端整合:** **元件替換。**

### 4.3 程式碼組織 (Code Organization)
所有新的或修改過的 React 元件都必須遵循 `apps/client/src/` 目錄下現有的檔案結構。新的全域主題和 i18n 設定檔應放置在 `apps/client/src/theme` 或 `apps/client/src/config` 中。

### 4.4 部署與營運 (Deployment and Operations)
部署流程和 CI/CD 操作應保持不變。

### 4.5 風險評估 (Risk Assessment)
1.  **視覺回歸 (Visual Regression):** 替換元件可能導致細微的視覺差異。 **緩解策略:** 開發過程中進行頻繁的視覺比對。
2.  **功能遺漏 (Feature Omission):** 在替換複雜元件時，可能會遺漏某些次要功能。 **緩解策略:** 建立詳細的元件功能對照清單，並在驗收時逐一測試。