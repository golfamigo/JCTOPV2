# 🚀 JCTOPV2 Zeabur 部署完整指南（新手友善版）

## 📋 部署前準備清單

### 需要準備的帳號：
- [ ] GitHub 帳號（已有：golfamigo）
- [ ] Zeabur 帳號（使用 GitHub 登入）
- [ ] Google 帳號（用於 Google Cloud Console）
- [ ] Gmail 帳號（用於發送郵件）

### 需要的資訊：
- [ ] 一個專案名稱（建議：jctop-event）
- [ ] 記事本記錄重要資訊

## 🔄 步驟 1：提交程式碼到 GitHub

### 1.1 開啟命令提示字元（CMD）
```
1. 按 Windows + R
2. 輸入 cmd
3. 按 Enter
```

### 1.2 執行以下命令
```bash
# 進入專案目錄
cd E:\gitHub\JCTOPV2

# 查看目前狀態
git status

# 添加所有檔案
git add .

# 提交變更
git commit -m "Add Zeabur deployment configuration"

# 推送到 GitHub
git push origin main
```

### 1.3 確認推送成功
- 開啟瀏覽器
- 前往 https://github.com/golfamigo/JCTOPV2
- 檢查最新的 commit 是否出現

## 🌐 步驟 2：註冊並登入 Zeabur

### 2.1 註冊 Zeabur
1. 開啟瀏覽器，前往 https://zeabur.com
2. 點擊右上角「Sign In」
3. 選擇「Continue with GitHub」
4. 授權 Zeabur 存取您的 GitHub

### 2.2 創建新專案
1. 登入後點擊「Create Project」
2. 輸入專案名稱：`jctop-event`
3. 選擇地區：`Asia Pacific (Tokyo)`（離台灣最近）

## 📊 步驟 3：部署資料庫

### 3.1 添加 PostgreSQL
1. 在專案頁面點擊「Add Service」
2. 選擇「Marketplace」標籤
3. 找到「PostgreSQL」點擊「Deploy」
4. 等待部署完成（約 1-2 分鐘）

### 3.2 記錄資料庫資訊
1. 點擊剛部署的 PostgreSQL 服務
2. 點擊「Variables」標籤
3. 找到 `DATABASE_URL` 並複製（稍後會用到）

## 🖥️ 步驟 4：部署後端服務

### 4.1 添加後端服務
1. 回到專案頁面，點擊「Add Service」
2. 選擇「Git」標籤
3. 選擇 `golfamigo/JCTOPV2`
4. 點擊「Deploy」

### 4.2 配置後端服務
點擊剛創建的服務，進行以下設定：

1. **基本設定**（Settings 標籤）：
   - Service Name: `backend`
   - Root Directory: `apps/server`
   - Port: `3000`

2. **環境變數**（Variables 標籤）：
   點擊「Bulk Edit」，貼上以下內容：

```env
# 基本設定
NODE_ENV=production
PORT=3000

# JWT 密鑰（請更換成您自己的）
JWT_SECRET=your_super_secret_key_please_change_this_12345678901234567890
JWT_EXPIRES_IN=30d

# CORS 設定（稍後更新）
CORS_ORIGIN=http://localhost:3000

# Email 設定（使用您的 Gmail）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google OAuth（暫時留空）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# ECPay 測試環境
ECPAY_MERCHANT_ID=3002607
ECPAY_HASH_KEY=pwFHCqoQZGmho4w6
ECPAY_HASH_IV=EkRm7iFT261dpevs
ECPAY_RETURN_URL=https://backend.zeabur.app/api/v1/payments/ecpay/return
ECPAY_PAYMENT_INFO_URL=https://backend.zeabur.app/api/v1/payments/ecpay/notify
```

3. 點擊「Save」保存設定

## 🎨 步驟 5：部署前端服務

### 5.1 添加前端服務
1. 回到專案頁面，點擊「Add Service」
2. 選擇「Git」標籤
3. 再次選擇 `golfamigo/JCTOPV2`
4. 點擊「Deploy」

### 5.2 配置前端服務
1. **基本設定**：
   - Service Name: `frontend`
   - Root Directory: `apps/client`
   - Port: `80`

2. **指定 Dockerfile**：
   在 Settings 中找到「Dockerfile Path」
   輸入：`Dockerfile.web`

3. **環境變數**：
```env
EXPO_PUBLIC_API_URL=https://backend-xxxxx.zeabur.app
```
（xxxxx 會是您的後端服務實際網址）

## 🔧 步驟 6：取得服務網址並更新設定

### 6.1 取得網址
1. 點擊後端服務，在「Domains」標籤找到網址
   - 例如：`https://backend-abc123.zeabur.app`
2. 點擊前端服務，在「Domains」標籤找到網址
   - 例如：`https://frontend-xyz789.zeabur.app`

### 6.2 更新環境變數
1. **更新後端 CORS_ORIGIN**：
   - 回到後端服務的 Variables
   - 更新 `CORS_ORIGIN` 為前端網址
   
2. **更新前端 API URL**：
   - 回到前端服務的 Variables
   - 更新 `EXPO_PUBLIC_API_URL` 為後端網址

3. **更新 ECPay 回調網址**：
   - 更新後端的 ECPay 相關 URL 為實際網址

## ✅ 步驟 7：測試部署

### 7.1 檢查後端
1. 開啟瀏覽器
2. 訪問：`https://[您的後端網址]/api/v1/health`
3. 應該看到健康檢查回應

### 7.2 檢查 API 文檔
訪問：`https://[您的後端網址]/api`
應該看到 Swagger API 文檔

### 7.3 檢查前端
訪問您的前端網址，應該看到首頁

## 🔐 步驟 8：設定 Gmail 應用程式密碼

### 8.1 啟用兩步驟驗證
1. 前往 https://myaccount.google.com/security
2. 開啟「兩步驟驗證」

### 8.2 產生應用程式密碼
1. 在安全性頁面，點擊「應用程式密碼」
2. 選擇「郵件」和「其他（自訂名稱）」
3. 輸入「JCTOP Event」
4. 複製產生的 16 位密碼
5. 更新 Zeabur 後端的 `SMTP_PASS`

## 🎯 步驟 9：生成安全的 JWT 密鑰

### 9.1 使用線上工具
1. 訪問 https://www.random.org/strings/
2. 設定：
   - 字串長度：64
   - 字元類型：選擇所有
3. 生成並複製

### 9.2 更新 JWT_SECRET
在 Zeabur 後端服務的環境變數中更新

## 🚨 常見問題解決

### 問題 1：資料庫連接失敗
- 檢查 PostgreSQL 服務是否正常運行
- 確認環境變數中的 DATABASE_URL 正確

### 問題 2：前端無法連接後端
- 檢查 CORS_ORIGIN 是否設定正確
- 確認 EXPO_PUBLIC_API_URL 包含 https://

### 問題 3：部署一直失敗
- 查看 Zeabur 的 Build Logs
- 確認 Dockerfile 路徑正確

## 📞 需要協助？

如果遇到任何問題：
1. 截圖錯誤訊息
2. 查看 Zeabur 的 Logs 標籤
3. 記錄您執行到哪個步驟

## 🎉 恭喜！

完成以上步驟後，您的 JCTOPV2 專案就成功部署到 Zeabur 了！

### 下一步：
1. 設定自定義網域
2. 配置 Google OAuth
3. 升級到正式的 ECPay 帳號
4. 設定備份策略