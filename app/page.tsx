export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Logo / Title - 移动端优化字体大小 */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight">
              私域营销业绩统计系统
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600">V2.0 - 移动端优先</p>
          </div>

          {/* Tech Stack - 移动端优化网格布局 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">技术栈</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { name: 'Next.js', version: '15.1' },
                { name: 'React', version: '19.0' },
                { name: 'TypeScript', version: '5.7' },
                { name: 'Tailwind CSS', version: '3.4' },
                { name: 'Supabase', version: 'Latest' },
                { name: 'Prisma', version: 'Latest' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200"
                >
                  <div className="font-semibold text-blue-900 text-base">{tech.name}</div>
                  <div className="text-sm text-blue-600">{tech.version}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features - 移动端优化为单列 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
              <div className="text-4xl mb-3 sm:mb-4">👥</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">多人协作</h3>
              <p className="text-base text-gray-600">直营经理自主录入，实时协作</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
              <div className="text-4xl mb-3 sm:mb-4">⚡</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">极速体验</h3>
              <p className="text-base text-gray-600">Server Actions + Turbopack</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
              <div className="text-4xl mb-3 sm:mb-4">🔒</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">安全可靠</h3>
              <p className="text-base text-gray-600">Supabase 云端存储，永不丢失</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
              <div className="text-4xl mb-3 sm:mb-4">📱</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">移动优先</h3>
              <p className="text-base text-gray-600">手机为主，网页为辅</p>
            </div>
          </div>

          {/* Status - 移动端优化按钮和文字 */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 sm:p-6">
            <p className="text-green-800 font-medium text-lg sm:text-xl mb-2">
              ✅ V2.0 已完成
            </p>
            <p className="text-green-600 text-sm sm:text-base mb-4">
              账号密码登录 | 业绩提交 | 历史记录查看 | 项目经理看板
            </p>
            <div className="space-y-3">
              <a
                href="/login"
                className="block w-full sm:inline-block sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg active:scale-95"
              >
                开始使用 →
              </a>
              <p className="text-xs sm:text-sm text-green-700 mt-2">
                测试账号：zhangsan / lisi / wangwu (密码: 123456) | admin (密码: admin123)
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
