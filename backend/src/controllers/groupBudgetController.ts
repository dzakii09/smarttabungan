import { Request, Response } from 'express'
import prisma from '../utils/database'
import { sendNotification } from '../services/notificationService'

// Create group budget
export const createGroupBudget = async (req: Request, res: Response) => {
  try {
    console.log('=== CREATE GROUP BUDGET START ===')
    console.log('Request body:', req.body)
    
    const { name, description, amount, period, duration, startDate, endDate, categoryId, invitedEmails } = req.body
    const userId = (req as any).user?.id
    
    console.log('User ID:', userId)
    console.log('Parsed data:', { name, description, amount, period, duration, startDate, endDate, categoryId })

    if (!userId) {
      console.error('No user ID found in request')
      return res.status(401).json({ message: 'User not authenticated' })
    }

    // Calculate end date based on duration if not provided
    let calculatedEndDate = endDate ? new Date(endDate) : null
    if (!calculatedEndDate && duration) {
      calculatedEndDate = new Date(startDate)
      if (period === 'weekly') {
        calculatedEndDate.setDate(calculatedEndDate.getDate() + (duration * 7))
      } else if (period === 'monthly') {
        calculatedEndDate.setMonth(calculatedEndDate.getMonth() + duration)
      } else if (period === 'daily') {
        calculatedEndDate.setDate(calculatedEndDate.getDate() + duration)
      }
    }

    // Create group budget
    console.log('Creating group budget in database...')
    const groupBudget = await prisma.groupBudget.create({
      data: {
        name,
        description,
        amount: parseFloat(amount),
        period,
        duration: duration || 1,
        startDate: new Date(startDate),
        endDate: calculatedEndDate || new Date(endDate),
        createdBy: userId,
        categoryId,
        members: {
          create: {
            userId,
            role: 'owner'
          }
        }
      },
      include: {
        creator: true,
        category: true,
        members: {
          include: {
            user: true
          }
        }
      }
    })

    console.log('Group budget created successfully:', groupBudget.id)

    // Create periods automatically
    console.log('Creating periods...')
    const periods = await createGroupBudgetPeriods(groupBudget.id, {
      period,
      duration: duration || 1,
      startDate: new Date(startDate),
      endDate: calculatedEndDate || new Date(endDate),
      totalAmount: parseFloat(amount)
    })

    console.log('Created', periods.length, 'periods')

    // Send invitations if emails provided
    if (invitedEmails && invitedEmails.length > 0) {
      console.log('Processing invitations for emails:', invitedEmails)
      for (const email of invitedEmails) {
        await prisma.groupBudgetInvitation.create({
          data: {
            email,
            groupBudgetId: groupBudget.id,
            invitedBy: userId
          }
        })

        // Send notification to invited user
        const invitedUser = await prisma.user.findUnique({
          where: { email }
        })

        if (invitedUser) {
          await sendNotification({
            userId: invitedUser.id,
            title: 'Undangan Budget Group',
            message: `Anda diundang untuk bergabung dengan budget group "${name}"`,
            type: 'budget_invitation',
            metadata: {
              groupBudgetId: groupBudget.id,
              groupBudgetName: name
            }
          })
        }
      }
    }

    console.log('=== CREATE GROUP BUDGET SUCCESS ===')
    res.status(201).json({
      message: 'Group budget created successfully',
      groupBudget: {
        ...groupBudget,
        periods
      }
    })
  } catch (error) {
    console.error('=== CREATE GROUP BUDGET ERROR ===')
    console.error('Error details:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Helper function to create periods
async function createGroupBudgetPeriods(
  groupBudgetId: string, 
  config: {
    period: string
    duration: number
    startDate: Date
    endDate: Date
    totalAmount: number
  }
) {
  const periods = []
  const periodAmount = config.totalAmount / config.duration

  for (let i = 0; i < config.duration; i++) {
    const periodStartDate = new Date(config.startDate)
    const periodEndDate = new Date(config.startDate)

    // Calculate period dates
    if (config.period === 'weekly') {
      periodStartDate.setDate(periodStartDate.getDate() + (i * 7))
      periodEndDate.setDate(periodEndDate.getDate() + ((i + 1) * 7) - 1)
    } else if (config.period === 'monthly') {
      periodStartDate.setMonth(periodStartDate.getMonth() + i)
      periodEndDate.setMonth(periodEndDate.getMonth() + i + 1)
      periodEndDate.setDate(0) // Last day of the month
    } else if (config.period === 'daily') {
      periodStartDate.setDate(periodStartDate.getDate() + i)
      periodEndDate.setDate(periodEndDate.getDate() + i)
    }

    const period = await prisma.groupBudgetPeriod.create({
      data: {
        groupBudgetId,
        periodNumber: i + 1,
        startDate: periodStartDate,
        endDate: periodEndDate,
        budget: periodAmount,
        spent: 0
      }
    })

    periods.push(period)
  }

  return periods
}

// Get all group budgets for user
export const getGroupBudgets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const groupBudgets = await prisma.groupBudget.findMany({
      where: {
        OR: [
          { createdBy: userId },
          {
            members: {
              some: {
                userId
              }
            }
          }
        ]
      },
      include: {
        creator: true,
        category: true,
        members: {
          include: {
            user: true
          }
        },
        invitations: true,
        periods: {
          include: {
            GroupBudgetPeriodConfirmation: true
          },
          orderBy: { periodNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(groupBudgets)
  } catch (error) {
    console.error('Get group budgets error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get group budget by ID
export const getGroupBudgetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const groupBudget = await prisma.groupBudget.findFirst({
      where: {
        id,
        OR: [
          { createdBy: userId },
          {
            members: {
              some: {
                userId
              }
            }
          }
        ]
      },
      include: {
        creator: true,
        category: true,
        members: {
          include: {
            user: true
          }
        },
        invitations: true
      }
    })

    if (!groupBudget) {
      return res.status(404).json({ message: 'Group budget not found' })
    }

    res.json(groupBudget)
  } catch (error) {
    console.error('Get group budget error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update group budget
export const updateGroupBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, amount, period, startDate, endDate, categoryId } = req.body
    const userId = (req as any).user.id

    // Check if user is owner
    const groupBudget = await prisma.groupBudget.findFirst({
      where: {
        id,
        createdBy: userId
      }
    })

    if (!groupBudget) {
      return res.status(404).json({ message: 'Group budget not found or you are not the owner' })
    }

    const updatedGroupBudget = await prisma.groupBudget.update({
      where: { id },
      data: {
        name,
        description,
        amount: parseFloat(amount),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        categoryId
      },
      include: {
        creator: true,
        category: true,
        members: {
          include: {
            user: true
          }
        }
      }
    })

    res.json({
      message: 'Group budget updated successfully',
      groupBudget: updatedGroupBudget
    })
  } catch (error) {
    console.error('Update group budget error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete group budget
export const deleteGroupBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    // Check if user is owner
    const groupBudget = await prisma.groupBudget.findFirst({
      where: {
        id,
        createdBy: userId
      }
    })

    if (!groupBudget) {
      return res.status(404).json({ message: 'Group budget not found or you are not the owner' })
    }

    await prisma.groupBudget.delete({
      where: { id }
    })

    res.json({ message: 'Group budget deleted successfully' })
  } catch (error) {
    console.error('Delete group budget error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Search users to invite
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query
    const userId = (req as any).user.id

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Query parameter is required' })
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ],
        NOT: { id: userId } // Exclude current user
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10
    })

    res.json(users)
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Invite user to group budget
export const inviteUser = async (req: Request, res: Response) => {
  try {
    const { groupBudgetId } = req.params
    const { email } = req.body
    const userId = (req as any).user.id

    // Check if user is owner or admin
    const groupBudget = await prisma.groupBudget.findFirst({
      where: {
        id: groupBudgetId,
        OR: [
          { createdBy: userId },
          {
            members: {
              some: {
                userId,
                role: { in: ['owner', 'admin'] }
              }
            }
          }
        ]
      }
    })

    if (!groupBudget) {
      return res.status(404).json({ message: 'Group budget not found or you do not have permission' })
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.groupBudgetInvitation.findUnique({
      where: {
        groupBudgetId_email: {
          groupBudgetId,
          email
        }
      }
    })

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent to this email' })
    }

    // Create invitation
    const invitation = await prisma.groupBudgetInvitation.create({
      data: {
        email,
        groupBudgetId,
        invitedBy: userId
      }
    })

    // Send notification to invited user
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    })

    if (invitedUser) {
      await sendNotification({
        userId: invitedUser.id,
        title: 'Undangan Budget Group',
        message: `Anda diundang untuk bergabung dengan budget group "${groupBudget.name}"`,
        type: 'budget_invitation',
        metadata: {
          groupBudgetId,
          groupBudgetName: groupBudget.name
        }
      })
    }

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation
    })
  } catch (error) {
    console.error('Invite user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Accept invitation
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params
    const userId = (req as any).user.id

    const invitation = await prisma.groupBudgetInvitation.findUnique({
      where: { id: invitationId },
      include: { groupBudget: true }
    })

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' })
    }

    // Update invitation status
    await prisma.groupBudgetInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'accepted',
        respondedAt: new Date()
      }
    })

    // Add user to group budget members
    await prisma.groupBudgetMember.create({
      data: {
        groupBudgetId: invitation.groupBudgetId,
        userId,
        role: 'member'
      }
    })

    res.json({ message: 'Invitation accepted successfully' })
  } catch (error) {
    console.error('Accept invitation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Decline invitation
export const declineInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params
    const userId = (req as any).user.id

    const invitation = await prisma.groupBudgetInvitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' })
    }

    await prisma.groupBudgetInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'declined',
        respondedAt: new Date()
      }
    })

    res.json({ message: 'Invitation declined successfully' })
  } catch (error) {
    console.error('Decline invitation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get user invitations
export const getUserInvitations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const invitations = await prisma.groupBudgetInvitation.findMany({
      where: {
        email: user.email,
        status: 'pending'
      },
      include: {
        groupBudget: {
          include: {
            creator: true,
            category: true
          }
        },
        inviter: true
      },
      orderBy: { invitedAt: 'desc' }
    })

    res.json(invitations)
  } catch (error) {
    console.error('Get user invitations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
} 

// Add transaction to group budget period
export const addGroupBudgetTransaction = async (req: Request, res: Response) => {
  try {
    const { groupBudgetId, periodId, amount, description, type, date } = req.body
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    // Check if user is member of the group budget
    const member = await prisma.groupBudgetMember.findFirst({
      where: {
        groupBudgetId,
        userId
      }
    })

    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this group budget' })
    }

    // Get period details to check if transaction is late
    const period = await prisma.groupBudgetPeriod.findUnique({
      where: { id: periodId },
      include: {
        groupBudget: true
      }
    })

    if (!period) {
      return res.status(404).json({ message: 'Period not found' })
    }

    const transactionDate = new Date(date)
    const periodEndDate = new Date(period.endDate)
    const isLate = transactionDate > periodEndDate

    // Create transaction
    const transaction = await prisma.groupBudgetTransaction.create({
      data: {
        groupBudgetId,
        periodId,
        amount: parseFloat(amount),
        description,
        type,
        date: transactionDate,
        createdBy: userId
      },
      include: {
        creator: true,
        period: true
      }
    })

    // Update period spent amount
    await prisma.groupBudgetPeriod.update({
      where: { id: periodId },
      data: {
        spent: {
          increment: parseFloat(amount)
        }
      }
    })

    // Update group budget total spent
    await prisma.groupBudget.update({
      where: { id: groupBudgetId },
      data: {
        spent: {
          increment: parseFloat(amount)
        }
      }
    })

    // Send notification if transaction is late
    if (isLate) {
      const daysLate = Math.ceil((transactionDate.getTime() - periodEndDate.getTime()) / (1000 * 60 * 60 * 24))
      
      await sendNotification({
        userId,
        title: '⚠️ Transaksi Terlambat',
        message: `Transaksi "${description}" untuk periode ${period.periodNumber} terlambat ${daysLate} hari. Periode berakhir pada ${periodEndDate.toLocaleDateString('id-ID')}`,
        type: 'warning',
        metadata: {
          groupBudgetId,
          periodId,
          transactionId: transaction.id,
          daysLate
        }
      })
    }

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction,
      isLate,
      warning: isLate ? `Transaksi terlambat ${Math.ceil((transactionDate.getTime() - periodEndDate.getTime()) / (1000 * 60 * 60 * 24))} hari` : null
    })
  } catch (error) {
    console.error('Add group budget transaction error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get group budget periods
export const getGroupBudgetPeriods = async (req: Request, res: Response) => {
  try {
    const { groupBudgetId } = req.params
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    // Check if user is member of the group budget
    const member = await prisma.groupBudgetMember.findFirst({
      where: {
        groupBudgetId,
        userId
      }
    })

    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this group budget' })
    }

    const periods = await prisma.groupBudgetPeriod.findMany({
      where: { groupBudgetId },
      include: {
        transactions: {
          include: {
            creator: true
          },
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { periodNumber: 'asc' }
    })

    res.json(periods)
  } catch (error) {
    console.error('Get group budget periods error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get group budget period by ID
export const getGroupBudgetPeriodById = async (req: Request, res: Response) => {
  try {
    const { periodId } = req.params
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const period = await prisma.groupBudgetPeriod.findFirst({
      where: { id: periodId },
      include: {
        groupBudget: {
          include: {
            members: {
              where: { userId }
            }
          }
        },
        transactions: {
          include: {
            creator: true
          },
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!period || period.groupBudget.members.length === 0) {
      return res.status(404).json({ message: 'Period not found or access denied' })
    }

    res.json(period)
  } catch (error) {
    console.error('Get group budget period error:', error)
    res.status(500).json({ message: 'Server error' })
  }
} 

// Konfirmasi setoran periode oleh member
export const confirmGroupBudgetPeriod = async (req: Request, res: Response) => {
  try {
    const { periodId } = req.params
    const userId = (req as any).user?.id
    if (!userId) return res.status(401).json({ message: 'User not authenticated' })

    // Cek apakah sudah pernah konfirmasi
    const existing = await prisma.groupBudgetPeriodConfirmation.findUnique({
      where: { periodId_userId: { periodId, userId } }
    })
    if (existing && existing.confirmedAt) {
      return res.status(400).json({ message: 'Sudah konfirmasi sebelumnya' })
    }

    // Konfirmasi (upsert)
    const confirmation = await prisma.groupBudgetPeriodConfirmation.upsert({
      where: { periodId_userId: { periodId, userId } },
      update: { confirmedAt: new Date() },
      create: { periodId, userId, confirmedAt: new Date() }
    })
    res.json({ message: 'Konfirmasi berhasil', confirmation })
  } catch (error) {
    console.error('Error confirmGroupBudgetPeriod:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get status konfirmasi semua member pada periode
export const getGroupBudgetPeriodConfirmations = async (req: Request, res: Response) => {
  try {
    const { periodId } = req.params
    // Ambil semua member group budget untuk periode ini
    const period = await prisma.groupBudgetPeriod.findUnique({
      where: { id: periodId },
      include: {
        groupBudget: {
          include: {
            members: { include: { user: true } }
          }
        }
      }
    })
    if (!period) return res.status(404).json({ message: 'Period not found' })
    const members = period.groupBudget.members
    // Ambil status konfirmasi masing-masing member
    const confirmations = await prisma.groupBudgetPeriodConfirmation.findMany({
      where: { periodId },
    })
    // Gabungkan data member dan konfirmasi
    const result = members.map(m => {
      const conf = confirmations.find(c => c.userId === m.userId)
      return {
        userId: m.userId,
        name: m.user.name,
        confirmedAt: conf?.confirmedAt || null
      }
    })
    res.json(result)
  } catch (error) {
    console.error('Error getGroupBudgetPeriodConfirmations:', error)
    res.status(500).json({ message: 'Server error' })
  }
} 