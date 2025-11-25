import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { logout } from '@/lib/actions/auth'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - 移动端优化 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">
                浦发广分业绩统计系统
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">V2.0</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.name}</p>
                <p className="text-xs text-gray-500">
                  {session.role === 'DIRECT_MANAGER' ? '直营经理' : '项目经理'}
                </p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition active:scale-95"
                >
                  退出
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 - 移动端优化间距 */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 欢迎信息 - 移动端优化 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 sm:p-6 border-2 border-blue-200 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2">
            欢迎回来，{session.name}！
          </h3>
          <p className="text-sm sm:text-base text-blue-700">
            {session.role === 'DIRECT_MANAGER'
              ? '您可以开始录入今日的业绩数据，或查看历史记录。'
              : '您可以查看所有直营经理的业绩数据，进行统计分析。'}
          </p>
        </div>

        {/* 快捷操作卡片 - 移动端单列布局 */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
          {/* 直营经理功能 */}
          {session.role === 'DIRECT_MANAGER' && (
            <>
              <a
                href="/submit"
                className="bg-white rounded-xl shadow-md p-6 sm:p-8 hover:shadow-lg transition active:scale-95 cursor-pointer"
              >
                <div className="text-5xl sm:text-6xl mb-4">📝</div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  提交业绩
                </h2>
                <p className="text-base text-gray-600">录入今日业绩数据</p>
              </a>

              <a
                href="/history"
                className="bg-white rounded-xl shadow-md p-6 sm:p-8 hover:shadow-lg transition active:scale-95 cursor-pointer"
              >
                <div className="text-5xl sm:text-6xl mb-4">📊</div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  历史记录
                </h2>
                <p className="text-base text-gray-600">查看我的业绩记录</p>
              </a>
            </>
          )}

          {/* 项目经理功能 */}
          {session.role === 'PROJECT_MANAGER' && (
            <>
              <a
                href="/overview"
                className="bg-white rounded-xl shadow-md p-6 sm:p-8 hover:shadow-lg transition active:scale-95 cursor-pointer"
              >
                <div className="text-5xl sm:text-6xl mb-4">📈</div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  业绩概览
                </h2>
                <p className="text-base text-gray-600">查看所有经理业绩</p>
              </a>

              <a
                href="/statistics"
                className="bg-white rounded-xl shadow-md p-6 sm:p-8 hover:shadow-lg transition active:scale-95 cursor-pointer"
              >
                <div className="text-5xl sm:text-6xl mb-4">📊</div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  统计分析
                </h2>
                <p className="text-base text-gray-600">业绩数据分析</p>
              </a>
            </>
          )}

          {/* 个人中心 - 所有用户 */}
          <a
            href="/profile"
            className="bg-white rounded-xl shadow-md p-6 sm:p-8 hover:shadow-lg transition active:scale-95 cursor-pointer"
          >
            <div className="text-5xl sm:text-6xl mb-4">👤</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              个人中心
            </h2>
            <p className="text-base text-gray-600">查看和编辑个人信息</p>
          </a>
        </div>
      </div>
    </main>
  )
}
