import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { BusinessLinesService } from '../modules/business-lines/business-lines.service';
import { AssetTypesService } from '../modules/asset-types/asset-types.service';
import { UserRole } from '../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function initData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const businessLinesService = app.get(BusinessLinesService);
  const assetTypesService = app.get(AssetTypesService);

  try {
    // 创建默认管理员用户
    const adminEmail = 'admin@example.com';
    const existingAdmin = await usersService.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await usersService.create({
        name: '系统管理员',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        department: 'IT',
      });
      console.log('✅ 默认管理员用户已创建');
      console.log('   邮箱: admin@example.com');
      console.log('   密码: admin123');
    } else {
      console.log('ℹ️  管理员用户已存在');
    }

    // 创建默认业务线
    const defaultBusinessLines = [
      { name: '超休闲', code: 'HCG', suffix: 'HCG' },
      { name: 'ROBUX网赚游戏', code: 'RWZ', suffix: 'RWZ' },
      { name: 'CPT工具', code: 'CPT', suffix: 'CPT' },
      { name: '007游戏TW', code: 'G007', suffix: 'G007' },
      { name: '007工具TW', code: 'T007', suffix: 'T007' },
      { name: '真金网赚', code: 'CWZ', suffix: 'CWZ' },
      { name: '混合变现游戏', code: 'HMG', suffix: 'HMG' },
      { name: '中重度游戏', code: 'MCG', suffix: 'MCG' },
      { name: 'Launcher游戏', code: 'GLC', suffix: 'GLC' },
      { name: 'Launcher工具', code: 'TLC', suffix: 'TLC' },
      { name: 'Remax', code: 'Remax', suffix: 'Remax' },
    ];

    for (const bl of defaultBusinessLines) {
      const existing = await businessLinesService.findAll();
      const found = existing.find(b => b.code === bl.code);
      
      if (!found) {
        await businessLinesService.create(bl);
        console.log(`✅ 业务线 "${bl.name}" 已创建`);
      }
    }

    // 创建默认资产类型
    const defaultAssetTypes = [
      { name: '域名', code: 'domain', category: '网络资源' },
      { name: '手机号', code: 'phone', category: '通信资源' },
      { name: '云存储', code: 'cloud_storage', category: '存储资源' },
      { name: '平台账号', code: 'platform_account', category: '账号资源' },
      { name: '银行账户', code: 'bank_account', category: '金融资源' },
      { name: '支付信用卡', code: 'payment_card', category: '金融资源' },
      { name: '服务器', code: 'server', category: '技术资源' },
      { name: 'APP', code: 'app', category: '应用资源' },
      { name: '游戏', code: 'game', category: '应用资源' },
      { name: '工具', code: 'tool', category: '应用资源' },
      { name: '公司主体', code: 'company', category: '组织资源' },
    ];

    for (const at of defaultAssetTypes) {
      const existing = await assetTypesService.findAll();
      const found = existing.find(a => a.code === at.code);
      
      if (!found) {
        await assetTypesService.create(at);
        console.log(`✅ 资产类型 "${at.name}" 已创建`);
      }
    }

    console.log('\n✅ 初始化数据完成！');
  } catch (error: any) {
    console.error('❌ 初始化数据失败:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

initData();
