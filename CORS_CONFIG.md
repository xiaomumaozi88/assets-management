# CORS 配置指南

## 问题
前端部署在 GitHub Pages (`https://xiaomumaozi88.github.io`) 时，无法访问 Railway 后端 API，出现 CORS 错误。

## 解决方案

### 1. 配置 Railway CORS 环境变量

在 Railway 项目设置中添加以下环境变量：

1. 访问 Railway 项目：https://railway.app/project
2. 选择你的服务（backend）
3. 点击 **Variables** 标签
4. 添加以下环境变量：

```
CORS_ORIGIN=https://xiaomumaozi88.github.io
```

**重要**：确保没有尾随斜杠！

如果需要同时支持多个域名（如本地开发），可以使用逗号分隔：
```
CORS_ORIGIN=https://xiaomumaozi88.github.io,http://localhost:5173,http://localhost:3001
```

### 2. 配置 GitHub Secrets（前端 API URL）

在 GitHub 仓库设置中添加 `VITE_API_URL`：

1. 访问：https://github.com/xiaomumaozi88/assets-management/settings/secrets/actions
2. 点击 **New repository secret**
3. 添加：
   - **Name**: `VITE_API_URL`
   - **Value**: `https://assets-management-production-2f7f.up.railway.app/api`

### 3. 重启 Railway 服务

配置完成后，Railway 会自动重新部署。如果不会自动重启，可以：
1. 在 Railway 服务页面点击 **Settings**
2. 点击 **Restart** 按钮

### 4. 重新部署前端

配置 GitHub Secrets 后，需要手动触发前端重新部署：

1. 访问：https://github.com/xiaomumaozi88/assets-management/actions
2. 选择 **部署前端** 工作流
3. 点击 **Run workflow** 按钮
4. 选择分支 `main`
5. 点击 **Run workflow**

或者推送一个空提交来触发：
```bash
git commit --allow-empty -m "触发前端重新部署以应用 API URL"
git push origin main
```

## 验证

配置完成后：

1. **检查 CORS**：
   - 在浏览器开发者工具中，Network 标签查看登录请求
   - 应该看到 `Access-Control-Allow-Origin: https://xiaomumaozi88.github.io` 响应头

2. **检查 API URL**：
   - 在浏览器控制台输入：`console.log(import.meta.env.VITE_API_URL)`
   - 应该显示：`https://assets-management-production-2f7f.up.railway.app/api`

## 故障排除

如果仍然遇到 CORS 错误：

1. **检查 Railway 环境变量**：
   - 确认 `CORS_ORIGIN` 变量已正确设置
   - 确认没有多余的空格或斜杠

2. **检查前端构建**：
   - 确认 GitHub Actions 构建日志中显示正确的 `VITE_API_URL`
   - 确认前端 HTML 中的 API 请求指向正确的后端 URL

3. **检查浏览器控制台**：
   - 查看具体的 CORS 错误信息
   - 确认 origin 和请求 URL 是否正确

4. **清除浏览器缓存**：
   - 强制刷新（Ctrl+Shift+R 或 Cmd+Shift+R）

