# 🚀 使用 Railway CLI 部署（推荐方法）

如果网页端一直 Loading，使用 CLI 方式更稳定可靠。

## 步骤 1：登录 Railway

```bash
railway login
```

这会打开浏览器，完成授权登录。

---

## 步骤 2：创建并初始化项目

```bash
# 进入后端目录
cd backend

# 初始化 Railway 项目
railway init
```

按照提示：
1. 选择 "Create a new project"
2. 输入项目名称：`assets-management-backend`（或任何你喜欢的名称）
3. 等待创建完成

---

## 步骤 3：配置环境变量

有两种方式添加环境变量：

### 方式 A：使用 CLI（推荐）

```bash
# 在 backend 目录下运行
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
railway variables set DB_PORT=5432
railway variables set DB_USERNAME=postgres
railway variables set DB_PASSWORD=Ll3uXrXdiiMZ0KTv
railway variables set DB_DATABASE=postgres
railway variables set JWT_SECRET=QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=
railway variables set JWT_EXPIRES_IN=7d
railway variables set CORS_ORIGIN=https://xiaomumaozi88.github.io
```

### 方式 B：在网页端配置

1. 访问 https://railway.app
2. 进入刚创建的项目
3. 点击服务 → Settings → Variables
4. 手动添加所有环境变量

---

## 步骤 4：配置服务设置

在 Railway 网页端：

1. 进入项目 → 点击服务
2. **Settings** → 配置：
   - **Root Directory**: （留空，因为我们在 backend 目录）
   - **Start Command**: `npm run start:prod`

或者使用 CLI：

```bash
# 查看当前配置
railway status

# 设置启动命令（如果需要）
railway service
```

---

## 步骤 5：部署

### 方法 A：自动部署（推送代码时）

```bash
# 确保在项目根目录
cd /Users/qiujian/Documents/CodeProjects/Touka/assets-fe

# 添加 Railway 远程仓库（如果需要）
# Railway 会在 init 时自动配置

# 推送代码（Railway 会自动部署）
git push origin main
```

### 方法 B：手动部署

```bash
cd backend
railway up
```

---

## 步骤 6：查看部署状态

```bash
# 查看服务状态
railway status

# 查看日志
railway logs

# 查看部署 URL
railway domain
```

或者在网页端查看：
- **Deployments** 标签页：查看部署日志
- **Settings** → **Networking**：查看服务 URL

---

## 步骤 7：获取服务 URL

部署完成后，获取服务 URL：

```bash
railway domain
```

或在网页端：
- Settings → Networking → 查看 Public Domain

URL 格式：`https://xxx.up.railway.app`

---

## 下一步：初始化数据库

部署完成后，初始化数据库：

```bash
cd backend
railway run npm run init:data
```

---

## 常见问题

### Q: railway init 找不到 backend 目录？
A: 确保在 `backend` 目录下运行 `railway init`

### Q: 如何查看环境变量？
A: `railway variables` 或 `railway variables --json`

### Q: 如何删除环境变量？
A: `railway variables unset KEY_NAME`

### Q: 如何重新部署？
A: `railway up` 或推送代码到 GitHub

---

## 完整命令序列

```bash
# 1. 登录
railway login

# 2. 进入后端目录并初始化
cd backend
railway init
# 选择 "Create a new project"，输入名称

# 3. 设置环境变量
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
railway variables set DB_PORT=5432
railway variables set DB_USERNAME=postgres
railway variables set DB_PASSWORD=Ll3uXrXdiiMZ0KTv
railway variables set DB_DATABASE=postgres
railway variables set JWT_SECRET=QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=
railway variables set JWT_EXPIRES_IN=7d
railway variables set CORS_ORIGIN=https://xiaomumaozi88.github.io

# 4. 在网页端设置 Root Directory 和 Start Command（或使用 railway service）
# Root Directory: （留空）
# Start Command: npm run start:prod

# 5. 部署
railway up

# 6. 查看状态和 URL
railway status
railway domain

# 7. 初始化数据库
railway run npm run init:data
```

