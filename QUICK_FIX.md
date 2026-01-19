# 🚨 快速修复 Railway 崩溃问题

## 立即检查以下内容

### 1️⃣ 检查环境变量（最重要！）

在 Railway 服务页面，进入 **Variables** 标签页，确认以下变量**都存在且正确**：

```bash
✅ NODE_ENV=production
✅ PORT=3000

✅ DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
✅ DB_PORT=5432
✅ DB_USERNAME=postgres
✅ DB_PASSWORD=Ll3uXrXdiiMZ0KTv
✅ DB_DATABASE=postgres  ← ⚠️ 必须是 postgres，不是 assets_management！

✅ JWT_SECRET=QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=
✅ JWT_EXPIRES_IN=7d

✅ CORS_ORIGIN=https://xiaomumaozi88.github.io
```

**⚠️ 特别注意**：
- `DB_DATABASE` 必须是 `postgres`（Supabase 的默认数据库名）
- 不要使用 `assets_management`

---

### 2️⃣ 查看日志

1. 点击 **assets-management** 服务
2. 点击 **Logs** 标签
3. 查看最新的错误信息
4. **告诉我错误信息**，我会帮你解决

常见错误：
- `database "assets_management" does not exist` → 需要设置 `DB_DATABASE=postgres`
- `Connection refused` → 数据库连接信息错误
- `JWT_SECRET is required` → 缺少 JWT_SECRET

---

### 3️⃣ 服务配置检查

在 **Settings** 标签页，确认：

- **Root Directory**: `backend`
- **Start Command**: `npm run start:prod`
- **Build Command**: （留空或 `npm install && npm run build`）

---

## 🔧 如果环境变量都正确，但仍崩溃

### 方案 A：临时启用数据库同步（快速测试）

1. 在 **Variables** 中，将 `NODE_ENV` 改为 `development`
2. 保存（会自动重新部署）
3. 这会让数据库自动创建表结构

⚠️ **注意**：这只是临时方案，用于测试。生产环境应该使用迁移脚本。

### 方案 B：初始化数据库表（推荐）

先确保服务能启动（可能需要先设置 `NODE_ENV=development`），然后运行初始化脚本：

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录并连接
railway login
cd backend
railway link

# 运行初始化脚本
railway run npm run init:data
```

---

## 📋 完整环境变量配置（复制粘贴）

在 Railway **Variables** 中，确保有这些变量：

```
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

---

## 🆘 需要帮助？

请提供：
1. **Logs** 标签页中的错误信息（最后 20-30 行）
2. **Variables** 中是否所有变量都已设置

我会根据错误信息帮你快速解决！

