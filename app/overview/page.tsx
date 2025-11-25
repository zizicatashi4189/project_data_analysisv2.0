import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { getSession } from '@/lib/auth'
import { getAllDailyReports, getAllManagers } from '@/lib/actions/dailyReport'
import { logout } from '@/lib/actions/auth'

export default async function OverviewPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/login')
  }

  if (session.role !== 'PROJECT_MANAGER') {
    redirect('/dashboard')
  }

  const reportsResult = await getAllDailyReports()
  const managersResult = await getAllManagers()

  const reports = reportsResult.success ? reportsResult.reports : []
  const managers = managersResult.success ? managersResult.managers : []

  // 计算统计数据
  const totalReports = reports?.length || 0
  const totalManagers = managers?.length || 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - sticky, 移动端优先 */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition border-2 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-50 active:scale-95 text-sm sm:text-base"
              >
                <span className="sm:hidden">← 返回</span>
                <span className="hidden sm:inline">← 返回首页</span>
              </a>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">业绩概览</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.name}
                </p>
                <p className="text-xs text-gray-500">项目经理</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition active:scale-95"
                >
                  退出
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 - 移动端优先间距 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* 统计卡片 - 移动端单列，大图标，大数字 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="text-5xl sm:text-6xl mr-4">👥</div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">直营经理总数</p>
                <p className="text-3xl sm:text-4xl font-bold text-blue-600">{totalManagers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="text-5xl sm:text-6xl mr-4">📊</div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">日报总数</p>
                <p className="text-3xl sm:text-4xl font-bold text-green-600">{totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="text-5xl sm:text-6xl mr-4">📈</div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">平均提交率</p>
                <p className="text-3xl sm:text-4xl font-bold text-purple-600">
                  {totalManagers > 0 ? (totalReports / totalManagers).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 直营经理列表 - 移动端2列，桌面端6列，圆角卡片 */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            直营经理列表
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {managers.map((manager: any) => (
              <div
                key={manager.id}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200 hover:shadow-md transition active:scale-95"
              >
                <p className="font-semibold text-gray-900 text-sm sm:text-base">{manager.name}</p>
                <p className="text-xs text-gray-500 mt-1">@{manager.username}</p>
                <p className="text-xs sm:text-sm text-blue-600 mt-2">
                  {manager._count.dailyReports} 条日报
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 日报记录列表标题 */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            最近日报记录
          </h2>
        </div>

        {reports && reports.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {reports.map((report: any) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:shadow-lg transition"
              >
                {/* 日报头部：提交人、日期 */}
                <div className="px-4 sm:px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-blue-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                          {report.user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            {report.user.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            📅 {format(new Date(report.date), 'yyyy年MM月dd日')}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        提交时间: {format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 企微运营指标 - 移动端2列，桌面端4列 */}
                <div className="px-4 sm:px-6 py-4 border-b-2 border-gray-200">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                    📱 企微运营指标
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 border-2 border-blue-100">
                      <p className="text-xs text-blue-600 mb-1">已导入企微客户数</p>
                      <p className="text-lg sm:text-xl font-semibold text-blue-900">
                        {report.importedCustomers}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 border-2 border-green-100">
                      <p className="text-xs text-green-600 mb-1">已认证企微数</p>
                      <p className="text-lg sm:text-xl font-semibold text-green-900">
                        {report.certifiedCustomers}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 border-2 border-purple-100">
                      <p className="text-xs text-purple-600 mb-1">今日企微覆盖客户数</p>
                      <p className="text-lg sm:text-xl font-semibold text-purple-900">
                        {report.todayCoverage}
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 border-2 border-orange-100">
                      <p className="text-xs text-orange-600 mb-1">企微回复客户数</p>
                      <p className="text-lg sm:text-xl font-semibold text-orange-900">
                        {report.todayReplies}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 业绩记录 */}
                {report.performances && report.performances.length > 0 && (
                  <div className="px-4 sm:px-6 py-4 border-b-2 border-gray-200">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                      💰 业绩记录 ({report.performances.length}条)
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                      {report.performances.map((perf: any) => (
                        <div
                          key={perf.id}
                          className="bg-gray-50 rounded-xl p-3 sm:p-4 border-2 border-gray-200"
                        >
                          {/* 支行和产品 */}
                          <div className="flex gap-3 sm:gap-4 mb-3 pb-3 border-b-2 border-gray-300">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500">所属支行</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.branch || '-'}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500">产品名称</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.product || '-'}
                              </p>
                            </div>
                          </div>

                          {/* 业绩数据网格 - 移动端2列，桌面端5列 */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                            <div className="bg-white rounded-xl p-2 sm:p-3 border-2 border-gray-200">
                              <p className="text-xs text-gray-500">行外吸金</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.outsideGold} <span className="text-xs">万</span>
                              </p>
                            </div>
                            <div className="bg-white rounded-xl p-2 sm:p-3 border-2 border-gray-200">
                              <p className="text-xs text-gray-500">活期</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.demand} <span className="text-xs">万</span>
                              </p>
                            </div>
                            <div className="bg-white rounded-xl p-2 sm:p-3 border-2 border-gray-200">
                              <p className="text-xs text-gray-500">存款</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.deposit} <span className="text-xs">万</span>
                              </p>
                            </div>
                            <div className="bg-white rounded-xl p-2 sm:p-3 border-2 border-gray-200">
                              <p className="text-xs text-gray-500">理财</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.wealth} <span className="text-xs">万</span>
                              </p>
                            </div>
                            <div className="bg-white rounded-xl p-2 sm:p-3 border-2 border-gray-200">
                              <p className="text-xs text-gray-500">贷款</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.loan} <span className="text-xs">万</span>
                              </p>
                            </div>
                            <div className="bg-white rounded-xl p-2 sm:p-3 border-2 border-gray-200">
                              <p className="text-xs text-gray-500">黄金</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.gold} <span className="text-xs">万</span>
                              </p>
                            </div>
                            <div className="bg-white rounded-xl p-2 sm:p-3 border-2 border-gray-200">
                              <p className="text-xs text-gray-500">保险</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.insurance} <span className="text-xs">万</span>
                              </p>
                            </div>
                            <div className="bg-white rounded-xl p-2 sm:p-3 border-2 border-gray-200">
                              <p className="text-xs text-gray-500">基金</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-900">
                                {perf.fund} <span className="text-xs">万</span>
                              </p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-2 sm:p-3 border-2 border-blue-300">
                              <p className="text-xs text-blue-600">信用卡</p>
                              <p className="text-sm sm:text-base font-semibold text-blue-900">
                                {perf.creditCard} <span className="text-xs">户</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 商机记录 */}
                {report.opportunities && report.opportunities.length > 0 && (
                  <div className="px-4 sm:px-6 py-4">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                      🎯 商机记录 ({report.opportunities.length}条)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {report.opportunities.map((opp: any) => (
                        <div
                          key={opp.id}
                          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200"
                        >
                          <p className="text-xs text-green-600 mb-1">{opp.category}</p>
                          <p className="text-lg sm:text-xl font-semibold text-green-900">
                            {opp.count} <span className="text-xs">条</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 如果没有业绩和商机记录 */}
                {(!report.performances || report.performances.length === 0) &&
                  (!report.opportunities || report.opportunities.length === 0) && (
                    <div className="px-4 sm:px-6 py-4">
                      <p className="text-xs sm:text-sm text-gray-500 text-center">
                        该日报仅包含企微运营指标
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-4">📊</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              暂无日报记录
            </h3>
            <p className="text-sm sm:text-base text-gray-600">等待直营经理提交日报数据</p>
          </div>
        )}
      </div>
    </main>
  )
}
