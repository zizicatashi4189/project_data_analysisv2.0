'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getIronSession } from 'iron-session'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { SessionData, sessionOptions } from '@/lib/session'

// 账号密码登录
export async function login(username: string, password: string) {
  // 验证输入
  if (!username || !password) {
    return { success: false, message: '请输入账号和密码' }
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    return { success: false, message: '账号或密码错误' }
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return { success: false, message: '账号或密码错误' }
  }

  // 创建 session
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  session.userId = user.id
  session.username = user.username
  session.name = user.name
  session.role = user.role
  session.isLoggedIn = true

  await session.save()

  console.log(`\n✅ 用户登录成功: ${user.name} (${user.username})\n`)

  return { success: true, message: '登录成功', user }
}

// 登出
export async function logout() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  session.destroy()
  redirect('/login')
}

// 获取当前用户信息
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })

  return user
}

// 创建用户（仅供管理员使用）
export async function createUser(
  username: string,
  password: string,
  name: string,
  role: 'DIRECT_MANAGER' | 'PROJECT_MANAGER',
  phone?: string
) {
  // 验证输入
  if (!username || !password || !name) {
    return { success: false, message: '请填写所有必填字段' }
  }

  // 检查用户名是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { username },
  })

  if (existingUser) {
    return { success: false, message: '用户名已存在' }
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10)

  // 创建用户
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
      role,
      phone,
    },
  })

  console.log(`\n✅ 新用户创建成功: ${user.name} (${user.username})\n`)

  return { success: true, message: '用户创建成功', user }
}
