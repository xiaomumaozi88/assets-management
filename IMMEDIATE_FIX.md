# 🚨 立即修复：Missing script "start:prod"

## 问题

Railway 找不到 `start:prod` 脚本，因为它在根目录查找，而不是 `backend` 目录。

---

## ✅ 立即修复步骤

### 在 Railway 网页端配置：

1. **进入服务设置**：
   - 点击 **assets-management** 服务
   - 点击 **Settings** 标签

2. **设置 Root Directory**：
   - 找到 **Root Directory** 字段
   - 设置为：`backend`
   - 点击 **Save**

3. **设置 Start Command**：
   - 找到 **Start Command** 字段
   - 设置为：`npm run start:prod`
   - 点击 **Save**

4. **设置 Build Command**（可选）：
   - 找到 **Build Command** 字段
   - 设置为：`npm install && npm run build`
   - 或留空（让 Railway 自动检测）
   - 点击 **Save**

5. **重新部署**：
   - 保存后 Railway 会自动重新部署
   - 或手动点击 **Deployments** → **Redeploy**

---

## 🔧 如果 Root Directory 设置不生效

### 方法 1：使用完整路径（在 Start Command 中）

将 **Start Command** 改为：
```bash
cd backend && npm run start:prod
```

将 **Build Command** 改为：
```bash
cd backend && npm install && npm run build
```

### 方法 2：直接使用 node 命令

将 **Start Command** 改为：
```bash
cd backend && node dist/main.js
```

---

## 📋 完整配置清单

在 Railway **Settings** 中：

- ✅ **Root Directory**: `backend`
- ✅ **Start Command**: `npm run start:prod` 或 `cd backend && npm run start:prod`
- ✅ **Build Command**: `npm install && npm run build` 或 `cd backend && npm install && npm run build`

---

## ⚡ 最快解决方案

如果上述方法都不行，使用最直接的命令：

**Start Command**:
```bash
cd backend && node dist/main.js
```

**Build Command**:
```bash
cd backend && npm install && npm run build
```

**Root Directory**: （留空或设置为项目根目录）

---

保存后等待重新部署，应该就能正常启动了！

