# Supabase 数据库配置指南

## 第一步：获取数据库连接信息

### 1. 进入数据库设置

1. 在 Supabase 项目页面，点击左侧菜单的 **Settings**（⚙️ 图标）
2. 点击 **Database**
3. 滚动到 **Connection string** 部分
4. 选择 **URI** 标签页

### 2. 复制连接字符串

你会看到一个类似这样的连接字符串：
```
postgresql://postgres:[YOUR-PASSWORD]@db.omtonocmwbqkadzkzmlt.supabase.co:5432/postgres
```

### 3. 提取连接信息

从连接字符串中提取以下信息：
- **DB_HOST**: `db.omtonocmwbqkadzkzmlt.supabase.co`
- **DB_PORT**: `5432`
- **DB_USERNAME**: `postgres`
- **DB_PASSWORD**: `[YOUR-PASSWORD]` （连接字符串中的密码部分）
- **DB_DATABASE**: `postgres`

---

## 第二步：获取数据库密码

如果你不知道数据库密码：

1. 在 **Settings** → **Database** 页面
2. 找到 **Database password** 部分
3. 如果没有设置或忘记了，点击 **Reset database password**
4. **⚠️ 重要**：保存好这个密码，后面会用到

---

## 第三步：准备配置信息

获取以下信息后告诉我，我会帮你配置：

1. **DB_HOST**: `db.omtonocmwbqkadzkzmlt.supabase.co` （从 Project URL 可以推断）
2. **DB_PORT**: `5432`
3. **DB_USERNAME**: `postgres`
4. **DB_PASSWORD**: `你的数据库密码`
5. **DB_DATABASE**: `postgres`

---

## 快速检查

你的 Project URL 是：`https://omtonocmwbqkadzkzmlt.supabase.co`

所以数据库主机应该是：`db.omtonocmwbqkadzkzmlt.supabase.co`

现在请：
1. 进入 Settings → Database
2. 找到连接字符串或数据库密码
3. 告诉我数据库密码，我会帮你配置下一步

