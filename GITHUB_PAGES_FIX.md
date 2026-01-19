# GitHub Pages 路径修复说明

## 问题
前端部署后，资源路径不正确：
- 错误路径：`https://xiaomumaozi88.github.io/assets/index-xxx.js`
- 正确路径应该是：`https://xiaomumaozi88.github.io/assets-management/assets/index-xxx.js`

## 已修复
1. ✅ 更新 `frontend/vite.config.ts`，设置 `base: '/assets-management/'`
2. ✅ 更新 `.github/workflows/deploy-frontend.yml`，设置 `VITE_BASE_PATH: '/assets-management/'`

## 验证步骤

### 1. 等待新的部署完成
- 访问 GitHub Actions：https://github.com/xiaomumaozi88/assets-management/actions
- 查看最新的 "部署前端" 工作流是否成功

### 2. 检查部署的 HTML 文件
部署完成后，访问：
```
https://xiaomumaozi88.github.io/assets-management/
```

查看页面源代码（右键 → 查看页面源代码），确认资源路径应该包含 `/assets-management/`：
```html
<script type="module" crossorigin src="/assets-management/assets/index-xxx.js"></script>
<link rel="stylesheet" crossorigin href="/assets-management/assets/index-xxx.css">
```

### 3. 清除浏览器缓存
如果还是看到旧路径，请：
- 按 `Ctrl+Shift+R` (Windows/Linux) 或 `Cmd+Shift+R` (Mac) 强制刷新
- 或者清除浏览器缓存
- 或者在隐私/无痕模式下访问

### 4. 检查 GitHub Pages 设置
确保 GitHub Pages 设置正确：
- 访问：https://github.com/xiaomumaozi88/assets-management/settings/pages
- Source 应该设置为：`GitHub Actions`
- Branch 应该设置为：`main` 或 `master`

## 如果问题仍然存在

如果修复后仍有问题，可能的原因：
1. GitHub Actions 还没有运行新的构建
2. GitHub Pages 缓存（可能需要等待几分钟）
3. 浏览器缓存（强制刷新或清除缓存）

等待 3-5 分钟后重试。

