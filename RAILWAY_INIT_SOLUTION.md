# Railway 初始化数据库解决方案

## 问题

`railway run npm run init:data` 在本地运行时，无法连接到 Supabase 数据库，出现 "Connection terminated unexpectedly" 错误。

## 原因

`railway run` 命令在**本地环境**运行，虽然会注入 Railway 的环境变量，但：
1. 本地网络可能无法直接连接到 Supabase（防火墙/网络限制）
2. 数据库连接池配置可能不适合本地连接

## 解决方案

### ✅ 方法 1：通过 Railway Web 界面运行（推荐）

这是最可靠的方法，在 Railway 的远程环境中运行：

1. **访问 Railway**：
   - 打开：https://railway.app
   - 登录你的账号

2. **找到 backend 服务**：
   - 选择项目 `pacific-solace`
   - 点击服务 `assets-management`

3. **打开终端**：
   - 点击 **Deployments** 标签
   - 点击最新的部署
   - 点击 **View Logs** 或找到终端/Shell 按钮
   - 在终端中输入：
     ```bash
     npm run init:data
     ```

4. **等待完成**：
   - 应该看到 "✅ 默认管理员用户已创建"
   - 看到 "✅ 初始化数据完成！"

### ✅ 方法 2：使用 Railway Shell（如果可用）

如果 Railway Web 界面有 Shell 功能：

1. 在服务页面找到 **Shell** 或 **Terminal** 按钮
2. 点击打开终端
3. 运行：`npm run init:data`

### ⚠️ 方法 3：手动在 Supabase 创建用户（备选）

如果上述方法都不可用，可以直接在 Supabase 中手动创建管理员用户：

1. **访问 Supabase**：
   - 打开：https://app.supabase.com
   - 选择你的项目

2. **打开 SQL Editor**：
   - 点击左侧菜单的 **SQL Editor**
   - 点击 **New Query**

3. **生成 bcrypt 哈希**：
   - 访问：https://bcrypt-generator.com/
   - 输入密码：`admin123`
   - 点击 "Generate Hash"
   - 复制生成的哈希（类似：`$2b$10$...`）

4. **运行 SQL**：
   ```sql
   INSERT INTO users (id, name, email, password, role, status, created_at, updated_at)
   VALUES (
     gen_random_uuid(),
     '系统管理员',
     'admin@example.com',
     '$2b$10$YourActualBcryptHashHere', -- 替换为步骤 3 生成的哈希
     'admin',
     'active',
     NOW(),
     NOW()
   );
   ```

## 验证

初始化完成后：

1. **测试登录**：
   - 访问：https://xiaomumaozi88.github.io/assets-management/login
   - 使用账号：`admin@example.com` / `admin123`

2. **如果登录成功**：
   - ✅ 说明初始化完成
   - ✅ 可以开始使用系统了

## 为什么 railway run 在本地失败？

`railway run` 命令虽然会注入 Railway 的环境变量，但：
- 它在**本地环境**运行
- 本地网络可能无法直接连接到 Supabase（防火墙/安全策略）
- 数据库连接池配置可能不适合本地连接

**最佳实践**：在 Railway 的远程环境中运行初始化脚本，这样可以：
- 使用 Railway 的网络环境
- 避免本地网络限制
- 确保配置一致性

