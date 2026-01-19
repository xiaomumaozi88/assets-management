# 🔧 配置 Railway 环境变量

## ✅ 当前状态

服务已启动，现在需要配置环境变量以确保数据库连接正常。

---

## 📋 环境变量配置清单

在 Railway 服务页面，点击 **"Variables"** 标签，添加以下所有变量：

### 必需的环境变量

```bash
# Node.js 环境
NODE_ENV=production
PORT=3000

# Supabase 数据库配置
DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Ll3uXrXdiiMZ0KTv
DB_DATABASE=postgres

# JWT 配置
JWT_SECRET=QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=
JWT_EXPIRES_IN=7d

# CORS 配置（前端 GitHub Pages URL）
CORS_ORIGIN=https://xiaomumaozi88.github.io
```

---

## 🔧 配置步骤

### 1. 进入 Variables 页面

1. 在 Railway 服务页面（assets-management）
2. 点击顶部 **"Variables"** 标签

### 2. 添加环境变量

对于每个变量：

1. 点击 **"+ New Variable"** 按钮
2. **Key**（变量名）：输入变量名（如 `DB_HOST`）
3. **Value**（变量值）：输入变量值（如 `db.omtonocmwbqkadzkzmlt.supabase.co`）
4. 点击 **"Add"** 或按回车

### 3. 逐个添加所有变量

按照上面的清单，逐个添加所有 11 个变量。

**⚠️ 注意事项**：
- 变量名区分大小写（必须完全匹配）
- 值中不要有多余的空格
- 不要给值加引号
- 确保所有值都正确

---

## 📝 变量说明

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 运行环境 |
| `PORT` | `3000` | 服务端口 |
| `DB_HOST` | `db.omtonocmwbqkadzkzmlt.supabase.co` | Supabase 数据库主机 |
| `DB_PORT` | `5432` | 数据库端口 |
| `DB_USERNAME` | `postgres` | 数据库用户名 |
| `DB_PASSWORD` | `Ll3uXrXdiiMZ0KTv` | 数据库密码 |
| `DB_DATABASE` | `postgres` | 数据库名称 |
| `JWT_SECRET` | `QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=` | JWT 密钥 |
| `JWT_EXPIRES_IN` | `7d` | Token 过期时间 |
| `CORS_ORIGIN` | `https://xiaomumaozi88.github.io` | 允许的前端域名 |

---

## ✅ 配置完成后

### 1. 重启服务

添加所有环境变量后：

1. 点击 **"Deployments"** 标签
2. 点击最新的部署
3. 点击 **"Redeploy"** 按钮
4. 等待重新部署完成

### 2. 检查日志

1. 点击 **"Logs"** 标签
2. 查看是否有数据库连接错误
3. 应该看到类似：`Application is running on: http://localhost:3000`

### 3. 验证连接

如果看到之前的 `ECONNREFUSED` 错误消失了，说明配置成功！

---

## 🔍 验证检查清单

配置完成后，确认：

- [ ] 所有 11 个环境变量都已添加
- [ ] 变量值都正确（特别是 `DB_HOST` 和 `DB_PASSWORD`）
- [ ] 服务已重新部署
- [ ] 日志中不再有 `ECONNREFUSED` 错误
- [ ] 日志显示应用正常运行

---

## 🆘 如果还有错误

### 仍然连接 localhost

- 检查 `DB_HOST` 是否为 `db.omtonocmwbqkadzkzmlt.supabase.co`
- 确认服务已重新部署
- 检查变量名拼写是否正确

### 数据库连接失败

- 检查 `DB_PASSWORD` 是否正确
- 确认 Supabase 数据库正在运行
- 验证数据库连接信息

---

配置完成后告诉我结果！🚀

