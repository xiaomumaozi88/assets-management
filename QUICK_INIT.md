# 快速初始化数据库

## 最简单的方法：通过 Railway Web 界面

1. **访问 Railway**：
   - 打开：https://railway.app
   - 登录你的账号

2. **找到 backend 服务**：
   - 选择包含 `assets-management` 或 `backend` 的项目
   - 点击 backend 服务

3. **运行初始化命令**：
   - 点击 **Deployments** 标签
   - 点击最新的部署
   - 点击 **View Logs** 或找到终端按钮
   - 在终端中输入：
     ```bash
     npm run init:data
     ```

4. **等待完成**：
   - 应该看到 "✅ 默认管理员用户已创建"
   - 看到 "✅ 初始化数据完成！"

## 登录信息

初始化完成后，使用以下账号登录：
- **邮箱**：`admin@example.com`
- **密码**：`admin123`

## 如果 Railway Web 没有终端选项

使用以下替代方法：

### 方法 A：通过 Railway CLI（需要手动链接）

在**你的本地终端**（不是在这个工具中）运行：

```bash
cd /Users/qiujian/Documents/CodeProjects/Touka/assets-fe
railway link
# 然后按照提示选择项目和服务
cd backend
railway run npm run init:data
```

### 方法 B：手动在 Supabase 创建用户

1. 访问：https://app.supabase.com
2. 选择项目 → SQL Editor
3. 运行以下 SQL（需要先生成 bcrypt 哈希）：

```sql
-- 1. 先访问 https://bcrypt-generator.com/ 生成哈希
-- 2. 输入密码：admin123
-- 3. 复制生成的哈希（类似：$2b$10$...）
-- 4. 替换下面的 YourHashHere

INSERT INTO users (id, name, email, password, role, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '系统管理员',
  'admin@example.com',
  '$2b$10$YourHashHere', -- 替换为实际的 bcrypt 哈希
  'admin',
  'active',
  NOW(),
  NOW()
);
```

## 验证

初始化完成后，访问前端：
- https://xiaomumaozi88.github.io/assets-management/login
- 使用 `admin@example.com` / `admin123` 登录

