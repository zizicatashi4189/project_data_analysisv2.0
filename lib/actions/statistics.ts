'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// 获取指定日期范围的统计数据
export async function getStatistics(startDate: string, endDate: string) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  if (session.role !== 'PROJECT_MANAGER' && session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '只有项目经理或系统管理员可以查看统计数据' }
  }

  try {
    const where: any = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }

    // 项目经理只能查看自己组织的数据
    if (session.role === 'PROJECT_MANAGER') {
      if (!session.organizationId) {
        return { success: false, message: '项目经理未关联组织' }
      }
      where.organizationId = session.organizationId
    }
    // SUPER_ADMIN 可以查看所有组织的数据

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
      orderBy: { date: 'asc' },
    })

    // 按直营经理汇总数据
    const managerStats = new Map()

    reports.forEach((report) => {
      const managerId = report.user.id
      const managerName = report.user.name

      if (!managerStats.has(managerId)) {
        managerStats.set(managerId, {
          managerId,
          managerName,
          // 企微运营指标（取最新值）
          importedCustomers: 0,
          certifiedCustomers: 0,
          todayCoverage: 0,
          todayReplies: 0,
          // 业绩汇总
          totalOutsideGold: 0,
          totalDemand: 0,
          totalDeposit: 0,
          totalWealth: 0,
          totalLoan: 0,
          totalGold: 0,
          totalInsurance: 0,
          totalFund: 0,
          totalCreditCard: 0,
          // 商机汇总
          opportunities: {} as Record<string, number>,
          // 按支行汇总
          branches: {} as Record<
            string,
            {
              outsideGold: number
              demand: number
              deposit: number
              wealth: number
              loan: number
              gold: number
              insurance: number
              fund: number
              creditCard: number
            }
          >,
          reportCount: 0,
        })
      }

      const stats = managerStats.get(managerId)
      stats.reportCount++

      // 更新企微指标（使用最新的非空值）
      if (report.importedCustomers !== null) {
        stats.importedCustomers = report.importedCustomers
      }
      if (report.certifiedCustomers !== null) {
        stats.certifiedCustomers = report.certifiedCustomers
      }
      if (report.todayCoverage !== null) {
        stats.todayCoverage += report.todayCoverage
      }
      if (report.todayReplies !== null) {
        stats.todayReplies += report.todayReplies
      }

      // 汇总业绩
      report.performances.forEach((perf) => {
        stats.totalOutsideGold += Number(perf.outsideGold)
        stats.totalDemand += Number(perf.demand)
        stats.totalDeposit += Number(perf.deposit)
        stats.totalWealth += Number(perf.wealth)
        stats.totalLoan += Number(perf.loan)
        stats.totalGold += Number(perf.gold)
        stats.totalInsurance += Number(perf.insurance)
        stats.totalFund += Number(perf.fund)
        stats.totalCreditCard += Number(perf.creditCard)

        // 按支行汇总
        if (perf.branch) {
          if (!stats.branches[perf.branch]) {
            stats.branches[perf.branch] = {
              outsideGold: 0,
              demand: 0,
              deposit: 0,
              wealth: 0,
              loan: 0,
              gold: 0,
              insurance: 0,
              fund: 0,
              creditCard: 0,
            }
          }
          stats.branches[perf.branch].outsideGold += Number(perf.outsideGold)
          stats.branches[perf.branch].demand += Number(perf.demand)
          stats.branches[perf.branch].deposit += Number(perf.deposit)
          stats.branches[perf.branch].wealth += Number(perf.wealth)
          stats.branches[perf.branch].loan += Number(perf.loan)
          stats.branches[perf.branch].gold += Number(perf.gold)
          stats.branches[perf.branch].insurance += Number(perf.insurance)
          stats.branches[perf.branch].fund += Number(perf.fund)
          stats.branches[perf.branch].creditCard += Number(perf.creditCard)
        }
      })

      // 汇总商机
      report.opportunities.forEach((opp) => {
        if (!stats.opportunities[opp.category]) {
          stats.opportunities[opp.category] = 0
        }
        stats.opportunities[opp.category] += opp.count
      })
    })

    const result = Array.from(managerStats.values())

    // 计算总计
    const totals = result.reduce(
      (acc, manager) => {
        acc.totalOutsideGold += manager.totalOutsideGold
        acc.totalDemand += manager.totalDemand
        acc.totalDeposit += manager.totalDeposit
        acc.totalWealth += manager.totalWealth
        acc.totalLoan += manager.totalLoan
        acc.totalGold += manager.totalGold
        acc.totalInsurance += manager.totalInsurance
        acc.totalFund += manager.totalFund
        acc.totalCreditCard += manager.totalCreditCard
        acc.importedCustomers = Math.max(acc.importedCustomers, manager.importedCustomers)
        acc.certifiedCustomers = Math.max(acc.certifiedCustomers, manager.certifiedCustomers)
        acc.todayCoverage += manager.todayCoverage
        acc.todayReplies += manager.todayReplies

        // 汇总所有商机
        Object.entries(manager.opportunities).forEach(([category, count]) => {
          acc.opportunities[category] = (acc.opportunities[category] || 0) + count
        })

        return acc
      },
      {
        totalOutsideGold: 0,
        totalDemand: 0,
        totalDeposit: 0,
        totalWealth: 0,
        totalLoan: 0,
        totalGold: 0,
        totalInsurance: 0,
        totalFund: 0,
        totalCreditCard: 0,
        importedCustomers: 0,
        certifiedCustomers: 0,
        todayCoverage: 0,
        todayReplies: 0,
        opportunities: {} as Record<string, number>,
      }
    )

    return {
      success: true,
      managerStats: result,
      totals,
      reportCount: reports.length,
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return { success: false, message: '获取统计数据失败' }
  }
}

// 获取支行销售明细
export async function getBranchSalesDetail(startDate: string, endDate: string) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return { success: false, message: '请先登录' }
  }

  if (session.role !== 'PROJECT_MANAGER' && session.role !== 'SUPER_ADMIN') {
    return { success: false, message: '只有项目经理或系统管理员可以查看统计数据' }
  }

  try {
    const where: any = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }

    // 项目经理只能查看自己组织的数据
    if (session.role === 'PROJECT_MANAGER') {
      if (!session.organizationId) {
        return { success: false, message: '项目经理未关联组织' }
      }
      where.organizationId = session.organizationId
    }
    // SUPER_ADMIN 可以查看所有组织的数据

    const reports = await prisma.dailyReport.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        performances: true,
      },
    })

    // 按支行和经理汇总
    const branchStats = new Map<
      string,
      Map<
        string,
        {
          outsideGold: number
          demand: number
          deposit: number
          wealth: number
          loan: number
          gold: number
          insurance: number
          fund: number
          creditCard: number
        }
      >
    >()

    reports.forEach((report) => {
      report.performances.forEach((perf) => {
        const branch = perf.branch || '未指定支行'
        const managerName = report.user.name

        if (!branchStats.has(branch)) {
          branchStats.set(branch, new Map())
        }

        const branchMap = branchStats.get(branch)!
        if (!branchMap.has(managerName)) {
          branchMap.set(managerName, {
            outsideGold: 0,
            demand: 0,
            deposit: 0,
            wealth: 0,
            loan: 0,
            gold: 0,
            insurance: 0,
            fund: 0,
            creditCard: 0,
          })
        }

        const managerData = branchMap.get(managerName)!
        managerData.outsideGold += Number(perf.outsideGold)
        managerData.demand += Number(perf.demand)
        managerData.deposit += Number(perf.deposit)
        managerData.wealth += Number(perf.wealth)
        managerData.loan += Number(perf.loan)
        managerData.gold += Number(perf.gold)
        managerData.insurance += Number(perf.insurance)
        managerData.fund += Number(perf.fund)
        managerData.creditCard += Number(perf.creditCard)
      })
    })

    // 转换为数组格式
    const result = Array.from(branchStats.entries()).map(([branch, managers]) => ({
      branch,
      managers: Array.from(managers.entries()).map(([name, data]) => ({
        name,
        ...data,
      })),
    }))

    return {
      success: true,
      branchSales: result,
    }
  } catch (error) {
    console.error('获取支行销售明细失败:', error)
    return { success: false, message: '获取支行销售明细失败' }
  }
}
