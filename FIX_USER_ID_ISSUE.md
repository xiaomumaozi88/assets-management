# 修复用户 ID 冲突问题

## 问题

Supabase 中已经存在 `admin@example.com` 用户，但它的 ID 可能与本地的不同。当 SQL 使用 `ON CONFLICT DO NOTHING` 时，不会插入已存在的用户，导致资产数据中的 `owner_id` 引用不存在的用户 ID。

## 解决方案

### 方法 1：查询并更新用户 ID（推荐）

1. **查询 Supabase 中 admin@example.com 的实际 ID**：
   
   在 Supabase SQL Editor 中运行：
   ```sql
   SELECT id, name, email FROM users WHERE email = 'admin@example.com';
   ```
   
   复制返回的 `id` 值。

2. **更新资产数据中的 owner_id**：
   
   在 Supabase SQL Editor 中运行（将 `实际的用户ID` 替换为步骤 1 查询到的 ID）：
   ```sql
   -- 先执行 export-data.sql（插入业务线、资产类型、资产模板、资产等）
   -- 然后运行以下 SQL 更新 owner_id
   
   -- 假设 admin@example.com 的实际 ID 是 '64376014-2f91-46c2-85e9-80809ed122eb'
   UPDATE assets 
   SET owner_id = '实际的用户ID' 
   WHERE owner_id = 'b11f399e-fd69-43db-8339-83f4f9c0dd9e';
   
   -- 同样更新其他本地用户 ID（如果有）
   -- 查询其他用户的实际 ID：
   SELECT id, email FROM users WHERE email IN ('zhangjie@example.com', 'huozhenwei@example.com', 'neil@example.com');
   
   -- 然后更新资产（替换为实际 ID）：
   -- UPDATE assets SET owner_id = '张杰的实际ID' WHERE owner_id = '38f7b695-81c8-4df1-9bf2-af8849ca1144';
   -- UPDATE assets SET owner_id = '霍振威的实际ID' WHERE owner_id = '71ca49e6-7ba8-42d9-be5b-eb2f87136b34';
   -- UPDATE assets SET owner_id = 'Neil的实际ID' WHERE owner_id = 'e363114f-be03-4352-ac86-4eba517c4baf';
   ```

### 方法 2：删除 Supabase 中的旧用户，然后重新插入

1. **删除 Supabase 中的 admin@example.com 用户**：
   ```sql
   DELETE FROM users WHERE email = 'admin@example.com';
   ```

2. **重新执行 export-data.sql**：
   - 这样会插入本地用户数据，ID 会匹配

⚠️ **注意**：如果删除了用户，之前创建的用户数据会丢失。

### 方法 3：在插入资产前更新 owner_id

在执行 `export-data.sql` 之前，先运行以下 SQL：

```sql
-- 查询 Supabase 中所有用户的 ID 映射
SELECT id, email FROM users;

-- 假设 admin@example.com 的实际 ID 是 'xxx'
-- 在 export-data.sql 中的资产插入部分，替换所有 owner_id
```

## 推荐的完整步骤

1. **执行 export-data.sql**：
   - 这会插入业务线、资产类型、资产模板
   - 用户部分会跳过已存在的用户（使用 ON CONFLICT）
   - 资产插入可能会因为 owner_id 错误而失败

2. **查询实际用户 ID**：
   ```sql
   SELECT id, email FROM users;
   ```

3. **更新资产 owner_id**：
   ```sql
   -- 创建一个映射表
   WITH user_mapping AS (
     SELECT 
       'b11f399e-fd69-43db-8339-83f4f9c0dd9e' as old_id,
       (SELECT id FROM users WHERE email = 'admin@example.com') as new_id
   )
   UPDATE assets 
   SET owner_id = (SELECT new_id FROM user_mapping)
   WHERE owner_id = (SELECT old_id FROM user_mapping);
   ```

4. **然后重新插入资产数据**：
   - 从 export-data.sql 中提取资产 INSERT 语句
   - 执行资产插入

## 快速修复脚本

创建一个新的 SQL 文件来修复这个问题：

```sql
-- 1. 查询并创建用户 ID 映射
DO $$
DECLARE
    admin_id UUID;
    zhangjie_id UUID;
    huozhenwei_id UUID;
    neil_id UUID;
BEGIN
    -- 查询实际用户 ID
    SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';
    SELECT id INTO zhangjie_id FROM users WHERE email = 'zhangjie@example.com';
    SELECT id INTO huozhenwei_id FROM users WHERE email = 'huozhenwei@example.com';
    SELECT id INTO neil_id FROM users WHERE email = 'neil@example.com';
    
    -- 更新资产 owner_id
    IF admin_id IS NOT NULL THEN
        UPDATE assets SET owner_id = admin_id WHERE owner_id = 'b11f399e-fd69-43db-8339-83f4f9c0dd9e';
    END IF;
    
    IF zhangjie_id IS NOT NULL THEN
        UPDATE assets SET owner_id = zhangjie_id WHERE owner_id = '38f7b695-81c8-4df1-9bf2-af8849ca1144';
    END IF;
    
    IF huozhenwei_id IS NOT NULL THEN
        UPDATE assets SET owner_id = huozhenwei_id WHERE owner_id = '71ca49e6-7ba8-42d9-be5b-eb2f87136b34';
    END IF;
    
    IF neil_id IS NOT NULL THEN
        UPDATE assets SET owner_id = neil_id WHERE owner_id = 'e363114f-be03-4352-ac86-4eba517c4baf';
    END IF;
END $$;
```

