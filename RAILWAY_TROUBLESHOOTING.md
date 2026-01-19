# Railway 崩溃问题排查指南

## 🔍 查看日志（最重要！）

**第一步**：在 Railway 页面查看错误日志

1. 点击 **assets-management** 服务
2. 点击 **Logs** 标签页（或 **Observability** → **Logs**）
3. 查看最新的错误信息

常见错误类型：
- 数据库连接失败
- 环境变量缺失
- 端口配置错误
- 依赖安装失败

---

## 🔧 常见问题及解决方案

### 问题 1：数据库连接失败

**错误信息**：`ECONNREFUSED` 或 `Connection refused`

**检查**：
1. 确认环境变量已正确设置：
   ```
   DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=Ll3uXrXdiiMZ0KTv
   DB_DATABASE=postgres
   ```

2. 确认 Supabase 数据库允许外部连接（默认允许）

**解决**：
- 检查环境变量拼写是否正确
- 确认密码中没有多余空格
- 测试数据库连接（见下方）

---

### 问题 2：环境变量未设置

**错误信息**：`JWT_SECRET is required` 或其他环境变量相关错误

**检查**：
在 Railway 服务 → **Variables** 标签页，确认以下变量都存在：

```bash
✅ NODE_ENV=production
✅ PORT=3000
✅ DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
✅ DB_PORT=5432
✅ DB_USERNAME=postgres
✅ DB_PASSWORD=Ll3uXrXdiiMZ0KTv
✅ DB_DATABASE=postgres
✅ JWT_SECRET=QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=
✅ JWT_EXPIRES_IN=7d
✅ CORS_ORIGIN=https://xiaomumaozi88.github.io
```

**解决**：
- 添加缺失的环境变量
- 保存后会自动重新部署

---

### 问题 3：数据库表不存在

**错误信息**：`relation "users" does not exist` 或类似的表不存在错误

**原因**：
- 生产环境下 `synchronize: false`，不会自动创建表
- 需要先运行初始化脚本

**解决**：
1. 先部署服务（即使崩溃也要先部署）
2. 使用 Railway CLI 运行初始化脚本：

```bash
npm i -g @railway/cli
railway login
cd backend
railway link
railway run npm run init:data
```

或者临时启用 synchronize（不推荐生产环境）：
- 设置环境变量：`NODE_ENV=development`
- 注意：生产环境应使用数据库迁移

---

### 问题 4：端口配置错误

**错误信息**：`Port already in use` 或服务无法启动

**检查**：
- 确认 `PORT` 环境变量已设置
- Railway 会自动设置 `PORT`，通常不需要手动设置

**解决**：
- 确保 `PORT` 环境变量存在（即使值不需要，也要有）
- 或者删除 `PORT` 变量，让 Railway 自动设置

---

### 问题 5：构建失败

**错误信息**：`npm install` 失败或构建错误

**检查**：
1. 查看 **Deployments** 标签页的构建日志
2. 确认 **Root Directory** 设置为 `backend`

**解决**：
- 确认 `backend/package.json` 存在
- 检查 Node.js 版本（Railway 通常自动检测）
- 查看构建日志中的具体错误

---

## 📋 完整环境变量清单

在 Railway **Variables** 中确保以下所有变量都存在：

```bash
# 必需的环境变量
NODE_ENV=production
PORT=3000

# 数据库配置（Supabase）
DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Ll3uXrXdiiMZ0KTv
DB_DATABASE=postgres

# JWT 配置
JWT_SECRET=QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=
JWT_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=https://xiaomumaozi88.github.io
```

---

## 🔍 诊断步骤

### 步骤 1：查看日志

1. 点击服务 → **Logs** 标签
2. 查看最后 50-100 行日志
3. 寻找红色错误信息
4. 复制错误信息

### 步骤 2：检查环境变量

1. 点击服务 → **Variables** 标签
2. 对照上方清单检查所有变量
3. 确认拼写和值都正确

### 步骤 3：测试数据库连接

使用 Railway CLI 测试：

```bash
railway run node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
client.connect().then(() => {
  console.log('✅ 数据库连接成功！');
  client.end();
}).catch(err => {
  console.error('❌ 数据库连接失败:', err.message);
  process.exit(1);
});
"
```

### 步骤 4：检查服务配置

1. **Settings** → **Root Directory**: `backend`
2. **Settings** → **Start Command**: `npm run start:prod`
3. **Settings** → **Build Command**: （留空，使用默认）

---

## 🚀 快速修复流程

1. **查看日志** → 找到错误原因
2. **检查环境变量** → 确保所有变量都存在
3. **重新部署** → 在 Deployments 标签页点击 "Redeploy"
4. **如果仍有问题** → 查看下方的临时解决方案

---

## 🔧 临时解决方案（如果急需启动）

### 方案 1：临时启用数据库同步（仅用于测试）

添加环境变量：
```
NODE_ENV=development
```

⚠️ **警告**：这会在每次启动时自动同步数据库结构，生产环境不推荐使用。

### 方案 2：手动运行初始化脚本

```bash
# 使用 Railway CLI
railway run npm run init:data
```

---

## 📞 需要帮助？

如果以上方法都无法解决，请提供：
1. **Logs** 中的完整错误信息
2. **Variables** 中的环境变量列表（隐藏敏感信息）
3. **Settings** 中的配置信息

我会帮你进一步排查！

