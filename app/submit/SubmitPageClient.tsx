'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  submitDailyReport,
  getDailyReportByDate,
  deletePerformance,
  deleteOpportunity,
  updatePerformance,
  updateOpportunity,
} from '@/lib/actions/dailyReport'
import { logout } from '@/lib/actions/auth'
import { format } from 'date-fns'

// 业绩记录类型
type PerformanceItem = {
  id?: string
  outsideGold: string
  demand: string
  deposit: string
  wealth: string
  loan: string
  gold: string
  insurance: string
  fund: string
  creditCard: string
  branch: string
  product: string
}

// 商机记录类型
type OpportunityItem = {
  id?: string
  category: string
  count: string
}

export default function SubmitPageClient({
  initialData,
  initialDate,
}: {
  initialData: any
  initialDate: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // 基本信息
  const [date, setDate] = useState(initialDate)

  // 企微运营指标
  const [importedCustomers, setImportedCustomers] = useState(
    initialData?.importedCustomers?.toString() || ''
  )
  const [certifiedCustomers, setCertifiedCustomers] = useState(
    initialData?.certifiedCustomers?.toString() || ''
  )
  const [todayCoverage, setTodayCoverage] = useState(
    initialData?.todayCoverage?.toString() || ''
  )
  const [todayReplies, setTodayReplies] = useState(
    initialData?.todayReplies?.toString() || ''
  )

  // 业绩记录数组
  const [performances, setPerformances] = useState<PerformanceItem[]>(
    initialData?.performances?.map((p: any) => ({
      id: p.id,
      outsideGold: p.outsideGold.toString(),
      demand: p.demand.toString(),
      deposit: p.deposit.toString(),
      wealth: p.wealth.toString(),
      loan: p.loan.toString(),
      gold: p.gold.toString(),
      insurance: p.insurance.toString(),
      fund: p.fund.toString(),
      creditCard: p.creditCard.toString(),
      branch: p.branch,
      product: p.product,
    })) || []
  )

  // 商机记录数组
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(
    initialData?.opportunities?.map((o: any) => ({
      id: o.id,
      category: o.category,
      count: o.count.toString(),
    })) || []
  )

  // 弹窗状态
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false)
  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false)

  // 编辑模式状态
  const [editingPerformanceIndex, setEditingPerformanceIndex] = useState<number | null>(null)
  const [editingOpportunityIndex, setEditingOpportunityIndex] = useState<number | null>(null)

  // 弹窗中的临时表单数据
  const [tempPerformance, setTempPerformance] = useState<PerformanceItem>({
    outsideGold: '',
    demand: '',
    deposit: '',
    wealth: '',
    loan: '',
    gold: '',
    insurance: '',
    fund: '',
    creditCard: '',
    branch: '',
    product: '',
  })

  const [tempOpportunity, setTempOpportunity] = useState<OpportunityItem>({
    category: '',
    count: '',
  })

  // 提示信息
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // 监听 props 变化，同步更新 state
  useEffect(() => {
    setDate(initialDate)

    // 更新企微指标
    setImportedCustomers(initialData?.importedCustomers?.toString() || '')
    setCertifiedCustomers(initialData?.certifiedCustomers?.toString() || '')
    setTodayCoverage(initialData?.todayCoverage?.toString() || '')
    setTodayReplies(initialData?.todayReplies?.toString() || '')

    // 更新业绩记录
    if (initialData?.performances && initialData.performances.length > 0) {
      setPerformances(
        initialData.performances.map((p: any) => ({
          id: p.id,
          outsideGold: p.outsideGold.toString(),
          demand: p.demand.toString(),
          deposit: p.deposit.toString(),
          wealth: p.wealth.toString(),
          loan: p.loan.toString(),
          gold: p.gold.toString(),
          insurance: p.insurance.toString(),
          fund: p.fund.toString(),
          creditCard: p.creditCard.toString(),
          branch: p.branch,
          product: p.product,
        }))
      )
    } else {
      setPerformances([])
    }

    // 更新商机记录
    if (initialData?.opportunities && initialData.opportunities.length > 0) {
      setOpportunities(
        initialData.opportunities.map((o: any) => ({
          id: o.id,
          category: o.category,
          count: o.count.toString(),
        }))
      )
    } else {
      setOpportunities([])
    }
  }, [initialDate, initialData])

  // 判断是否今天
  const isToday = date === format(new Date(), 'yyyy-MM-dd')

  // 日期切换
  const changeDate = (days: number) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + days)
    const newDateStr = format(newDate, 'yyyy-MM-dd')
    router.push(`/submit?date=${newDateStr}`)
  }

  // 统一的数据重新加载函数
  const reloadData = async () => {
    const result = await getDailyReportByDate(date)
    if (result.success && result.report) {
      // 回显企微指标
      setImportedCustomers(result.report.importedCustomers?.toString() || '')
      setCertifiedCustomers(result.report.certifiedCustomers?.toString() || '')
      setTodayCoverage(result.report.todayCoverage?.toString() || '')
      setTodayReplies(result.report.todayReplies?.toString() || '')

      // 回显业绩记录
      if (result.report.performances && result.report.performances.length > 0) {
        setPerformances(
          result.report.performances.map((p: any) => ({
            id: p.id,
            outsideGold: p.outsideGold.toString(),
            demand: p.demand.toString(),
            deposit: p.deposit.toString(),
            wealth: p.wealth.toString(),
            loan: p.loan.toString(),
            gold: p.gold.toString(),
            insurance: p.insurance.toString(),
            fund: p.fund.toString(),
            creditCard: p.creditCard.toString(),
            branch: p.branch,
            product: p.product,
          }))
        )
      } else {
        setPerformances([])
      }

      // 回显商机记录
      if (result.report.opportunities && result.report.opportunities.length > 0) {
        setOpportunities(
          result.report.opportunities.map((o: any) => ({
            id: o.id,
            category: o.category,
            count: o.count.toString(),
          }))
        )
      } else {
        setOpportunities([])
      }
    } else {
      // 没有数据时重置为空
      setPerformances([])
      setOpportunities([])
      setImportedCustomers('')
      setCertifiedCustomers('')
      setTodayCoverage('')
      setTodayReplies('')
    }
  }

  // 打开业绩弹窗（新增模式）
  const openPerformanceDialog = () => {
    setEditingPerformanceIndex(null)
    setTempPerformance({
      outsideGold: '',
      demand: '',
      deposit: '',
      wealth: '',
      loan: '',
      gold: '',
      insurance: '',
      fund: '',
      creditCard: '',
      branch: '',
      product: '',
    })
    setShowPerformanceDialog(true)
  }

  // 编辑业绩记录
  const handleEditPerformance = (index: number) => {
    setEditingPerformanceIndex(index)
    setTempPerformance(performances[index])
    setShowPerformanceDialog(true)
  }

  // 保存业绩到数据库（新增或编辑）
  const handleAddPerformance = async () => {
    // 验证至少有一个字段不为空
    const hasNumbers =
      Number(tempPerformance.outsideGold) !== 0 ||
      Number(tempPerformance.demand) !== 0 ||
      Number(tempPerformance.deposit) !== 0 ||
      Number(tempPerformance.wealth) !== 0 ||
      Number(tempPerformance.loan) !== 0 ||
      Number(tempPerformance.gold) !== 0 ||
      Number(tempPerformance.insurance) !== 0 ||
      Number(tempPerformance.fund) !== 0 ||
      Number(tempPerformance.creditCard) !== 0

    const hasText = tempPerformance.branch.trim() !== '' || tempPerformance.product.trim() !== ''

    if (!hasNumbers && !hasText) {
      alert('请至少填写一个业绩数据或文本字段')
      return
    }

    startTransition(async () => {
      if (editingPerformanceIndex !== null && tempPerformance.id) {
        // 编辑模式：更新现有记录
        const result = await updatePerformance(tempPerformance.id, {
          outsideGold: Number(tempPerformance.outsideGold) || 0,
          demand: Number(tempPerformance.demand) || 0,
          deposit: Number(tempPerformance.deposit) || 0,
          wealth: Number(tempPerformance.wealth) || 0,
          loan: Number(tempPerformance.loan) || 0,
          gold: Number(tempPerformance.gold) || 0,
          insurance: Number(tempPerformance.insurance) || 0,
          fund: Number(tempPerformance.fund) || 0,
          creditCard: Number(tempPerformance.creditCard) || 0,
          branch: tempPerformance.branch,
          product: tempPerformance.product,
        })

        if (result.success) {
          setMessage('业绩更新成功')
          setMessageType('success')
          setEditingPerformanceIndex(null)
          // 重新加载所有数据
          await reloadData()
        } else {
          setMessage(result.message)
          setMessageType('error')
        }
      } else {
        // 新增模式：添加新记录
        const result = await submitDailyReport({
          date,
          performances: [
            {
              outsideGold: Number(tempPerformance.outsideGold) || 0,
              demand: Number(tempPerformance.demand) || 0,
              deposit: Number(tempPerformance.deposit) || 0,
              wealth: Number(tempPerformance.wealth) || 0,
              loan: Number(tempPerformance.loan) || 0,
              gold: Number(tempPerformance.gold) || 0,
              insurance: Number(tempPerformance.insurance) || 0,
              fund: Number(tempPerformance.fund) || 0,
              creditCard: Number(tempPerformance.creditCard) || 0,
              branch: tempPerformance.branch,
              product: tempPerformance.product,
            },
          ],
          opportunities: [],
        })

        if (result.success) {
          setMessage('业绩添加成功')
          setMessageType('success')
          // 重新加载所有数据
          await reloadData()
        } else {
          setMessage(result.message)
          setMessageType('error')
        }
      }

      setShowPerformanceDialog(false)
      setTimeout(() => setMessage(''), 3000)
    })
  }

  // 删除业绩记录
  const removePerformance = async (index: number) => {
    const performance = performances[index]
    if (!performance.id) {
      return
    }

    if (!confirm('确认删除这条业绩记录吗？')) {
      return
    }

    startTransition(async () => {
      const result = await deletePerformance(performance.id!)
      if (result.success) {
        setMessage('业绩删除成功')
        setMessageType('success')
        setPerformances(performances.filter((_, i) => i !== index))
      } else {
        setMessage(result.message)
        setMessageType('error')
      }
      setTimeout(() => setMessage(''), 3000)
    })
  }

  // 打开商机弹窗（新增模式）
  const openOpportunityDialog = () => {
    setEditingOpportunityIndex(null)
    setTempOpportunity({
      category: '',
      count: '',
    })
    setShowOpportunityDialog(true)
  }

  // 编辑商机记录
  const handleEditOpportunity = (index: number) => {
    setEditingOpportunityIndex(index)
    setTempOpportunity(opportunities[index])
    setShowOpportunityDialog(true)
  }

  // 保存商机到数据库（新增或编辑）
  const handleAddOpportunity = async () => {
    if (tempOpportunity.category.trim() === '' || tempOpportunity.count.trim() === '') {
      alert('请填写商机类别和数量')
      return
    }

    startTransition(async () => {
      if (editingOpportunityIndex !== null && tempOpportunity.id) {
        // 编辑模式：更新现有记录
        const result = await updateOpportunity(tempOpportunity.id, {
          category: tempOpportunity.category,
          count: Number(tempOpportunity.count),
        })

        if (result.success) {
          setMessage('商机更新成功')
          setMessageType('success')
          setEditingOpportunityIndex(null)
          // 重新加载所有数据
          await reloadData()
        } else {
          setMessage(result.message)
          setMessageType('error')
        }
      } else {
        // 新增模式：添加新记录
        const result = await submitDailyReport({
          date,
          performances: [],
          opportunities: [
            {
              category: tempOpportunity.category,
              count: Number(tempOpportunity.count),
            },
          ],
        })

        if (result.success) {
          setMessage('商机添加成功')
          setMessageType('success')
          // 重新加载所有数据
          await reloadData()
        } else {
          setMessage(result.message)
          setMessageType('error')
        }
      }

      setShowOpportunityDialog(false)
      setTimeout(() => setMessage(''), 3000)
    })
  }

  // 删除商机记录
  const removeOpportunity = async (index: number) => {
    const opportunity = opportunities[index]
    if (!opportunity.id) {
      return
    }

    if (!confirm('确认删除这条商机记录吗？')) {
      return
    }

    startTransition(async () => {
      const result = await deleteOpportunity(opportunity.id!)
      if (result.success) {
        setMessage('商机删除成功')
        setMessageType('success')
        setOpportunities(opportunities.filter((_, i) => i !== index))
      } else {
        setMessage(result.message)
        setMessageType('error')
      }
      setTimeout(() => setMessage(''), 3000)
    })
  }

  // 保存企微运营指标
  const handleSaveWeChatMetrics = async () => {
    startTransition(async () => {
      const result = await submitDailyReport({
        date,
        // 企微指标
        importedCustomers: importedCustomers ? Number(importedCustomers) : null,
        certifiedCustomers: certifiedCustomers ? Number(certifiedCustomers) : null,
        todayCoverage: todayCoverage ? Number(todayCoverage) : null,
        todayReplies: todayReplies ? Number(todayReplies) : null,
        // 业绩和商机为空数组（不影响已有数据）
        performances: [],
        opportunities: [],
      })

      setMessage(result.success ? '企微运营指标保存成功' : result.message)
      setMessageType(result.success ? 'success' : 'error')

      if (result.success) {
        setTimeout(() => {
          setMessage('')
        }, 3000)
      }
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="flex justify-between items-center h-14 px-4">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="text-base text-gray-600 hover:text-gray-900 transition active:scale-95"
            >
              返回
            </a>
            <h1 className="text-lg font-bold text-gray-900">提交日报</h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition active:scale-95"
            >
              退出
            </button>
          </form>
        </div>
      </nav>

      {/* 日期选择区 */}
      <div className="bg-white border-b-2 border-gray-200 p-4 sticky top-14 z-40">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => changeDate(-1)}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition active:scale-95"
          >
            昨天
          </button>
          <div className="text-base font-bold text-center">
            <div>{format(new Date(date), 'yyyy年MM月dd日')}</div>
            {isToday && <span className="text-xs text-blue-600 font-normal">今天</span>}
          </div>
          <button
            onClick={() => changeDate(1)}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition active:scale-95"
          >
            明天
          </button>
        </div>
      </div>

      {/* 提示信息 */}
      {message && (
        <div
          className={`mx-4 mt-4 p-3 rounded-lg text-sm ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700 border-2 border-green-200'
              : 'bg-red-50 text-red-700 border-2 border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* 主内容区域 */}
      <div className="px-4 py-4 space-y-4">
        {/* 企微运营指标区 */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-900">企微运营指标（日终填写）</h2>
            <button
              onClick={handleSaveWeChatMetrics}
              disabled={isPending}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50"
            >
              {isPending ? '保存中...' : '保存'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">已导入企微客户</label>
              <input
                type="number"
                value={importedCustomers}
                onChange={(e) => setImportedCustomers(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">已认证企微</label>
              <input
                type="number"
                value={certifiedCustomers}
                onChange={(e) => setCertifiedCustomers(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">今日覆盖客户</label>
              <input
                type="number"
                value={todayCoverage}
                onChange={(e) => setTodayCoverage(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">企微回复客户</label>
              <input
                type="number"
                value={todayReplies}
                onChange={(e) => setTodayReplies(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 业绩记录区 */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-900">业绩记录</h2>
            <button
              type="button"
              onClick={openPerformanceDialog}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition active:scale-95"
            >
              + 添加业绩
            </button>
          </div>

          {performances.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              暂无业绩记录，点击上方按钮添加
            </div>
          ) : (
            <div className="space-y-3">
              {performances.map((perf, index) => (
                <div
                  key={index}
                  onClick={() => handleEditPerformance(index)}
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm">{perf.branch || '未填写支行'}</p>
                      {perf.product && <p className="text-xs text-gray-600">{perf.product}</p>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removePerformance(index)
                      }}
                      className="text-red-600 text-xs px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition active:scale-95"
                    >
                      删除
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {Number(perf.outsideGold) > 0 && (
                      <span className="text-gray-700">
                        行外吸金: <span className="font-semibold">{perf.outsideGold}万</span>
                      </span>
                    )}
                    {Number(perf.demand) > 0 && (
                      <span className="text-gray-700">
                        活期: <span className="font-semibold">{perf.demand}万</span>
                      </span>
                    )}
                    {Number(perf.deposit) > 0 && (
                      <span className="text-gray-700">
                        存款: <span className="font-semibold">{perf.deposit}万</span>
                      </span>
                    )}
                    {Number(perf.wealth) > 0 && (
                      <span className="text-gray-700">
                        理财: <span className="font-semibold">{perf.wealth}万</span>
                      </span>
                    )}
                    {Number(perf.loan) > 0 && (
                      <span className="text-gray-700">
                        贷款: <span className="font-semibold">{perf.loan}万</span>
                      </span>
                    )}
                    {Number(perf.gold) > 0 && (
                      <span className="text-gray-700">
                        黄金: <span className="font-semibold">{perf.gold}万</span>
                      </span>
                    )}
                    {Number(perf.insurance) > 0 && (
                      <span className="text-gray-700">
                        保险: <span className="font-semibold">{perf.insurance}万</span>
                      </span>
                    )}
                    {Number(perf.fund) > 0 && (
                      <span className="text-gray-700">
                        基金: <span className="font-semibold">{perf.fund}万</span>
                      </span>
                    )}
                    {Number(perf.creditCard) > 0 && (
                      <span className="text-gray-700">
                        信用卡: <span className="font-semibold">{perf.creditCard}户</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 商机记录区 */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-900">商机记录</h2>
            <button
              type="button"
              onClick={openOpportunityDialog}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition active:scale-95"
            >
              + 添加商机
            </button>
          </div>

          {opportunities.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">暂无商机记录，点击上方按钮添加</div>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp, index) => (
                <div
                  key={index}
                  onClick={() => handleEditOpportunity(index)}
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:border-green-500 hover:shadow-md transition"
                >
                  <div>
                    <p className="font-bold text-sm">{opp.category}</p>
                    <p className="text-xs text-gray-600">{opp.count} 笔</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeOpportunity(index)
                    }}
                    className="text-red-600 text-xs px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition active:scale-95"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 业绩弹窗 */}
      {showPerformanceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto pb-20 animate-slide-up">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {editingPerformanceIndex !== null ? '编辑业绩' : '添加业绩'}
              </h3>
              <button
                onClick={() => {
                  setShowPerformanceDialog(false)
                  setEditingPerformanceIndex(null)
                }}
                className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    行外吸金（万元）
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempPerformance.outsideGold}
                    onChange={(e) =>
                      setTempPerformance({
                        ...tempPerformance,
                        outsideGold: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">活期（万元）</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempPerformance.demand}
                    onChange={(e) =>
                      setTempPerformance({ ...tempPerformance, demand: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">存款（万元）</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempPerformance.deposit}
                    onChange={(e) =>
                      setTempPerformance({ ...tempPerformance, deposit: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">理财（万元）</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempPerformance.wealth}
                    onChange={(e) =>
                      setTempPerformance({ ...tempPerformance, wealth: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">贷款（万元）</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempPerformance.loan}
                    onChange={(e) =>
                      setTempPerformance({ ...tempPerformance, loan: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">黄金（万元）</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempPerformance.gold}
                    onChange={(e) =>
                      setTempPerformance({ ...tempPerformance, gold: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">保险（万元）</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempPerformance.insurance}
                    onChange={(e) =>
                      setTempPerformance({
                        ...tempPerformance,
                        insurance: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">基金（万元）</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempPerformance.fund}
                    onChange={(e) =>
                      setTempPerformance({ ...tempPerformance, fund: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    信用卡开户（户）
                  </label>
                  <input
                    type="number"
                    value={tempPerformance.creditCard}
                    onChange={(e) =>
                      setTempPerformance({
                        ...tempPerformance,
                        creditCard: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属支行</label>
                <input
                  type="text"
                  value={tempPerformance.branch}
                  onChange={(e) =>
                    setTempPerformance({ ...tempPerformance, branch: e.target.value })
                  }
                  placeholder="请输入支行名称"
                  className="w-full px-3 py-3 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
                <input
                  type="text"
                  value={tempPerformance.product}
                  onChange={(e) =>
                    setTempPerformance({ ...tempPerformance, product: e.target.value })
                  }
                  placeholder="请输入产品名称"
                  className="w-full px-3 py-3 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4">
              <button
                onClick={handleAddPerformance}
                className="w-full py-4 bg-blue-600 text-white text-base font-bold rounded-xl active:scale-95 transition"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 商机弹窗 */}
      {showOpportunityDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto pb-20 animate-slide-up">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {editingOpportunityIndex !== null ? '编辑商机' : '添加商机'}
              </h3>
              <button
                onClick={() => {
                  setShowOpportunityDialog(false)
                  setEditingOpportunityIndex(null)
                }}
                className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商机类别</label>
                <input
                  type="text"
                  value={tempOpportunity.category}
                  onChange={(e) =>
                    setTempOpportunity({ ...tempOpportunity, category: e.target.value })
                  }
                  placeholder="如：存款商机、理财商机"
                  className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数量（笔）</label>
                <input
                  type="number"
                  value={tempOpportunity.count}
                  onChange={(e) =>
                    setTempOpportunity({ ...tempOpportunity, count: e.target.value })
                  }
                  placeholder="0"
                  className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4">
              <button
                onClick={handleAddOpportunity}
                className="w-full py-4 bg-green-600 text-white text-base font-bold rounded-xl active:scale-95 transition"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加弹窗动画样式 */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </main>
  )
}
