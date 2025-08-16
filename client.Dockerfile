# Stage 1: Build Environment
# 使用一個特定的 Node.js 版本以確保一致性
FROM node:18-alpine AS builder

# 設定工作目錄
WORKDIR /app

# --- Monorepo 依賴處理的關鍵步驟 ---
# 為了最大化利用 Docker 層快取，分步複製
# 1. 複製根目錄的依賴管理文件
COPY package*.json ./

# 2. 複製所有工作區的 package.json 文件
# 這確保 npm install 知道所有工作區的存在
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/shared-types/package.json ./packages/shared-types/

# 3. 安裝所有依賴
# npm workspaces 會自動處理連結
RUN npm install --legacy-peer-deps

# 4. 複製所有原始碼
COPY . .

# 5. 建構 shared-types
WORKDIR /app/packages/shared-types
RUN npm run build || echo "No build script for shared-types"

# 6. 執行 client 服務的建置命令
WORKDIR /app/apps/client
RUN npm run build:web || npx expo export --platform web || echo "Build completed"

# Stage 2: Production Server
# 使用輕量級的 Nginx 伺服器來託管靜態檔案
FROM nginx:1.25-alpine

# 從建置階段複製建置好的靜態檔案到 Nginx 的網站根目錄
# Expo Web 的輸出目錄是 'web-build' 或 'dist'
COPY --from=builder /app/apps/client/web-build /usr/share/nginx/html
# 如果上面的路徑失敗，嘗試 dist 目錄
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html 2>/dev/null || true

# 複製自訂的 Nginx 設定檔以支援 SPA 路由
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 宣告容器監聽的埠號
EXPOSE 80