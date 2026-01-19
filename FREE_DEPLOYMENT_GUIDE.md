# 💰 完全免费部署方案指南

本文档详细说明各平台的免费额度，帮你选择最适合的免费部署方案。

## 🆓 完全免费方案对比

### ✅ 方案一：GitHub Pages + Railway（推荐）⭐⭐⭐⭐⭐

**免费额度**：
- **GitHub Pages**: 完全免费，无限制
  - 带宽：100GB/月（对小型项目足够）
  - 存储：1GB（静态文件足够）
  - 自定义域名：支持
  
- **Railway**:
  - $5 免费额度/月（新用户）
  - 足够运行一个小型 NestJS 应用
  - 包含 PostgreSQL 数据库
  
**成本**: **$0/月**（使用免费额度）

---

### ✅ 方案二：GitHub Pages + Render（适合中小型项目）⭐⭐⭐⭐

**免费额度**：
- **GitHub Pages**: 完全免费（同上）

- **Render**:
  - Web Service：免费（但有休眠限制）
  - PostgreSQL：免费 90 天，之后 $7/月
  - 适合短期测试或学习

**成本**: 
- 前 90 天：**$0/月**
- 90 天后：**$7/月**（如果继续使用 PostgreSQL）

---

### ✅ 方案三：Vercel 全栈（最简单）⭐⭐⭐

**免费额度**：
- **Vercel**:
  - 前端：完全免费，无限制
  - 后端：100GB 带宽/月，100 小时构建时间/月
  - 但 NestJS 在 Vercel 上需要额外配置

- **数据库**（需要单独配置）：
  - Supabase：500MB 数据库，完全免费
  - Neon：3GB 数据库，完全免费

**成本**: **$0/月**（如果使用免费数据库）

---

### ✅ 方案四：Vercel（前端）+ Supabase/Neon（后端+数据库）⭐⭐⭐⭐⭐

**免费额度**：
- **Vercel 前端**: 完全免费
  - 带宽：100GB/月
  - 构建：100 小时/月
  
- **Supabase**（后端 + 数据库）:
  - API 请求：500,000/月
  - 数据库：500MB
  - 存储：1GB
  - 完全免费
  
- **Neon**（仅数据库）:
  - 数据库：3GB
  - 计算：1000 小时/月
  - 完全免费

**成本**: **$0/月**

**注意**：需要将 NestJS 后端改造为 Supabase Functions，或使用其他架构。

---

## 🏆 最佳免费方案推荐

### 🥇 推荐方案：GitHub Pages + Railway + Supabase（最省钱）

```
前端：GitHub Pages（免费）
后端：Railway（$5 免费额度/月）
数据库：Supabase PostgreSQL（免费，500MB）
```

**总成本**: **$0/月**

**配置步骤**：
1. 前端部署到 GitHub Pages（完全免费）
2. 后端部署到 Railway（使用 $5 免费额度）
3. 数据库使用 Supabase（500MB 免费）

---

### 🥈 备选方案：GitHub Pages + Render（适合学习/短期项目）

```
前端：GitHub Pages（免费）
后端：Render Web Service（免费，但会休眠）
数据库：Render PostgreSQL（免费 90 天）
```

**成本**: 
- 前 90 天：**$0/月**
- 90 天后：需要升级或迁移

**注意**：Render 免费服务在 15 分钟无活动后会休眠，首次访问需要等待唤醒（约 30 秒）。

---

### 🥉 简单方案：Vercel 全栈 + Neon

```
前端：Vercel（免费）
后端：Vercel（免费，但需要适配 NestJS）
数据库：Neon PostgreSQL（免费 3GB）
```

**成本**: **$0/月**

**缺点**：NestJS 在 Vercel 上部署需要额外配置，可能不够稳定。

---

## 📊 各平台免费额度详细对比

### GitHub Pages
| 项目 | 免费额度 |
|------|----------|
| 带宽 | 100GB/月 |
| 存储 | 1GB |
| 构建时间 | 10 分钟/构建 |
| 自定义域名 | ✅ 支持 |
| SSL 证书 | ✅ 自动 |
| **总成本** | **$0/月** |

### Vercel
| 项目 | 免费额度 |
|------|----------|
| 带宽 | 100GB/月 |
| 构建时间 | 100 小时/月 |
| 函数执行 | 100GB-小时/月 |
| 团队协作 | ✅ 支持 |
| 自定义域名 | ✅ 支持 |
| **总成本** | **$0/月** |

### Railway
| 项目 | 免费额度 |
|------|----------|
| 使用额度 | $5/月 |
| 包含 | 计算 + 数据库 + 网络 |
| 休眠 | ❌ 不会休眠 |
| 数据库 | 包含 PostgreSQL |
| **总成本** | **$0/月**（使用免费额度） |

**⚠️ 注意**：Railway 每月 $5 免费额度通常足够运行一个小型 NestJS 应用（约 500 小时/月）。

### Render
| 项目 | 免费额度 |
|------|----------|
| Web Service | 免费（会休眠） |
| PostgreSQL | 免费 90 天 |
| 休眠时间 | 15 分钟无活动后休眠 |
| 唤醒时间 | 约 30 秒 |
| **成本** | **$0/月**（90 天内） |

### Supabase
| 项目 | 免费额度 |
|------|----------|
| API 请求 | 500,000/月 |
| 数据库 | 500MB |
| 文件存储 | 1GB |
| 带宽 | 5GB/月 |
| **总成本** | **$0/月** |

### Neon
| 项目 | 免费额度 |
|------|----------|
| 数据库大小 | 3GB |
| 计算时间 | 1000 小时/月 |
| 分支数 | 10 个 |
| **总成本** | **$0/月** |

---

## 🎯 根据项目规模选择

### 小型项目（< 1000 用户/天）
**推荐**：GitHub Pages + Railway
- 成本：$0/月
- Railway $5 免费额度足够使用

### 中型项目（1000-10000 用户/天）
**推荐**：Vercel + Railway + Supabase
- 成本：$0/月
- 各平台免费额度组合使用

### 大型项目（> 10000 用户/天）
**建议**：考虑付费方案
- Railway: $20/月起
- Vercel: $20/月起
- 或使用 VPS（如 DigitalOcean $6/月）

---

## ⚠️ 免费方案限制说明

### Railway 限制
- 每月 $5 免费额度，超出需付费
- 适合小型项目，中型项目可能需要升级

### Render 限制
- 免费服务会休眠（15 分钟无活动）
- 首次访问需要等待 30 秒唤醒
- PostgreSQL 只免费 90 天

### Vercel 限制
- 100GB 带宽/月，超出需要付费
- 适合中小型项目

### Supabase 限制
- 500MB 数据库，超出需要付费
- 500,000 API 请求/月

---

## 🚀 推荐配置步骤（完全免费）

### 第一步：前端部署到 GitHub Pages（5分钟）

1. 推送到 GitHub
2. 进入仓库 Settings → Pages
3. Source 选择 "GitHub Actions"
4. 配置环境变量：
   ```
   VITE_API_URL = https://your-backend.railway.app/api
   ```

### 第二步：创建 Supabase 数据库（3分钟）

1. 访问 https://supabase.com
2. 创建新项目
3. 等待数据库创建完成
4. 在 Settings → Database 复制连接信息

### 第三步：后端部署到 Railway（5分钟）

1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 创建新项目 → "New" → "GitHub Repo"
4. 选择你的仓库，Root Directory 设置为 `backend`
5. 添加环境变量：
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=db.xxxxx.supabase.co
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your-password
   DB_DATABASE=postgres
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-username.github.io
   ```
6. Start Command: `npm run start:prod`

### 第四步：更新前端 CORS（1分钟）

在 Railway 环境变量中更新：
```
CORS_ORIGIN=https://your-username.github.io
```

**完成！总成本：$0/月** 🎉

---

## 📝 监控免费额度使用

### Railway
- 在 Dashboard 查看使用情况
- 接近 $5 时会收到通知

### Vercel
- Dashboard → Usage 查看使用情况
- 接近限制时会收到警告

### Supabase
- Settings → Usage 查看数据库大小
- Settings → Billing 查看 API 使用情况

---

## 💡 节省成本的小贴士

1. **使用 Supabase 代替自建数据库**（500MB 免费）
2. **前端使用 GitHub Pages**（完全免费）
3. **后端使用 Railway**（$5 免费额度通常足够）
4. **启用 CDN 缓存**（减少带宽使用）
5. **优化构建**（减少构建时间）
6. **数据库索引优化**（减少数据库负载）

---

## 🔄 如果免费额度不够用？

### 升级选项（按成本排序）

1. **Railway** - $5/月起（最便宜）
2. **Render** - $7/月起
3. **Vercel Pro** - $20/月起
4. **DigitalOcean** - $6/月（VPS，需要自己管理）

---

## ✅ 总结

**完全免费的推荐方案**：
1. **前端**：GitHub Pages（$0）
2. **后端**：Railway（$5 免费额度/月）
3. **数据库**：Supabase（$0，500MB 免费）

**总成本：$0/月** ✅

对于小型到中型项目，这个组合完全免费且稳定可靠！

