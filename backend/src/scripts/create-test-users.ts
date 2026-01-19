import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { UserRole } from '../modules/users/entities/user.entity';

async function createTestUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);

  try {
    // 测试用户列表
    const testUsers = [
      {
        name: '张杰',
        email: 'zhangjie@example.com',
        password: 'zhangjie123',
        role: UserRole.USER,
        department: '技术部',
      },
      {
        name: '霍振威',
        email: 'huozhenwei@example.com',
        password: 'huozhenwei123',
        role: UserRole.USER,
        department: '技术部',
      },
      {
        name: 'Neil',
        email: 'neil@example.com',
        password: 'neil123',
        role: UserRole.USER,
        department: '技术部',
      },
    ];

    console.log('开始创建测试用户...\n');

    for (const userData of testUsers) {
      const existing = await usersService.findByEmail(userData.email);
      
      if (existing) {
        console.log(`ℹ️  用户 "${userData.name}" 已存在 (${userData.email})`);
      } else {
        await usersService.create(userData);
        console.log(`✅ 用户 "${userData.name}" 已创建`);
        console.log(`   邮箱: ${userData.email}`);
        console.log(`   密码: ${userData.password}`);
        console.log('');
      }
    }

    console.log('\n✅ 测试用户创建完成！');
    console.log('\n登录信息：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach(user => {
      console.log(`姓名: ${user.name}`);
      console.log(`邮箱: ${user.email}`);
      console.log(`密码: ${user.password}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error: any) {
    console.error('❌ 创建测试用户失败:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

createTestUsers();

