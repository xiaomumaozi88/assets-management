# 📍 找到数据库连接字符串

## 🎯 当前位置

你现在在 **API Settings** 页面（Data API）。

## 📋 找到数据库连接字符串的步骤

### 方法 1：通过左侧导航（推荐）

1. 在左侧导航栏，找到 **"CONFIGURATION"** 部分
2. 点击 **"Database"**（带数据库图标）
3. 这会打开 Database 设置页面
4. 在 Database 页面，查找 **"Connection string"** 或 **"Connection info"** 部分
5. 你会看到几个标签：
   - **URI**（直接连接）
   - **Session mode** ⬅️ **点击这个！**
   - **Transaction mode**

### 方法 2：回到项目主页

1. 点击顶部导航栏的 **"xiaomumaozi88's Project"**
2. 回到项目主页
3. 在项目主页，找到 **"Connect to your project"** 部分
4. 在这个部分，应该能看到数据库连接字符串选项

### 方法 3：通过 Database Settings

1. 在左侧导航栏，点击 **"CONFIGURATION"** → **"Database"**
2. 在 Database 页面，查找连接字符串部分

---

## ✅ 连接字符串应该显示什么

找到后，你应该看到类似这样的内容：

**Session mode** 连接字符串：
```
postgresql://postgres.xxxxx:password@aws-0-<region>.pooler.supabase.com:5432/postgres
```

或者分开显示：
- **Host**: `aws-0-<region>.pooler.supabase.com`
- **Port**: `5432` 或 `6543`
- **User**: `postgres.xxxxx`
- **Password**: 你的密码
- **Database**: `postgres`

---

## 🔍 关键点

- 不要使用 **URI** 标签（那是直接连接，使用 IPv6）
- 使用 **Session mode** 或 **Transaction mode**（这些是连接池，支持 IPv4）
- Host 应该是 `pooler.supabase.com`，不是 `db.xxxxx.supabase.co`

---

**先尝试点击左侧的 "CONFIGURATION" → "Database"**，应该能找到连接字符串！

