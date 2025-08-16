# Zeabur Monorepo 部署配置

## 專案結構
本專案採用 Monorepo 架構，包含兩個主要服務：
- **後端服務 (server)**: 位於 `apps/server/`
- **前端服務 (client)**: 位於 `apps/client/`

## Zeabur 部署策略
根據 Zeabur Monorepo 部署權威指南，我們採用**策略 A：基於 Dockerfile 的方法**，以獲得最大的控制權和可攜性。

## 配置文件說明

### 1. zbpack 配置文件（專案根目錄）
- `zbpack.server.json`: 後端服務配置
  - 指定 `app_dir: "apps/server"` 來限定服務上下文
  - 使用 `Dockerfile.zeabur` 進行容器化構建
  
- `zbpack.client.json`: 前端服務配置
  - 指定 `app_dir: "apps/client"`
  - 使用 `client.Dockerfile` 進行容器化構建

### 2. Dockerfile 文件
- `apps/server/Dockerfile.zeabur`: 後端多階段構建
  - 階段 1：構建 TypeScript 並編譯 shared-types
  - 階段 2：生產環境精簡映像
  
- `apps/client/client.Dockerfile`: 前端構建
  - 包含 shared-types 編譯
  - 使用 Expo 生產模式

## Zeabur 部署步驟

### 步驟 1：創建 PostgreSQL 服務
1. 在 Zeabur 專案中添加 PostgreSQL 服務
2. Zeabur 會自動提供 `DATABASE_URL` 環境變數

### 步驟 2：部署後端服務
1. 創建新服務，命名為 `server`
2. 連接 GitHub 倉庫
3. **重要**：不需要設置根目錄或 Dockerfile 路徑（zbpack.server.json 會自動處理）
4. 設置環境變數：
   ```
   NODE_ENV=production
   JWT_SECRET=1322fa7e9a2c139f54b2ef1f72c310e4
   ENCRYPTION_SECRET_KEY=55f57ce844a791941af169291907e043
   CORS_ORIGIN=https://[前端域名]
   GOOGLE_CLIENT_ID=[從 Google Cloud Console 獲取]
   GOOGLE_CLIENT_SECRET=[從 Google Cloud Console 獲取]
   GOOGLE_CALLBACK_URL=https://[後端域名]/api/v1/auth/google/callback
   ```

### 步驟 3：部署前端服務
1. 創建新服務，命名為 `client`
2. 連接同一個 GitHub 倉庫
3. **重要**：不需要設置根目錄或 Dockerfile 路徑（zbpack.client.json 會自動處理）
4. 設置環境變數：
   ```
   EXPO_PUBLIC_API_URL=https://[後端域名]/api/v1
   ```

## 驗證部署

### 後端健康檢查
```bash
curl https://[後端域名]/api/v1/health
```
預期回應：
```json
{
  "status": "ok",
  "database": {"status": "connected"},
  "timestamp": "..."
}
```

### 前端訪問
直接訪問 `https://[前端域名]` 應該看到 Expo Web 應用程式

## 關鍵配置要點

1. **zbpack 配置優先級**：
   - Zeabur 會優先讀取 `zbpack.[service-name].json`
   - 這會覆蓋自動檢測的構建計畫

2. **Dockerfile 命名**：
   - 後端：`Dockerfile.zeabur`（位於 apps/server/）
   - 前端：`client.Dockerfile`（位於 apps/client/）

3. **Monorepo 上下文隔離**：
   - `app_dir` 設定確保每個服務只看到自己的子目錄
   - 避免了 zbpack 在專案根目錄的誤判

4. **私有網路通訊**：
   - 後端可通過內部主機名連接 PostgreSQL
   - 無需將資料庫暴露到公網

## 故障排除

如果部署失敗：
1. 檢查 Zeabur 構建日誌
2. 確認服務名稱與 zbpack 文件名稱匹配（server → zbpack.server.json）
3. 驗證所有環境變數都已正確設置
4. 確認 ENCRYPTION_SECRET_KEY 正好是 32 個字符

## 本地測試

使用 docker-compose 進行本地測試：
```bash
docker-compose -f docker-compose.test.yml up
```

這會啟動所有服務並驗證 Dockerfile 配置正確性。