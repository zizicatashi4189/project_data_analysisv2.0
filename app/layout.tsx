import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '私域营销业绩统计系统 V2.0',
  description: '基于最先进技术栈的多人协作业绩统计系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
