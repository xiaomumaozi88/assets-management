# 后端：构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# 运行阶段：仅保留运行时依赖与构建产物
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3001

# 只安装生产依赖
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# 运行时环境变量由云效/编排在运行容器时注入，例如：
# DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
# JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN, PORT
CMD ["node", "dist/main.js"]
