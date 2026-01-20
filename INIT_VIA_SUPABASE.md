# 通过 Supabase SQL Editor 初始化数据库

由于 Railway 的 View Logs 没有终端，我们可以直接在 Supabase 中手动创建管理员用户。

## 步骤 1：生成 bcrypt 哈希

1. **访问 bcrypt 生成器**：
   - 打开：https://bcrypt-generator.com/

2. **生成哈希**：
   - 在 "Password" 输入框输入：`admin123`
   - 点击 "Generate Hash"
   - 复制生成的哈希值（类似：`$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

## 步骤 2：在 Supabase 中创建用户

1. **访问 Supabase**：
   - 打开：https://app.supabase.com
   - 登录你的账号
   - 选择项目（omtonocmwbqkadzkzmlt）

2. **打开 SQL Editor**：
   - 点击左侧菜单的 **SQL Editor**
   - 点击 **New Query** 按钮

3. **运行以下 SQL**：
   
   将下面 SQL 中的 `$2b$10$YourHashHere` 替换为步骤 1 生成的哈希值：

   ```sql
   -- 创建管理员用户
   INSERT INTO users (id, name, email, password, role, status, created_at, updated_at)
   VALUES (
     gen_random_uuid(),
     '系统管理员',
     'admin@example.com',
     '$2b$10$YourHashHere',  -- ⚠️ 替换为步骤 1 生成的 bcrypt 哈希
     'admin',
     'active',
     NOW(),
     NOW()
   );
   ```

4. **执行 SQL**：
   - 点击 **Run** 按钮
   - 应该看到 "Success. No rows returned"

## 步骤 3：验证用户创建

运行以下 SQL 验证用户是否创建成功：

```sql
-- 查看创建的用户（密码会被隐藏）
SELECT id, name, email, role, status, created_at 
FROM users 
WHERE email = 'admin@example.com';
```

应该能看到一行记录，显示：
- name: 系统管理员
- email: admin@example.com
- role: admin
- status: active

## 步骤 4：测试登录

1. 访问前端：https://xiaomumaozi88.github.io/assets-management/login
2. 使用以下账号登录：
   - **邮箱**：`admin@example.com`
   - **密码**：`admin123`

如果登录成功，说明初始化完成！

## 可选：创建默认业务线和资产类型

如果你需要，也可以运行以下 SQL 创建默认业务线和资产类型：

```sql
-- 创建默认业务线
INSERT INTO business_lines (id, name, code, suffix, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  name,
  code,
  suffix,
  true,
  NOW(),
  NOW()
FROM (VALUES
  ('超休闲', 'HCG', 'HCG'),
  ('ROBUX网赚游戏', 'RWZ', 'RWZ'),
  ('CPT工具', 'CPT', 'CPT'),
  ('007游戏TW', 'G007', 'G007'),
  ('007工具TW', 'T007', 'T007'),
  ('真金网赚', 'CWZ', 'CWZ'),
  ('混合变现游戏', 'HMG', 'HMG'),
  ('中重度游戏', 'MCG', 'MCG'),
  ('Launcher游戏', 'GLC', 'GLC'),
  ('Launcher工具', 'TLC', 'TLC'),
  ('Remax', 'Remax', 'Remax')
) AS v(name, code, suffix)
WHERE NOT EXISTS (
  SELECT 1 FROM business_lines WHERE business_lines.code = v.code
);

-- 创建默认资产类型
INSERT INTO asset_types (id, name, code, category, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  name,
  code,
  category,
  true,
  NOW(),
  NOW()
FROM (VALUES
  ('域名', 'domain', '网络资源'),
  ('手机号', 'phone', '通信资源'),
  ('云存储', 'cloud_storage', '存储资源'),
  ('平台账号', 'platform_account', '账号资源'),
  ('银行账户', 'bank_account', '金融资源'),
  ('支付信用卡', 'payment_card', '金融资源'),
  ('服务器', 'server', '技术资源'),
  ('APP', 'app', '应用资源'),
  ('游戏', 'game', '应用资源'),
  ('工具', 'tool', '应用资源'),
  ('公司主体', 'company', '组织资源')
) AS v(name, code, category)
WHERE NOT EXISTS (
  SELECT 1 FROM asset_types WHERE asset_types.code = v.code
);
```

## 故障排除

### 问题：bcrypt 哈希生成失败

**解决**：
- 使用其他在线工具：https://www.bcrypt.fr/
- 或使用 Node.js 生成：
  ```bash
  node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
  ```

### 问题：SQL 执行报错 "column does not exist"

**原因**：数据库表结构可能还没有创建

**解决**：
1. 检查 Railway 服务日志，确认数据库表是否已创建
2. 如果表不存在，可能需要先运行数据库迁移或启用 `synchronize: true`
3. 或者等待 Railway 服务启动并自动创建表结构

### 问题：用户创建成功但无法登录

**检查**：
1. 确认 bcrypt 哈希是否正确
2. 检查数据库中的用户记录：
   ```sql
   SELECT * FROM users WHERE email = 'admin@example.com';
   ```
3. 确认用户状态是 `active`

