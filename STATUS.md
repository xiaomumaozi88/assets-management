# 服务状态

## 当前状态

✅ **后端服务已启动** - http://localhost:3000
✅ **前端服务已启动** - http://localhost:5173

## 访问地址

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000/api

## 下一步操作

### 1. 如果看到数据库连接错误

需要先创建PostgreSQL数据库：

```bash
# 连接到PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE assets_management;

# 退出
\q
```

### 2. 初始化基础数据

后端启动成功后，运行初始化脚本：

```bash
cd backend
npm run init:data
```

这将创建：
- 默认管理员账号（admin@example.com / admin123）
- 默认业务线
- 默认资产类型

### 3. 访问系统

打开浏览器访问：http://localhost:5173

使用默认账号登录：
- 邮箱: `admin@example.com`
- 密码: `admin123`

## 停止服务

如果需要停止服务：

```bash
# 停止后端（在运行后端的终端按 Ctrl+C）
# 或使用：
lsof -ti:3000 | xargs kill

# 停止前端（在运行前端的终端按 Ctrl+C）
# 或使用：
lsof -ti:5173 | xargs kill
```

## 查看日志

后端日志会在运行 `npm run start:dev` 的终端显示。

前端日志会在运行 `npm run dev` 的终端显示。

