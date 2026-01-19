# 资产管理系统

一个通用的资产管理系统，支持动态配置资产类型和字段，用于管理域名、手机号、云存储、平台账号等多种类型的公司资产。

## 技术栈

### 后端
- NestJS + TypeScript
- PostgreSQL + TypeORM
- JWT 认证

### 前端
- React 18 + TypeScript
- Vite
- React Router
- React Query
- React Hook Form

## 项目结构

```
assets-fe/
├── backend/          # NestJS 后端
│   ├── src/
│   │   ├── modules/  # 业务模块
│   │   ├── config/   # 配置文件
│   │   ├── common/   # 通用组件
│   │   └── database/ # 数据库配置
│   └── package.json
├── frontend/         # React 前端
│   ├── src/
│   │   ├── pages/    # 页面组件
│   │   ├── components/ # 通用组件
│   │   ├── services/ # API 服务
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 12+
- npm 或 yarn

### 1. 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 2. 配置数据库

创建 PostgreSQL 数据库：
```sql
CREATE DATABASE assets_management;
```

复制后端环境变量文件：
```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接信息：
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=assets_management

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. 启动后端

```bash
cd backend
npm run start:dev
```

后端服务将在 http://localhost:3000 启动

### 4. 启动前端

```bash
cd frontend
npm run dev
```

前端应用将在 http://localhost:5173 启动

## 功能特性

### 已实现
- ✅ 用户认证（登录/注册）
- ✅ 业务线管理（CRUD）
- ✅ 资产类型管理（CRUD）
- ✅ 资产管理基础结构
- ✅ 前端基础布局和路由

### 待实现
- ⏳ 资产字段动态配置
- ⏳ 资产管理完整功能（动态表单）
- ⏳ 申请和审批流程
- ⏳ 成本管理
- ⏳ 续费提醒
- ⏳ 数据导入/导出
- ⏳ 资产历史记录

## API 接口

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册

### 业务线
- `GET /api/business-lines` - 获取业务线列表
- `POST /api/business-lines` - 创建业务线
- `GET /api/business-lines/:id` - 获取业务线详情
- `PATCH /api/business-lines/:id` - 更新业务线
- `DELETE /api/business-lines/:id` - 删除业务线

### 资产类型
- `GET /api/asset-types` - 获取资产类型列表
- `POST /api/asset-types` - 创建资产类型
- `GET /api/asset-types/:id` - 获取资产类型详情
- `PATCH /api/asset-types/:id` - 更新资产类型
- `DELETE /api/asset-types/:id` - 删除资产类型

### 资产
- `GET /api/assets` - 获取资产列表（支持筛选）
- `POST /api/assets` - 创建资产
- `GET /api/assets/:id` - 获取资产详情
- `PATCH /api/assets/:id` - 更新资产
- `DELETE /api/assets/:id` - 删除资产

## 开发说明

### 数据库迁移

项目使用 TypeORM 的 synchronize 模式（开发环境），生产环境建议使用迁移脚本。

### 环境变量

前端环境变量（可选）：
```env
VITE_API_URL=http://localhost:3000/api
```

## 后续开发计划

1. 完善资产管理功能（动态表单渲染）
2. 实现申请和审批流程
3. 实现成本管理和报告
4. 实现续费提醒定时任务
5. 实现 CSV/Excel 数据导入
6. 完善前端 UI 和用户体验

## 许可证

MIT

