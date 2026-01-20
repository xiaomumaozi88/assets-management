# 在 Railway 中初始化数据库

由于 Railway CLI 的 `link` 命令需要交互式选择，我提供了两种方法来初始化数据库。

## 方法 1：通过 Railway Web 界面（推荐）

1. **访问 Railway 项目**：
   - 打开：https://railway.app
   - 选择你的 `backend` 服务

2. **打开 Terminal**：
   - 在服务页面，点击 **Deployments** 标签
   - 选择最新的部署
   - 点击右上角的 **View Logs**
   - 在日志页面，你应该能看到一个终端图标或 "Open Terminal" 按钮

3. **运行初始化脚本**：
   ```bash
   cd /app
   npm run init:data
   ```

   或者如果工作目录不是 `/app`：
   ```bash
   npm run init:data
   ```

## 方法 2：通过 Railway CLI（需要先链接）

如果你想使用 CLI，需要先手动链接项目：

1. **在终端中运行**（需要交互）：
   ```bash
   cd /Users/qiujian/Documents/CodeProjects/Touka/assets-fe
   railway link
   ```
   然后按照提示选择：
   - Workspace: `xiaomumaozi88's Projects`
   - Project: 选择你的项目（应该能看到 assets-management 相关的项目）
   - Service: 选择 `backend` 服务

2. **链接成功后运行初始化**：
   ```bash
   cd backend
   railway run npm run init:data
   ```

## 方法 3：手动创建用户（如果脚本不可用）

如果上述方法都不行，可以直接在 Supabase 中手动创建管理员用户：

1. **访问 Supabase Dashboard**：
   - https://app.supabase.com
   - 选择你的项目

2. **打开 SQL Editor**：
   - 点击左侧菜单的 **SQL Editor**
   - 点击 **New Query**

3. **运行以下 SQL**：
   ```sql
   -- 首先需要生成 bcrypt 哈希
   -- 可以使用这个在线工具：https://bcrypt-generator.com/
   -- 输入密码：admin123，生成哈希（应该类似：$2b$10$...）
   
   -- 假设生成的哈希为 $2b$10$YourHashHere
   INSERT INTO users (id, name, email, password, role, status, created_at, updated_at)
   VALUES (
     gen_random_uuid(),
     '系统管理员',
     'admin@example.com',
     '$2b$10$YourActualBcryptHashHere', -- 替换为实际的 bcrypt 哈希
     'admin',
     'active',
     NOW(),
     NOW()
   );
   ```

4. **生成 bcrypt 哈希**：
   - 访问：https://bcrypt-generator.com/
   - 输入密码：`admin123`
   - 点击 "Generate Hash"
   - 复制生成的哈希（以 `$2b$10$` 开头）
   - 将上面的 SQL 中的 `YourActualBcryptHashHere` 替换为生成的哈希

## 验证

初始化完成后，尝试登录：
- 邮箱：`admin@example.com`
- 密码：`admin123`

如果登录成功，说明初始化完成！

## 如果遇到问题

如果遇到数据库连接错误，检查：
1. Railway 环境变量是否正确配置（DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE）
2. 使用的是 Session Pooler 连接字符串（IPv4 兼容）
3. Supabase 数据库是否正常运行

