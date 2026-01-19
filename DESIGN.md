# 资产管理系统设计文档

## 1. 系统概述

本系统是一个灵活的资产管理系统，采用三层架构设计，支持动态字段配置、申请审批流程和多种资产类型管理。

### 1.1 核心设计理念

- **三层架构**：资产类型（AssetType） → 管理表格（AssetTemplate） → 字段（AssetField）
- **动态字段配置**：支持为每个管理表格配置自定义字段
- **申请审批流程**：支持资源申请和审批工作流
- **树形资产结构**：支持资产的父子关系

## 2. 核心实体设计

### 2.1 资产类型（AssetType）

**实体类**：`AssetType`

**职责**：定义资产的大类，如"域名"、"服务器"等。

**主要属性**：
- `id` (UUID): 主键
- `name` (String): 资产类型名称
- `code` (String): 唯一代码标识
- `category` (String): 分类
- `description` (Text): 描述
- `status` (Boolean): 启用状态
- `sort_order` (Integer): 排序顺序

**关联关系**：
- 一对多：`templates` (AssetTemplate[]) - 该类型下的所有管理表格
- 一对多：`assets` (Asset[]) - 该类型下的所有资产实例
- 一对多：`fields` (AssetField[]) - 该类型下的字段（已废弃，字段现在关联到模板）
- 一对多：`applications` (Application[]) - 该类型的申请记录

### 2.2 管理表格（AssetTemplate）

**实体类**：`AssetTemplate`

**职责**：定义资产类型下的具体管理表格，每个表格可以有不同的用途和字段配置。

**主要属性**：
- `id` (UUID): 主键
- `asset_type_id` (UUID): 所属资产类型ID
- `name` (String): 表格名称
- `code` (String): 代码标识
- `purpose` (String): 用途（如"数据上报"、"API调用"等）
- `description` (Text): 表格描述
- `status` (Boolean): 启用状态
- `sort_order` (Integer): 排序顺序

**关联关系**：
- 多对一：`assetType` (AssetType) - 所属资产类型
- 一对多：`fields` (AssetField[]) - 该表格的字段配置
- 一对多：`assets` (Asset[]) - 使用该模板的资产实例

**设计说明**：
- 一个资产类型可以有多个管理表格，每个表格有不同的用途
- 用途（purpose）用于在申请资源时区分不同的表格

### 2.3 字段（AssetField）

**实体类**：`AssetField`

**职责**：定义管理表格的字段配置，支持多种字段类型和验证规则。

**主要属性**：
- `id` (UUID): 主键
- `asset_template_id` (UUID): 所属管理表格ID
- `field_name` (String): 字段显示名称
- `field_code` (String): 字段代码（用于存储）
- `field_type` (Enum): 字段类型
  - `text`: 文本
  - `number`: 数字
  - `date`: 日期
  - `url`: URL
  - `email`: 邮箱
  - `textarea`: 多行文本
  - `select`: 下拉选择
- `is_required` (Boolean): 是否必填
- `require_in_application` (Boolean): 是否在申请时必填
- `default_value` (String): 默认值
- `validation_rule` (JSONB): 验证规则
- `options` (JSONB): 选项配置（用于下拉字段）
  - `multiple` (Boolean): 是否多选
  - `items` (Array): 选项列表
    - 格式：`[{value: string, label: string}]` 或 `[string]`
- `display_order` (Integer): 显示顺序

**关联关系**：
- 多对一：`assetTemplate` (AssetTemplate) - 所属管理表格

**设计说明**：
- 字段可以配置为在申请时必填（`require_in_application`）
- 下拉字段支持单选和多选两种模式
- 选项列表支持值-标签格式或纯值格式

### 2.4 资产（Asset）

**实体类**：`Asset`

**职责**：资产实例，存储具体的资产数据。

**主要属性**：
- `id` (UUID): 主键
- `asset_type_id` (UUID): 资产类型ID
- `asset_template_id` (UUID): 使用的管理表格ID
- `name` (String): 资产名称
- `code` (String): 资产代码（唯一）
- `status` (Enum): 状态
  - `active`: 启用
  - `inactive`: 禁用
  - `released`: 已释放
  - `deleted`: 已删除
- `owner_id` (UUID): 所有者ID
- `project_id` (UUID): 所属项目ID
- `business_line_id` (UUID): 所属业务线ID
- `expiry_date` (Date): 到期日期
- `cost` (Decimal): 成本
- `custom_fields` (JSONB): 自定义字段数据
- `parent_id` (UUID): 父资产ID（支持树形结构）
- `metadata` (JSONB): 元数据

**关联关系**：
- 多对一：`assetType` (AssetType) - 资产类型
- 多对一：`assetTemplate` (AssetTemplate) - 管理表格
- 多对一：`owner` (User) - 所有者
- 多对一：`project` (Project) - 项目
- 多对一：`businessLine` (BusinessLine) - 业务线
- 多对一：`parent` (Asset) - 父资产
- 一对多：`children` (Asset[]) - 子资产

**设计说明**：
- `custom_fields` 存储根据字段配置动态生成的数据
- 支持树形结构，资产可以有父子关系
- 资产数据根据模板的字段配置动态生成

### 2.5 申请（Application）

**实体类**：`Application`

**职责**：资源申请记录。

**主要属性**：
- `id` (UUID): 主键
- `applicant_id` (UUID): 申请人ID
- `asset_type_id` (UUID): 申请的资产类型ID
- `asset_template_id` (UUID): 申请的表格ID（用途）
- `approver_id` (UUID): 审批人ID
- `application_data` (JSONB): 申请数据（预填的字段数据）
- `status` (Enum): 申请状态
  - `pending`: 待审批
  - `approved`: 已通过
  - `rejected`: 已拒绝

**关联关系**：
- 多对一：`applicant` (User) - 申请人
- 多对一：`assetType` (AssetType) - 资产类型
- 多对一：`assetTemplate` (AssetTemplate) - 管理表格（用途）
- 一对多：`approvals` (Approval[]) - 审批记录

**设计说明**：
- `application_data` 存储申请人预填的字段数据
- 申请通过后，系统会根据 `application_data` 和 `asset_template_id` 自动创建资产

### 2.6 审批（Approval）

**实体类**：`Approval`

**职责**：审批记录。

**主要属性**：
- `id` (UUID): 主键
- `application_id` (UUID): 申请ID
- `approver_id` (UUID): 审批人ID
- `status` (Enum): 审批状态
  - `pending`: 待审批
  - `approved`: 已通过
  - `rejected`: 已拒绝
- `comments` (Text): 审批意见

**关联关系**：
- 多对一：`application` (Application) - 申请记录
- 多对一：`approver` (User) - 审批人

**设计说明**：
- 一个申请可以有多个审批记录（支持多级审批）
- 审批通过后，会触发资产创建流程

### 2.7 用户（User）

**实体类**：`User`

**职责**：系统用户。

**主要属性**：
- `id` (UUID): 主键
- `name` (String): 姓名
- `email` (String): 邮箱（唯一）
- `password` (String): 密码（加密）
- `role` (Enum): 角色
  - `user`: 普通用户
  - `admin`: 管理员
- `department` (String): 部门
- `status` (Enum): 状态
  - `active`: 启用
  - `inactive`: 禁用

**关联关系**：
- 一对多：`assets` (Asset[]) - 拥有的资产
- 一对多：`applications` (Application[]) - 提交的申请
- 一对多：`approvals` (Approval[]) - 审批记录

## 3. 关系设计

### 3.1 三层架构关系

```
AssetType (资产类型)
  └── AssetTemplate (管理表格)
        └── AssetField (字段)
              └── Asset.custom_fields (资产数据)
```

**说明**：
- 一个资产类型可以有多个管理表格
- 一个管理表格可以有多个字段
- 资产实例使用某个管理表格，其 `custom_fields` 存储该表格字段的数据

### 3.2 申请审批流程

```
User (申请人)
  └── Application (申请)
        └── Approval (审批)
              └── Asset (资产) [审批通过后创建]
```

**说明**：
- 用户提交申请，选择资产类型和用途（表格）
- 系统根据表格配置显示需要预填的字段
- 申请提交后创建审批记录
- 审批通过后，系统根据申请数据创建资产

### 3.3 资产树形结构

```
Asset (父资产)
  └── Asset (子资产)
        └── Asset (子资产)
```

**说明**：
- 资产支持父子关系，形成树形结构
- 用于表示资产的层级关系（如：服务器 → 虚拟机 → 容器）

## 4. 业务流程设计

### 4.1 资产配置流程

1. **创建资产类型**：管理员创建资产类型（如"域名"）
2. **创建管理表格**：为资产类型创建管理表格，设置用途（如"数据上报"）
3. **配置字段**：为管理表格配置字段
   - 设置字段类型、是否必填、是否申请必填
   - 对于下拉字段，配置选项列表和单选/多选模式
4. **使用表格**：在资产管理页面选择表格，查看和管理资产数据

### 4.2 申请审批流程

1. **提交申请**：
   - 用户选择资产类型
   - 选择用途（管理表格）
   - 系统根据表格配置显示需要预填的字段
   - 填写申请数据
   - 指定审批人
   - 提交申请

2. **审批流程**：
   - 审批人查看待审批申请
   - 审批通过或拒绝
   - 审批通过后，系统自动创建资产

3. **资产管理**：
   - 用户可以在"我的资产"中查看自己的资产
   - 在资产管理页面可以编辑资产数据

## 5. 前端组件设计

### 5.1 页面组件

#### 资产项管理（AssetTypes）
- **职责**：管理资产类型、管理表格和字段配置
- **功能**：
  - 资产类型的增删改查
  - 管理表格的增删改查（包括用途和描述）
  - 字段配置（包括字段类型、选项配置等）

#### 资产管理（Assets）
- **职责**：管理资产实例数据
- **功能**：
  - 选择资产类型和表格
  - 显示表格描述（可编辑）
  - 表格数据的增删改查（行内编辑）
  - 支持树形结构（父子行）
  - 根据字段类型动态渲染输入控件

#### 申请管理（Applications）
- **职责**：管理资源申请和审批
- **功能**：
  - 提交申请（动态表单）
  - 查看我的申请
  - 待我审批列表
  - 我已审批列表
  - 审批操作（通过/拒绝）

### 5.2 服务层设计

#### 后端服务（NestJS）
- **Controller**：处理HTTP请求
- **Service**：业务逻辑处理
- **Entity**：数据模型定义
- **DTO**：数据传输对象

#### 前端服务（TypeScript）
- **Service**：封装API调用
- **Type**：类型定义

## 6. 数据存储设计

### 6.1 字段数据存储

- **字段配置**：存储在 `asset_fields` 表
- **字段数据**：存储在 `assets.custom_fields` (JSONB)
- **申请数据**：存储在 `applications.application_data` (JSONB)

### 6.2 选项配置格式

下拉字段的选项配置存储在 `asset_fields.options` (JSONB)：

```json
{
  "multiple": false,
  "items": [
    {"value": "option1", "label": "选项1"},
    {"value": "option2", "label": "选项2"}
  ]
}
```

或简化格式：
```json
{
  "multiple": true,
  "items": ["选项1", "选项2"]
}
```

## 7. 设计模式

### 7.1 模板模式（Template Pattern）
- 管理表格（AssetTemplate）作为模板，定义字段结构
- 资产实例（Asset）使用模板，存储实际数据

### 7.2 策略模式（Strategy Pattern）
- 不同字段类型使用不同的渲染策略
- 前端根据字段类型动态选择输入控件

### 7.3 观察者模式（Observer Pattern）
- 审批通过后自动创建资产
- 申请状态变化触发相关操作

## 8. 扩展性设计

### 8.1 字段类型扩展
- 通过 `FieldType` 枚举定义字段类型
- 前端和后端都需要支持新类型

### 8.2 验证规则扩展
- `validation_rule` 使用 JSONB 存储，支持灵活配置
- 可以添加各种验证规则（长度、格式等）

### 8.3 审批流程扩展
- 当前支持单级审批
- 可以扩展为多级审批（通过多个 Approval 记录）

## 9. 总结

本系统采用灵活的三层架构设计，支持：
- 动态字段配置
- 多种字段类型（包括下拉单选/多选）
- 申请审批流程
- 树形资产结构
- 表格描述和用途管理

通过这种设计，系统可以适应不同业务场景的资产管理需求，具有良好的扩展性和灵活性。

