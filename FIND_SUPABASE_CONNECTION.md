# 📍 在 Supabase 中查找连接池地址的步骤

## 🎯 当前页面

你现在在 **Project Overview** 页面。

## 📋 操作步骤

### 方法 1：通过左侧导航（推荐）

1. **点击左侧导航栏的 "Project Settings"**（在底部附近）
2. 在新页面中，点击 **"Database"**（在左侧菜单中）
3. 滚动到 **"Connection string"** 部分
4. 你会看到几个标签页：
   - **URI**（直接连接，IPv6）
   - **Session mode** ⬅️ **点击这个！**
   - **Transaction mode**
   - **Direct connection**

5. **选择 "Session mode" 标签**
6. 复制连接字符串或提取以下信息：
   - Host: `aws-0-<region>.pooler.supabase.com`
   - Port: `5432` 或 `6543`
   - Username: `postgres.xxxxx`
   - Password: 你的密码
   - Database: `postgres`

### 方法 2：通过 "Connect to your project" 部分

1. 在当前页面（Project Overview）
2. 滚动到 **"Connect to your project"** 部分
3. 点击 **"API settings"** 按钮（带齿轮图标）
4. 在设置页面中查找 **Database** 或 **Connection** 相关选项

### 方法 3：直接访问数据库设置

1. 点击左侧导航栏的 **"Database"**（在顶部附近）
2. 或者点击 **"SQL Editor"** 
3. 在这些页面中，查找连接信息或设置选项

---

## 🔍 查找的关键词

在页面中查找：
- **Connection string**
- **Connection pooling**
- **Session mode**
- **Transaction mode**
- **Pooler**

---

## ✅ 找到后应该看到

连接池地址格式类似：
```
postgresql://postgres.xxxxx:password@aws-0-<region>.pooler.supabase.com:5432/postgres
```

或分开显示：
- Host: `aws-0-<region>.pooler.supabase.com`
- Port: `5432` 或 `6543`
- Username: `postgres.xxxxx`（注意格式）

---

## 📝 如果找不到连接池选项

如果只有 "URI" 标签（直接连接），那么：
1. 可能项目较新，连接池功能默认启用
2. 或者需要启用 IPv4 Add-on（可能需要付费）
3. 告诉我你看到的选项，我会帮你找其他解决方案

---

**先尝试点击左侧的 "Project Settings" → "Database"**，应该能找到连接字符串选项！

