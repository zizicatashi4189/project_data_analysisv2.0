import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function SettingsPage() {
  const session = await getSession()

  // 权限检查：仅超级管理员可访问
  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                ← 返回
              </a>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">
                系统设置
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        {/* 系统信息 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">系统信息</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">系统名称</span>
              <span className="font-medium">私域营销业绩统计系统</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">系统版本</span>
              <span className="font-medium">V2.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">架构模式</span>
              <span className="font-medium">多租户（单数据库 + organizationId）</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">技术栈</span>
              <span className="font-medium">Next.js 15 + Prisma + PostgreSQL</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">当前管理员</span>
              <span className="font-medium">{session.name} ({session.username})</span>
            </div>
          </div>
        </div>

        {/* 功能配置（占位） */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">功能配置</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">🚧 功能开发中</p>
            <p className="text-sm">系统配置功能即将上线</p>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">快速链接</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/admin/organizations"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">🏢</span>
              <div>
                <div className="font-semibold text-gray-900">组织管理</div>
                <div className="text-sm text-gray-600">管理所有组织</div>
              </div>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">👥</span>
              <div>
                <div className="font-semibold text-gray-900">用户管理</div>
                <div className="text-sm text-gray-600">管理所有用户</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
