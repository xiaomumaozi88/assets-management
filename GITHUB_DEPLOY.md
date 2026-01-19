# 🚀 GitHub 快速部署指南

## 一、准备工作（5分钟）

### 1. 将代码推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2. 选择部署平台

推荐组合（全部免费）：
- **前端**：GitHub Pages 或 Vercel
- **后端**：Vercel 或 Railway
- **数据库**：Railway PostgreSQL、Neon、Supabase（任选一个）

## 二、快速部署（方案一：Vercel 全栈，最简单）⭐⭐⭐

### 步骤 1：部署后端（推荐使用 Railway，3分钟）

**⚠️ 注意**：NestJS 应用更适合部署到 Railway 或 Render，而不是 Vercel。
如果必须使用 Vercel，需要额外配置（见下方）。

#### 选项 A：使用 Railway（推荐）⭐⭐⭐

1. 访问 https://railway.app，使用 GitHub 登录
2. 点击 "New Project" → "Provision PostgreSQL"（先创建数据库）
3. 点击 "New" → "GitHub Repo" → 选择你的仓库
4. 在服务设置中：
   - **Root Directory**: `backend`
   - **Start Command**: `npm run start:prod`
5. 在 Variables 标签添加环境变量（见下方）

#### 选项 B：使用 Vercel（需要额外配置）

1. 访问 https://vercel.com，使用 GitHub 登录
2. 点击 "Add New" → "Project"
3. 导入你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. 配置环境变量：
   ```
   NODE_ENV = production
   PORT = 3000
   DB_HOST = your-db-host.railway.app
   DB_PORT = 5432
   DB_USERNAME = postgres
   DB_PASSWORD = your-password
   DB_DATABASE = assets_management
   JWT_SECRET = your-random-secret-key-here
   JWT_EXPIRES_IN = 7d
   CORS_ORIGIN = https://your-frontend.vercel.app
   ```

6. 点击 "Deploy"，等待部署完成
7. 复制部署后的 URL（例如：`https://your-backend.vercel.app`）

### 步骤 2：创建数据库（Railway，5分钟）

1. 访问 https://railway.app，使用 GitHub 登录
2. 点击 "New Project" → "Provision PostgreSQL"
3. 等待数据库创建完成
4. 点击数据库，进入 "Variables" 标签
5. 复制连接信息，填写到 Vercel 后端环境变量中

**或使用 Supabase（更简单）**：
1. 访问 https://supabase.com
2. 创建新项目
3. 在 Settings → Database 中复制连接信息

### 步骤 3：部署前端（3分钟）

1. 在 Vercel 中点击 "Add New" → "Project"
2. 再次导入同一个 GitHub 仓库
3. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. 配置环境变量：
   ```
   VITE_API_URL = https://your-backend.vercel.app/api
   ```

5. 点击 "Deploy"

### 步骤 4：更新后端 CORS（1分钟）

回到后端 Vercel 项目，更新环境变量：
```
CORS_ORIGIN = https://your-frontend.vercel.app
```

### 完成！🎉

现在可以访问：
- 前端：`https://your-frontend.vercel.app`
- 后端 API：`https://your-backend.vercel.app/api`

## 三、使用 GitHub Actions 自动部署（可选）

如果你想要每次推送代码时自动部署：

### 1. 配置 GitHub Secrets

进入仓库 → Settings → Secrets and variables → Actions → New repository secret

添加以下 Secrets（如果使用 Vercel）：
```
VERCEL_TOKEN = (在 Vercel → Settings → Tokens 中创建)
VERCEL_ORG_ID = (在 Vercel Project Settings 中查看)
VERCEL_PROJECT_ID_BACKEND = (后端项目的 Project ID)
VERCEL_PROJECT_ID = (前端项目的 Project ID)
```

### 2. 工作流已自动配置

项目已包含以下 GitHub Actions 工作流：
- `.github/workflows/deploy-frontend.yml` - 前端部署
- `.github/workflows/deploy-backend.yml` - 后端部署
- `.github/workflows/ci.yml` - 代码检查和测试

推送代码到 main 分支即可自动触发部署！

## 四、其他部署方案

### 方案二：GitHub Pages（前端）+ Railway（后端+数据库）

**前端部署到 GitHub Pages**：
1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 推送代码后自动部署

**后端部署到 Railway**：
1. 访问 https://railway.app
2. 创建新项目 → 添加 PostgreSQL
3. 添加 Service → 从 GitHub 导入仓库
4. Root Directory 设置为 `backend`
5. 配置环境变量和启动命令

### 方案三：Render（适合需要更多控制）

1. 访问 https://render.com
2. 创建 Web Service（后端）+ PostgreSQL 数据库
3. 配置构建和启动命令
4. 设置环境变量

## 五、初始化数据库

部署完成后，需要初始化数据库：

### 方法 1：使用 Vercel CLI（推荐）

```bash
npm i -g vercel
vercel login
cd backend
vercel env pull .env.local
npm run init:data
```

### 方法 2：使用 Railway CLI

```bash
npm i -g @railway/cli
railway login
cd backend
railway link
railway run npm run init:data
```

### 方法 3：手动连接数据库

使用数据库客户端（如 pgAdmin、DBeaver）连接到你的数据库，然后运行初始化脚本。

## 六、常见问题

### Q1: 后端部署后无法访问数据库
**A**: 检查数据库是否允许外部连接，Railway 和 Supabase 默认允许。

### Q2: CORS 错误
**A**: 确保后端 `CORS_ORIGIN` 环境变量包含前端完整域名（带 https://）。

### Q3: 环境变量不生效
**A**: 
- Vite 变量必须以 `VITE_` 开头
- 更新环境变量后需要重新部署

### Q4: 数据库迁移
**A**: TypeORM 在开发环境使用 `synchronize: true`，生产环境建议关闭并使用迁移。

## 七、下一步

- ✅ 部署完成后，访问前端地址测试登录
- ✅ 检查后端 API 是否正常：`https://your-backend.vercel.app/api`
- ✅ 配置自定义域名（可选）
- ✅ 设置 CI/CD 自动化测试

## 需要帮助？

查看详细文档：[DEPLOYMENT.md](./DEPLOYMENT.md)

---

**提示**：Vercel 免费额度：
- 100GB 带宽/月
- 100 小时构建时间/月
- 无限项目
- 完全足够小型项目使用！
