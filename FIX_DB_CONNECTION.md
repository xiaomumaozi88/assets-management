# 🔧 修复数据库连接问题

## ❌ 当前问题

错误：`Connection terminated unexpectedly`

这说明连接到数据库后连接被立即终止。

---

## ✅ 解决方案

### 方案 1：临时启用数据库同步（最简单）

在生产环境暂时启用自动同步来创建表结构：

1. 在 Railway **Variables** 标签页
2. 找到 `NODE_ENV` 变量
3. **临时**改为：`development`
4. 保存（会自动重新部署）
5. 等待部署完成，数据库表会自动创建
6. ⚠️ **重要**：创建完成后，改回 `production`

### 方案 2：检查 Supabase 连接设置

1. 在 Supabase 控制台
2. **Settings** → **Database**
3. 检查 **Connection string**
4. 确认连接信息是否正确

### 方案 3：使用 Supabase 连接池（如果可用）

1. 在 Supabase **Settings** → **Database**
2. 找到 **Connection pooling** 部分
3. 使用连接池的端口（通常是 6543 而不是 5432）
4. 在 Railway Variables 中更新 `DB_PORT` 为 `6543`

### 方案 4：检查 Railway 环境变量

确保 Railway **Variables** 中所有数据库变量都已正确设置：

```bash
DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Ll3uXrXdiiMZ0KTv
DB_DATABASE=postgres
```

---

## 🚀 推荐操作（最快）

**临时启用数据库同步**：

1. Railway → **Variables**
2. `NODE_ENV` = `development` （临时）
3. 保存并等待重新部署
4. 部署完成后，表会自动创建
5. 改回 `production`

---

## 🧪 验证

部署完成后，查看 Railway **Logs**：
- ✅ 如果看到表创建的信息 → 成功！
- ✅ 如果没有数据库连接错误 → 成功！
- ✅ 然后改回 `NODE_ENV=production`

---

## ⚠️ 注意事项

- `NODE_ENV=development` 会启用 `synchronize: true`
- 这在生产环境不推荐使用
- **创建完表后，立即改回 `production`**

