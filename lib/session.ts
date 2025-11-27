// Session 配置和管理
import { SessionOptions } from 'iron-session'

export interface SessionData {
  userId: string
  username: string
  name: string
  role: 'SUPER_ADMIN' | 'DIRECT_MANAGER' | 'PROJECT_MANAGER'
  organizationId: string | null  // null for SUPER_ADMIN
  organizationName: string | null  // null for SUPER_ADMIN
  isLoggedIn: boolean
}

export const defaultSession: SessionData = {
  userId: '',
  username: '',
  name: '',
  role: 'DIRECT_MANAGER',
  organizationId: null,
  organizationName: null,
  isLoggedIn: false,
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'performance-system-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
  },
}
