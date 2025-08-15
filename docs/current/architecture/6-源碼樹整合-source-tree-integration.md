# 6\. 源碼樹整合 (Source Tree Integration)

## 6.1 新增檔案的組織規劃 (New File Organization Plan)

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

## 6.2 整合指南 (Integration Guidelines)

1.  **元件引用:** 畫面 (`screens`) 應優先引用 `components/` 目錄中的可複用元件。
2.  **樣式與主題:** 所有元件樣式必須透過 `theme/index.ts` 獲取，嚴禁硬編碼。
3.  **文字內容:** 所有靜態文字必須透過 i18n 函數呈現，嚴禁硬編碼。

-----
