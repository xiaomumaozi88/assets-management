#!/bin/bash

echo "🚀 初始化数据库脚本"
echo ""

# 检查是否在 backend 目录
if [ ! -f "package.json" ]; then
    echo "⚠️  请在 backend 目录下运行此脚本"
    echo "或运行: cd backend && bash ../init-database.sh"
    exit 1
fi

echo "📋 步骤 1: 检查 Railway CLI"
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI 未安装"
    echo "安装命令: npm i -g @railway/cli"
    exit 1
fi
echo "✅ Railway CLI 已安装"
echo ""

echo "📋 步骤 2: 登录 Railway"
echo "执行: railway login"
railway login
if [ $? -ne 0 ]; then
    echo "❌ 登录失败"
    exit 1
fi
echo "✅ 登录成功"
echo ""

echo "📋 步骤 3: 连接到 Railway 项目"
echo "执行: railway link"
railway link
if [ $? -ne 0 ]; then
    echo "❌ 连接失败"
    exit 1
fi
echo "✅ 连接成功"
echo ""

echo "📋 步骤 4: 初始化数据库"
echo "执行: railway run npm run init:data"
railway run npm run init:data
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 数据库初始化成功！"
    echo ""
    echo "🎉 完成！现在可以测试后端 API 了"
else
    echo ""
    echo "❌ 数据库初始化失败"
    exit 1
fi

