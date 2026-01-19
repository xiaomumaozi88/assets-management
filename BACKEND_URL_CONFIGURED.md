# ✅ 后端 URL 已配置

## 📋 后端信息

- **URL**: `https://assets-management-production-2f7f.up.railway.app`
- **API 端点**: `https://assets-management-production-2f7f.up.railway.app/api`
- **端口**: 3000

---

## 🧪 第 1 步：测试后端 API

在浏览器中访问：
```
https://assets-management-production-2f7f.up.railway.app/api
```

应该能看到 API 响应。

---

## 🗄️ 第 2 步：初始化数据库（重要！）

现在需要创建数据库表结构。

### 使用 Railway CLI：

```bash
# 1. 安装 Railway CLI（如果还没安装）
npm i -g @railway/cli

# 2. 登录
railway login

# 3. 连接到项目
cd backend
railway link

# 4. 运行初始化脚本
railway run npm run init:data
```

---

## 📱 第 3 步：配置前端

### 1. 启用 GitHub Pages

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/pages
2. Source: 选择 **"GitHub Actions"**
3. 保存

### 2. 添加 GitHub Secret

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/secrets/actions
2. 点击 **"New repository secret"**
3. Name: `VITE_API_URL`
4. Value: `https://assets-management-production-2f7f.up.railway.app/api`
5. 点击 **"Add secret"**

### 3. 触发前端部署

推送代码触发部署：

```bash
git commit --allow-empty -m "触发前端部署"
git push
```

---

## 🔧 第 4 步：更新 CORS 配置

1. 在 Railway **Variables** 标签页
2. 找到或添加 `CORS_ORIGIN` 变量
3. 设置为：`https://xiaomumaozi88.github.io`
4. 保存（会自动重新部署）

---

## ✅ 完成后的检查

- [ ] 后端 API 可访问
- [ ] 数据库已初始化
- [ ] GitHub Pages 已启用
- [ ] VITE_API_URL secret 已添加
- [ ] 前端已部署
- [ ] CORS 已更新

---

完成后，访问前端 URL：
```
https://xiaomumaozi88.github.io/assets-management
```

应该能看到应用界面！

