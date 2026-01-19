-- 添加 is_primary 字段到 asset_fields 表
ALTER TABLE asset_fields 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- 更新现有记录的默认值
UPDATE asset_fields SET is_primary = false WHERE is_primary IS NULL;
