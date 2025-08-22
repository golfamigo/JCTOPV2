# Google OAuth 設定指南

## 問題描述
當您看到錯誤 `Error 400: redirect_uri_mismatch` 時，表示 Google OAuth 設定的重定向 URI 不匹配。

## 設定步驟

### 1. 在 Google Cloud Console 設定 OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇或建立專案
3. 啟用 Google+ API:
   - 前往 **APIs & Services** > **Library**
   - 搜尋 "Google+ API" 並啟用

4. 建立 OAuth 2.0 憑證:
   - 前往 **APIs & Services** > **Credentials**
   - 點擊 **Create Credentials** > **OAuth client ID**
   - 選擇 **Web application**
   - 設定名稱（例如：JCTOP Event Management）

5. 設定授權的重定向 URI:
   ```
   # 本地開發環境
   http://localhost:3001/api/v1/auth/google/callback
   http://localhost:3000/auth/callback
   
   # 生產環境（如果有）
   https://your-domain.com/api/v1/auth/google/callback
   ```

6. 儲存後會顯示:
   - **Client ID**: 類似 `123456789-xxxxx.apps.googleusercontent.com`
   - **Client Secret**: 一串密碼

### 2. 更新後端環境變數

編輯 `/home/golfamigo/projects/JCTOPV2/apps/server/.env.local`:

```bash
# 替換成您的真實憑證
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
```

### 3. 重新啟動服務

#### 方法 A: 使用 Docker Compose（推薦）
```bash
cd /home/golfamigo/projects/JCTOPV2
docker-compose -f docker-compose.local.yml up -d
```

#### 方法 B: 直接運行後端
```bash
cd /home/golfamigo/projects/JCTOPV2/apps/server
npm run start:dev
```

### 4. 測試 Google 登入

1. 開啟瀏覽器前往 http://localhost:3000
2. 點擊 "Sign in with Google"
3. 應該會重定向到 Google 登入頁面
4. 登入後會回到應用程式

## 疑難排解

### 錯誤: redirect_uri_mismatch
- 確認 Google Console 中的重定向 URI 與環境變數完全一致
- 注意 http vs https
- 注意尾部斜線
- 確認 port 號碼正確

### 錯誤: invalid_client
- 確認 Client ID 和 Client Secret 正確
- 確認憑證類型是 "Web application"

### 錯誤: access_denied
- 確認 Google+ API 已啟用
- 確認 OAuth 同意畫面已設定

## 安全提醒

⚠️ **重要**: 
- 永遠不要將真實的 Google OAuth 憑證提交到 Git
- 使用環境變數或 .env 文件（已加入 .gitignore）
- 生產環境使用不同的憑證

## 相關文件

- [Google OAuth 2.0 文檔](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)