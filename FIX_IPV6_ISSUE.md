# 🔧 修复 IPv6 连接问题

## ❌ 问题

错误信息：
```
ENETUNREACH 2406:da18:243:7418:aa7b:72fe:96f:f397:5432
```

**原因**：应用程序尝试通过 IPv6 连接 Supabase 数据库，但 Railway 可能无法访问 Supabase 的 IPv6 地址。

---

## ✅ 解决方案

### 方案 1：使用连接池配置（已修复）

我已经更新了数据库配置，强制使用 IPv4 连接。

**需要做的**：
1. 代码已更新，推送到 GitHub
2. Railway 会自动重新部署
3. 等待部署完成

### 方案 2：检查 Supabase 连接字符串

如果方案 1 不行，可能需要检查 Supabase 的连接设置：

1. 在 Supabase 控制台
2. **Settings** → **Database**
3. 查看 **Connection string**，确认是否提供了 IPv4 地址

### 方案 3：使用连接池 URL（如果支持）

在 Supabase 中，有时需要使用 **Connection pooling** 地址而不是直接数据库地址。

1. 在 Supabase **Settings** → **Database**
2. 找到 **Connection pooling** 部分
3. 使用 **Session mode** 或 **Transaction mode** 的连接字符串
4. 如果是连接字符串格式，可能需要解析出单独的配置

---

## 🔍 检查 Supabase 设置

### 1. 检查数据库访问设置

在 Supabase 控制台：
1. **Settings** → **Database**
2. 确认 **Database Settings** 中的连接方式
3. 查看是否有 **IPv6** 或 **IPv4** 相关设置

### 2. 获取正确的连接信息

在 Supabase **Settings** → **Database** → **Connection string**：
- 使用 **URI** 格式
- 确认主机地址是否正确

---

## 🧪 测试连接

部署后，查看日志应该：
- ✅ 不再有 `ENETUNREACH` 错误
- ✅ 成功连接到数据库
- ✅ 或出现其他错误（如表不存在，这是正常的，需要初始化）

---

## 💡 如果问题仍然存在

可能需要：
1. 联系 Supabase 支持检查 IPv6/IPv4 设置
2. 或使用 Supabase 的连接池地址（如果可用）
3. 或检查 Railway 的网络设置

---

代码已更新，请等待 Railway 自动重新部署！🚀

