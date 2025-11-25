'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// 提交业绩数据
export async function submitPerformance(formData: {
  date: string
  branch: string
  depositAum: number
  depositNew: number
  depositActivity: number
  goldWeight: number
  fundCount: number
  fundHoldingAum: number
  fundSalesAmount: number
  insuranceNewPremium: number
  insuranceContinuePremium: number
  opportunityDetails?: any
  remarks?: string
}) {
  // 验证登录状态
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  // 只有直营经理可以提交业绩
  if (session.role !== 'DIRECT_MANAGER') {
    return { success: false, message: '只有直营经理可以提交业绩' }
  }

  try {
    // 检查当天是否已经提交过该网点的业绩
    const existingPerformance = await prisma.performance.findFirst({
      where: {
        userId: session.userId,
        date: new Date(formData.date),
        branch: formData.branch,
      },
    })

    if (existingPerformance) {
      // 更新现有记录
      const updated = await prisma.performance.update({
        where: { id: existingPerformance.id },
        data: {
          depositAum: formData.depositAum,
          depositNew: formData.depositNew,
          depositActivity: formData.depositActivity,
          goldWeight: formData.goldWeight,
          fundCount: formData.fundCount,
          fundHoldingAum: formData.fundHoldingAum,
          fundSalesAmount: formData.fundSalesAmount,
          insuranceNewPremium: formData.insuranceNewPremium,
          insuranceContinuePremium: formData.insuranceContinuePremium,
          opportunityDetails: formData.opportunityDetails,
          remarks: formData.remarks,
        },
      })

      console.log(
        `\n✅ 业绩更新成功: ${session.name} - ${formData.branch} (${formData.date})\n`
      )

      revalidatePath('/submit')
      revalidatePath('/history')
      revalidatePath('/dashboard')

      return {
        success: true,
        message: '业绩更新成功',
        performance: updated,
      }
    } else {
      // 创建新记录
      const created = await prisma.performance.create({
        data: {
          userId: session.userId,
          date: new Date(formData.date),
          branch: formData.branch,
          depositAum: formData.depositAum,
          depositNew: formData.depositNew,
          depositActivity: formData.depositActivity,
          goldWeight: formData.goldWeight,
          fundCount: formData.fundCount,
          fundHoldingAum: formData.fundHoldingAum,
          fundSalesAmount: formData.fundSalesAmount,
          insuranceNewPremium: formData.insuranceNewPremium,
          insuranceContinuePremium: formData.insuranceContinuePremium,
          opportunityDetails: formData.opportunityDetails,
          remarks: formData.remarks,
        },
      })

      console.log(
        `\n✅ 业绩提交成功: ${session.name} - ${formData.branch} (${formData.date})\n`
      )

      revalidatePath('/submit')
      revalidatePath('/history')
      revalidatePath('/dashboard')

      return {
        success: true,
        message: '业绩提交成功',
        performance: created,
      }
    }
  } catch (error) {
    console.error('业绩提交失败:', error)
    return { success: false, message: '业绩提交失败，请重试' }
  }
}

// 获取当前用户的业绩记录
export async function getMyPerformances(limit = 10, offset = 0) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  try {
    const performances = await prisma.performance.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.performance.count({
      where: { userId: session.userId },
    })

    return {
      success: true,
      performances,
      total,
      hasMore: offset + limit < total,
    }
  } catch (error) {
    console.error('获取业绩记录失败:', error)
    return { success: false, message: '获取业绩记录失败' }
  }
}

// 删除业绩记录
export async function deletePerformance(id: string) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  try {
    // 检查记录是否属于当前用户
    const performance = await prisma.performance.findUnique({
      where: { id },
    })

    if (!performance) {
      return { success: false, message: '记录不存在' }
    }

    if (performance.userId !== session.userId) {
      return { success: false, message: '无权删除此记录' }
    }

    await prisma.performance.delete({
      where: { id },
    })

    console.log(`\n✅ 业绩记录已删除: ${id}\n`)

    revalidatePath('/history')
    revalidatePath('/dashboard')

    return { success: true, message: '删除成功' }
  } catch (error) {
    console.error('删除失败:', error)
    return { success: false, message: '删除失败，请重试' }
  }
}
