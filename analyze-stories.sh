#!/bin/bash

echo "# JCTOP Stories 完整分析報告"
echo ""
echo "## 系統章節分類"
echo ""

# Chapter 1: User Authentication (1.1-1.8)
echo "### 📌 Chapter 1: 使用者認證系統 (1.1-1.8)"
for i in {1..8}; do
  file="1.$i.story.md"
  if [ -f "$file" ]; then
    title=$(grep -m1 "^#\s" "$file" | sed 's/# //')
    echo "- $title"
  fi
done
echo ""

# Chapter 2: Event Management (2.1-2.6)
echo "### 📅 Chapter 2: 活動管理系統 (2.1-2.6)"
for i in {1..6}; do
  file="2.$i.story.md"
  if [ -f "$file" ]; then
    title=$(grep -m1 "^#\s" "$file" | sed 's/# //')
    echo "- $title"
  fi
done
echo ""

# Chapter 3: Registration & Payment (3.1-3.8)
echo "### 💳 Chapter 3: 註冊與支付系統 (3.1-3.8)"
for i in {1..8}; do
  file="3.$i.story.md"
  if [ -f "$file" ]; then
    title=$(grep -m1 "^#\s" "$file" | sed 's/# //')
    echo "- $title"
  fi
done
echo ""

# Chapter 4: Check-in & Reporting (4.1-4.8)
echo "### ✅ Chapter 4: 報到與報表系統 (4.1-4.8)"
for i in {1..8}; do
  file="4.$i.story.md"
  if [ -f "$file" ]; then
    title=$(grep -m1 "^#\s" "$file" | sed 's/# //')
    echo "- $title"
  fi
done
echo ""

# Chapter 5: Deployment (5.1-5.2)
echo "### 🚀 Chapter 5: 部署與架構 (5.1-5.2)"
for i in {1..2}; do
  file="5.$i.story.md"
  if [ -f "$file" ]; then
    title=$(grep -m1 "^#\s" "$file" | sed 's/# //')
    echo "- $title"
  fi
done
echo ""

echo "## 詳細頁面結構分析"
echo ""

# Extract pages from each story
for file in *.story.md; do
  echo "### $file"
  # Get title
  title=$(grep -m1 "^#\s" "$file" | sed 's/# //')
  echo "**$title**"
  echo ""
  
  # Try to find pages/routes mentioned
  echo "頁面/路由："
  grep -E "(/[a-zA-Z\-]+|Page:|Screen:|Route:|頁面|畫面)" "$file" | head -10 | sed 's/^/  - /'
  echo ""
done