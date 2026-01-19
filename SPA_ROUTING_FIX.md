# SPA 路由修复说明

## 问题

当直接访问子路由时（如 `https://xiaomumaozi88.github.io/assets-management/login`），GitHub Pages 返回 404 错误。

**原因**：
- GitHub Pages 是静态文件服务器
- 当访问 `/login` 时，服务器尝试查找 `/login` 文件或目录
- 但 SPA 的路由是客户端路由，不存在物理文件
- 所以服务器返回 404

## 解决方案

在构建后创建 `404.html` 文件，它是 `index.html` 的副本。

**原理**：
- GitHub Pages 在遇到 404 时会查找 `404.html` 文件
- 如果存在，会使用 `404.html` 作为响应
- 这样所有路由请求都会返回 `index.html`，由 React Router 处理

## 已实现的修复

在 `.github/workflows/deploy-frontend.yml` 中添加了以下步骤：

```yaml
- name: 修复 SPA 路由（创建 404.html）
  working-directory: ./frontend
  run: cp dist/index.html dist/404.html
```

## 验证

部署完成后，以下链接应该都能正常工作：

1. ✅ `https://xiaomumaozi88.github.io/assets-management/` - 主页
2. ✅ `https://xiaomumaozi88.github.io/assets-management/login` - 直接访问登录页
3. ✅ `https://xiaomumaozi88.github.io/assets-management/dashboard` - 直接访问仪表盘
4. ✅ 其他所有路由都应该可以正常访问

## 其他 SPA 部署方案

如果 `404.html` 方案不起作用，还可以考虑：

1. **使用 `_redirects` 文件**（如果 GitHub Pages 支持）
2. **使用自定义域名**并配置服务器重定向规则
3. **使用 Vercel/Netlify 等支持 SPA 的托管平台**

对于 GitHub Pages，`404.html` 方案是最简单可靠的解决方案。

