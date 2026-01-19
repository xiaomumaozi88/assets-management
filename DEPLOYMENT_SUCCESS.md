# 🎉 部署成功！下一步操作

## ✅ 当前状态

- ✅ 后端服务已成功部署到 Railway
- ✅ 服务状态：**Online**
- ✅ 部署状态：**Active**

---

## 🔍 第一步：获取后端 URL

1. 在 Railway 服务页面，点击顶部的 **"Settings"** 标签
2. 滚动到 **"Networking"** 部分
3. 在 **"Public Networking"** 下：
   - 点击 **"+ Generate Domain"** 按钮（如果还没有域名）
   - 复制生成的域名，格式类似：`https://assets-management-xxxx.up.railway.app`
   - 或使用已有的域名

4. **记录这个 URL**，稍后需要：
   - 配置前端连接
   - 测试 API

---

## 🔧 第二步：检查环境变量

确保所有环境变量都已设置：

1. 点击 **"Variables"** 标签
2. 确认以下变量都存在：

```bash
NODE_ENV=production
PORT=3000
DB_HOST=db.omtonocmwbqkadzkzmlt.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Ll3uXrXdiiMZ0KTv
DB_DATABASE=postgres
JWT_SECRET=QumEj6dTi4IcuH4JDslEzZuljs1kv8jSkfhIVg6GErM=
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://xiaomumaozi88.github.io
```

3. 如果缺少，点击 **"+ New Variable"** 添加

---

## 🗄️ 第三步：初始化数据库（重要！）

服务现在运行了，但数据库表还没有创建。需要初始化：

### 使用 Railway CLI（推荐）

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录
railway login

# 3. 连接到项目
cd backend
railway link

# 4. 运行初始化脚本
railway run npm run init:data
```

### 或者：临时启用数据库同步（快速测试）

1. 在 Railway **Variables** 中，将 `NODE_ENV` 改为 `development`
2. 保存（会自动重新部署）
3. 这会让数据库自动创建表结构
4. ⚠️ **注意**：这是临时方案，用于测试

---

## 🧪 第四步：测试 API

获取后端 URL 后，在浏览器中访问：

```
https://你的域名.up.railway.app/api
```

应该能看到 API 响应（可能是 JSON 或错误信息，但说明服务正在运行）。

---

## 📱 第五步：配置前端（GitHub Pages）

### 1. 启用 GitHub Pages

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/pages
2. Source: 选择 **"GitHub Actions"**

### 2. 添加 GitHub Secret

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/secrets/actions
2. 点击 **"New repository secret"**
3. Name: `VITE_API_URL`
4. Value: `https://你的域名.up.railway.app/api`
5. 点击 **"Add secret"**

### 3. 触发前端部署

推送一个小改动或手动触发工作流：

```bash
git commit --allow-empty -m "触发前端部署"
git push
```

---

## ✅ 完成检查清单

- [ ] 获取后端 URL
- [ ] 检查环境变量是否全部设置
- [ ] 初始化数据库（运行 init:data）
- [ ] 测试后端 API
- [ ] 配置 GitHub Pages
- [ ] 添加 VITE_API_URL secret
- [ ] 部署前端

---

## 🆘 如果遇到问题

### 服务无法访问

- 检查 **Networking** 中是否生成了公共域名
- 确认服务状态是 **Online**

### 数据库连接失败

- 检查环境变量中的数据库信息是否正确
- 确认 Supabase 数据库正在运行

### API 返回错误

- 可能需要先初始化数据库表结构
- 查看 Railway **Logs** 了解详细错误

---

恭喜！后端已成功部署！🎉

