# 🚀 下一步部署步骤

## ✅ 已完成

1. ✅ 代码已推送到 GitHub: https://github.com/xiaomumaozi88/assets-management
2. ✅ Supabase 数据库已创建并配置
3. ✅ 生成 JWT_SECRET（见下方）

---

## 📋 部署步骤

### 步骤 1：部署后端到 Railway（约 5 分钟）

**⚠️ 如果网页端一直 Loading，请使用 [Railway CLI 方法](#使用-railway-cli-部署推荐)**

#### 方法 A：使用网页端（如果正常）

1. **访问 Railway**：
   - 打开 https://railway.app
   - 使用 GitHub 登录

2. **创建新项目**：
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权 Railway 访问 GitHub（如果提示）
   - 选择仓库：`xiaomumaozi88/assets-management`
   - ⚠️ 如果一直 Loading，使用下面的 CLI 方法

#### 方法 B：使用 Railway CLI 部署（推荐，更稳定）⚡

如果网页端一直 Loading，使用命令行部署：

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录（会打开浏览器）
railway login

# 3. 进入后端目录并初始化
cd backend
railway init

# 4. 按照提示：
#    - 选择 "Create a new project" 或 "Link to existing project"
#    - 项目名称：assets-management-backend
#    - 等待创建完成

# 5. 在网页端配置环境变量（见下方）
#    或使用命令：railway variables set KEY=value
```

3. **配置服务**（在 Railway 网页端）：
   - 进入项目，点击服务
   - **Settings** → 配置：
     - **Root Directory**: `backend`
     - **Start Command**: `npm run start:prod`

4. **添加环境变量**（Settings → Variables 或使用 CLI）：
   
   ```bash
   NODE_ENV=production
   PORT=3000
   DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=Ll3uXrXdiiMZ0KTv
   DB_DATABASE=postgres
   JWT_SECRET=QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://xiaomumaozi88.github.io
   ```

5. **等待部署完成**：
   - 在 Deployments 标签页查看日志
   - 部署成功后，在 Settings → Networking 获取服务 URL
   - URL 格式：`https://xxx.up.railway.app`

---

### 步骤 2：初始化数据库（约 2 分钟）

部署完成后，需要初始化数据库表结构：

#### 方法 1：使用 Railway CLI（推荐）

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 连接到项目
cd backend
railway link

# 运行初始化脚本
railway run npm run init:data
```

#### 方法 2：使用环境变量本地运行

```bash
cd backend

# 设置环境变量
export DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=Ll3uXrXdiiMZ0KTv
export DB_DATABASE=postgres

# 运行初始化
npm install
npm run init:data
```

---

### 步骤 3：配置 GitHub Pages（约 3 分钟）

1. **启用 GitHub Pages**：
   - 访问：https://github.com/xiaomumaozi88/assets-management/settings/pages
   - Source: 选择 **GitHub Actions**（不是分支）

2. **添加 GitHub Secret**：
   - 访问：https://github.com/xiaomumaozi88/assets-management/settings/secrets/actions
   - 点击 "New repository secret"
   - Name: `VITE_API_URL`
   - Value: `https://xxx.up.railway.app/api` （替换为你的 Railway URL）

3. **触发部署**：
   - 推送一个小改动触发工作流，或
   - 在 Actions 标签页手动运行工作流

4. **获取前端 URL**：
   - Settings → Pages
   - URL 格式：`https://xiaomumaozi88.github.io/assets-management`

---

### 步骤 4：更新 CORS 配置

1. 回到 Railway 项目
2. 进入后端服务的 Variables
3. 更新 `CORS_ORIGIN`：
   ```
   CORS_ORIGIN=https://xiaomumaozi88.github.io
   ```
4. 保存（Railway 会自动重新部署）

---

## 🔑 JWT_SECRET

请使用下方生成的密钥：

```bash
# 运行这个命令生成新的密钥（如果上面的已过期）
openssl rand -base64 32
```

或使用我之前生成的密钥（见 Railway_CONFIG.md）

---

## ✅ 验证部署

部署完成后：

1. **测试后端 API**：
   ```
   https://xxx.up.railway.app/api
   ```

2. **测试前端**：
   ```
   https://xiaomumaozi88.github.io/assets-management
   ```

3. **测试登录**：
   - 默认账号：`admin@example.com`
   - 默认密码：`admin123`
   - （如果运行了 init:data 脚本）

---

## 🆘 需要帮助？

查看详细文档：
- **快速配置**: `QUICK_SETUP.md`
- **详细配置**: `SETUP_GUIDE.md`
- **Railway 配置**: `RAILWAY_CONFIG.md`

