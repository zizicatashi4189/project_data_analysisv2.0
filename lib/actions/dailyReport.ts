'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// 提交日报数据（支持增量提交：企微指标可选，业绩商机累加）
export async function submitDailyReport(formData: {
  date: string
  // 企微运营指标（可选，支持日终补充）
  importedCustomers?: number | null
  certifiedCustomers?: number | null
  todayCoverage?: number | null
  todayReplies?: number | null
  // 业绩记录数组（累加模式）
  performances: Array<{
    outsideGold: number
    demand: number
    deposit: number
    wealth: number
    loan: number
    gold: number
    insurance: number
    fund: number
    creditCard: number
    branch: string
    product: string
  }>
  // 商机记录数组（累加模式）
  opportunities: Array<{
    category: string
    count: number
  }>
}) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  if (session.role !== 'DIRECT_MANAGER') {
    return { success: false, message: '只有直营经理可以提交业绩' }
  }

  try {
    const reportDate = new Date(formData.date)

    // 检查当天是否已提交
    const existing = await prisma.dailyReport.findUnique({
      where: {
        userId_date: {
          userId: session.userId,
          date: reportDate,
        },
      },
      include: {
        performances: true,
        opportunities: true,
      },
    })

    if (existing) {
      // 增量更新模式：企微指标可选更新，业绩商机追加
      const updateData: any = {}

      // 只有提供了企微指标才更新
      if (formData.importedCustomers !== undefined && formData.importedCustomers !== null) {
        updateData.importedCustomers = formData.importedCustomers
      }
      if (formData.certifiedCustomers !== undefined && formData.certifiedCustomers !== null) {
        updateData.certifiedCustomers = formData.certifiedCustomers
      }
      if (formData.todayCoverage !== undefined && formData.todayCoverage !== null) {
        updateData.todayCoverage = formData.todayCoverage
      }
      if (formData.todayReplies !== undefined && formData.todayReplies !== null) {
        updateData.todayReplies = formData.todayReplies
      }

      // 追加新的业绩记录（不删除旧的）
      if (formData.performances && formData.performances.length > 0) {
        updateData.performances = {
          create: formData.performances,
        }
      }

      // 追加新的商机记录（不删除旧的）
      if (formData.opportunities && formData.opportunities.length > 0) {
        updateData.opportunities = {
          create: formData.opportunities,
        }
      }

      const updated = await prisma.dailyReport.update({
        where: { id: existing.id },
        data: updateData,
        include: {
          performances: true,
          opportunities: true,
        },
      })

      console.log(`\n✅ 日报增量更新: ${session.name} (${formData.date})\n`)

      revalidatePath('/submit')
      revalidatePath('/history')
      revalidatePath('/dashboard')

      return {
        success: true,
        message: '提交成功（已累加到今日日报）',
        report: updated,
      }
    } else {
      // 创建新记录
      const created = await prisma.dailyReport.create({
        data: {
          userId: session.userId,
          date: reportDate,
          importedCustomers: formData.importedCustomers,
          certifiedCustomers: formData.certifiedCustomers,
          todayCoverage: formData.todayCoverage,
          todayReplies: formData.todayReplies,
          performances: {
            create: formData.performances,
          },
          opportunities: {
            create: formData.opportunities,
          },
        },
        include: {
          performances: true,
          opportunities: true,
        },
      })

      console.log(`\n✅ 日报提交成功: ${session.name} (${formData.date})\n`)

      revalidatePath('/submit')
      revalidatePath('/history')
      revalidatePath('/dashboard')

      return {
        success: true,
        message: '日报提交成功',
        report: created,
      }
    }
  } catch (error) {
    console.error('日报提交失败:', error)
    return { success: false, message: '日报提交失败，请重试' }
  }
}

// 获取当前用户的日报记录
export async function getMyDailyReports(limit = 30, offset = 0) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  try {
    const reports = await prisma.dailyReport.findMany({
      where: { userId: session.userId },
      include: {
        performances: true,
        opportunities: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.dailyReport.count({
      where: { userId: session.userId },
    })

    return {
      success: true,
      reports,
      total,
      hasMore: offset + limit < total,
    }
  } catch (error) {
    console.error('获取日报记录失败:', error)
    return { success: false, message: '获取日报记录失败' }
  }
}

// 删除日报记录
export async function deleteDailyReport(id: string) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  try {
    const report = await prisma.dailyReport.findUnique({
      where: { id },
    })

    if (!report) {
      return { success: false, message: '记录不存在' }
    }

    if (report.userId !== session.userId) {
      return { success: false, message: '无权删除此记录' }
    }

    await prisma.dailyReport.delete({
      where: { id },
    })

    console.log(`\n✅ 日报记录已删除: ${id}\n`)

    revalidatePath('/history')
    revalidatePath('/dashboard')

    return { success: true, message: '删除成功' }
  } catch (error) {
    console.error('删除失败:', error)
    return { success: false, message: '删除失败，请重试' }
  }
}

// 获取指定日期的日报（用于编辑回显）
export async function getDailyReportByDate(date: string) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  try {
    const report = await prisma.dailyReport.findUnique({
      where: {
        userId_date: {
          userId: session.userId,
          date: new Date(date),
        },
      },
      include: {
        performances: true,
        opportunities: true,
      },
    })

    return {
      success: true,
      report,
    }
  } catch (error) {
    console.error('获取日报失败:', error)
    return { success: false, message: '获取日报失败' }
  }
}

// 项目经理：获取所有直营经理的日报记录
export async function getAllDailyReports(
  startDate?: string,
  endDate?: string,
  limit = 100,
  offset = 0
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  if (session.role !== 'PROJECT_MANAGER') {
    return { success: false, message: '只有项目经理可以查看所有数据' }
  }

  try {
    const where: any = {}

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const reports = await prisma.dailyReport.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        performances: true,
        opportunities: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.dailyReport.count({ where })

    return {
      success: true,
      reports,
      total,
      hasMore: offset + limit < total,
    }
  } catch (error) {
    console.error('获取所有日报失败:', error)
    return { success: false, message: '获取所有日报失败' }
  }
}

// 项目经理：获取所有直营经理列表
export async function getAllManagers() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  if (session.role !== 'PROJECT_MANAGER') {
    return { success: false, message: '只有项目经理可以查看所有数据' }
  }

  try {
    const managers = await prisma.user.findMany({
      where: { role: 'DIRECT_MANAGER' },
      select: {
        id: true,
        name: true,
        username: true,
        _count: {
          select: {
            dailyReports: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return {
      success: true,
      managers,
    }
  } catch (error) {
    console.error('获取经理列表失败:', error)
    return { success: false, message: '获取经理列表失败' }
  }
}

// 删除单条业绩记录
export async function deletePerformance(performanceId: string) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  if (session.role !== 'DIRECT_MANAGER') {
    return { success: false, message: '只有直营经理可以操作' }
  }

  try {
    // 验证该业绩记录属于当前用户
    const performance = await prisma.performance.findUnique({
      where: { id: performanceId },
      include: {
        dailyReport: {
          select: { userId: true },
        },
      },
    })

    if (!performance) {
      return { success: false, message: '业绩记录不存在' }
    }

    if (performance.dailyReport.userId !== session.userId) {
      return { success: false, message: '无权删除此记录' }
    }

    await prisma.performance.delete({
      where: { id: performanceId },
    })

    console.log(`✅ 业绩记录已删除: ${performanceId}`)

    revalidatePath('/submit')
    revalidatePath('/history')
    revalidatePath('/dashboard')

    return { success: true, message: '删除成功' }
  } catch (error) {
    console.error('删除业绩记录失败:', error)
    return { success: false, message: '删除失败，请重试' }
  }
}

// 删除单条商机记录
export async function deleteOpportunity(opportunityId: string) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  if (session.role !== 'DIRECT_MANAGER') {
    return { success: false, message: '只有直营经理可以操作' }
  }

  try {
    // 验证该商机记录属于当前用户
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        dailyReport: {
          select: { userId: true },
        },
      },
    })

    if (!opportunity) {
      return { success: false, message: '商机记录不存在' }
    }

    if (opportunity.dailyReport.userId !== session.userId) {
      return { success: false, message: '无权删除此记录' }
    }

    await prisma.opportunity.delete({
      where: { id: opportunityId },
    })

    console.log(`✅ 商机记录已删除: ${opportunityId}`)

    revalidatePath('/submit')
    revalidatePath('/history')
    revalidatePath('/dashboard')

    return { success: true, message: '删除成功' }
  } catch (error) {
    console.error('删除商机记录失败:', error)
    return { success: false, message: '删除失败，请重试' }
  }
}

// 更新单条业绩记录
export async function updatePerformance(
  performanceId: string,
  data: {
    outsideGold: number
    demand: number
    deposit: number
    wealth: number
    loan: number
    gold: number
    insurance: number
    fund: number
    creditCard: number
    branch: string
    product: string
  }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  if (session.role !== 'DIRECT_MANAGER') {
    return { success: false, message: '只有直营经理可以操作' }
  }

  try {
    // 验证该业绩记录属于当前用户
    const performance = await prisma.performance.findUnique({
      where: { id: performanceId },
      include: {
        dailyReport: {
          select: { userId: true },
        },
      },
    })

    if (!performance) {
      return { success: false, message: '业绩记录不存在' }
    }

    if (performance.dailyReport.userId !== session.userId) {
      return { success: false, message: '无权修改此记录' }
    }

    const updated = await prisma.performance.update({
      where: { id: performanceId },
      data,
    })

    console.log(`✅ 业绩记录已更新: ${performanceId}`)

    revalidatePath('/submit')
    revalidatePath('/history')
    revalidatePath('/dashboard')

    return { success: true, message: '更新成功', performance: updated }
  } catch (error) {
    console.error('更新业绩记录失败:', error)
    return { success: false, message: '更新失败，请重试' }
  }
}

// 更新单条商机记录
export async function updateOpportunity(
  opportunityId: string,
  data: {
    category: string
    count: number
  }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  if (session.role !== 'DIRECT_MANAGER') {
    return { success: false, message: '只有直营经理可以操作' }
  }

  try {
    // 验证该商机记录属于当前用户
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        dailyReport: {
          select: { userId: true },
        },
      },
    })

    if (!opportunity) {
      return { success: false, message: '商机记录不存在' }
    }

    if (opportunity.dailyReport.userId !== session.userId) {
      return { success: false, message: '无权修改此记录' }
    }

    const updated = await prisma.opportunity.update({
      where: { id: opportunityId },
      data,
    })

    console.log(`✅ 商机记录已更新: ${opportunityId}`)

    revalidatePath('/submit')
    revalidatePath('/history')
    revalidatePath('/dashboard')

    return { success: true, message: '更新成功', opportunity: updated }
  } catch (error) {
    console.error('更新商机记录失败:', error)
    return { success: false, message: '更新失败，请重试' }
  }
}
