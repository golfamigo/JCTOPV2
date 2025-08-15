# 5. 元件架構 (Component Architecture)

採用**原子設計 (Atomic Design)** 的原則來組織元件，分為原子、分子、組織等層級。

## 5.1 新元件的檔案結構 (New Component File Structure)
```

apps/client/src/components/
├── atoms/
├── molecules/
└── organisms/

````

## 5.2 元件層級關係圖 (Component Hierarchy Diagram)
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
