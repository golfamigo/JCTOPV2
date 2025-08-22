#!/bin/bash
# 測試 Google OAuth 設定

echo "測試 Google OAuth 設定..."
echo "=========================="

# 測試後端健康狀態
echo "1. 檢查後端服務..."
curl -s https://jctop.zeabur.app/api/v1/health || echo "後端服務可能有問題"

echo ""
echo "2. 測試 OAuth 端點..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://jctop.zeabur.app/api/v1/auth/google)
if [ "$response" = "302" ]; then
    echo "✅ OAuth 端點正常 (302 重定向)"
else
    echo "❌ OAuth 端點異常 (HTTP $response)"
fi

echo ""
echo "3. 獲取重定向 URL..."
curl -s -I https://jctop.zeabur.app/api/v1/auth/google | grep -i location

echo ""
echo "=========================="
echo "如果看到重定向到 accounts.google.com，表示設定正確"
echo "如果看到錯誤，請檢查 Zeabur 環境變數"