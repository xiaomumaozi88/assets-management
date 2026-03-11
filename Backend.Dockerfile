# 从仓库根目录构建后端（云效流水线上下文为仓库根时使用）
# 使用国内镜像源，避免云效构建时拉取 Docker Hub 超时
# 构建阶段
FROM docker.m.daocloud.io/library/node:20-alpine AS builder

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

COPY backend/ .
RUN npm run build

# 运行阶段
FROM docker.m.daocloud.io/library/node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3001

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
