# Zeabur 部署指南

## 方法 1: 使用 Zeabur Web 界面（推薦）

### 步驟 1: 創建或選擇項目
1. 登入 [Zeabur Dashboard](https://dash.zeabur.com)
2. 使用現有的 `jctop-event` 項目或創建新項目

### 步驟 2: 部署 PostgreSQL
1. 在項目中點擊 "Add Service"
2. 選擇 "Marketplace"
3. 搜索並選擇 "PostgreSQL"
4. 部署後記錄連接資訊

### 步驟 3: 部署 Backend
1. 點擊 "Add Service"
2. 選擇 "Git"
3. 連接 GitHub 並選擇 `golfamigo/JCTOPV2` repository
4. **重要**: 服務名稱設為 `backend`
5. Zeabur 會自動檢測到 `zeabur.json` 並使用正確的配置
6. 設置環境變數：
   ```
   NODE_ENV=production
   DATABASE_URL=[從PostgreSQL服務複製連接字串]
   JWT_SECRET=[自動生成或自定義]
   ENCRYPTION_SECRET_KEY=abcdefghijklmnopqrstuvwxyz123456
   CORS_ORIGIN=https://[frontend域名]
   ```

### 步驟 4: 部署 Frontend
1. 再次點擊 "Add Service"
2. 選擇 "Git"
3. 選擇同一個 repository `golfamigo/JCTOPV2`
4. **重要**: 服務名稱設為 `frontend`
5. 設置環境變數：
   ```
   EXPO_PUBLIC_API_URL=https://[backend域名]/api/v1
   ```

### 步驟 5: 綁定域名
1. 為 backend 服務綁定域名
2. 為 frontend 服務綁定域名

## 配置文件說明

我們已經設置好了 `zeabur.json`，它會告訴 Zeabur：
- backend 服務使用 `apps/server` 目錄和 `server.Dockerfile`
- frontend 服務使用 `apps/client` 目錄和 `client.Dockerfile`

## 重要提醒

1. **服務名稱必須匹配**: 創建服務時，名稱必須是 `backend` 和 `frontend`，與 zeabur.json 中定義的一致
2. **先部署 PostgreSQL**，再部署 Backend，最後部署 Frontend
3. **環境變數**: 確保所有環境變數都正確設置