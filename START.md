# 启动指南

## 前置准备

### 1. 安装 PostgreSQL

确保已安装并启动 PostgreSQL 数据库服务。

### 2. 创建数据库

```sql
CREATE DATABASE assets_management;
```

### 3. 配置环境变量

后端环境变量文件已创建在 `backend/.env`，请根据实际情况修改：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=你的数据库密码
DB_DATABASE=assets_management

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 启动步骤

### 1. 启动后端服务

```bash
cd backend
npm install  # 如果还没安装依赖
npm run start:dev
```

后端服务将在 http://localhost:3000 启动

### 2. 启动前端服务

打开新的终端窗口：

```bash
cd frontend
npm install  # 如果还没安装依赖
npm run dev
```

前端应用将在 http://localhost:5173 启动

## 首次使用

### 1. 初始化基础数据

在启动后端服务后，运行初始化脚本创建默认数据：

```bash
cd backend
npm run init:data
```

这将创建：
- 默认管理员账号（邮箱: admin@example.com, 密码: admin123）
- 默认业务线（HCG、RWZ、CPT、G007等）
- 默认资产类型（域名、手机号、云存储等）

### 2. 登录系统

访问 http://localhost:5173/login，使用默认管理员账号登录：
- 邮箱: `admin@example.com`
- 密码: `admin123`

### 3. 开始使用

登录后，可以：
- 查看和管理业务线
- 配置资产类型和字段
- 创建和管理资产
- 导入现有数据

## 常见问题

### 数据库连接失败

- 检查 PostgreSQL 服务是否运行
- 检查 `.env` 文件中的数据库配置是否正确
- 检查数据库用户是否有权限访问 `assets_management` 数据库

### 端口被占用

- 后端默认端口：3000，可在 `.env` 中修改 `PORT`
- 前端默认端口：5173，可在 `vite.config.ts` 中修改

### 编译错误

如果遇到编译错误，请运行：

```bash
cd backend
npm run build
```

查看具体错误信息。

## 下一步

- 创建业务线数据
- 配置资产类型和字段
- 导入现有资产数据
- 完善各功能模块

