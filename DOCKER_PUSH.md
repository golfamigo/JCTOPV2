# 推送 Docker Images 到 Docker Hub

## 1. 在 Docker Hub 創建 Access Token
1. 登入 https://hub.docker.com
2. 進入 Account Settings > Security
3. 點擊 "New Access Token"
4. 給 token 一個名稱（例如：zeabur-deployment）
5. 複製 token

## 2. 登入 Docker Hub
```bash
docker login -u golfamigo
# 輸入你的 Access Token 作為密碼
```

## 3. 推送 Images
```bash
# Images 已經標記好了
docker push golfamigo/jctopv2-backend:latest
docker push golfamigo/jctopv2-frontend:latest
```

## 4. 驗證 Images
訪問以下連結確認 images 已上傳：
- https://hub.docker.com/r/golfamigo/jctopv2-backend
- https://hub.docker.com/r/golfamigo/jctopv2-frontend

## 5. 部署到 Zeabur
Images 推送完成後，執行：
```bash
npx zeabur@latest template deploy -f zeabur-prebuilt.yaml --project-id 688edee906701c66c7145ed5 -i=false
```

這會部署三個服務：
- PostgreSQL 資料庫
- Backend API（使用你的 Docker image）
- Frontend Web（使用你的 Docker image）