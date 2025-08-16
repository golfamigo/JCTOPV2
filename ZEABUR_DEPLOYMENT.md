# Zeabur 部署指南（簡化版）

## 當前配置

```
JCTOPV2/
├── Dockerfile.backend   # 後端 Dockerfile
├── Dockerfile.frontend  # 前端 Dockerfile
├── zbpack.json         # 指向 Dockerfile.backend
├── apps/
│   ├── server/         # 後端代碼
│   └── client/         # 前端代碼
└── packages/
    └── shared-types/   # 共享類型
```

## 部署步驟

### 1. 部署 PostgreSQL
- 在 Zeabur Dashboard 創建新項目
- 添加 PostgreSQL 服務（從 Marketplace）
- 記錄連接字串

### 2. 部署後端
- 添加 Git 服務
- 選擇 `golfamigo/JCTOPV2` repository
- **服務名稱**: backend
- zbpack.json 已配置使用 `Dockerfile.backend`
- 設置環境變數：
  ```
  DATABASE_URL=[PostgreSQL連接字串]
  JWT_SECRET=[生成密鑰]
  ENCRYPTION_SECRET_KEY=abcdefghijklmnopqrstuvwxyz123456
  NODE_ENV=production
  ```

### 3. 部署前端

#### 方法 A: 使用分支
```bash
git checkout -b frontend
echo '{"dockerfile": "Dockerfile.frontend"}' > zbpack.json
git add zbpack.json
git commit -m "Configure for frontend"
git push origin frontend
```
然後在 Zeabur 添加新服務，選擇 `frontend` 分支

#### 方法 B: 手動修改
- 在 Zeabur 添加新的 Git 服務
- 選擇同一個 repository
- 部署後，在 Zeabur 控制台修改服務的構建配置
- 將 dockerfile 改為 `Dockerfile.frontend`

設置前端環境變數：
```
EXPO_PUBLIC_API_URL=https://[後端域名]/api/v1
```

## 為什麼這樣配置？

1. **Dockerfile 在根目錄**：因為需要訪問整個 monorepo 結構
2. **使用 zbpack.json**：強制 Zeabur 使用 Dockerfile 而不是自動檢測
3. **分開部署**：前端和後端作為獨立服務部署

## 注意事項

- **不要**在 apps 目錄下放 Dockerfile
- **不要**使用 yarn（會導致 monorepo 依賴錯誤）
- zbpack.json 控制使用哪個 Dockerfile