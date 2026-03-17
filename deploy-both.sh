#!/bin/bash
set -e

# ========== 镜像仓库：阿里云 ACR 个人版（成都）==========
# 登录: docker login --username=QGene crpi-oewwvqmlb6b1oaqg.cn-chengdu.personal.cr.aliyuncs.com
# ECS 与镜像仓库同 VPC 时可用内网拉取（更快、免公网流量）：
#   crpi-oewwvqmlb6b1oaqg-vpc.cn-chengdu.personal.cr.aliyuncs.com
# 云效「变量」可覆盖 BACKEND_IMAGE / FRONTEND_IMAGE（如用流水线构建出的版本号）。
# 使用 Supabase 时在云效配置: DB_HOST / DB_PASSWORD(保密) / DB_DATABASE=postgres / JWT_SECRET(保密)

REGISTRY="crpi-oewwvqmlb6b1oaqg.cn-chengdu.personal.cr.aliyuncs.com"
REPO="${REPO:-xiaomumaozi/touka_projects}"

BACKEND_IMAGE="${BACKEND_IMAGE:-$REGISTRY/$REPO:backend-latest}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-$REGISTRY/$REPO:frontend-latest}"

# 后端数据库与 JWT（在云效「变量」里配置）
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"
# Supabase 的库名为 postgres；本地可为 assets_management
DB_DATABASE="${DB_DATABASE:-postgres}"
JWT_SECRET="${JWT_SECRET:-your-production-secret-change-me}"
JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-7d}"
# 前端页面的访问地址，用于 CORS（后端据此放行跨域）。云效变量填: http://8.137.120.220
CORS_ORIGIN="${CORS_ORIGIN:-http://8.137.120.220}"

CONTAINER_BACKEND="assets-backend"
CONTAINER_FRONTEND="assets-frontend"

# ---------- 后端 ----------
echo ">>> 拉取后端镜像: $BACKEND_IMAGE"
docker pull "$BACKEND_IMAGE"

echo ">>> 停止并删除旧后端容器（若存在）"
docker stop $CONTAINER_BACKEND 2>/dev/null || true
docker rm $CONTAINER_BACKEND 2>/dev/null || true

echo ">>> 启动后端容器"
docker run -d \
  --name $CONTAINER_BACKEND \
  --restart unless-stopped \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DB_HOST="$DB_HOST" \
  -e DB_PORT="$DB_PORT" \
  -e DB_USERNAME="$DB_USERNAME" \
  -e DB_PASSWORD="$DB_PASSWORD" \
  -e DB_DATABASE="$DB_DATABASE" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
  -e CORS_ORIGIN="$CORS_ORIGIN" \
  "$BACKEND_IMAGE"

# ---------- 前端 ----------
echo ">>> 拉取前端镜像: $FRONTEND_IMAGE"
docker pull "$FRONTEND_IMAGE"

echo ">>> 停止并删除旧前端容器（若存在）"
docker stop $CONTAINER_FRONTEND 2>/dev/null || true
docker rm $CONTAINER_FRONTEND 2>/dev/null || true

echo ">>> 启动前端容器"
docker run -d \
  --name $CONTAINER_FRONTEND \
  --restart unless-stopped \
  -p 80:80 \
  "$FRONTEND_IMAGE"

echo ">>> 部署完成"
echo "    后端 API: http://<ECS公网IP>:3001"
echo "    前端页面: http://<ECS公网IP>/assets-management/"
