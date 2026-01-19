# 📱 前端部署步骤（GitHub Pages）

## ✅ 前提条件

- ✅ 后端已成功部署：`https://assets-management-production-2f7f.up.railway.app`
- ✅ 数据库连接正常

---

## 📋 部署步骤

### 步骤 1：启用 GitHub Pages

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/pages
2. 在 **"Source"** 部分：
   - 选择 **"GitHub Actions"**（不要选择分支）
3. 点击 **"Save"**

---

### 步骤 2：添加 GitHub Secret

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/secrets/actions
2. 点击 **"New repository secret"**
3. 填写：
   - **Name**: `VITE_API_URL`
   - **Value**: `https://assets-management-production-2f7f.up.railway.app/api`
4. 点击 **"Add secret"**

---

### 步骤 3：触发前端部署

我已经帮你准备好了，只需要推送代码：

```bash
cd /Users/qiujian/Documents/CodeProjects/Touka/assets-fe
git commit --allow-empty -m "触发前端部署"
git push
```

或者我可以帮你执行。

---

### 步骤 4：等待部署完成

1. 访问：https://github.com/xiaomumaozi88/assets-management/actions
2. 查看 **"部署前端"** 工作流的运行状态
3. 等待部署完成（约 2-3 分钟）

---

### 步骤 5：获取前端 URL

部署完成后：

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/pages
2. 在页面顶部会显示部署的 URL
3. URL 格式：`https://xiaomumaozi88.github.io/assets-management`
4. 复制这个 URL

---

### 步骤 6：更新 CORS 配置

1. 回到 Railway：https://railway.app
2. 进入 **assets-management** 服务
3. 点击 **"Variables"** 标签
4. 找到或添加 `CORS_ORIGIN` 变量
5. 设置为：`https://xiaomumaozi88.github.io`（或完整 URL，包括路径）
6. 保存（会自动重新部署）

---

## ✅ 完成检查清单

- [ ] GitHub Pages 已启用（Source: GitHub Actions）
- [ ] VITE_API_URL secret 已添加
- [ ] 前端部署已触发
- [ ] 前端部署成功
- [ ] 获取了前端 URL
- [ ] CORS_ORIGIN 已更新

---

## 🎉 完成后

访问你的前端 URL：
```
https://xiaomumaozi88.github.io/assets-management
```

应该能看到应用界面了！

默认登录账号（如果已运行 init:data）：
- 邮箱: `admin@example.com`
- 密码: `admin123`

