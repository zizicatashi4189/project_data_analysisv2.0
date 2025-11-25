'use client'

import { useState, useTransition } from 'react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { getStatistics, getBranchSalesDetail } from '@/lib/actions/statistics'
import { logout } from '@/lib/actions/auth'

type TabType = 'day' | 'week' | 'custom'

export default function StatisticsClient({
  initialDate,
  userName,
}: {
  initialDate: string
  userName: string
}) {
  const [activeTab, setActiveTab] = useState<TabType>('day')
  const [isPending, startTransition] = useTransition()

  // 日统计状态
  const [dayDate, setDayDate] = useState(initialDate)

  // 周统计状态
  const today = new Date()
  const [weekStart, setWeekStart] = useState(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'))
  const [weekEnd, setWeekEnd] = useState(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'))

  // 自定义统计状态
  const [customStart, setCustomStart] = useState(initialDate)
  const [customEnd, setCustomEnd] = useState(initialDate)

  // 统计结果状态
  const [stats, setStats] = useState<any>(null)
  const [branchSales, setBranchSales] = useState<any>(null)
  const [message, setMessage] = useState('')

  // 加载日统计
  const loadDayStats = async () => {
    startTransition(async () => {
      const result = await getStatistics(dayDate, dayDate)
      const branchResult = await getBranchSalesDetail(dayDate, dayDate)

      if (result.success) {
        setStats(result)
        setBranchSales(branchResult.success ? branchResult : null)
        setMessage('')
      } else {
        setMessage(result.message)
      }
    })
  }

  // 加载周统计
  const loadWeekStats = async () => {
    startTransition(async () => {
      const result = await getStatistics(weekStart, weekEnd)
      const branchResult = await getBranchSalesDetail(weekStart, weekEnd)

      if (result.success) {
        setStats(result)
        setBranchSales(branchResult.success ? branchResult : null)
        setMessage('')
      } else {
        setMessage(result.message)
      }
    })
  }

  // 加载自定义统计
  const loadCustomStats = async () => {
    startTransition(async () => {
      const result = await getStatistics(customStart, customEnd)
      const branchResult = await getBranchSalesDetail(customStart, customEnd)

      if (result.success) {
        setStats(result)
        setBranchSales(branchResult.success ? branchResult : null)
        setMessage('')
      } else {
        setMessage(result.message)
      }
    })
  }

  // 格式化数字
  const formatNumber = (num: number) => {
    return num > 0 ? num.toFixed(2) : '-'
  }

  // 生成企微运营文字总结
  const generateWechatTextSummary = () => {
    if (!stats) return ''

    const totalImported = stats.totals.importedCustomers
    const totalCertified = stats.totals.certifiedCustomers
    const totalRate = totalImported > 0 ? (totalCertified / totalImported * 100) : 0

    let summary = `企微客户数据情况\n`
    summary += `1.企微客户总数${totalImported}\n`
    summary += `2.认证数${totalCertified}，认证率${totalRate.toFixed(2)}%`

    return summary
  }

  // 生成销售情况文字总结
  const generateSalesTextSummary = () => {
    if (!stats) return ''

    const totals = stats.totals
    let totalCount = 0
    let bigDeals = 0

    // 计算总笔数（通过manager统计）
    stats.managerStats.forEach((manager: any) => {
      Object.values(manager.branches || {}).forEach((branch: any) => {
        totalCount++
        const totalAmount = (branch.outsideGold || 0) + (branch.deposit || 0) +
                          (branch.wealth || 0) + (branch.loan || 0) +
                          (branch.gold || 0) + (branch.insurance || 0) +
                          (branch.fund || 0)
        if (totalAmount >= 50) {
          bigDeals++
        }
      })
    })

    let summary = `销售情况\n`
    summary += `1.直营经理业绩笔数${totalCount}笔\n`

    let salesParts = []
    if (totals.totalOutsideGold > 0) salesParts.push(`行外吸金${formatNumber(totals.totalOutsideGold)}万元`)
    if (totals.totalDemand > 0) salesParts.push(`活期${formatNumber(totals.totalDemand)}万元`)
    if (totals.totalDeposit > 0) salesParts.push(`存款${formatNumber(totals.totalDeposit)}万元`)
    if (totals.totalWealth > 0) salesParts.push(`理财${formatNumber(totals.totalWealth)}万元`)
    if (totals.totalLoan > 0) salesParts.push(`贷款${formatNumber(totals.totalLoan)}万元`)
    if (totals.totalGold > 0) salesParts.push(`黄金${formatNumber(totals.totalGold)}万元`)
    if (totals.totalInsurance > 0) salesParts.push(`保险${formatNumber(totals.totalInsurance)}万元`)
    if (totals.totalFund > 0) salesParts.push(`基金${formatNumber(totals.totalFund)}万元`)

    summary += `2.${salesParts.join('、')}`
    if (bigDeals > 0) summary += `、大单${bigDeals}笔（50万及以上）`
    if (totals.totalCreditCard > 0) summary += `、信用卡开卡${totals.totalCreditCard}户`

    return summary
  }

  // 复制文字总结到剪贴板
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label}已复制到剪贴板！`)
    } catch (err) {
      alert('复制失败，请手动复制')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900 transition">
                ← 返回
              </a>
              <h1 className="text-xl font-bold text-gray-900">统计分析</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">项目经理</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  退出
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 选项卡 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('day')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'day'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              日统计
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'week'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              周统计
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              自定义统计
            </button>
          </nav>
        </div>

        {/* 日统计 */}
        {activeTab === 'day' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">选择日期：</label>
                <input
                  type="date"
                  value={dayDate}
                  onChange={(e) => setDayDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={loadDayStats}
                  disabled={isPending}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isPending ? '加载中...' : '生成统计'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 周统计 */}
        {activeTab === 'week' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">开始日期：</label>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <label className="text-sm font-medium text-gray-700">结束日期：</label>
                <input
                  type="date"
                  value={weekEnd}
                  onChange={(e) => setWeekEnd(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={loadWeekStats}
                  disabled={isPending}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isPending ? '加载中...' : '生成统计'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 自定义统计 */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">开始日期：</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <label className="text-sm font-medium text-gray-700">结束日期：</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={loadCustomStats}
                  disabled={isPending}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isPending ? '加载中...' : '生成统计'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {message && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* 统计结果 */}
        {stats && (
          <div className="space-y-6 mt-6">
            {/* 企微运营统计 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">企微运营统计</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">已导入企微客户</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totals.importedCustomers}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">已认证企微</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totals.certifiedCustomers}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">覆盖客户数</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totals.todayCoverage}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">回复客户数</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.totals.todayReplies}</p>
                  </div>
                </div>
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">文字总结</h3>
                    <button
                      onClick={() => copyToClipboard(generateWechatTextSummary(), '企微运营总结')}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      复制总结
                    </button>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {generateWechatTextSummary()}
                  </pre>
                </div>
              </div>
            </div>

            {/* 业绩汇总表 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">业绩汇总表</h2>
                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
                  导出Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        经理姓名
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        行外吸金
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        活期
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        存款
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        理财
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        贷款
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        黄金
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        保险
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        基金
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        信用卡(户)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.managerStats.map((manager: any) => (
                      <tr key={manager.managerId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {manager.managerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(manager.totalOutsideGold)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(manager.totalDemand)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(manager.totalDeposit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(manager.totalWealth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(manager.totalLoan)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(manager.totalGold)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(manager.totalInsurance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatNumber(manager.totalFund)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {manager.totalCreditCard > 0 ? manager.totalCreditCard : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-bold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">合计</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(stats.totals.totalOutsideGold)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(stats.totals.totalDemand)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(stats.totals.totalDeposit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(stats.totals.totalWealth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(stats.totals.totalLoan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(stats.totals.totalGold)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(stats.totals.totalInsurance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatNumber(stats.totals.totalFund)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {stats.totals.totalCreditCard}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">销售情况总结</h3>
                  <button
                    onClick={() => copyToClipboard(generateSalesTextSummary(), '销售情况总结')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    复制总结
                  </button>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {generateSalesTextSummary()}
                </pre>
              </div>
            </div>

            {/* 支行销售明细 */}
            {branchSales && branchSales.branchSales && branchSales.branchSales.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">支行销售明细</h2>
                </div>
                <div className="p-6 space-y-6">
                  {branchSales.branchSales.map((branch: any) => (
                    <div key={branch.branch} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-900">
                        {branch.branch}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">经理</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">行外吸金</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">活期</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">存款</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">理财</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">贷款</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">黄金</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">保险</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">基金</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">信用卡</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {branch.managers.map((manager: any) => (
                              <tr key={manager.name}>
                                <td className="px-4 py-2 text-sm text-gray-900">{manager.name}</td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">
                                  {formatNumber(manager.outsideGold)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">
                                  {formatNumber(manager.demand)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">
                                  {formatNumber(manager.deposit)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">
                                  {formatNumber(manager.wealth)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">
                                  {formatNumber(manager.loan)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">
                                  {formatNumber(manager.gold)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">
                                  {formatNumber(manager.insurance)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">
                                  {formatNumber(manager.fund)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">
                                  {manager.creditCard > 0 ? manager.creditCard : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
