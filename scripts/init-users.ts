// 初始化用户账号脚本
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('\n🚀 开始创建初始用户...\n')

  // 测试账号列表
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

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
      },
    })

    console.log(
      `✅ 创建成功: ${user.name} (${user.username}) - ${
        user.role === 'DIRECT_MANAGER' ? '直营经理' : '项目经理'
      }`
    )
  }

  console.log('\n📋 初始账号列表：\n')
  console.log('┌─────────────────────────────────────────────────────┐')
  console.log('│ 角色         │ 账号      │ 密码      │ 姓名      │')
  console.log('├─────────────────────────────────────────────────────┤')
  console.log('│ 直营经理     │ zhangsan  │ 123456    │ 张三      │')
  console.log('│ 直营经理     │ lisi      │ 123456    │ 李四      │')
  console.log('│ 直营经理     │ wangwu    │ 123456    │ 王五      │')
  console.log('│ 项目经理     │ admin     │ admin123  │ 项目经理  │')
  console.log('└─────────────────────────────────────────────────────┘')
  console.log('\n✨ 初始化完成！现在可以使用这些账号登录了\n')
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
