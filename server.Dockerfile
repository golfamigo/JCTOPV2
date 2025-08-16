# Stage 1: Build Environment
FROM node:18-alpine AS builder

WORKDIR /app

# Monorepo 依賴處理
# 1. 複製根目錄的依賴管理文件
COPY package*.json ./

# 2. 複製所有工作區的 package.json 文件
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/shared-types/package.json ./packages/shared-types/

# 3. 安裝所有依賴
RUN npm install --legacy-peer-deps

# 4. 複製所有原始碼
COPY . .

# 5. 建構 shared-types
WORKDIR /app/packages/shared-types
RUN npm run build || echo "No build script for shared-types"

# 6. 建構後端應用
WORKDIR /app/apps/server
RUN npm run build

# Stage 2: Production Runtime
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# 複製 package.json 文件
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/shared-types/package*.json ./packages/shared-types/

# 安裝生產依賴和必要工具
RUN npm install --production --legacy-peer-deps && \
    npm install -g ts-node typescript

# 從建置階段複製建置產物
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# 複製必要的源文件（用於 TypeORM 遷移）
COPY apps/server/data-source.ts ./apps/server/
COPY apps/server/src/migrations ./apps/server/src/migrations

WORKDIR /app/apps/server

# 宣告容器監聽的埠號
# Zeabur 會透過 PORT 環境變數注入實際埠號
EXPOSE 3000

# 啟動應用程式
CMD ["node", "dist/main"]