-- 创建管理员用户
-- 密码: admin123
-- bcrypt 哈希已生成

INSERT INTO users (id, name, email, password, role, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '系统管理员',
  'admin@example.com',
  '$2b$10$xgc4GLwg8xn8gFvf7sdC1etySnFe9oTqYJn3X3JuoAN2d8sa8j.4S',
  'admin',
  'active',
  NOW(),
  NOW()
);

-- 验证用户是否创建成功
-- SELECT id, name, email, role, status, created_at 
-- FROM users 
-- WHERE email = 'admin@example.com';

