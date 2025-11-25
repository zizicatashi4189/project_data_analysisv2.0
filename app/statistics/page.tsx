import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { format } from 'date-fns'
import StatisticsClient from './StatisticsClient'

export default async function StatisticsPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/login')
  }

  if (session.role !== 'PROJECT_MANAGER') {
    redirect('/dashboard')
  }

  // 默认显示今天的数据
  const today = format(new Date(), 'yyyy-MM-dd')

  return <StatisticsClient initialDate={today} userName={session.name} />
}
