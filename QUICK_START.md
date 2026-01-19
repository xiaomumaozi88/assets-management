# 快速启动指南

## 一键启动（推荐）

### 1. 确保PostgreSQL运行

```bash
# macOS (使用Homebrew)
brew services start postgresql@14

# 或检查PostgreSQL是否运行
psql --version
```

### 2. 创建数据库

```bash
psql -U postgres
```

在PostgreSQL命令行中执行：
```sql
CREATE DATABASE assets_management;
\q
```

### 3. 配置数据库连接

编辑 `backend/.env` 文件，修改数据库密码（如果需要）：

```env
DB_PASSWORD=你的数据库密码
```

### 4. 启动后端

```bash
cd backend
npm install  # 首次运行需要
npm run start:dev
```

等待看到 "Application is running on: http://localhost:3000" 表示启动成功。

### 5. 初始化数据（新终端窗口）

```bash
cd backend
npm run init:data
```

### 6. 启动前端（新终端窗口）

```bash
cd frontend
npm install  # 首次运行需要
npm run dev
```

### 7. 访问系统

打开浏览器访问：http://localhost:5173

使用默认账号登录：
- 邮箱: `admin@example.com`
- 密码: `admin123`

## 验证安装

### 检查后端API

```bash
curl http://localhost:3000/api
```

应该返回API信息。

### 测试登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

应该返回包含 `access_token` 的JSON响应。

## 常见问题

### 数据库连接失败

**错误**: `connect ECONNREFUSED 127.0.0.1:5432`

**解决**:
1. 检查PostgreSQL是否运行: `brew services list` (macOS)
2. 检查端口是否正确: `lsof -i :5432`
3. 检查 `.env` 中的数据库配置

### 端口被占用

**错误**: `EADDRINUSE: address already in use :::3000`

**解决**:
1. 修改 `backend/.env` 中的 `PORT` 值
2. 或停止占用端口的进程: `lsof -ti:3000 | xargs kill`

### 模块未找到

**错误**: `Cannot find module '@nestjs/xxx'`

**解决**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 下一步

- 查看 [README.md](./README.md) 了解完整功能
- 查看 [START.md](./START.md) 了解详细配置
- 开始创建业务线和资产类型

