# Railway 部署故障排除

## 问题：选择 GitHub repo 后一直 Loading

### 解决方案 1：检查 GitHub 授权（最常见）

1. **检查 Railway 是否有 GitHub 权限**：
   - 在 Railway Dashboard，点击右上角头像
   - 进入 **Settings** → **Connected Accounts**
   - 检查 GitHub 是否已连接
   - 如果没有，点击 **Connect GitHub** 并授权

2. **重新授权**：
   - 如果已连接，尝试 **Disconnect** 然后重新连接
   - 授权时需要确保选择了正确的 GitHub 账户
   - 确保授权了 `railway` 应用访问仓库的权限

### 解决方案 2：使用 Empty Project（推荐替代方法）

如果 GitHub 连接有问题，可以手动部署：

1. **创建空项目**：
   - 点击 **New Project**
   - 选择 **Empty Project**（不要选 GitHub repo）

2. **手动添加服务**：
   - 点击 **+ New** → **GitHub Repo**
   - 选择你的仓库：`xiaomumaozi88/assets-management`
   - 等待加载

3. **如果还是加载**，使用 **Empty Project** + **GitHub CLI**：
   - 创建 Empty Project
   - 在本地使用 Railway CLI 连接

### 解决方案 3：使用 Railway CLI 部署（最可靠）

如果网页端一直有问题，使用命令行部署：

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录
railway login

# 3. 在项目根目录初始化
cd /Users/qiujian/Documents/CodeProjects/Touka/assets-fe
railway init

# 4. 创建新项目（会在浏览器中打开）
railway up

# 5. 或者直接连接到现有项目
railway link
```

### 解决方案 4：检查仓库可见性

1. **确认仓库是公开的或 Railway 有权限**：
   - 访问：https://github.com/xiaomumaozi88/assets-management/settings/access
   - 如果是 Private 仓库，确保 Railway 应用有访问权限

2. **临时改为 Public 测试**（如果隐私允许）：
   - Settings → Danger Zone → Change repository visibility
   - 改为 Public，测试部署
   - 部署成功后再改回 Private

### 解决方案 5：浏览器问题

1. **清除缓存和 Cookies**：
   - 清除 Railway 相关的 cookies
   - 重新登录

2. **尝试无痕模式**：
   - 使用 Chrome/Edge 无痕模式
   - 重新登录 Railway 和 GitHub

3. **尝试不同浏览器**：
   - 如果 Chrome 不行，试试 Firefox 或 Safari

### 解决方案 6：检查网络和防火墙

1. **检查是否能访问 GitHub API**：
   ```bash
   curl https://api.github.com
   ```

2. **检查 Railway 服务状态**：
   - 访问 https://status.railway.app
   - 确认服务正常

### 解决方案 7：使用 Git Push 方式（最稳定）

如果网页端一直有问题，使用 Git 推送方式：

```bash
# 1. 在 Railway 创建 Empty Project
# 2. 获取 Railway 的 Git URL（在项目 Settings → Git 中）
# 3. 添加 Railway 为远程仓库
git remote add railway https://railway.app/your-project.git

# 4. 推送代码
git push railway main
```

---

## 推荐方案：使用 Railway CLI

最稳定的方式是使用 Railway CLI，避免网页端的问题：

```bash
# 完整步骤
npm i -g @railway/cli
railway login
cd backend
railway init
railway up
```

然后按照提示在网页端配置环境变量。

---

## 如果所有方法都不行

可以考虑使用其他平台：
- **Render**: https://render.com
- **Fly.io**: https://fly.io
- **DigitalOcean App Platform**: https://www.digitalocean.com

这些平台也有免费的部署选项。

