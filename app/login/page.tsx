'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setMessage('请输入账号和密码')
      setMessageType('error')
      return
    }

    startTransition(async () => {
      const result = await login(username, password)
      setMessage(result.message)
      setMessageType(result.success ? 'success' : 'error')

      if (result.success) {
        // 登录成功，跳转到首页
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Logo - 移动端优化字体 */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            浦发广分业绩统计
          </h1>
          <p className="text-base sm:text-lg text-gray-600">V2.0 - 移动端优先</p>
        </div>

        {/* 登录表单 - 移动端优化间距 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* 账号输入 - 移动端优化触摸目标 */}
            <div>
              <label htmlFor="username" className="block text-base font-medium text-gray-700 mb-2">
                账号
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入账号"
                autoComplete="username"
                className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* 密码输入 - 移动端优化触摸目标 */}
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* 提示信息 - 移动端优化字体 */}
            {message && (
              <div
                className={`p-4 rounded-xl text-base ${
                  messageType === 'success'
                    ? 'bg-green-50 text-green-700 border-2 border-green-200'
                    : 'bg-red-50 text-red-700 border-2 border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            {/* 登录按钮 - 移动端优化高度 */}
            <button
              type="submit"
              disabled={isPending || !username || !password}
              className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg active:scale-95"
            >
              {isPending ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 底部提示 - 移动端优化字体 */}
          <div className="mt-6 text-center text-base text-gray-500">
            <p>请使用管理员分配的账号密码登录</p>
          </div>
        </div>

        {/* 测试账号提示 - 移动端可隐藏 */}
        <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm sm:text-base text-blue-800">
          <p className="font-semibold">测试账号：</p>
          <p className="mt-1">运行初始化脚本创建测试账号</p>
          <p className="mt-1 text-xs sm:text-sm text-blue-600">
            npm run init:users
          </p>
        </div>
      </div>
    </main>
  )
}
