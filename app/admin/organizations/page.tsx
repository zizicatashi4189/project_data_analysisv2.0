import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getOrganizations } from '@/lib/actions/organization'
import OrganizationsClient from './OrganizationsClient'

export default async function OrganizationsPage() {
  const session = await getSession()

  // 权限检查：仅超级管理员可访问
  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  // 获取所有组织
  const result = await getOrganizations()

  return <OrganizationsClient initialOrganizations={result.organizations || []} />
}
