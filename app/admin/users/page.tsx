import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getAllUsers, getOrganizations } from '@/lib/actions/organization'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const session = await getSession()

  // 权限检查：仅超级管理员可访问
  if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  // 获取所有用户和组织
  const [usersResult, orgsResult] = await Promise.all([
    getAllUsers(),
    getOrganizations(),
  ])

  return (
    <UsersClient
      initialUsers={usersResult.users || []}
      organizations={orgsResult.organizations || []}
    />
  )
}
