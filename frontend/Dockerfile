# 前端：构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 依赖
COPY package.json package-lock.json* ./
RUN npm ci

# 构建时传入 API 地址与 base 路径。线上构建必须传 VITE_API_URL，否则前端会请求 localhost:3001
# 后端地址为 http://8.137.120.220:3001，接口前缀为 /api，故 VITE_API_URL=http://8.137.120.220:3001/api
# 云效示例: docker build --build-arg VITE_API_URL=http://8.137.120.220:3001/api -t frontend .
ARG VITE_BASE_PATH=/assets-management/
ARG VITE_API_URL=
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# 运行阶段：Nginx 托管静态资源
FROM nginx:alpine

# 使用项目内 nginx 配置（支持 SPA 与 base 路径）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 将构建产物放到 /assets-management/ 下（与 VITE_BASE_PATH 一致）
COPY --from=builder /app/dist /usr/share/nginx/html/assets-management

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
