'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/lib/actions/organization'

interface Organization {
  id: string
  name: string
  code: string
  isActive: boolean
  createdAt: Date
  _count?: {
    users: number
    dailyReports: number
  }
}

interface Props {
  initialOrganizations: Organization[]
}

export default function OrganizationsClient({ initialOrganizations }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [organizations, setOrganizations] = useState(initialOrganizations)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // 表单状态
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    isActive: true,
  })

  // 重置表单
  const resetForm = () => {
    setFormData({ name: '', code: '', isActive: true })
    setIsEditing(false)
    setEditingId(null)
  }

  // 创建组织
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await createOrganization(formData.name, formData.code)
      setMessage(result.message)
      setMessageType(result.success ? 'success' : 'error')

      if (result.success) {
        resetForm()
        router.refresh()
      }
    })
  }

  // 编辑组织
  const handleEdit = (org: Organization) => {
    setIsEditing(true)
    setEditingId(org.id)
    setFormData({
      name: org.name,
      code: org.code,
      isActive: org.isActive,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 更新组织
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    startTransition(async () => {
      const result = await updateOrganization(
        editingId,
        formData.name,
        formData.code,
        formData.isActive
      )
      setMessage(result.message)
      setMessageType(result.success ? 'success' : 'error')

      if (result.success) {
        resetForm()
        router.refresh()
      }
    })
  }

  // 删除组织
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除组织"${name}"吗？此操作不可恢复！`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteOrganization(id)
      setMessage(result.message)
      setMessageType(result.success ? 'success' : 'error')

      if (result.success) {
        router.refresh()
      }
    })
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
                组织管理
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
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
            {isEditing ? '编辑组织' : '创建新组织'}
          </h2>
          <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  组织名称 *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：XX银行"
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  组织代码 *
                </label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="如：XX_BANK"
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">唯一标识，只能包含字母、数字和下划线</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                启用该组织
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isPending ? '处理中...' : isEditing ? '更新组织' : '创建组织'}
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

        {/* 组织列表 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              组织列表 ({initialOrganizations.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    组织名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    组织代码
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户数
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
                {initialOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{org.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          org.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {org.isActive ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {org._count?.users || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {org._count?.dailyReports || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(org)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(org.id, org.name)}
                        className="text-red-600 hover:text-red-900"
                        disabled={
                          (org._count?.users || 0) > 0 || (org._count?.dailyReports || 0) > 0
                        }
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {initialOrganizations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                暂无组织数据，请创建第一个组织
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
