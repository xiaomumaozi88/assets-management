# 🔧 修复数据库连接错误

## ❌ 错误分析

错误信息显示：
```
ECONNREFUSED 127.0.0.1:5432
```

**问题**：应用程序正在尝试连接 `localhost:5432`，而不是 Supabase 数据库。

**原因**：Railway 环境变量可能：
1. 没有设置
2. 设置错误
3. 服务需要重启才能读取新的环境变量

---

## ✅ 解决步骤

### 第 1 步：检查 Railway 环境变量

1. 在 Railway 服务页面，点击 **"Variables"** 标签
2. 确认以下变量**都存在且正确**：

```bash
DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Ll3uXrXdiiMZ0KTv
DB_DATABASE=postgres
```

3. **特别检查**：
   - `DB_HOST` 必须是 `db.omtonocmwbqkadzkzmlt.supabase.co`（不是 `localhost` 或 `127.0.0.1`）
   - `DB_PORT` 必须是 `5432`
   - 所有变量都没有多余的空格

### 第 2 步：添加缺失的环境变量

如果缺少任何变量：

1. 点击 **"+ New Variable"** 按钮
2. 添加以下变量（如果缺失）：

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

### 第 3 步：重启服务

添加或修改环境变量后，**必须重启服务**：

1. 点击 **"Deployments"** 标签
2. 点击最新的部署（Active）
3. 点击 **"Redeploy"** 按钮
4. 或者：在 **Settings** 中，临时修改任何变量（比如添加一个空格），保存，然后改回来，这会触发重新部署

### 第 4 步：验证环境变量

重启后，查看日志确认环境变量被读取：

1. 点击 **"Logs"** 标签
2. 查找是否有数据库连接相关的日志
3. 如果仍然连接 `127.0.0.1`，说明环境变量仍然没有被读取

---

## 🔍 常见问题

### 问题 1：环境变量已设置但仍连接 localhost

**可能原因**：
- 环境变量名称拼写错误（检查大小写）
- 服务没有重启
- 环境变量中有多余空格

**解决**：
1. 删除所有环境变量，重新添加（确保没有空格）
2. 重启服务
3. 检查变量名称是否完全匹配：`DB_HOST`、`DB_PORT` 等

### 问题 2：环境变量格式错误

确保格式正确：
```
✅ 正确：DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
❌ 错误：DB_HOST = db.omtonocmwbqkadzkzmlt.supabase.co（有多余空格）
❌ 错误：DB_HOST="db.omtonocmwbqkadzkzmlt.supabase.co"（不要加引号）
```

### 问题 3：Supabase 数据库不允许连接

**检查**：
1. 确认 Supabase 项目正在运行
2. 在 Supabase 控制台检查数据库状态
3. 测试连接（见下方）

---

## 🧪 测试数据库连接

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
console.log('尝试连接:', process.env.DB_HOST);
client.connect().then(() => {
  console.log('✅ 数据库连接成功！');
  client.end();
}).catch(err => {
  console.error('❌ 数据库连接失败:', err.message);
  console.error('DB_HOST:', process.env.DB_HOST);
  process.exit(1);
});
"
```

---

## 📋 完整环境变量检查清单

在 Railway **Variables** 中，确保以下**所有**变量都存在：

- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co`
- [ ] `DB_PORT=5432`
- [ ] `DB_USERNAME=postgres`
- [ ] `DB_PASSWORD=Ll3uXrXdiiMZ0KTv`
- [ ] `DB_DATABASE=postgres`
- [ ] `JWT_SECRET=QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=`
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `CORS_ORIGIN=https://xiaomumaozi88.github.io`

---

## ⚡ 快速修复

如果所有变量都已正确设置，但仍有问题：

1. **删除所有数据库相关变量**
2. **重新添加**（确保没有拼写错误和多余空格）
3. **重启服务**（Redeploy）
4. **查看日志**确认连接地址

如果还是不行，告诉我具体的错误信息！

