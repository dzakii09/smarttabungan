import api from '../api'

export interface GroupBudget {
  id: string
  name: string
  description?: string
  amount: number
  spent: number
  period: 'daily' | 'weekly' | 'monthly'
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
  startDate: string
  endDate: string
  categoryId?: string
  invitedEmails?: string[]
}

export interface UpdateGroupBudgetData {
  name?: string
  description?: string
  amount?: number
  period?: 'daily' | 'weekly' | 'monthly'
  startDate?: string
  endDate?: string
  categoryId?: string
}

export interface User {
  id: string
  name: string
  email: string
}

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
}

export default new GroupBudgetService() 