#!/bin/bash

# 测试 Supabase 数据库连接
# 使用方法: ./test-db-connection.sh

echo "🔍 测试 Supabase 数据库连接..."
echo ""

DB_HOST="db.omtonocmwbqkadzkzmlt.supabase.co"
DB_PORT="5432"
DB_USERNAME="postgres"
DB_PASSWORD="Ll3uXrXdiiMZ0KTv"
DB_DATABASE="postgres"

# 检查 psql 是否安装
if ! command -v psql &> /dev/null; then
    echo "❌ psql 未安装，无法测试连接"
    echo "💡 可以通过以下方式安装："
    echo "   macOS: brew install postgresql"
    echo ""
    echo "或者直接使用 Railway 部署，部署后会自动测试连接"
    exit 1
fi

echo "📋 连接信息："
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_DATABASE"
echo "   User: $DB_USERNAME"
echo ""

# 测试连接
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_DATABASE -c "\conninfo" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 数据库连接成功！"
    echo ""
    echo "💡 下一步："
    echo "   1. 部署到 Railway"
    echo "   2. 运行初始化脚本: npm run init:data"
else
    echo ""
    echo "❌ 数据库连接失败"
    echo "💡 请检查："
    echo "   1. 网络连接"
    echo "   2. 数据库密码是否正确"
    echo "   3. Supabase 项目是否正常运行"
fi

