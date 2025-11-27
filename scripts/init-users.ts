// 初始化用户账号脚本 - 多租户版本
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('\n🚀 开始初始化多租户系统...\n')

  // 1️⃣ 创建默认组织
  console.log('📦 创建默认组织...')
  let defaultOrg = await prisma.organization.findUnique({
    where: { code: 'DEFAULT_ORG' },
  })

  if (!defaultOrg) {
    defaultOrg = await prisma.organization.create({
      data: {
        name: '默认组织',
        code: 'DEFAULT_ORG',
        isActive: true,
      },
    })
    console.log(`✅ 组织创建成功: ${defaultOrg.name} (${defaultOrg.code})`)
  } else {
    console.log(`⏭️  跳过: ${defaultOrg.name} - 已存在`)
  }

  // 2️⃣ 创建系统超级管理员
  console.log('\n👑 创建系统超级管理员...')
  const superAdminExists = await prisma.user.findUnique({
    where: { username: 'superadmin' },
  })

  if (!superAdminExists) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10)
    const superAdmin = await prisma.user.create({
      data: {
        username: 'superadmin',
        password: hashedPassword,
        name: '系统管理员',
        role: 'SUPER_ADMIN',
        phone: '13900000000',
        organizationId: null, // 超级管理员不属于任何组织
      },
    })
    console.log(`✅ 超级管理员创建成功: ${superAdmin.name} (${superAdmin.username})`)
  } else {
    console.log(`⏭️  跳过: 系统管理员 (superadmin) - 已存在`)
  }

  // 3️⃣ 创建测试用户（归属默认组织）
  console.log('\n👥 创建测试用户...')
  const users = [
    {
      username: 'zhangsan',
      password: '123456',
      name: '张三',
      role: 'DIRECT_MANAGER' as const,
      phone: '13800138001',
    },
    {
      username: 'lisi',
      password: '123456',
      name: '李四',
      role: 'DIRECT_MANAGER' as const,
      phone: '13800138002',
    },
    {
      username: 'wangwu',
      password: '123456',
      name: '王五',
      role: 'DIRECT_MANAGER' as const,
      phone: '13800138003',
    },
    {
      username: 'admin',
      password: 'admin123',
      name: '项目经理',
      role: 'PROJECT_MANAGER' as const,
      phone: '13800138000',
    },
  ]

  for (const userData of users) {
    // 检查用户是否已存在
    const existing = await prisma.user.findUnique({
      where: { username: userData.username },
    })

    if (existing) {
      console.log(`⏭️  跳过: ${userData.name} (${userData.username}) - 已存在`)
      continue
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // 创建用户（关联到默认组织）
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        organizationId: defaultOrg.id, // 关联到默认组织
      },
    })

    console.log(
      `✅ 创建成功: ${user.name} (${user.username}) - ${
        user.role === 'DIRECT_MANAGER' ? '直营经理' : '项目经理'
      } [${defaultOrg.name}]`
    )
  }

  console.log('\n📋 初始账号列表：\n')
  console.log('┌─────────────────────────────────────────────────────────────┐')
  console.log('│ 角色         │ 账号       │ 密码          │ 姓名     │ 组织   │')
  console.log('├─────────────────────────────────────────────────────────────┤')
  console.log('│ 系统管理员   │ superadmin │ superadmin123 │ 系统管理 │ 全局   │')
  console.log('│ 直营经理     │ zhangsan   │ 123456        │ 张三     │ 默认组织│')
  console.log('│ 直营经理     │ lisi       │ 123456        │ 李四     │ 默认组织│')
  console.log('│ 直营经理     │ wangwu     │ 123456        │ 王五     │ 默认组织│')
  console.log('│ 项目经理     │ admin      │ admin123      │ 项目经理 │ 默认组织│')
  console.log('└─────────────────────────────────────────────────────────────┘')
  console.log('\n✨ 多租户系统初始化完成！现在可以使用这些账号登录了\n')
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
