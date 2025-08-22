# Zeabur Google OAuth 設定

## 步驟 1: Google Cloud Console 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇項目: **jctop-469805**
3. 前往 **APIs & Services** > **Credentials**
4. 編輯您的 OAuth 2.0 Client ID
5. 在 **Authorized redirect URIs** 新增:
   ```
   https://jctop.zeabur.app/api/v1/auth/google/callback
   ```

## 步驟 2: Zeabur 環境變數設定

### 方法 A: 使用 Zeabur 網頁介面

1. 登入 [Zeabur Console](https://dash.zeabur.com/)
2. 選擇您的專案
3. 點擊後端服務 (backend-api)
4. 前往 **Variables** 標籤
5. 更新或新增以下環境變數:

```bash
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET  
GOOGLE_CALLBACK_URL=https://jctop.zeabur.app/api/v1/auth/google/callback
```

### 方法 B: 使用 Zeabur CLI

```bash
# 登入 Zeabur
zeabur auth login

# 列出服務
zeabur service list

# 設定環境變數
zeabur env set GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID" --service backend-api
zeabur env set GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET" --service backend-api  
zeabur env set GOOGLE_CALLBACK_URL="https://jctop.zeabur.app/api/v1/auth/google/callback" --service backend-api

# 重新部署服務
zeabur service deploy --service backend-api
```

## 步驟 3: 驗證設定

1. 前往 https://jctop-web.zeabur.app (或您的前端 URL)
2. 點擊 "Sign in with Google"
3. 應該成功重定向到 Google 登入頁面
4. 授權後應該返回應用程式

## 重要提醒

⚠️ **安全性**:
- 這些憑證僅用於開發和測試
- 生產環境應使用不同的憑證
- 確保 Zeabur 環境變數設為私密

## 疑難排解

### 仍然出現 redirect_uri_mismatch
- 確認 Google Console 中的 URI 完全匹配（包括 https）
- 等待 5-10 分鐘讓 Google 更新生效
- 清除瀏覽器快取

### 無法連接到後端
- 檢查 Zeabur 服務是否正在運行
- 確認 CORS 設定包含前端 URL

## 相關連結

- [Zeabur Dashboard](https://dash.zeabur.com/)
- [Google Cloud Console - OAuth](https://console.cloud.google.com/apis/credentials?project=jctop-469805)