-- 第一步：查询 Supabase 中 admin@example.com 的实际用户 ID
-- 请在 Supabase SQL Editor 中运行以下查询，然后告诉我结果

SELECT id, name, email FROM users WHERE email = 'admin@example.com';

-- 如果 admin@example.com 的 ID 不是 'b11f399e-fd69-43db-8339-83f4f9c0dd9e'
-- 需要更新资产数据中的 owner_id

-- 例如，如果实际的 ID 是 'xxx-xxx-xxx'，运行以下 SQL：
-- UPDATE assets SET owner_id = '实际的用户ID' WHERE owner_id = 'b11f399e-fd69-43db-8339-83f4f9c0dd9e';

