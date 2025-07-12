import api from '../api'

export interface GroupBudget {
  id: string
  name: string
  description?: string
  amount: number
  spent: number
  period: 'daily' | 'weekly' | 'monthly'
  duration: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  creator: {
    id: string
    name: string
    email: string
  }
  categoryId?: string
  category?: {
    id: string
    name: string
    type: string
  }
  members: GroupBudgetMember[]
  invitations: GroupBudgetInvitation[]
  periods?: GroupBudgetPeriod[]
}

export interface GroupBudgetPeriod {
  id: string
  periodNumber: number
  startDate: string
  endDate: string
  budget: number
  spent: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  groupBudgetId: string
  transactions: GroupBudgetTransaction[]
}

export interface GroupBudgetTransaction {
  id: string
  amount: number
  description: string
  type: 'income' | 'expense'
  date: string
  createdAt: string
  updatedAt: string
  groupBudgetId: string
  periodId: string
  createdBy: string
  creator: {
    id: string
    name: string
    email: string
  }
}

export interface GroupBudgetMember {
  id: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface GroupBudgetInvitation {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'declined'
  invitedAt: string
  respondedAt?: string
  groupBudget: {
    id: string
    name: string
    creator: {
      id: string
      name: string
    }
    category?: {
      id: string
      name: string
    }
  }
  inviter: {
    id: string
    name: string
  }
}

export interface CreateGroupBudgetData {
  name: string
  description?: string
  amount: number
  period: 'daily' | 'weekly' | 'monthly'
  duration: number
  startDate: string
  endDate?: string
  categoryId?: string
  invitedEmails?: string[]
}

export interface AddGroupBudgetTransactionData {
  groupBudgetId: string
  periodId: string
  amount: number
  description: string
  type: 'income' | 'expense'
  date: string
}

export interface UpdateGroupBudgetData {
  name?: string
  description?: string
  amount?: number
  period?: 'daily' | 'weekly' | 'monthly'
  duration?: number
  startDate?: string
  endDate?: string
  categoryId?: string
}

export interface User {
  id: string
  name: string
  email: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class GroupBudgetService {
  // Create group budget
  async createGroupBudget(data: CreateGroupBudgetData): Promise<GroupBudget> {
    const response = await api.post('/group-budgets', data)
    return (response.data as any).groupBudget
  }

  // Get all group budgets
  async getGroupBudgets(): Promise<GroupBudget[]> {
    const response = await api.get('/group-budgets')
    return response.data as GroupBudget[]
  }

  // Get group budget by ID
  async getGroupBudgetById(id: string): Promise<GroupBudget> {
    const response = await api.get(`/group-budgets/${id}`)
    return response.data as GroupBudget
  }

  // Update group budget
  async updateGroupBudget(id: string, data: UpdateGroupBudgetData): Promise<GroupBudget> {
    const response = await api.put(`/group-budgets/${id}`, data)
    return (response.data as any).groupBudget
  }

  // Delete group budget
  async deleteGroupBudget(id: string): Promise<void> {
    await api.delete(`/group-budgets/${id}`)
  }

  // Get group budget periods
  async getGroupBudgetPeriods(groupBudgetId: string): Promise<GroupBudgetPeriod[]> {
    const response = await api.get(`/group-budgets/${groupBudgetId}/periods`)
    return response.data as GroupBudgetPeriod[]
  }

  // Get group budget period by ID
  async getGroupBudgetPeriodById(periodId: string): Promise<GroupBudgetPeriod> {
    const response = await api.get(`/group-budgets/periods/${periodId}`)
    return response.data as GroupBudgetPeriod
  }

  // Add transaction to group budget period
  async addGroupBudgetTransaction(data: AddGroupBudgetTransactionData): Promise<any> {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')

    const response = await fetch(`${API_BASE_URL}/group-budgets/${data.groupBudgetId}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to add transaction')
    }

    const result = await response.json()
    return result // Returns { message, transaction, isLate, warning }
  }

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get(`/group-budgets/search/users?query=${encodeURIComponent(query)}`)
    return response.data as User[]
  }

  // Invite user to group budget
  async inviteUser(groupBudgetId: string, email: string): Promise<any> {
    const response = await api.post(`/group-budgets/${groupBudgetId}/invite`, { email })
    return response.data
  }

  // Accept invitation
  async acceptInvitation(invitationId: string): Promise<void> {
    await api.post(`/group-budgets/invitations/${invitationId}/accept`)
  }

  // Decline invitation
  async declineInvitation(invitationId: string): Promise<void> {
    await api.post(`/group-budgets/invitations/${invitationId}/decline`)
  }

  // Get user invitations
  async getUserInvitations(): Promise<GroupBudgetInvitation[]> {
    const response = await api.get('/group-budgets/invitations/user')
    return response.data as GroupBudgetInvitation[]
  }

  // Get period confirmations (status konfirmasi semua member pada periode)
  async getPeriodConfirmations(periodId: string): Promise<Array<{userId: string, name: string, confirmedAt: string | null}>> {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')
    const response = await fetch(`${API_BASE_URL}/group-budgets/periods/${periodId}/confirmations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to get confirmations')
    return await response.json()
  }

  // Confirm period for current user
  async confirmPeriod(periodId: string): Promise<any> {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')
    const response = await fetch(`${API_BASE_URL}/group-budgets/periods/${periodId}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed to confirm period')
    return await response.json()
  }
}

export default new GroupBudgetService() 