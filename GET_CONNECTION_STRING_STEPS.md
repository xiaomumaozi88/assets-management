# 📍 获取数据库连接字符串的步骤

## 🎯 当前位置

你现在在 **Database Settings** 页面，看到了 "Connection pooling configuration"。

## 📋 找到连接字符串

连接字符串不在 Settings 页面，而在项目主页。

### 步骤：

1. **点击顶部导航栏的项目名称**：
   - 点击 **"xiaomumaozi88's Project"**（在顶部面包屑导航中）

2. **回到项目主页后**：
   - 向下滚动
   - 找到 **"Connect to your project"** 部分
   - 在这个部分，应该有 **"Database"** 或 **"Connection string"** 选项

3. **或者**：
   - 在项目主页，查找卡片或部分，显示：
     - "Database"
     - "Connection string"
     - 或类似的数据库连接信息

4. **在连接字符串部分**：
   - 你会看到几个标签页：
     - **URI**（直接连接）
     - **Session mode** ⬅️ **点击这个！**
     - **Transaction mode**
     - **Connection pooling**

5. **选择 "Session mode" 标签**，复制连接字符串

---

## 🔄 如果找不到

另一种方法：

1. 在当前页面（Database Settings），点击右上角的 **"Connect"** 按钮
2. 这会打开连接向导或显示连接信息

---

## ✅ 连接字符串格式

找到后，应该类似：

```
postgresql://postgres.xxxxx:password@aws-0-<region>.pooler.supabase.com:5432/postgres
```

或者：

```
postgresql://postgres:password@aws-0-<region>.pooler.supabase.com:6543/postgres
```

---

**先点击顶部的项目名称，回到项目主页，然后查找 "Connect to your project" 部分！**

