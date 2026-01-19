#!/bin/bash

echo "🚀 开始安装和配置PostgreSQL..."

# 检查Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ 未找到Homebrew，请先安装Homebrew"
    exit 1
fi

# 安装PostgreSQL
echo "📦 正在安装PostgreSQL..."
if brew list postgresql@14 &> /dev/null; then
    echo "✅ PostgreSQL已安装"
else
    brew install postgresql@14
    if [ $? -ne 0 ]; then
        echo "❌ PostgreSQL安装失败"
        exit 1
    fi
fi

# 启动PostgreSQL服务
echo "🔄 正在启动PostgreSQL服务..."
brew services start postgresql@14

# 等待服务启动
sleep 3

# 检查PostgreSQL是否运行
if pg_isready -q; then
    echo "✅ PostgreSQL服务已启动"
else
    echo "⏳ 等待PostgreSQL服务启动..."
    sleep 5
    if ! pg_isready -q; then
        echo "❌ PostgreSQL服务启动失败"
        exit 1
    fi
fi

# 创建数据库
echo "📝 正在创建数据库..."
if psql -lqt | cut -d \| -f 1 | grep -qw assets_management; then
    echo "✅ 数据库 assets_management 已存在"
else
    createdb assets_management 2>/dev/null || psql postgres -c "CREATE DATABASE assets_management;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ 数据库 assets_management 创建成功"
    else
        echo "❌ 数据库创建失败，请手动创建："
        echo "   createdb assets_management"
        exit 1
    fi
fi

echo ""
echo "✅ PostgreSQL安装和配置完成！"
echo ""
echo "📋 数据库信息："
echo "   数据库名: assets_management"
echo "   主机: localhost"
echo "   端口: 5432"
echo "   用户: $(whoami)"
echo ""
echo "🔄 现在后端服务应该可以连接数据库了"


