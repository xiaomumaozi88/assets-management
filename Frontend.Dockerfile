# 从仓库根目录构建前端（云效流水线上下文为仓库根时使用）
# 使用国内镜像源加速（DaoCloud 从云效拉取很慢，改用 1ms 或 阿里云加速器）
# 构建阶段
FROM docker.1ms.run/library/node:20-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

ARG VITE_BASE_PATH=/assets-management/
ARG VITE_API_URL=
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_API_URL=$VITE_API_URL

COPY frontend/ .
RUN npm run build

# 运行阶段
FROM docker.1ms.run/library/nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html/assets-management

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
