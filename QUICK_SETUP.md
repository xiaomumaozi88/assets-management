# ⚡ 5分钟快速配置指南

这是最简化的配置步骤，按照顺序执行即可。

## ✅ 前置条件

- [x] 代码已推送到 GitHub
- [x] 有 GitHub 账户
- [x] 有 Supabase 账户（免费注册）
- [x] 有 Railway 账户（免费注册）

---

## 📝 配置步骤

### 1️⃣ Supabase 数据库（2分钟）

1. 访问 https://supabase.com → 登录/注册
2. 点击 **New Project**
3. 设置项目名称和数据库密码（⚠️ 记住密码）
4. 等待创建完成
5. 进入 **Settings** → **Database**
6. 复制连接信息：
   - Host: `db.xxxxx.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: 你设置的密码

---

### 2️⃣ Railway 后端部署（3分钟）

1. 访问 https://railway.app → 使用 GitHub 登录
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择你的仓库
4. 等待 Railway 检测到项目

5. **配置服务**：
   - 点击服务 → **Settings**
   - **Root Directory**: `backend`
   - **Start Command**: `npm run start:prod`

6. **添加环境变量**（Settings → Variables）：
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=db.xxxxx.supabase.co  (从 Supabase 复制)
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=你的Supabase密码
   DB_DATABASE=postgres
   JWT_SECRET=随机生成（见下方）
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-username.github.io  (稍后更新)
   ```

7. **生成 JWT_SECRET**：
   ```bash
   openssl rand -base64 32
   ```
   复制生成的字符串

8. 等待部署完成，复制 Railway 提供的 URL（如：`https://xxx.up.railway.app`）

---

### 3️⃣ 初始化数据库（1分钟）

在终端运行：

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录并连接
cd backend
railway login
railway link

# 初始化数据库
railway run npm run init:data
```

---

### 4️⃣ GitHub Pages 配置（2分钟）

1. **启用 Pages**：
   - 仓库 → **Settings** → **Pages**
   - Source: 选择 **GitHub Actions**

2. **添加 Secret**：
   - 仓库 → **Settings** → **Secrets and variables** → **Actions**
   - 点击 **New repository secret**
   - Name: `VITE_API_URL`
   - Value: `https://xxx.up.railway.app/api` (使用你的 Railway URL)

3. **推送代码触发部署**（如果还没推送）：
   ```bash
   git add .
   git commit -m "配置部署"
   git push
   ```

4. 等待部署完成（**Actions** 标签页查看）

5. 获取前端 URL：
   - **Settings** → **Pages**
   - URL 类似：`https://your-username.github.io/repo-name`

---

### 5️⃣ 更新 CORS（30秒）

1. 回到 Railway
2. 找到 `CORS_ORIGIN` 变量
3. 更新为你的 GitHub Pages URL（完整 URL）
4. 保存（自动重新部署）

---

## 🎉 完成！

访问你的 GitHub Pages URL 测试应用。

**默认登录账号**（如果运行了 init:data）：
- 邮箱: `admin@example.com`
- 密码: `admin123`

---

## 🆘 常见问题

**Q: 前端 404 错误？**  
A: 检查 GitHub Actions 是否成功运行

**Q: CORS 错误？**  
A: 确保 Railway 的 `CORS_ORIGIN` 是完整 URL（包含 https://）

**Q: 数据库连接失败？**  
A: 检查 Supabase 密码和 Railway 环境变量是否正确

---

需要详细说明？查看 [SETUP_GUIDE.md](./SETUP_GUIDE.md)

