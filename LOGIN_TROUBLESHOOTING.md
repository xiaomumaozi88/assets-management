# 登录问题排查指南

## 问题现象

1. **API 返回 401**：`https://assets-management-production-2f7f.up.railway.app/api/auth/login` 返回 401 未授权错误
2. **404 请求**：出现对 `/login` 的 HTML 请求返回 404

## 原因分析

### 401 错误的可能原因

1. **数据库未初始化用户数据**
   - Railway 后端可能没有运行初始化脚本
   - 数据库中不存在默认管理员账号

2. **登录凭据不正确**
   - 使用的邮箱或密码不正确

3. **数据库连接问题**
   - 后端无法连接 Supabase 数据库
   - 环境变量配置错误

### 404 请求的原因

- 当 API 返回 401 时，axios 响应拦截器会尝试重定向到登录页
- 如果已经在登录页，这可能导致额外的请求
- 已修复：现在会检查是否已在登录页，避免循环重定向

## 解决步骤

### 1. 检查后端数据库初始化

需要在 Railway 后端运行初始化脚本创建默认用户：

**默认管理员账号**：
- 邮箱：`admin@example.com`
- 密码：`admin123`

**初始化方法**：

#### 方法 A：通过 Railway CLI（推荐）

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 链接到项目
railway link

# 运行初始化脚本
railway run npm run init:data
```

#### 方法 B：通过 Railway Web 界面

1. 访问 Railway 项目：https://railway.app
2. 选择 backend 服务
3. 点击 **Deployments** 标签
4. 找到最新的部署
5. 点击 **View Logs**
6. 在终端中运行：
   ```
   npm run init:data
   ```

#### 方法 C：手动创建用户（SQL）

如果初始化脚本不可用，可以手动在 Supabase 中创建用户：

1. 访问 Supabase Dashboard：https://app.supabase.com
2. 选择你的项目
3. 打开 **SQL Editor**
4. 运行以下 SQL（注意：密码需要使用 bcrypt 加密）：

```sql
-- 生成 bcrypt 哈希（密码：admin123）
-- 可以使用在线工具：https://bcrypt-generator.com/
-- 或者在后端临时添加代码生成

-- 假设 bcrypt 哈希为 $2b$10$... （需要实际生成）
INSERT INTO users (id, name, email, password, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Admin',
  'admin@example.com',
  '$2b$10$YourActualBcryptHashHere', -- 需要替换为实际的 bcrypt 哈希
  'admin',
  NOW(),
  NOW()
);
```

### 2. 验证后端日志

1. 访问 Railway：https://railway.app
2. 选择 backend 服务
3. 查看 **Logs**，检查：
   - 数据库连接是否成功
   - 是否有错误信息
   - 服务是否正常运行

### 3. 检查环境变量

确保 Railway 中设置了以下环境变量：

- `DB_HOST` - Supabase 数据库主机（Session Pooler 地址）
- `DB_PORT` - 通常是 5432
- `DB_USERNAME` - Supabase 数据库用户名
- `DB_PASSWORD` - Supabase 数据库密码
- `DB_DATABASE` - 数据库名称（通常是 `postgres`）
- `JWT_SECRET` - JWT 密钥
- `CORS_ORIGIN` - `https://xiaomumaozi88.github.io`

### 4. 测试登录 API

使用 curl 测试登录接口：

```bash
curl -X POST https://assets-management-production-2f7f.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**预期响应**（成功）：
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**如果返回 401**：
- 检查用户是否存在
- 检查密码是否正确
- 检查数据库连接

### 5. 检查前端 API URL 配置

确保 GitHub Secrets 中设置了正确的 API URL：

- 变量名：`VITE_API_URL`
- 变量值：`https://assets-management-production-2f7f.up.railway.app/api`

## 常见错误

### 错误 1：数据库连接失败

**症状**：后端日志显示 `ECONNREFUSED` 或连接超时

**解决**：
- 检查 Supabase 数据库连接信息
- 使用 Session Pooler 连接字符串（IPv4 兼容）
- 确保 `DB_HOST`、`DB_PORT`、`DB_USERNAME`、`DB_PASSWORD` 正确

### 错误 2：用户不存在

**症状**：登录返回 401，错误信息为 "Invalid credentials"

**解决**：
- 运行初始化脚本创建默认用户
- 或手动在数据库中创建用户

### 错误 3：CORS 错误

**症状**：浏览器控制台显示 CORS 错误

**解决**：
- 在 Railway 中设置 `CORS_ORIGIN=https://xiaomumaozi88.github.io`
- 重启 Railway 服务

## 下一步

完成以上步骤后：

1. 等待 Railway 服务重启（如果修改了环境变量）
2. 运行初始化脚本创建默认用户
3. 在前端测试登录：
   - 访问：https://xiaomumaozi88.github.io/assets-management/login
   - 使用默认账号：`admin@example.com` / `admin123`

如果仍然有问题，请检查：
- Railway 日志
- 浏览器控制台错误
- Network 标签中的请求和响应

