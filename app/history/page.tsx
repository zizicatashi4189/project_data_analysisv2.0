import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { getSession } from '@/lib/auth'
import { getMyDailyReports, deleteDailyReport } from '@/lib/actions/dailyReport'
import { logout } from '@/lib/actions/auth'

export default async function HistoryPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/login')
  }

  if (session.role !== 'DIRECT_MANAGER') {
    redirect('/dashboard')
  }

  const result = await getMyDailyReports(50)
  const reports = result.success ? result.reports : []

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition text-sm sm:text-base"
              >
                <span className="sm:hidden">← 返回</span>
                <span className="hidden sm:inline">← 返回首页</span>
              </a>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">历史记录</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {session.name}
                </p>
                <p className="text-xs text-gray-500">直营经理</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-3 py-2 sm:px-4 sm:py-2 text-sm text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition active:scale-95"
                >
                  退出
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* 统计卡片 */}
        <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-md border-2 border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            我的日报记录
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            共 <span className="font-bold text-blue-600">{reports?.length || 0}</span> 天有填报记录
          </p>
        </div>

        {/* 日期列表 */}
        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report: any) => {
              const dateStr = format(new Date(report.date), 'yyyy-MM-dd')
              const performanceCount = report.performances?.length || 0
              const opportunityCount = report.opportunities?.length || 0

              return (
                <Link
                  key={report.id}
                  href={`/submit?date=${dateStr}`}
                  className="block bg-white rounded-xl shadow-md hover:shadow-lg transition border-2 border-gray-200 hover:border-blue-400"
                >
                  <div className="p-4 sm:p-6">
                    {/* 日期标题 */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          📅 {format(new Date(report.date), 'yyyy年MM月dd日')}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          提交于 {format(new Date(report.createdAt), 'MM-dd HH:mm')}
                        </p>
                      </div>
                      <div className="text-blue-600 text-sm font-medium">
                        查看 →
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {/* 业绩记录统计 */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border-2 border-blue-200">
                        <div className="text-xs sm:text-sm text-blue-600 mb-1">业绩记录</div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-900">
                          {performanceCount}
                          <span className="text-sm ml-1">条</span>
                        </div>
                      </div>

                      {/* 商机记录统计 */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border-2 border-green-200">
                        <div className="text-xs sm:text-sm text-green-600 mb-1">商机记录</div>
                        <div className="text-xl sm:text-2xl font-bold text-green-900">
                          {opportunityCount}
                          <span className="text-sm ml-1">条</span>
                        </div>
                      </div>

                      {/* 企微运营 */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border-2 border-purple-200">
                        <div className="text-xs sm:text-sm text-purple-600 mb-1">企微运营</div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-900">
                          {report.importedCustomers || report.certifiedCustomers || report.todayCoverage || report.todayReplies ? '已填' : '未填'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-4">📊</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              还没有日报记录
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">快去提交你的第一条日报吧！</p>
            <a
              href="/submit"
              className="inline-block w-full sm:w-auto px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg active:scale-95 border-2 border-transparent"
            >
              提交日报
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
