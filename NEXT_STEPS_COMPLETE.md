# 🎉 下一步操作指南

## ✅ 当前状态

- ✅ 服务已在线（Online）
- ✅ 环境变量已配置（如果已经配置了的话）
- ✅ 代码已部署

---

## 📋 接下来的步骤

### 1. 确认环境变量（如果还没配置）

如果还没配置 JWT_SECRET，需要：

1. 在 Railway **Variables** 标签页
2. 确认是否有 `JWT_SECRET` 变量
3. 如果没有，添加：
   - Key: `JWT_SECRET`
   - Value: `QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=` （我已经生成过了）
4. 或使用新生成的密钥（见下方）

### 2. 获取后端 URL

1. 在 Railway 服务页面，点击 **"Settings"** 标签
2. 滚动到 **"Networking"** 部分
3. 在 **"Public Networking"** 下：
   - 如果没有域名，点击 **"+ Generate Domain"**
   - 复制生成的域名（格式：`https://assets-management-xxxx.up.railway.app`）
   - 记录下来，后面会用到

### 3. 检查服务是否正常运行

1. 点击 **"Logs"** 标签
2. 查看日志：
   - ✅ 如果看到 `Application is running on: http://localhost:3000` → 成功！
   - ✅ 如果不再有数据库连接错误 → 成功！
   - ❌ 如果还有错误，告诉我错误信息

### 4. 测试 API

在浏览器中访问：
```
https://你的域名.up.railway.app/api
```

应该能看到 API 响应。

---

## 🗄️ 初始化数据库（重要！）

服务运行后，需要创建数据库表结构。

### 方法 1：使用 Railway CLI（推荐）

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录（会打开浏览器）
railway login

# 3. 连接到项目
cd backend
railway link

# 4. 运行初始化脚本
railway run npm run init:data
```

### 方法 2：临时启用数据库同步

1. 在 Railway **Variables** 中
2. 将 `NODE_ENV` 改为 `development`
3. 保存（会自动重新部署）
4. ⚠️ 这会自动创建表，但生产环境不推荐使用

---

## 📱 配置前端（GitHub Pages）

### 1. 启用 GitHub Pages

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/pages
2. Source: 选择 **"GitHub Actions"**
3. 保存

### 2. 添加 GitHub Secret

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/secrets/actions
2. 点击 **"New repository secret"**
3. Name: `VITE_API_URL`
4. Value: `https://你的域名.up.railway.app/api` （使用第 2 步获取的 URL）
5. 点击 **"Add secret"**

### 3. 触发前端部署

推送代码触发部署：

```bash
git commit --allow-empty -m "触发前端部署"
git push
```

或等待 GitHub Actions 自动运行。

---

## ✅ 完成检查清单

- [ ] 确认所有环境变量已配置
- [ ] 获取后端 URL
- [ ] 测试后端 API 是否可访问
- [ ] 初始化数据库（运行 init:data）
- [ ] 启用 GitHub Pages
- [ ] 添加 VITE_API_URL secret
- [ ] 部署前端
- [ ] 更新 Railway CORS_ORIGIN（使用前端 URL）

---

## 🔑 JWT_SECRET

如果还没配置，使用以下密钥：

```
QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=
```

或生成新的：

```bash
openssl rand -base64 32
```

---

## 🆘 如果遇到问题

### 数据库连接错误

- 检查环境变量是否正确
- 确认 Supabase 数据库正在运行
- 查看日志了解详细错误

### API 无法访问

- 检查是否生成了公共域名
- 确认服务状态是 Online
- 查看 Logs 了解错误信息

---

按顺序完成这些步骤，告诉我进度！🚀

