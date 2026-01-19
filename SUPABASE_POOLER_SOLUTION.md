# 🔧 解决 Supabase IPv6 连接问题

## ❌ 问题根源

Supabase 的默认数据库连接使用 **IPv6 地址**，而 Railway 不支持 IPv6，导致连接失败。

## ✅ 解决方案：使用 Supabase 连接池（Session Pooler）

Supabase 提供了 **Session Pooler**，它支持 IPv4，可以解决这个问题。

---

## 📋 操作步骤

### 步骤 1：获取 Supabase 连接池地址

1. 访问 Supabase 控制台：https://supabase.com/dashboard/project/omtonocmwbqkadzkzmlt
2. 进入 **Settings** → **Database**
3. 滚动到 **Connection string** 部分
4. 选择 **Session mode** 或 **Transaction mode** 标签
5. 你会看到一个连接字符串，类似：

```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres
```

6. **复制这个连接字符串**，或提取以下信息：
   - **Host**: `aws-0-<region>.pooler.supabase.com`（不是 `db.omtonocmwbqkadzkzmlt.supabase.co`）
   - **Port**: `5432` 或 `6543`（pooler 端口）
   - **User**: `postgres.xxxxx`（注意格式不同）
   - **Password**: 你的密码
   - **Database**: `postgres`

---

### 步骤 2：更新 Railway 环境变量

在 Railway **Variables** 中，**更新或添加**以下变量：

**重要**：使用连接池的地址，而不是直接数据库地址：

```bash
# 使用连接池地址（IPv4 支持）
DB_HOST=aws-0-<region>.pooler.supabase.com  # 从连接池地址提取
DB_PORT=5432  # 或 6543（根据连接池类型）
DB_USERNAME=postgres.xxxxx  # 从连接池地址提取（格式不同！）
DB_PASSWORD=Ll3uXrXdiiMZ0KTv
DB_DATABASE=postgres
```

**⚠️ 注意**：
- `DB_USERNAME` 格式可能是 `postgres.xxxxx`，不是简单的 `postgres`
- Host 是 `pooler.supabase.com`，不是 `db.xxxxx.supabase.co`

---

### 步骤 3：或使用 DATABASE_URL（推荐）

更简单的方法是直接使用连接字符串：

1. 在 Railway **Variables** 中，添加：
   ```
   DATABASE_URL=postgresql://postgres.xxxxx:Ll3uXrXdiiMZ0KTv@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```

2. 修改后端代码使用 `DATABASE_URL`（如果需要）

---

### 步骤 4：重新部署

1. 保存环境变量
2. Railway 会自动重新部署
3. 查看 Logs，应该不再有 IPv6 错误

---

## 🔍 如果找不到连接池选项

### 方法 A：启用 IPv4 Add-on（需要付费）

1. 在 Supabase **Settings** → **Database**
2. 查找 **IPv4 Add-on** 选项
3. 启用后，`db.omtonocmwbqkadzkzmlt.supabase.co` 会同时支持 IPv4

### 方法 B：检查连接字符串格式

连接池地址通常在 **Connection pooling** 部分，查找：
- Session mode
- Transaction mode
- 或 Pooler connection string

---

## 📝 连接池地址示例

格式通常是：
```
postgresql://postgres.xxxxx:password@aws-0-<region>.pooler.supabase.com:5432/postgres
```

或
```
postgresql://postgres.xxxxx:password@aws-0-<region>.pooler.supabase.com:6543/postgres
```

---

## ✅ 完成后验证

部署完成后，查看 Railway Logs：
- ✅ 不再有 `ENETUNREACH` IPv6 错误
- ✅ 成功连接到数据库
- ✅ 应用正常运行

---

## 🆘 需要帮助？

如果找不到连接池地址，告诉我，我可以帮你：
1. 检查 Supabase 设置
2. 或提供其他解决方案

