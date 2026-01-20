# 数据同步指南

## 数据格式选项

请告诉我你的本地数据是什么格式，我会为你提供相应的同步方案：

### 选项 1：数据库导出（PostgreSQL/MySQL 等）
- 如果是从其他数据库导出的 SQL 文件
- 可以直接转换为 Supabase 兼容的 SQL

### 选项 2：Excel/CSV 文件
- 如果是 Excel 表格或 CSV 文件
- 需要转换为 SQL INSERT 语句

### 选项 3：JSON 数据
- 如果是 JSON 格式的数据
- 可以转换为 SQL INSERT 语句

### 选项 4：其他格式
- 告诉我数据格式，我会提供相应的转换方案

## 数据库表结构参考

### assets 表（资产）
主要字段：
- `id` (UUID) - 自动生成
- `asset_type_id` (UUID) - 资产类型ID（需要在 asset_types 表中存在）
- `asset_template_id` (UUID, 可选) - 资产模板ID
- `name` (VARCHAR) - 资产名称
- `code` (VARCHAR, 可选) - 资产代码
- `status` (ENUM) - 状态：'active', 'released', 'deleted'
- `owner_id` (UUID) - 所有者ID（需要在 users 表中存在）
- `project_id` (UUID, 可选) - 项目ID
- `business_line_id` (UUID, 可选) - 业务线ID
- `expiry_date` (DATE, 可选) - 过期日期
- `cost` (DECIMAL, 可选) - 成本
- `cost_currency` (VARCHAR) - 货币，默认 'CNY'
- `custom_fields` (JSONB, 可选) - 自定义字段
- `metadata` (JSONB, 可选) - 元数据
- `parent_id` (UUID, 可选) - 父资产ID（用于层级结构）
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 更新时间

### asset_types 表（资产类型）
- `id` (UUID) - 自动生成
- `name` (VARCHAR) - 名称
- `code` (VARCHAR, UNIQUE) - 代码
- `category` (VARCHAR, 可选) - 分类
- `description` (TEXT, 可选) - 描述
- `status` (BOOLEAN) - 状态
- `sort_order` (INT) - 排序

### business_lines 表（业务线）
- `id` (UUID) - 自动生成
- `name` (VARCHAR) - 名称
- `code` (VARCHAR, UNIQUE) - 代码
- `suffix` (VARCHAR, 可选) - 后缀
- `description` (TEXT, 可选) - 描述
- `status` (BOOLEAN) - 状态
- `sort_order` (INT) - 排序

### users 表（用户）
- `id` (UUID) - 自动生成
- `name` (VARCHAR) - 姓名
- `email` (VARCHAR, UNIQUE) - 邮箱
- `password` (VARCHAR) - bcrypt 加密的密码
- `role` (ENUM) - 角色：'admin', 'user'
- `status` (ENUM) - 状态：'active', 'inactive'

## 同步步骤

1. **准备数据**：根据你的数据格式，我会帮你转换为 SQL
2. **检查依赖**：确保相关的资产类型、业务线、用户等已存在
3. **执行 SQL**：在 Supabase SQL Editor 中执行

## 注意事项

- **外键依赖**：插入资产前，确保引用的资产类型、业务线、用户等已存在
- **UUID 生成**：使用 `gen_random_uuid()` 生成新的 UUID
- **时间戳**：使用 `NOW()` 设置创建和更新时间
- **JSONB 字段**：自定义字段和元数据需要是有效的 JSON 格式

## 下一步

请告诉我：
1. 你的数据是什么格式？（Excel、CSV、SQL、JSON 等）
2. 主要有哪些数据？（资产、资产类型、业务线等）
3. 数据量大概有多少？

我会根据你的情况提供具体的 SQL 脚本或转换工具。

