# Zeabur 環境變數配置

## 後端服務 (jctop-backend)

複製以下環境變數到 Zeabur 後端服務設置：

```env
NODE_ENV=production
DATABASE_URL=（Zeabur PostgreSQL 會自動提供）
JWT_SECRET=1322fa7e9a2c139f54b2ef1f72c310e4
ENCRYPTION_SECRET_KEY=55f57ce844a791941af169291907e043
CORS_ORIGIN=https://jctop-frontend.zeabur.app
GOOGLE_CLIENT_ID=（從 Google Cloud Console 獲取）
GOOGLE_CLIENT_SECRET=（從 Google Cloud Console 獲取）
GOOGLE_CALLBACK_URL=https://jctop-backend.zeabur.app/api/v1/auth/google/callback
```

## 前端服務 (jctop-frontend)

```env
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://jctop-backend.zeabur.app/api/v1
```

## 重要提示

1. **DATABASE_URL**: 
   - 如果使用 Zeabur 的 PostgreSQL，創建數據庫服務後會自動提供
   - 格式: `postgresql://user:password@host:port/database`

2. **域名**:
   - 根據實際分配的域名更新 `CORS_ORIGIN` 和 `EXPO_PUBLIC_API_URL`
   - 後端域名範例: `jctop-backend.zeabur.app`
   - 前端域名範例: `jctop-frontend.zeabur.app`

3. **Google OAuth 設置**:
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 創建 OAuth 2.0 客戶端 ID
   - 添加授權重定向 URI: `https://你的後端域名/api/v1/auth/google/callback`

4. **密鑰安全**:
   - JWT_SECRET: `1322fa7e9a2c139f54b2ef1f72c310e4`
   - ENCRYPTION_SECRET_KEY: `55f57ce844a791941af169291907e043`
   - ⚠️ 這些是隨機生成的安全密鑰，請妥善保管
   - ⚠️ 不要將這些密鑰提交到 Git 倉庫

## 部署檢查清單

- [ ] 創建 PostgreSQL 服務
- [ ] 設置後端服務環境變數
- [ ] 部署後端服務
- [ ] 驗證後端健康檢查: `https://後端域名/api/v1/health`
- [ ] 設置前端服務環境變數
- [ ] 部署前端服務
- [ ] 測試完整應用功能

## 故障排除

如果遇到問題：
1. 檢查 Zeabur 構建日誌
2. 確認 Dockerfile 路徑正確
3. 驗證所有環境變數都已設置
4. 確認 ENCRYPTION_SECRET_KEY 正好是 32 個字符（上面提供的已確認）