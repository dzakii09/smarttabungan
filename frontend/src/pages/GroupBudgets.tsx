import React, { useState, useEffect } from 'react'
import { Plus, Search, Users, Calendar, DollarSign, Trash2, Edit, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import groupBudgetService, { GroupBudget, CreateGroupBudgetData, User } from '../services/groupBudgetService'
import { categoryService } from '../services/categoryService'

interface Category {
  id: string
  name: string
  type: string
}

const GroupBudgets: React.FC = () => {
  const navigate = useNavigate()
  const [groupBudgets, setGroupBudgets] = useState<GroupBudget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedGroupBudget, setSelectedGroupBudget] = useState<GroupBudget | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)

  // Form states
  const [formData, setFormData] = useState<CreateGroupBudgetData>({
    name: '',
    description: '',
    amount: 0,
    period: 'monthly',
    duration: 1,
    startDate: new Date().toISOString().split('T')[0], // Default to today
    endDate: '',
    categoryId: '',
    invitedEmails: []
  })

  const [inviteEmail, setInviteEmail] = useState('')

  // Calculate target per period and end date
  const calculatePeriodDetails = () => {
    const { amount, period, duration, startDate } = formData
    const start = new Date(startDate)
    const targetPerPeriod = amount / duration
    
    let end = new Date(start)
    if (period === 'daily') {
      end.setDate(start.getDate() + duration - 1)
    } else if (period === 'weekly') {
      end.setDate(start.getDate() + (duration * 7) - 1)
    } else if (period === 'monthly') {
      end.setMonth(start.getMonth() + duration)
      end.setDate(0) // Last day of the month
    }
    
    return {
      targetPerPeriod: Math.round(targetPerPeriod),
      endDate: end.toISOString().split('T')[0]
    }
  }

  const { targetPerPeriod, endDate } = calculatePeriodDetails()

  // Update end date when period or duration changes
  const handlePeriodChange = (newPeriod: string) => {
    const { endDate: newEndDate } = calculatePeriodDetails()
    setFormData(prev => ({
      ...prev,
      period: newPeriod as any,
      endDate: newEndDate
    }))
  }

  const handleDurationChange = (newDuration: number) => {
    const { endDate: newEndDate } = calculatePeriodDetails()
    setFormData(prev => ({
      ...prev,
      duration: newDuration,
      endDate: newEndDate
    }))
  }

  useEffect(() => {
    loadData()
    
    // Debug: Check authentication status on component mount
    const token = localStorage.getItem('token');
    console.log('🔍 Debug: GroupBudgets component mounted');
    console.log('🔍 Debug: Token exists:', !!token);
    if (token) {
      console.log('🔍 Debug: Token preview:', token.substring(0, 50) + '...');
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [budgetsData, categoriesData] = await Promise.all([
        groupBudgetService.getGroupBudgets(),
        categoryService.getAll()
      ])
      setGroupBudgets(budgetsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroupBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Debug: Check authentication status
    const token = localStorage.getItem('token');
    console.log('🔍 Debug: Creating group budget...');
    console.log('🔍 Debug: Token exists:', !!token);
    console.log('🔍 Debug: Form data:', formData);
    
    try {
      const newGroupBudget = await groupBudgetService.createGroupBudget(formData)
      setGroupBudgets([newGroupBudget, ...groupBudgets])
      setShowCreateModal(false)
      setFormData({
        name: '',
        description: '',
        amount: 0,
        period: 'monthly',
        duration: 1,
        startDate: new Date().toISOString().split('T')[0], // Default to today
        endDate: '',
        categoryId: '',
        invitedEmails: []
      })
    } catch (error) {
      console.error('Error creating group budget:', error)
    }
  }

  const handleDeleteGroupBudget = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this group budget?')) {
      try {
        await groupBudgetService.deleteGroupBudget(id)
        setGroupBudgets(groupBudgets.filter(budget => budget.id !== id))
      } catch (error) {
        console.error('Error deleting group budget:', error)
      }
    }
  }

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const results = await groupBudgetService.searchUsers(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleInviteUser = async () => {
    if (!selectedGroupBudget || !inviteEmail) return

    try {
      await groupBudgetService.inviteUser(selectedGroupBudget.id, inviteEmail)
      setShowInviteModal(false)
      setInviteEmail('')
      setSelectedGroupBudget(null)
      // Reload group budgets to get updated invitations
      loadData()
    } catch (error) {
      console.error('Error inviting user:', error)
    }
  }

  const filteredGroupBudgets = groupBudgets.filter(budget =>
    budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    budget.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const getProgressPercentage = (spent: number, amount: number) => {
    return Math.min((spent / amount) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Hitung progress konfirmasi member per periode
  const getConfirmationProgress = (budget: GroupBudget) => {
    if (!budget.periods || budget.periods.length === 0) return 0
    const totalMembers = budget.members.length
    const totalPeriods = budget.periods.length
    let totalConfirm = 0
    budget.periods.forEach(period => {
      const confirmations = (period as any).GroupBudgetPeriodConfirmation || []
      totalConfirm += confirmations.filter((c: any) => c.confirmedAt).length
    })
    const totalNeeded = totalMembers * totalPeriods
    return totalNeeded === 0 ? 0 : (totalConfirm / totalNeeded) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Budgets</h1>
          <p className="text-gray-600">Manage shared budgets with other users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Group Budget
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search group budgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Group Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroupBudgets.map((budget) => {
          const progressPercentage = getConfirmationProgress(budget)
          const progressColor = getProgressColor(progressPercentage)

          return (
            <div key={budget.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{budget.name}</h3>
                  {budget.description && (
                    <p className="text-sm text-gray-600">{budget.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/group-budgets/${budget.id}`)}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGroupBudget(budget)
                      setShowInviteModal(true)
                    }}
                    className="text-green-600 hover:text-green-700"
                    title="Invite User"
                  >
                    <Users size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroupBudget(budget.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600 capitalize">
                    {budget.period} • {budget.duration} {budget.period}
                    {budget.duration > 1 ? 's' : ''} • {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                  </span>
                </div>

                {budget.category && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">{budget.category.name}</span>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress Konfirmasi</span>
                    <span>{getConfirmationProgress(budget).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(getConfirmationProgress(budget))}`}
                      style={{ width: `${getConfirmationProgress(budget)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Members */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Members ({budget.members.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {budget.members.slice(0, 3).map((member) => (
                      <span
                        key={member.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {member.user.name}
                      </span>
                    ))}
                    {budget.members.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{budget.members.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Creator */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Created by:</span>
                    <span className="text-xs font-medium text-gray-700">{budget.creator.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredGroupBudgets.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No group budgets</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new group budget.
          </p>
        </div>
      )}

      {/* Create Group Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Create Group Budget</h2>
            <form onSubmit={handleCreateGroupBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  required
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration || ''}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Target per period info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">Target per {formData.period}</span>
                </div>
                <div className="text-lg font-bold text-blue-900">
                  Rp {targetPerPeriod.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Total: {formData.amount.toLocaleString('id-ID')} ÷ {formData.duration} {formData.period}
                  {formData.duration > 1 ? 's' : ''}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Auto-calculated)</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && selectedGroupBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Invite User to "{selectedGroupBudget.name}"</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value)
                      handleSearchUsers(e.target.value)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Search Results */}
              {searching && (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setInviteEmail(user.email)
                        setSearchResults([])
                      }}
                    >
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false)
                    setSelectedGroupBudget(null)
                    setInviteEmail('')
                    setSearchResults([])
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInviteUser}
                  disabled={!inviteEmail}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupBudgets 