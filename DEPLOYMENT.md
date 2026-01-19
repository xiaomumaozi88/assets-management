# GitHub 部署指南

本文档介绍如何使用 GitHub Actions 自动部署前端和后端项目。

## 📋 目录

- [快速开始](#快速开始)
- [部署方案](#部署方案)
- [配置步骤](#配置步骤)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

## 🚀 快速开始

### 方案一：GitHub Pages + Vercel（推荐，免费）

- **前端**：GitHub Pages（免费静态托管）
- **后端**：Vercel（免费 Node.js 运行时，支持 PostgreSQL）

### 方案二：Vercel 全栈部署（最简单）

- **前端 + 后端**：都部署到 Vercel
- 支持自动 HTTPS、CDN、全球加速

### 方案三：Railway（适合需要更多数据库控制）

- **前端**：Vercel 或 GitHub Pages
- **后端 + 数据库**：Railway（提供 PostgreSQL）

## 📦 部署方案详解

### 方案一：GitHub Pages + Vercel

#### 1. 前端部署到 GitHub Pages

**优点**：
- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 与 GitHub 集成良好

**步骤**：

1. 在 GitHub 仓库设置中启用 Pages：
   - 进入 `Settings` → `Pages`
   - Source 选择 `GitHub Actions`

2. 配置环境变量（在仓库 Settings → Secrets and variables → Actions）：
   ```
   VITE_API_URL = https://your-backend-api.vercel.app/api
   ```

3. 推送到 main 分支即可自动部署

**访问地址**：
- `https://your-username.github.io/repo-name`
- 或自定义域名

#### 2. 后端部署到 Vercel

**步骤**：

1. 安装 Vercel CLI（本地测试）：
   ```bash
   npm i -g vercel
   ```

2. 登录 Vercel：
   ```bash
   vercel login
   ```

3. 在项目根目录创建 `vercel.json`（后端）：
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend/package.json",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "backend/dist/main.js"
       }
     ]
   }
   ```

4. 在 Vercel 控制台创建项目：
   - 访问 https://vercel.com
   - 导入 GitHub 仓库
   - Root Directory 设置为 `backend`
   - 配置环境变量

5. 获取 Vercel Token 和 Project ID：
   - Settings → Tokens：创建新 token
   - Project Settings → General：复制 Org ID 和 Project ID

6. 在 GitHub 配置 Secrets：
   ```
   VERCEL_TOKEN = your-vercel-token
   VERCEL_ORG_ID = team_xxxxx
   VERCEL_PROJECT_ID_BACKEND = prj_xxxxx
   ```

### 方案二：Vercel 全栈部署（最简单）

**步骤**：

1. **前端部署**：
   - 在 Vercel 控制台导入仓库
   - Root Directory 设置为 `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - 环境变量：
     ```
     VITE_API_URL = https://your-backend.vercel.app/api
     ```

2. **后端部署**：
   - 在 Vercel 控制台创建新项目
   - Root Directory 设置为 `backend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - 环境变量：见下方环境变量配置

### 方案三：Railway 部署后端

**步骤**：

1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 创建新项目 → 添加 PostgreSQL 数据库
4. 添加 Service → 从 GitHub 导入仓库
5. 配置：
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`
6. 在 Variables 中添加环境变量
7. 获取 Railway Token：
   - Account Settings → Tokens → New Token
8. 在 GitHub 配置 Secrets：
   ```
   RAILWAY_TOKEN = your-token
   RAILWAY_PROJECT_ID = project-id
   RAILWAY_SERVICE_ID_BACKEND = service-id
   ```

## 🔧 配置步骤

### 1. 配置 GitHub Secrets

进入仓库 `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

#### 前端所需 Secrets：
```
VITE_API_URL = https://your-backend-api.vercel.app/api
VERCEL_TOKEN = (如果使用 Vercel)
VERCEL_ORG_ID = (如果使用 Vercel)
VERCEL_PROJECT_ID = (如果使用 Vercel)
```

#### 后端所需 Secrets：
```
VERCEL_TOKEN = (如果使用 Vercel)
VERCEL_ORG_ID = (如果使用 Vercel)
VERCEL_PROJECT_ID_BACKEND = (如果使用 Vercel)
RAILWAY_TOKEN = (如果使用 Railway)
RAILWAY_PROJECT_ID = (如果使用 Railway)
RAILWAY_SERVICE_ID_BACKEND = (如果使用 Railway)
RENDER_WEBHOOK_URL = (如果使用 Render)
```

### 2. 配置环境变量（部署平台）

#### Vercel 环境变量（后端）：
```
NODE_ENV = production
PORT = 3000
DB_HOST = your-db-host
DB_PORT = 5432
DB_USERNAME = your-db-user
DB_PASSWORD = your-db-password
DB_DATABASE = assets_management
JWT_SECRET = your-jwt-secret
JWT_EXPIRES_IN = 7d
CORS_ORIGIN = https://your-frontend-domain.com
```

#### Railway 环境变量：
同上，Railway 会自动注入数据库连接信息，只需添加：
```
DATABASE_URL = (Railway 自动提供)
JWT_SECRET = your-jwt-secret
JWT_EXPIRES_IN = 7d
CORS_ORIGIN = https://your-frontend-domain.com
```

### 3. 数据库配置

#### 使用 Vercel PostgreSQL（推荐）：
1. 在 Vercel 项目中添加 PostgreSQL 存储
2. 会自动提供连接字符串
3. 格式：`postgresql://user:password@host:port/database`

#### 使用 Railway PostgreSQL：
- Railway 会自动创建 PostgreSQL 数据库
- 连接信息在 Environment Variables 中

#### 使用外部 PostgreSQL：
- Supabase（免费 PostgreSQL）
- Neon（免费 PostgreSQL）
- ElephantSQL（免费 PostgreSQL）

### 4. 修改前端 API 配置

前端已配置为使用环境变量 `VITE_API_URL`，部署时设置该变量即可。

## 📝 环境变量配置

### 后端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NODE_ENV` | 环境类型 | `production` |
| `PORT` | 服务端口 | `3000` |
| `DB_HOST` | 数据库主机 | `localhost` 或 `xxx.railway.app` |
| `DB_PORT` | 数据库端口 | `5432` |
| `DB_USERNAME` | 数据库用户名 | `postgres` |
| `DB_PASSWORD` | 数据库密码 | `your-password` |
| `DB_DATABASE` | 数据库名称 | `assets_management` |
| `JWT_SECRET` | JWT 密钥 | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d` |
| `CORS_ORIGIN` | 允许的前端域名 | `https://your-app.vercel.app` |

### 前端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_URL` | 后端 API 地址 | `https://api.example.com/api` |

## 🚦 工作流说明

### `deploy-frontend.yml`
- 触发条件：推送到 main/master 分支且 frontend 目录有变更
- 功能：构建前端并部署到 GitHub Pages

### `deploy-backend.yml`
- 触发条件：推送到 main/master 分支且 backend 目录有变更
- 功能：构建后端并部署到 Vercel/Railway

### `ci.yml`
- 触发条件：Pull Request 和 Push
- 功能：运行测试和代码检查

## ⚠️ 常见问题

### 1. GitHub Pages 部署失败

**问题**：Pages 部署显示 404

**解决**：
- 检查 `frontend/vite.config.ts` 中是否配置了 `base`：
  ```ts
  export default defineConfig({
    base: '/repo-name/', // 如果部署到子路径
    plugins: [react()],
  })
  ```

### 2. 后端部署后数据库连接失败

**问题**：`ECONNREFUSED` 或连接超时

**解决**：
- 检查数据库是否允许外部连接
- 检查防火墙设置
- 使用连接池配置

### 3. CORS 错误

**问题**：前端访问后端 API 时出现 CORS 错误

**解决**：
- 检查后端 `CORS_ORIGIN` 环境变量
- 确保包含前端部署域名
- 支持多个域名用逗号分隔

### 4. Vercel 部署失败

**问题**：构建失败或找不到模块

**解决**：
- 确保 `package.json` 中有正确的 `build` 脚本
- 检查 Node.js 版本（推荐 20.x）
- 查看 Vercel 构建日志

### 5. 环境变量未生效

**问题**：部署后环境变量不生效

**解决**：
- Vite 环境变量必须以 `VITE_` 开头
- 重新部署以应用新的环境变量
- 检查变量名拼写

## 📚 参考资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app)
- [GitHub Pages 文档](https://docs.github.com/en/pages)

## 🔄 更新部署

推送代码到 main 分支后，GitHub Actions 会自动触发部署。可以在 `Actions` 标签页查看部署状态。

手动触发部署：
1. 进入 `Actions` 标签页
2. 选择对应的工作流
3. 点击 `Run workflow`

## 📞 需要帮助？

如果遇到问题，请：
1. 查看 GitHub Actions 日志
2. 检查环境变量配置
3. 查看部署平台的控制台日志
