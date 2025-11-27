'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// 获取所有组织列表（仅 SUPER_ADMIN）
export async function getOrganizations() {
  const session = await getSession()

  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '权限不足', organizations: [] }
  }

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          users: true,
          dailyReports: true,
        },
      },
    },
  })

  return { success: true, organizations }
}

// 创建组织（仅 SUPER_ADMIN）
export async function createOrganization(name: string, code: string) {
  const session = await getSession()

  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '权限不足' }
  }

  // 验证输入
  if (!name || !code) {
    return { success: false, message: '请填写所有必填字段' }
  }

  // 检查组织代码是否已存在
  const existing = await prisma.organization.findUnique({
    where: { code },
  })

  if (existing) {
    return { success: false, message: '组织代码已存在' }
  }

  // 创建组织
  const organization = await prisma.organization.create({
    data: {
      name,
      code,
      isActive: true,
    },
  })

  console.log(`\n✅ 组织创建成功: ${organization.name} (${organization.code})\n`)

  return { success: true, message: '组织创建成功', organization }
}

// 更新组织信息（仅 SUPER_ADMIN）
export async function updateOrganization(
  id: string,
  name: string,
  code: string,
  isActive: boolean
) {
  const session = await getSession()

  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '权限不足' }
  }

  // 验证输入
  if (!name || !code) {
    return { success: false, message: '请填写所有必填字段' }
  }

  // 检查组织代码是否与其他组织冲突
  const existing = await prisma.organization.findFirst({
    where: {
      code,
      id: { not: id },
    },
  })

  if (existing) {
    return { success: false, message: '组织代码已被其他组织使用' }
  }

  // 更新组织
  const organization = await prisma.organization.update({
    where: { id },
    data: {
      name,
      code,
      isActive,
    },
  })

  console.log(`\n✅ 组织更新成功: ${organization.name} (${organization.code})\n`)

  return { success: true, message: '组织更新成功', organization }
}

// 删除组织（仅 SUPER_ADMIN）
export async function deleteOrganization(id: string) {
  const session = await getSession()

  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '权限不足' }
  }

  // 检查组织是否存在
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          dailyReports: true,
        },
      },
    },
  })

  if (!organization) {
    return { success: false, message: '组织不存在' }
  }

  // 检查是否有关联数据
  if (organization._count.users > 0 || organization._count.dailyReports > 0) {
    return {
      success: false,
      message: `无法删除：该组织下还有 ${organization._count.users} 个用户和 ${organization._count.dailyReports} 条日报记录`,
    }
  }

  // 删除组织
  await prisma.organization.delete({
    where: { id },
  })

  console.log(`\n✅ 组织删除成功: ${organization.name} (${organization.code})\n`)

  return { success: true, message: '组织删除成功' }
}

// 获取指定组织的用户列表（仅 SUPER_ADMIN）
export async function getOrganizationUsers(organizationId: string) {
  const session = await getSession()

  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '权限不足', users: [] }
  }

  const users = await prisma.user.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  })

  return { success: true, users }
}

// 获取所有用户列表（仅 SUPER_ADMIN）
export async function getAllUsers() {
  const session = await getSession()

  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '权限不足', users: [] }
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      organization: true,
    },
  })

  return { success: true, users }
}

// 更新用户信息（仅 SUPER_ADMIN）
export async function updateUser(
  id: string,
  data: {
    username: string
    name: string
    role: 'SUPER_ADMIN' | 'DIRECT_MANAGER' | 'PROJECT_MANAGER'
    organizationId: string | null
    isActive: boolean
    phone?: string
  }
) {
  const session = await getSession()

  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '权限不足' }
  }

  // 验证输入
  if (!data.username || !data.name) {
    return { success: false, message: '请填写所有必填字段' }
  }

  // SUPER_ADMIN 必须 organizationId 为 null
  if (data.role === 'SUPER_ADMIN' && data.organizationId !== null) {
    return { success: false, message: '系统管理员不能归属任何组织' }
  }

  // 其他角色必须有 organizationId
  if (data.role !== 'SUPER_ADMIN' && !data.organizationId) {
    return { success: false, message: '普通用户必须归属某个组织' }
  }

  // 检查用户名是否与其他用户冲突
  const existing = await prisma.user.findFirst({
    where: {
      username: data.username,
      id: { not: id },
    },
  })

  if (existing) {
    return { success: false, message: '用户名已被其他用户使用' }
  }

  // 如果指定了组织，检查组织是否存在
  if (data.organizationId) {
    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId },
    })
    if (!organization) {
      return { success: false, message: '指定的组织不存在' }
    }
  }

  // 更新用户
  const user = await prisma.user.update({
    where: { id },
    data: {
      username: data.username,
      name: data.name,
      role: data.role,
      organization: data.organizationId
        ? { connect: { id: data.organizationId } }
        : { disconnect: true },
      isActive: data.isActive,
      phone: data.phone,
    },
  })

  console.log(`\n✅ 用户更新成功: ${user.name} (${user.username})\n`)

  return { success: true, message: '用户更新成功', user }
}

// 删除用户（仅 SUPER_ADMIN）
export async function deleteUser(id: string) {
  const session = await getSession()

  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '权限不足' }
  }

  // 检查用户是否存在
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          dailyReports: true,
        },
      },
    },
  })

  if (!user) {
    return { success: false, message: '用户不存在' }
  }

  // 警告：删除用户会级联删除所有日报数据
  if (user._count.dailyReports > 0) {
    console.warn(
      `⚠️  警告：删除用户 ${user.name} 将同时删除 ${user._count.dailyReports} 条日报记录`
    )
  }

  // 删除用户（会级联删除日报数据）
  await prisma.user.delete({
    where: { id },
  })

  console.log(`\n✅ 用户删除成功: ${user.name} (${user.username})\n`)

  return { success: true, message: '用户删除成功' }
}

// 重置用户密码（仅 SUPER_ADMIN）
export async function resetUserPassword(id: string, newPassword: string) {
  const session = await getSession()

  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '权限不足' }
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: '密码至少需要6个字符' }
  }

  // 检查用户是否存在
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) {
    return { success: false, message: '用户不存在' }
  }

  // 加密新密码
  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // 更新密码
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  })

  console.log(`\n✅ 密码重置成功: ${user.name} (${user.username})\n`)

  return { success: true, message: '密码重置成功' }
}
