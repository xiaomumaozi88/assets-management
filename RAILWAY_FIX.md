# 🔧 修复 Railway 启动脚本错误

## 问题

错误：`Missing script: "start:prod"`

**原因**：Railway 没有正确识别到 `backend` 目录，或者 `Root Directory` 配置不正确。

---

## ✅ 解决方案

### 方法 1：检查并修复 Root Directory（推荐）

1. 在 Railway 服务页面，点击 **Settings**
2. 找到 **Root Directory** 配置
3. 确保设置为：`backend`
4. 如果为空或错误，修改为 `backend` 并保存

### 方法 2：检查 Start Command

1. 在 **Settings** 中找到 **Start Command**
2. 确保设置为：`npm run start:prod`
3. 如果为空，添加：`npm run start:prod`
4. 保存

### 方法 3：如果方法 1 和 2 都不行

检查 Build Command：
1. **Settings** → **Build Command**
2. 设置为：`cd backend && npm install && npm run build`
3. 或留空（Railway 会自动检测）

---

## 📋 完整的服务配置检查清单

在 Railway **Settings** 中确认：

- ✅ **Root Directory**: `backend`
- ✅ **Start Command**: `npm run start:prod`
- ✅ **Build Command**: `cd backend && npm install && npm run build` （或留空）

---

## 🔍 验证步骤

1. 修改配置后，Railway 会自动重新部署
2. 查看 **Logs** 标签页，应该看到：
   - ✅ 构建成功
   - ✅ 启动命令正确执行
   - ✅ 应用运行在端口上

---

## 如果问题仍然存在

可能是 Railway 检测逻辑问题，尝试以下方法：

### 临时方案：使用完整路径

在 **Start Command** 中使用：
```bash
cd backend && npm run start:prod
```

或者在 **Build Command** 中：
```bash
cd backend && npm install && npm run build
```

然后在 **Start Command** 中：
```bash
cd backend && node dist/main.js
```

