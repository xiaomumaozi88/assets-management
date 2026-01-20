import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function exportData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('📊 开始导出数据...\n');

    // 1. 导出业务线
    console.log('📦 导出业务线...');
    const businessLines = await dataSource.query('SELECT * FROM business_lines ORDER BY created_at');
    console.log(`✅ 找到 ${businessLines.length} 条业务线\n`);

    // 2. 导出资产类型
    console.log('📦 导出资产类型...');
    const assetTypes = await dataSource.query('SELECT * FROM asset_types ORDER BY created_at');
    console.log(`✅ 找到 ${assetTypes.length} 条资产类型\n`);

    // 3. 导出资产模板
    console.log('📦 导出资产模板...');
    const assetTemplates = await dataSource.query('SELECT * FROM asset_templates ORDER BY created_at');
    console.log(`✅ 找到 ${assetTemplates.length} 条资产模板\n`);

    // 4. 导出用户
    console.log('📦 导出用户...');
    const users = await dataSource.query('SELECT id, name, email, role, status, department, created_at, updated_at FROM users ORDER BY created_at');
    console.log(`✅ 找到 ${users.length} 条用户\n`);

    // 5. 导出资产
    console.log('📦 导出资产...');
    const assets = await dataSource.query('SELECT * FROM assets ORDER BY created_at');
    console.log(`✅ 找到 ${assets.length} 条资产\n`);

    // 生成 SQL
    let sql = '-- 数据导出 SQL\n';
    sql += `-- 导出时间: ${new Date().toISOString()}\n\n`;

    // 业务线 SQL
    if (businessLines.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 业务线 (business_lines)\n';
      sql += '-- ========================================\n\n';
      sql += 'INSERT INTO business_lines (id, name, code, suffix, description, status, sort_order, created_at) VALUES\n';
      const blValues = businessLines.map((bl: any) => {
        const suffix = bl.suffix ? `'${bl.suffix.replace(/'/g, "''")}'` : 'NULL';
        const desc = bl.description ? `'${bl.description.replace(/'/g, "''")}'` : 'NULL';
        return `  ('${bl.id}', '${bl.name.replace(/'/g, "''")}', '${bl.code}', ${suffix}, ${desc}, ${bl.status}, ${bl.sort_order || 0}, '${bl.created_at.toISOString()}')`;
      }).join(',\n');
      sql += blValues + '\n';
      sql += 'ON CONFLICT (code) DO NOTHING;\n\n';
    }

    // 资产类型 SQL
    if (assetTypes.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 资产类型 (asset_types)\n';
      sql += '-- ========================================\n\n';
      sql += 'INSERT INTO asset_types (id, name, code, category, description, status, sort_order, created_at, updated_at) VALUES\n';
      const atValues = assetTypes.map((at: any) => {
        const category = at.category ? `'${at.category.replace(/'/g, "''")}'` : 'NULL';
        const desc = at.description ? `'${at.description.replace(/'/g, "''")}'` : 'NULL';
        const fieldsConfig = at.fields_config ? `'${JSON.stringify(at.fields_config).replace(/'/g, "''")}'::jsonb` : 'NULL';
        return `  ('${at.id}', '${at.name.replace(/'/g, "''")}', '${at.code}', ${category}, ${desc}, ${at.status}, ${at.sort_order || 0}, '${at.created_at.toISOString()}', '${at.updated_at.toISOString()}')`;
      }).join(',\n');
      sql += atValues + '\n';
      sql += 'ON CONFLICT (code) DO NOTHING;\n\n';
    }

    // 资产模板 SQL
    if (assetTemplates.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 资产模板 (asset_templates)\n';
      sql += '-- ========================================\n\n';
      sql += 'INSERT INTO asset_templates (id, asset_type_id, name, code, purpose, description, status, sort_order, created_at, updated_at) VALUES\n';
      const templateValues = assetTemplates.map((template: any) => {
        const code = template.code ? `'${template.code.replace(/'/g, "''")}'` : 'NULL';
        const purpose = template.purpose ? `'${template.purpose.replace(/'/g, "''")}'` : 'NULL';
        // 处理描述：移除换行符和特殊字符
        const desc = template.description 
          ? `'${template.description.replace(/'/g, "''").replace(/\n/g, ' ').replace(/\r/g, '')}'` 
          : 'NULL';
        return `  ('${template.id}', '${template.asset_type_id}', '${template.name.replace(/'/g, "''")}', ${code}, ${purpose}, ${desc}, ${template.status}, ${template.sort_order || 0}, '${template.created_at.toISOString()}', '${template.updated_at.toISOString()}')`;
      }).join(',\n');
      sql += templateValues + '\n';
      sql += 'ON CONFLICT (id) DO NOTHING;\n\n';
    }

    // 用户 SQL（导出用户，使用临时密码）
    if (users.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 用户 (users) - 注意：使用临时密码\n';
      sql += '-- ========================================\n\n';
      sql += '-- ⚠️ 所有导入的用户临时密码为：temp123456\n';
      sql += '-- ⚠️ 请在登录后立即修改密码！\n\n';
      
      // 生成临时密码的 bcrypt 哈希（所有用户使用相同临时密码）
      const tempPasswordHash = '$2b$10$rZqJKqKLJqKLJqKLJqKLJOqKLJqKLJqKLJqKLJqKLJqKLJqKLJqK'; // 占位符，稍后替换
      
      // 使用 bcrypt 同步生成哈希（注意：在异步函数中需要使用 await）
      const bcrypt = require('bcrypt');
      const tempPassword = 'temp123456';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
      
      sql += `-- 注意：如果用户已存在（如 admin@example.com），会跳过插入\n`;
      sql += `-- 此时需要确保资产中的 owner_id 指向正确的用户 ID\n`;
      sql += `-- 如果遇到外键错误，请先查询 Supabase 中的实际用户 ID，然后更新资产数据\n\n`;
      sql += `INSERT INTO users (id, name, email, password, role, status, department, created_at, updated_at) VALUES\n`;
      const userValues = users.map((user: any) => {
        const dept = user.department ? `'${user.department.replace(/'/g, "''")}'` : 'NULL';
        return `  ('${user.id}', '${user.name.replace(/'/g, "''")}', '${user.email}', '${hashedPassword}', '${user.role}', '${user.status}', ${dept}, '${user.created_at.toISOString()}', '${user.updated_at.toISOString()}')`;
      }).join(',\n');
      sql += userValues + '\n';
      sql += 'ON CONFLICT (email) DO NOTHING;\n\n';
      
      // 添加一个更新资产 owner_id 的 SQL（如果用户 ID 不同）
      sql += '-- ========================================\n';
      sql += '-- 更新资产 owner_id（如果需要）\n';
      sql += '-- ========================================\n\n';
      sql += '-- 如果 admin@example.com 的 ID 不同，运行以下 SQL 更新资产 owner_id：\n';
      sql += '-- 首先查询 Supabase 中 admin@example.com 的实际 ID：\n';
      sql += "-- SELECT id, email FROM users WHERE email = 'admin@example.com';\n";
      sql += '-- 然后更新资产（假设新的 ID 为 NEW_ADMIN_ID）：\n';
      sql += "-- UPDATE assets SET owner_id = 'NEW_ADMIN_ID' WHERE owner_id = 'b11f399e-fd69-43db-8339-83f4f9c0dd9e';\n\n";
    }

    // 资产 SQL
    if (assets.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 资产 (assets)\n';
      sql += '-- ========================================\n\n';
      sql += 'INSERT INTO assets (id, asset_type_id, asset_template_id, name, code, status, owner_id, project_id, business_line_id, expiry_date, cost, cost_currency, custom_fields, metadata, parent_id, created_at, updated_at) VALUES\n';
      const assetValues = assets.map((asset: any) => {
        const templateId = asset.asset_template_id ? `'${asset.asset_template_id}'` : 'NULL';
        const code = asset.code ? `'${asset.code.replace(/'/g, "''")}'` : 'NULL';
        const projectId = asset.project_id ? `'${asset.project_id}'` : 'NULL';
        const businessLineId = asset.business_line_id ? `'${asset.business_line_id}'` : 'NULL';
        // 处理日期：如果是 Date 对象，转换为 ISO 字符串；如果是字符串，解析后转换；否则为 NULL
        let expiryDate = 'NULL';
        if (asset.expiry_date) {
          try {
            const date = asset.expiry_date instanceof Date 
              ? asset.expiry_date 
              : new Date(asset.expiry_date);
            if (!isNaN(date.getTime())) {
              // 只取日期部分，格式化为 YYYY-MM-DD
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              expiryDate = `'${year}-${month}-${day}'::date`;
            }
          } catch (e) {
            // 如果日期解析失败，保持为 NULL
            expiryDate = 'NULL';
          }
        }
        const cost = asset.cost !== null && asset.cost !== undefined ? asset.cost : 'NULL';
        const currency = asset.cost_currency || 'CNY';
        const customFields = asset.custom_fields ? `'${JSON.stringify(asset.custom_fields).replace(/'/g, "''")}'::jsonb` : 'NULL';
        const metadata = asset.metadata ? `'${JSON.stringify(asset.metadata).replace(/'/g, "''")}'::jsonb` : 'NULL';
        const parentId = asset.parent_id ? `'${asset.parent_id}'` : 'NULL';
        return `  ('${asset.id}', '${asset.asset_type_id}', ${templateId}, '${asset.name.replace(/'/g, "''")}', ${code}, '${asset.status}', '${asset.owner_id}', ${projectId}, ${businessLineId}, ${expiryDate}, ${cost}, '${currency}', ${customFields}, ${metadata}, ${parentId}, '${asset.created_at.toISOString()}', '${asset.updated_at.toISOString()}')`;
      }).join(',\n');
      sql += assetValues + ';\n';
    }

    // 保存到文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '../../../export-data.sql');
    fs.writeFileSync(outputPath, sql, 'utf8');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 数据导出完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📄 SQL 文件已保存到: ${outputPath}`);
    console.log(`\n📊 导出统计：`);
    console.log(`   - 业务线: ${businessLines.length} 条`);
    console.log(`   - 资产类型: ${assetTypes.length} 条`);
    console.log(`   - 资产模板: ${assetTemplates.length} 条`);
    console.log(`   - 用户: ${users.length} 条`);
    console.log(`   - 资产: ${assets.length} 条`);
    console.log(`\n💡 下一步：`);
    console.log(`   1. 检查生成的 SQL 文件: export-data.sql`);
    console.log(`   2. 在 Supabase SQL Editor 中执行该文件`);
    console.log(`   3. 确保所有外键依赖已存在（业务线、资产类型、用户等）`);

  } catch (error: any) {
    console.error('❌ 导出失败:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

exportData();

