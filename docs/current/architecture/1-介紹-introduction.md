# 1. 介紹 (Introduction)

本文件 outlines the architectural approach for enhancing JCTOPV2. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development of new features while ensuring seamless integration with the existing system.

## 1.1 現有專案分析 (Existing Project Analysis)

* **現有技術棧 (Current Tech Stack):** 我們將在現有的 Expo (SDK 53) + Node.js (Express) + PostgreSQL 的 Monorepo 結構上進行開發。
* **架構風格 (Architecture Style):** 前端為元件化架構，後端為分層服務架構。API 透過 JWT 進行驗證。
* **關鍵約束 (Key Constraint):** 所有工作都必須在不破壞現有後端 API 合約、導航邏輯和狀態管理邏輯的前提下進行。

## 1.2 變更日誌 (Change Log)

| 日期 | 版本 | 描述 | 作者 |
| :--- | :--- | :--- | :--- |
| 2025年8月5日 | 1.0 | 建立前端重構專案的技術架構草案。 | Winston (Architect) |

---
