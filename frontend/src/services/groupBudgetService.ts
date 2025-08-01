import api from '../api'

export interface TabunganBersama {
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
  members: TabunganBersamaMember[]
  invitations: TabunganBersamaInvitation[]
  periods?: TabunganBersamaPeriod[]
}

export interface TabunganBersamaPeriod {
  id: string
  periodNumber: number
  startDate: string
  endDate: string
  budget: number
  spent: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  tabunganBersamaId: string
  transactions: TabunganBersamaTransaction[]
}

export interface TabunganBersamaTransaction {
  id: string
  amount: number
  description: string
  type: 'income' | 'expense'
  date: string
  createdAt: string
  updatedAt: string
  tabunganBersamaId: string
  periodId: string
  createdBy: string
  creator: {
    id: string
    name: string
    email: string
  }
}

export interface TabunganBersamaMember {
  id: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface TabunganBersamaInvitation {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'declined'
  invitedAt: string
  respondedAt?: string
  tabunganBersama: {
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

export interface CreateTabunganBersamaData {
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

export interface AddTabunganBersamaTransactionData {
  tabunganBersamaId: string
  periodId: string
  amount: number
  description: string
  type: 'income' | 'expense'
  date: string
}

export interface UpdateTabunganBersamaData {
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

class TabunganBersamaService {
  // Create group budget
  async createTabunganBersama(data: CreateTabunganBersamaData): Promise<TabunganBersama> {
    const response = await api.post('/group-budgets', data)
    return (response.data as any).groupBudget
  }

  // Get all group budgets
  async getTabunganBersamas(): Promise<TabunganBersama[]> {
    const token = localStorage.getItem('token')
    const response = await api.get('/group-budgets', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data as TabunganBersama[]
  }

  // Get group budget by ID
  async getTabunganBersamaById(id: string): Promise<TabunganBersama> {
    const token = localStorage.getItem('token')
    const response = await api.get(`/group-budgets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data as TabunganBersama
  }

  // Update group budget
  async updateTabunganBersama(id: string, data: UpdateTabunganBersamaData): Promise<TabunganBersama> {
    const response = await api.put(`/group-budgets/${id}`, data)
    return (response.data as any).groupBudget
  }

  // Delete group budget
  async deleteTabunganBersama(id: string): Promise<void> {
    await api.delete(`/group-budgets/${id}`)
  }

  // Get group budget periods
  async getTabunganBersamaPeriods(tabunganBersamaId: string): Promise<TabunganBersamaPeriod[]> {
    const token = localStorage.getItem('token')
    const response = await api.get(`/group-budgets/${tabunganBersamaId}/periods`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data as TabunganBersamaPeriod[]
  }

  // Get group budget period by ID
  async getTabunganBersamaPeriodById(periodId: string): Promise<TabunganBersamaPeriod> {
    const response = await api.get(`/group-budgets/periods/${periodId}`)
    return response.data as TabunganBersamaPeriod
  }

  // Add transaction to group budget period
  async addTabunganBersamaTransaction(data: AddTabunganBersamaTransactionData): Promise<any> {
    const response = await api.post(`/group-budgets/${data.tabunganBersamaId}/transactions`, data)
    return response.data
  }

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get(`/group-budgets/search/users?query=${encodeURIComponent(query)}`)
    return response.data as User[]
  }

  // Invite user to group budget
  async inviteUser(tabunganBersamaId: string, email: string): Promise<any> {
    const response = await api.post(`/group-budgets/${tabunganBersamaId}/invite`, { email })
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
  async getUserInvitations(): Promise<TabunganBersamaInvitation[]> {
    const response = await api.get('/group-budgets/invitations/user')
    return response.data as TabunganBersamaInvitation[]
  }

  // Get period confirmations (status konfirmasi semua member pada periode)
  async getPeriodConfirmations(periodId: string): Promise<Array<{userId: string, name: string, confirmedAt: string | null}>> {
    const response = await api.get(`/group-budgets/periods/${periodId}/confirmations`)
    return response.data as Array<{userId: string, name: string, confirmedAt: string | null}>
  }

  // Confirm period for current user
  async confirmPeriod(periodId: string): Promise<any> {
    const response = await api.post(`/group-budgets/periods/${periodId}/confirm`, { confirmed: true })
    return response.data
  }
}

export default new TabunganBersamaService() 