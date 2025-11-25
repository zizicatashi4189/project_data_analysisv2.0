import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { SessionData, sessionOptions } from './lib/session'

// 不需要认证的路径
const publicPaths = ['/login', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 如果是公开路径，直接放行
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // 检查 session
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  // 如果未登录，重定向到登录页
  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// 配置需要运行中间件的路径
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
