# Zeabur 部署指南

本項目包含前端和後端兩個獨立的服務，需要在 Zeabur 上分別部署。

## 服務架構

- **前端服務 (Frontend)**: React Native Web + Expo
- **後端服務 (Backend)**: NestJS API

## 部署步驟

### 1. 後端服務部署

1. 在 Zeabur 控制台創建新項目
2. 選擇「Deploy from GitHub」
3. 選擇倉庫：`golfamigo/JCTOPV2`
4. 配置服務：
   - **Service Name**: `jctop-backend`
   - **Dockerfile**: `Dockerfile.backend`
   - **Port**: 3000
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `DATABASE_URL=your_database_url`
     - `JWT_SECRET=your_jwt_secret`

### 2. 前端服務部署

1. 在同一個項目中添加新服務
2. 選擇「Deploy from GitHub」
3. 選擇倉庫：`golfamigo/JCTOPV2`
4. 配置服務：
   - **Service Name**: `jctop-frontend`  
   - **Dockerfile**: `Dockerfile.frontend`
   - **Port**: 3000
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `EXPO_PUBLIC_API_URL=https://your-backend-url/api/v1`

### 3. 網域配置

後端部署完成後，將獲得一個 Zeabur URL，例如：
`https://jctop-backend-xxx.zeabur.app`

前端的環境變數 `EXPO_PUBLIC_API_URL` 應該指向後端的 URL：
`https://jctop-backend-xxx.zeabur.app/api/v1`

## 配置文件

### 前端配置文件

- `apps/client/zeabur.json`: Zeabur 特定配置
- `apps/client/.env.production`: 生產環境變數
- `Dockerfile.frontend`: 前端容器化配置

### 後端配置文件

- `Dockerfile.backend`: 後端容器化配置
- `Dockerfile.zeabur`: Zeabur 優化配置（備用）

## 重要注意事項

1. **獨立部署**: 前後端作為兩個獨立的 Zeabur 服務部署
2. **CORS 配置**: 確保後端允許前端域名的跨域請求
3. **環境變數**: 前端需要正確的後端 API URL
4. **端口配置**: 兩個服務都使用 3000 端口（內部），Zeabur 會自動分配外部端口

## 故障排除

### 前端問題
- 檢查 `EXPO_PUBLIC_API_URL` 是否正確指向後端
- 確認 Expo 開發服務器在生產環境正常運行

### 後端問題
- 檢查資料庫連接配置
- 確認所有環境變數設定正確

### CORS 問題
- 在後端 main.ts 中配置 CORS 允許前端域名
- 確保 API 端點路徑正確 (`/api/v1`)