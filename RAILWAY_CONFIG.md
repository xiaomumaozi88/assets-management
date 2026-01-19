# Railway 部署配置

## Supabase 数据库信息

✅ **已配置完成**：
- **DB_HOST**: `db.omtonocmwbqkadzkzmlt.supabase.co`
- **DB_PORT**: `5432`
- **DB_USERNAME**: `postgres`
- **DB_PASSWORD**: `Ll3uXrXdiiMZ0KTv` ✅
- **DB_DATABASE**: `postgres`

---

## Railway 环境变量配置

在 Railway 部署时，需要在 **Variables** 标签页添加以下环境变量：

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

# CORS 配置（部署前端后更新）
CORS_ORIGIN=https://xiaomumaozi88.github.io
```

---

## 生成 JWT_SECRET

运行以下命令生成随机密钥：

```bash
openssl rand -base64 32
```

或者：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

复制生成的字符串作为 `JWT_SECRET` 的值。

---

## 下一步

1. ✅ Supabase 数据库已配置
2. ⏭️ 部署后端到 Railway
3. ⏭️ 初始化数据库表结构
4. ⏭️ 配置 GitHub Pages 前端
5. ⏭️ 更新 CORS 配置

