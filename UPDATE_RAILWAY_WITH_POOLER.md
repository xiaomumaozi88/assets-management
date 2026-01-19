# ✅ 更新 Railway 环境变量（使用连接池）

## 🎯 从 Supabase 获取的信息

从连接字符串中提取的信息：

**连接字符串**：
```
postgresql://postgres.omtonocmwbqkadzkzmlt:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**提取的关键信息**：
- **Host**: `aws-1-ap-southeast-1.pooler.supabase.com` ⬅️ 重要！是 pooler 地址
- **Port**: `5432`
- **Username**: `postgres.omtonocmwbqkadzkzmlt` ⬅️ 注意格式不同！
- **Password**: `Ll3uXrXdiiMZ0KTv`（你的密码）
- **Database**: `postgres`

---

## 📋 更新 Railway 环境变量

### 步骤：

1. **在 Railway 服务页面**，点击 **"Variables"** 标签

2. **更新以下变量**（如果已存在，编辑；如果不存在，添加）：

```bash
# 数据库配置（使用连接池地址）
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_USERNAME=postgres.omtonocmwbqkadzkzmlt
DB_PASSWORD=Ll3uXrXdiiMZ0KTv
DB_DATABASE=postgres
```

**⚠️ 重要变化**：
- `DB_HOST` 改为：`aws-1-ap-southeast-1.pooler.supabase.com`（不是之前的 `db.omtonocmwbqkadzkzmlt.supabase.co`）
- `DB_USERNAME` 改为：`postgres.omtonocmwbqkadzkzmlt`（注意格式！不是简单的 `postgres`）

3. **保存所有变量**

4. **Railway 会自动重新部署**

---

## ✅ 验证

部署完成后，查看 Railway **Logs**：
- ✅ 应该不再有 IPv6 错误
- ✅ 应该成功连接到数据库
- ✅ 应用正常运行

---

## 🎉 完成！

更新环境变量后，等待重新部署，应该就能正常连接数据库了！

