'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/lib/actions/auth'
import {
  updateUser,
  deleteUser,
  resetUserPassword,
} from '@/lib/actions/organization'

interface User {
  id: string
  username: string
  name: string
  role: 'SUPER_ADMIN' | 'DIRECT_MANAGER' | 'PROJECT_MANAGER'
  organizationId: string | null
  phone: string | null
  isActive: boolean
  createdAt: Date
  organization?: {
    id: string
    name: string
    code: string
  } | null
  _count?: {
    dailyReports: number
  }
}

interface Organization {
  id: string
  name: string
  code: string
  isActive: boolean
}

interface Props {
  initialUsers: User[]
  organizations: Organization[]
}

export default function UsersClient({ initialUsers, organizations }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // 表单状态
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'DIRECT_MANAGER' as 'SUPER_ADMIN' | 'DIRECT_MANAGER' | 'PROJECT_MANAGER',
    organizationId: '',
    isActive: true,
    phone: '',
  })

  // 筛选状态
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterOrg, setFilterOrg] = useState<string>('all')

  // 重置表单
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'DIRECT_MANAGER',
      organizationId: '',
      isActive: true,
      phone: '',
    })
    setIsEditing(false)
    setEditingId(null)
  }

  // 创建用户
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await createUser(
        formData.username,
        formData.password,
        formData.name,
        formData.role,
        formData.role === 'SUPER_ADMIN' ? null : formData.organizationId || null,
        formData.phone || undefined
      )
      setMessage(result.message)
      setMessageType(result.success ? 'success' : 'error')

      if (result.success) {
        resetForm()
        router.refresh()
      }
    })
  }

  // 编辑用户
  const handleEdit = (user: User) => {
    setIsEditing(true)
    setEditingId(user.id)
    setFormData({
      username: user.username || '',
      password: '', // 编辑时不显示密码
      name: user.name || '',
      role: user.role,
      organizationId: user.organizationId || '',
      isActive: user.isActive ?? true,
      phone: user.phone || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 更新用户
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    startTransition(async () => {
      const result = await updateUser(editingId, {
        username: formData.username,
        name: formData.name,
        role: formData.role,
        organizationId: formData.role === 'SUPER_ADMIN' ? null : formData.organizationId || null,
        isActive: formData.isActive,
        phone: formData.phone || undefined,
      })
      setMessage(result.message)
      setMessageType(result.success ? 'success' : 'error')

      if (result.success) {
        resetForm()
        router.refresh()
      }
    })
  }

  // 删除用户
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除用户"${name}"吗？此操作会同时删除该用户的所有日报数据！`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteUser(id)
      setMessage(result.message)
      setMessageType(result.success ? 'success' : 'error')

      if (result.success) {
        router.refresh()
      }
    })
  }

  // 重置密码
  const handleResetPassword = async (id: string, username: string) => {
    const newPassword = prompt(`请输入用户"${username}"的新密码（至少6个字符）：`)
    if (!newPassword) return

    if (newPassword.length < 6) {
      alert('密码至少需要6个字符')
      return
    }

    startTransition(async () => {
      const result = await resetUserPassword(id, newPassword)
      setMessage(result.message)
      setMessageType(result.success ? 'success' : 'error')
    })
  }

  // 筛选用户
  const filteredUsers = initialUsers.filter((user) => {
    if (filterRole !== 'all' && user.role !== filterRole) return false
    if (filterOrg !== 'all') {
      if (filterOrg === 'null' && user.organizationId !== null) return false
      if (filterOrg !== 'null' && user.organizationId !== filterOrg) return false
    }
    return true
  })

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '系统管理员'
      case 'PROJECT_MANAGER':
        return '项目经理'
      case 'DIRECT_MANAGER':
        return '直营经理'
      default:
        return role
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                ← 返回
              </a>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">
                用户管理
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        {/* 提示消息 */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-base ${
              messageType === 'success'
                ? 'bg-green-50 text-green-700 border-2 border-green-200'
                : 'bg-red-50 text-red-700 border-2 border-red-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* 创建/编辑表单 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isEditing ? '编辑用户' : '创建新用户'}
          </h2>
          <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  用户名 *
                </label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="登录账号"
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              {!isEditing && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    密码 *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="至少6个字符"
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required={!isEditing}
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="真实姓名"
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  角色 *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as any,
                      organizationId: e.target.value === 'SUPER_ADMIN' ? '' : formData.organizationId,
                    })
                  }
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="DIRECT_MANAGER">直营经理</option>
                  <option value="PROJECT_MANAGER">项目经理</option>
                  <option value="SUPER_ADMIN">系统管理员</option>
                </select>
              </div>

              {formData.role !== 'SUPER_ADMIN' && (
                <div>
                  <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-2">
                    所属组织 *
                  </label>
                  <select
                    id="organizationId"
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required={formData.role !== 'SUPER_ADMIN'}
                  >
                    <option value="">请选择组织</option>
                    {organizations
                      .filter((org) => org.isActive)
                      .map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.code})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  手机号
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="选填"
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  启用账号
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isPending ? '处理中...' : isEditing ? '更新用户' : '创建用户'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition"
                >
                  取消
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">按角色筛选</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部角色</option>
                <option value="SUPER_ADMIN">系统管理员</option>
                <option value="PROJECT_MANAGER">项目经理</option>
                <option value="DIRECT_MANAGER">直营经理</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">按组织筛选</label>
              <select
                value={filterOrg}
                onChange={(e) => setFilterOrg(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部组织</option>
                <option value="null">无组织（系统管理员）</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              用户列表 ({filteredUsers.length} / {initialUsers.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所属组织
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    手机号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日报数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'PROJECT_MANAGER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.organization?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._count?.dailyReports || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.username)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        重置密码
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {initialUsers.length === 0 ? '暂无用户数据' : '没有符合条件的用户'}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
