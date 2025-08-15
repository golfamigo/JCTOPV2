# Zeabur 部署指南

本項目包含前端和後端兩個獨立的服務，使用 Zeabur Prebuilt Images 進行部署。

## 服務架構

- **前端服務 (Frontend)**: React Native Web + Expo
- **後端服務 (Backend)**: NestJS API

## 推薦部署方法：使用 Prebuilt Images

### 1. 後端服務部署

1. 在 Zeabur 控制台創建新項目
2. 選擇「Deploy from GitHub」
3. 選擇倉庫：`golfamigo/JCTOPV2`
4. **重要**：設定 **Root Directory** 為 `apps/server`
5. Zeabur 會自動檢測 `zeabur.json` 配置：
   - **Service Name**: `jctop-backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start:prod`
   - **Port**: 3000
6. 設定環境變數：
   - `NODE_ENV=production`
   - `DATABASE_URL=your_database_url`
   - `JWT_SECRET=your_jwt_secret`

### 2. 前端服務部署

1. 在同一個項目中添加新服務
2. 選擇「Deploy from GitHub」
3. 選擇倉庫：`golfamigo/JCTOPV2`
4. **重要**：設定 **Root Directory** 為 `apps/client`
5. Zeabur 會自動檢測 `zeabur.json` 配置：
   - **Service Name**: `jctop-frontend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run web`
   - **Port**: 3000
6. 設定環境變數：
   - `NODE_ENV=production`
   - `BACKEND_URL=your-backend-service-url` (Zeabur 內部 URL)

### 3. 服務間通信配置

Zeabur 會自動為每個服務生成內部和外部 URL：

**內部通信**（推薦）：
- 後端內部 URL: `http://jctop-backend:3000`
- 前端環境變數設定: `BACKEND_URL=http://jctop-backend:3000`

**外部 URL**（如果需要）：
- 後端外部 URL: `https://jctop-backend-xxx.zeabur.app`

## 配置文件

### 前端配置文件
- `apps/client/zeabur.json`: Zeabur Prebuilt 配置
- `apps/client/.env.production`: 生產環境變數

### 後端配置文件
- `apps/server/zeabur.json`: Zeabur Prebuilt 配置

## 優勢

使用 Prebuilt Images 方法的優勢：

1. **更快的構建時間** - 使用 Zeabur 優化的 Node.js 映像
2. **自動依賴檢測** - Zeabur 自動安裝 monorepo 依賴
3. **智能緩存** - 更好的構建緩存機制
4. **簡化維護** - 不需要維護 Dockerfile
5. **自動優化** - Zeabur 自動應用最佳實踐

## 重要注意事項

1. **Root Directory**: 每個服務必須設定正確的根目錄
   - 後端: `apps/server`
   - 前端: `apps/client`

2. **環境變數**: 使用 Zeabur 變數替換功能
   - `${BACKEND_URL}` 會自動替換為後端服務 URL

3. **服務發現**: Zeabur 內部服務可以通過服務名稱互相訪問

## 故障排除

### 構建問題
- 確認 `zeabur.json` 配置正確
- 檢查 Root Directory 設定

### 連接問題
- 驗證環境變數設定
- 檢查服務間網路配置

### 性能問題
- 檢查 Zeabur 資源配置
- 監控服務日誌

## 備用方案

如果 Prebuilt Images 遇到問題，仍可使用自定義 Dockerfile：
- 前端: `Dockerfile.frontend`
- 後端: `Dockerfile.backend`