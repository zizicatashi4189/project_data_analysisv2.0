import { Suspense } from 'react'
import { format } from 'date-fns'
import { getDailyReportByDate } from '@/lib/actions/dailyReport'
import SubmitPageClient from './SubmitPageClient'

// Server Component - 预先获取数据
export default async function SubmitPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const date = searchParams.date || format(new Date(), 'yyyy-MM-dd')

  // 在服务器端获取数据
  const result = await getDailyReportByDate(date)

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-lg text-gray-600">加载中...</div>
        </div>
      }
    >
      <SubmitPageClient initialData={result.report} initialDate={date} />
    </Suspense>
  )
}
