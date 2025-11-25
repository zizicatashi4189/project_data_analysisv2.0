// 认证工具函数
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { SessionData, defaultSession, sessionOptions } from './session'

// 获取当前 session
export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return defaultSession
  }

  return session
}

// 检查是否已登录
export async function isAuthenticated() {
  const session = await getSession()
  return session.isLoggedIn
}
