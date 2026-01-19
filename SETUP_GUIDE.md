# 🚀 完整配置指南：GitHub Pages + Railway + Supabase

本文档提供详细的步骤，帮助你配置完全免费的部署方案。

## 📋 配置概览

- **前端**：GitHub Pages（完全免费）
- **后端**：Railway（$5 免费额度/月）
- **数据库**：Supabase PostgreSQL（500MB 免费）

**总成本：$0/月** ✅

---

## 第一步：创建 Supabase 数据库（5分钟）

### 1. 注册 Supabase 账户

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 登录（推荐）

### 2. 创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: `assets-management`（或你喜欢的名称）
   - **Database Password**: 设置一个强密码（⚠️ 请保存好）
   - **Region**: 选择离你最近的区域（推荐 `Southeast Asia (Singapore)`）
3. 点击 "Create new project"
4. 等待项目创建完成（约 2-3 分钟）

### 3. 获取数据库连接信息

1. 进入项目后，点击左侧菜单的 **Settings** → **Database**
2. 在 **Connection string** 部分，选择 **URI** 标签
3. 复制连接字符串，格式如下：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. 解析连接信息（需要以下信息）：
   - **DB_HOST**: `db.xxxxx.supabase.co`
   - **DB_PORT**: `5432`
   - **DB_USERNAME**: `postgres`
   - **DB_PASSWORD**: `[YOUR-PASSWORD]`（你设置的密码）
   - **DB_DATABASE**: `postgres`

### 4. 测试数据库连接（可选）

你可以使用数据库客户端（如 pgAdmin、DBeaver 或 TablePlus）连接测试。

---

## 第二步：部署后端到 Railway（10分钟）

### 1. 注册 Railway 账户

1. 访问 https://railway.app
2. 点击 "Start a New Project"
3. 使用 GitHub 登录（推荐）

### 2. 创建新项目

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 授权 Railway 访问你的 GitHub 仓库
4. 选择你的仓库（如果还没推送代码，先推送代码到 GitHub）
5. 点击 "Deploy Now"

### 3. 配置后端服务

1. 在 Railway 项目中，你会看到新创建的服务
2. 点击服务，进入设置
3. 点击 **Settings** 标签，配置：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`（或留空，Railway 会自动检测）
   - **Start Command**: `npm run start:prod`

### 4. 配置环境变量

在 Railway 服务的 **Variables** 标签页，添加以下环境变量：

```bash
# Node.js 环境
NODE_ENV=production
PORT=3000

# 数据库配置（Supabase）
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=你的Supabase密码
DB_DATABASE=postgres

# JWT 配置
JWT_SECRET=你的随机密钥（生成方法见下方）
JWT_EXPIRES_IN=7d

# CORS 配置（稍后更新为你的 GitHub Pages URL）
CORS_ORIGIN=https://your-username.github.io
```

#### 生成 JWT_SECRET

在终端运行以下命令生成随机密钥：

```bash
# macOS/Linux
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

复制生成的字符串作为 `JWT_SECRET` 的值。

### 5. 等待部署完成

1. Railway 会自动开始构建和部署
2. 在 **Deployments** 标签页可以查看部署日志
3. 部署成功后，在 **Settings** → **Networking** 中可以看到服务的 URL
4. 复制这个 URL，格式类似：`https://your-backend.up.railway.app`

### 6. 初始化数据库（重要）

部署成功后，需要初始化数据库表结构：

#### 方法 1：使用 Railway CLI（推荐）

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录 Railway
railway login

# 连接到项目
cd backend
railway link

# 运行初始化脚本
railway run npm run init:data
```

#### 方法 2：使用环境变量运行

```bash
cd backend

# 设置环境变量（使用 Railway 提供的值）
export DB_HOST=db.xxxxx.supabase.co
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=你的密码
export DB_DATABASE=postgres

# 运行初始化
npm run init:data
```

#### 方法 3：使用数据库客户端

1. 使用 pgAdmin 或 DBeaver 连接到 Supabase 数据库
2. 运行 `backend/add_is_primary_column.sql`（如果有）
3. TypeORM 会在首次启动时自动创建表结构（如果配置了 synchronize）

### 7. 验证后端部署

在浏览器访问：
```
https://your-backend.up.railway.app/api
```

应该能看到 API 响应（可能需要先初始化数据库）。

---

## 第三步：配置 GitHub Pages（5分钟）

### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Pages**
3. 在 **Source** 部分：
   - 选择 **GitHub Actions**（不是分支）
4. 保存设置

### 2. 配置 GitHub Secrets

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加以下 secret：

#### VITE_API_URL

```
Name: VITE_API_URL
Value: https://your-backend.up.railway.app/api
```

⚠️ **重要**：将 `your-backend.up.railway.app` 替换为你实际的后端 URL。

### 3. 推送代码触发部署

如果代码已经推送到 GitHub，工作流会自动运行。如果没有，执行：

```bash
git add .
git commit -m "配置 GitHub Pages 部署"
git push
```

### 4. 查看部署状态

1. 进入仓库的 **Actions** 标签页
2. 查看 `部署前端` 工作流的运行状态
3. 等待部署完成（约 2-3 分钟）

### 5. 获取前端 URL

部署完成后：
1. 进入 **Settings** → **Pages**
2. 你会看到部署的 URL，格式为：
   ```
   https://your-username.github.io/repo-name
   ```
3. 复制这个 URL

---

## 第四步：更新 CORS 配置（2分钟）

现在需要更新后端的 CORS 配置，允许前端域名访问：

### 在 Railway 中更新环境变量

1. 回到 Railway 项目
2. 进入后端服务的 **Variables** 标签
3. 找到 `CORS_ORIGIN` 变量
4. 更新值为你的 GitHub Pages URL：
   ```
   CORS_ORIGIN=https://your-username.github.io
   ```
5. 保存后，Railway 会自动重新部署

### 验证 CORS

部署完成后，在前端页面尝试登录，应该可以正常访问后端 API。

---

## 第五步：初始化数据（可选）

如果需要初始化测试数据：

### 使用 Railway CLI

```bash
cd backend
railway run npm run init:data
```

### 或创建测试用户

```bash
railway run npm run create:test-users
```

---

## 🎉 完成！

现在你的应用已经部署完成：

- **前端**: https://your-username.github.io/repo-name
- **后端**: https://your-backend.up.railway.app/api

### 测试登录

使用默认账号登录：
- 邮箱: `admin@example.com`
- 密码: `admin123`

（如果已运行 `init:data` 脚本）

---

## 📝 后续更新

### 更新代码

只需推送代码到 GitHub：
```bash
git add .
git commit -m "更新功能"
git push
```

GitHub Actions 会自动：
- 检测前端变更 → 部署到 GitHub Pages
- 检测后端变更 → 部署到 Railway

### 更新环境变量

- **前端**: 在 GitHub Secrets 中更新 `VITE_API_URL`
- **后端**: 在 Railway Variables 中更新相应变量

---

## 🔧 故障排除

### 问题 1: 前端无法连接后端

**检查**：
1. 确认 GitHub Secret `VITE_API_URL` 设置正确
2. 确认后端 URL 可访问（在浏览器打开测试）
3. 检查浏览器控制台的 CORS 错误

**解决**：
- 更新 Railway 的 `CORS_ORIGIN` 环境变量
- 确保包含完整的前端 URL（带 https://）

### 问题 2: 后端数据库连接失败

**检查**：
1. 确认 Supabase 数据库连接信息正确
2. 检查 Railway 环境变量中的密码是否正确
3. 查看 Railway 部署日志中的错误信息

**解决**：
- 重新复制 Supabase 连接字符串
- 确保密码中特殊字符已正确转义

### 问题 3: GitHub Pages 404 错误

**检查**：
1. 确认 GitHub Actions 工作流运行成功
2. 检查 Settings → Pages 中的配置

**解决**：
- 重新运行部署工作流
- 确认构建产物路径正确（应为 `frontend/dist`）

### 问题 4: Railway 部署失败

**检查**：
1. 查看 Railway 部署日志
2. 确认 `Root Directory` 设置为 `backend`
3. 确认 `Start Command` 设置为 `npm run start:prod`

**解决**：
- 检查 `package.json` 中是否有 `start:prod` 脚本
- 确保所有依赖已正确安装

---

## 📊 监控使用情况

### Railway 使用情况

1. 进入 Railway Dashboard
2. 查看右上角的使用额度
3. $5 免费额度通常足够小型项目使用

### Supabase 使用情况

1. 进入 Supabase 项目
2. 点击 **Settings** → **Usage**
3. 查看数据库使用量（500MB 免费限制）

---

## 💡 优化建议

1. **启用缓存**：减少数据库查询
2. **优化构建**：减少 Railway 构建时间
3. **使用 CDN**：GitHub Pages 自带 CDN
4. **监控日志**：定期查看 Railway 和 Supabase 日志

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看 GitHub Actions 日志
2. 查看 Railway 部署日志
3. 查看 Supabase 数据库日志
4. 检查浏览器控制台错误

祝你部署顺利！🎉

