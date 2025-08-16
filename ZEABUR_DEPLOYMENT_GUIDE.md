# Zeabur Monorepo 部署配置

## 專案結構
本專案採用 Monorepo 架構，包含三個主要服務：
- **後端服務 (server)**: 位於 `apps/server/`
- **前端服務 (client)**: 位於 `apps/client/`
- **資料庫服務 (database)**: PostgreSQL

## Zeabur 部署策略
我們採用**Template YAML 方法**，這是最先進且可維護的方案，提供「基礎設施即程式碼」的優勢。

## 配置文件說明

### 1. zeabur.yaml（專案根目錄）
這是最重要的文件，定義了整個應用的服務架構：
- 自動創建並配置 PostgreSQL 資料庫
- 部署後端服務（使用 server.Dockerfile）
- 部署前端服務（使用 client.Dockerfile）
- 自動設置服務間的連接和環境變數

### 2. Dockerfile 文件（專案根目錄）
- `server.Dockerfile`: 後端多階段構建
  - 處理 Monorepo 依賴
  - 構建 TypeScript 和 shared-types
  - 生產環境優化
  
- `client.Dockerfile`: 前端構建
  - 構建 Expo Web 應用
  - 使用 Nginx 托管靜態文件
  - 支援 SPA 路由

### 3. zbpack 配置文件（可選）
- `zbpack.server.json`: 確保使用正確的 Dockerfile
- `zbpack.client.json`: 確保使用正確的 Dockerfile

## Zeabur 部署步驟（使用 Template YAML）

### 步驟 1：準備檔案
確保以下檔案都在專案根目錄：
- ✅ `zeabur.yaml` - 服務架構定義
- ✅ `server.Dockerfile` - 後端 Dockerfile
- ✅ `client.Dockerfile` - 前端 Dockerfile
- ✅ `nginx.conf` - Nginx 配置
- ✅ `zbpack.server.json` - 後端配置
- ✅ `zbpack.client.json` - 前端配置

### 步驟 2：在 Zeabur 部署
1. 登入 Zeabur Dashboard
2. 創建新專案或選擇現有專案
3. 點擊 **「Add Service」（新增服務）**
4. **重要**：選擇 **「Deploy from Git Repository」**（不是 Deploy from Template）
5. 選擇你的 GitHub 帳號並授權
6. 選擇 `JCTOPV2` 倉庫
7. Zeabur 會自動偵測 `zeabur.yaml` 並顯示即將創建的服務：
   - `database` - PostgreSQL 資料庫
   - `server` - 後端 API
   - `client` - 前端應用
8. 點擊 **「Deploy」** 開始部署

### 步驟 3：設置環境變數（如需要）
如果你想使用 Google OAuth，在 Zeabur Dashboard 設置：
```
GOOGLE_CLIENT_ID=[從 Google Cloud Console 獲取]
GOOGLE_CLIENT_SECRET=[從 Google Cloud Console 獲取]
```

所有其他環境變數會自動設置！

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

1. **Template YAML 優勢**：
   - 一個文件定義整個應用架構
   - 自動處理服務間的依賴和連接
   - 環境變數自動注入（如 `${database.POSTGRES_CONNECTION_STRING}`）
   - 基礎設施即程式碼（IaC）

2. **服務命名與 Dockerfile 匹配**：
   - 服務名 `server` → 使用 `server.Dockerfile`
   - 服務名 `client` → 使用 `client.Dockerfile`
   - 自動通過 zbpack 配置或命名慣例匹配

3. **Monorepo 支援**：
   - Dockerfile 正確處理 shared-types 依賴
   - 多階段構建優化映像大小
   - 工作區依賴自動連結

4. **自動化網路配置**：
   - 資料庫自動連接到後端
   - 前端自動配置 API 端點
   - 服務間通過內部網路通訊

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