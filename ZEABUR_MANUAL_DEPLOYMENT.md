# Zeabur 手動部署指南

由於 Template 自動識別有問題，我們採用手動部署策略。

## 步驟 1：部署 PostgreSQL 資料庫

1. 在 Zeabur Dashboard 創建新專案
2. 點擊 **Add Service**
3. 選擇 **Marketplace**
4. 選擇 **PostgreSQL**
5. 等待資料庫啟動

## 步驟 2：部署後端服務

1. 在同一專案中，點擊 **Add Service**
2. 選擇 **Deploy from Git Repository**
3. 選擇你的 `JCTOPV2` 倉庫
4. **服務名稱設為**: `backend`
5. Zeabur 應該會自動使用 `server.Dockerfile`
6. 在環境變數中設置：
   ```
   NODE_ENV=production
   DATABASE_URL=(從 PostgreSQL 服務複製連接字串)
   JWT_SECRET=your-32-character-secret-key-here
   ENCRYPTION_SECRET_KEY=test-encryption-key-32-charsssss
   CORS_ORIGIN=https://[你的前端域名]
   ```

## 步驟 3：部署前端服務

1. 再次點擊 **Add Service**
2. 選擇 **Deploy from Git Repository**
3. 選擇同一個 `JCTOPV2` 倉庫
4. **服務名稱設為**: `frontend`
5. Zeabur 應該會自動使用 `client.Dockerfile`
6. 在環境變數中設置：
   ```
   EXPO_PUBLIC_API_URL=https://[你的後端域名]/api/v1
   ```

## 步驟 4：配置域名

1. 為後端服務綁定域名（例如：api-jctop.zeabur.app）
2. 為前端服務綁定域名（例如：jctop.zeabur.app）
3. 更新環境變數中的域名

## 驗證

1. 訪問後端健康檢查：`https://[後端域名]/api/v1/health`
2. 訪問前端應用：`https://[前端域名]`

## 環境變數參考

### 後端必需的環境變數：
- `NODE_ENV`: production
- `DATABASE_URL`: PostgreSQL 連接字串
- `JWT_SECRET`: 32 字符的密鑰
- `ENCRYPTION_SECRET_KEY`: 必須正好 32 字符
- `CORS_ORIGIN`: 前端的完整 URL

### 前端必需的環境變數：
- `EXPO_PUBLIC_API_URL`: 後端 API 的完整 URL

## 故障排除

如果服務沒有使用正確的 Dockerfile：
1. 檢查服務名稱是否正確（backend/frontend）
2. 檢查 zbpack.json 是否存在
3. 確認 Dockerfile 在專案根目錄