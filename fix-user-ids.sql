-- 修复用户 ID 映射问题
-- 如果 Supabase 中已有用户（如 admin@example.com），但 ID 不同
-- 使用此脚本更新资产数据中的 owner_id

-- 第一步：查询 Supabase 中实际用户 ID
SELECT id, name, email FROM users WHERE email IN (
  'admin@example.com',
  'zhangjie@example.com',
  'huozhenwei@example.com',
  'neil@example.com'
);

-- 第二步：自动更新资产 owner_id（推荐方法）
DO $$
DECLARE
    admin_id UUID;
    zhangjie_id UUID;
    huozhenwei_id UUID;
    neil_id UUID;
    updated_count INTEGER;
BEGIN
    -- 查询实际用户 ID
    SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';
    SELECT id INTO zhangjie_id FROM users WHERE email = 'zhangjie@example.com';
    SELECT id INTO huozhenwei_id FROM users WHERE email = 'huozhenwei@example.com';
    SELECT id INTO neil_id FROM users WHERE email = 'neil@example.com';
    
    -- 更新资产 owner_id
    IF admin_id IS NOT NULL THEN
        UPDATE assets SET owner_id = admin_id WHERE owner_id = 'b11f399e-fd69-43db-8339-83f4f9c0dd9e';
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE '更新了 % 条资产的 owner_id (admin@example.com: % -> %)', updated_count, 'b11f399e-fd69-43db-8339-83f4f9c0dd9e', admin_id;
    END IF;
    
    IF zhangjie_id IS NOT NULL THEN
        UPDATE assets SET owner_id = zhangjie_id WHERE owner_id = '38f7b695-81c8-4df1-9bf2-af8849ca1144';
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE '更新了 % 条资产的 owner_id (zhangjie@example.com: % -> %)', updated_count, '38f7b695-81c8-4df1-9bf2-af8849ca1144', zhangjie_id;
    END IF;
    
    IF huozhenwei_id IS NOT NULL THEN
        UPDATE assets SET owner_id = huozhenwei_id WHERE owner_id = '71ca49e6-7ba8-42d9-be5b-eb2f87136b34';
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE '更新了 % 条资产的 owner_id (huozhenwei@example.com: % -> %)', updated_count, '71ca49e6-7ba8-42d9-be5b-eb2f87136b34', huozhenwei_id;
    END IF;
    
    IF neil_id IS NOT NULL THEN
        UPDATE assets SET owner_id = neil_id WHERE owner_id = 'e363114f-be03-4352-ac86-4eba517c4baf';
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE '更新了 % 条资产的 owner_id (neil@example.com: % -> %)', updated_count, 'e363114f-be03-4352-ac86-4eba517c4baf', neil_id;
    END IF;
    
    RAISE NOTICE '✅ 用户 ID 映射完成！';
END $$;

