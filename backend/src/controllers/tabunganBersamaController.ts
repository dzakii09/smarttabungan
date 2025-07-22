import { Request, Response } from 'express'
import prisma from '../utils/database'
import { sendNotification } from '../services/notificationService'

// Create group budget
export const createTabunganBersama = async (req: Request, res: Response) => {
  try {
    console.log('=== CREATE TABUNGAN BERSAMA START ===')
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
    console.log('Creating tabungan bersama in database...')
    const tabunganBersama = await prisma.groupBudget.create({
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

    console.log('Tabungan bersama created successfully:', tabunganBersama.id)

    // Create periods automatically
    console.log('Creating periods...')
    const periods = await createTabunganBersamaPeriods(tabunganBersama.id, {
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
            groupBudgetId: tabunganBersama.id,
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
            title: 'Undangan Tabungan Bersama',
            message: `Anda diundang untuk bergabung dengan tabungan bersama "${name}"`,
            type: 'budget_invitation',
            metadata: {
              groupBudgetId: tabunganBersama.id,
              groupBudgetName: name
            }
          })
        }
      }
    }

    console.log('=== CREATE TABUNGAN BERSAMA SUCCESS ===')
    res.status(201).json({
      message: 'Tabungan bersama created successfully',
      tabunganBersama: {
        ...tabunganBersama,
        periods
      }
    })
  } catch (error) {
    console.error('=== CREATE TABUNGAN BERSAMA ERROR ===')
    console.error('Error details:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Helper function to create periods
async function createTabunganBersamaPeriods(
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
export const getTabunganBersamas = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const tabunganBersamas = await prisma.groupBudget.findMany({
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

    res.json(tabunganBersamas)
  } catch (error) {
    console.error('Get tabungan bersamas error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get group budget by ID
export const getTabunganBersamaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const tabunganBersama = await prisma.groupBudget.findFirst({
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

    if (!tabunganBersama) {
      return res.status(404).json({ message: 'Tabungan bersama not found' })
    }

    res.json(tabunganBersama)
  } catch (error) {
    console.error('Get tabungan bersama by ID error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update group budget
export const updateTabunganBersama = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, amount, period, duration, startDate, endDate, categoryId } = req.body
    const userId = (req as any).user.id

    // Check if user is owner
    const existingTabunganBersama = await prisma.groupBudget.findFirst({
      where: {
        id,
        createdBy: userId
      }
    })

    if (!existingTabunganBersama) {
      return res.status(404).json({ message: 'Tabungan bersama not found or you are not the owner' })
    }

    const updatedTabunganBersama = await prisma.groupBudget.update({
      where: { id },
      data: {
        name,
        description,
        amount: parseFloat(amount),
        period,
        duration: duration || 1,
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
      message: 'Tabungan bersama updated successfully',
      tabunganBersama: updatedTabunganBersama
    })
  } catch (error) {
    console.error('Update tabungan bersama error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete group budget
export const deleteTabunganBersama = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    // Check if user is owner
    const existingTabunganBersama = await prisma.groupBudget.findFirst({
      where: {
        id,
        createdBy: userId
      }
    })

    if (!existingTabunganBersama) {
      return res.status(404).json({ message: 'Tabungan bersama not found or you are not the owner' })
    }

    await prisma.groupBudget.delete({
      where: { id }
    })

    res.json({ message: 'Tabungan bersama deleted successfully' })
  } catch (error) {
    console.error('Delete tabungan bersama error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Search users for invitation
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
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ],
        NOT: { id: userId }
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

    // Check if user is member of the group budget
    const groupBudget = await prisma.groupBudget.findFirst({
      where: {
        id: groupBudgetId,
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
      }
    })

    if (!groupBudget) {
      return res.status(404).json({ message: 'Tabungan bersama not found or you are not a member' })
    }

    // Check if user already exists
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user is already a member
    const existingMember = await prisma.groupBudgetMember.findFirst({
      where: {
        groupBudgetId,
        userId: invitedUser.id
      }
    })

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' })
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.groupBudgetInvitation.findFirst({
      where: {
        groupBudgetId,
        email
      }
    })

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent' })
    }

    // Create invitation
    const invitation = await prisma.groupBudgetInvitation.create({
      data: {
        email,
        groupBudgetId,
        invitedBy: userId
      }
    })

    // Send notification
    await sendNotification({
      userId: invitedUser.id,
      title: 'Undangan Tabungan Bersama',
      message: `Anda diundang untuk bergabung dengan tabungan bersama "${groupBudget.name}"`,
      type: 'budget_invitation',
      metadata: {
        groupBudgetId,
        groupBudgetName: groupBudget.name
      }
    })

    res.json({
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
      include: {
        groupBudget: true
      }
    })

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    if (invitation.email !== (req as any).user.email) {
      return res.status(403).json({ message: 'You can only accept your own invitations' })
    }

    // Add user as member
    await prisma.groupBudgetMember.create({
      data: {
        groupBudgetId: invitation.groupBudgetId,
        userId,
        role: 'member'
      }
    })

    // Delete invitation
    await prisma.groupBudgetInvitation.delete({
      where: { id: invitationId }
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

    if (invitation.email !== (req as any).user.email) {
      return res.status(403).json({ message: 'You can only decline your own invitations' })
    }

    await prisma.groupBudgetInvitation.delete({
      where: { id: invitationId }
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
    const userEmail = (req as any).user.email

    const invitations = await prisma.groupBudgetInvitation.findMany({
      where: {
        email: userEmail
      },
              include: {
          groupBudget: {
            include: {
              creator: true
            }
          },
          inviter: true
        },
      orderBy: { createdAt: 'desc' }
    })

    res.json(invitations)
  } catch (error) {
    console.error('Get user invitations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Add transaction to group budget
export const addTabunganBersamaTransaction = async (req: Request, res: Response) => {
  try {
    const { groupBudgetId } = req.params
    const { amount, description, type, date, periodId } = req.body
    const userId = (req as any).user.id

    // Check if user is member of the group budget
    const groupBudget = await prisma.groupBudget.findFirst({
      where: {
        id: groupBudgetId,
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
        periods: true
      }
    })

    if (!groupBudget) {
      return res.status(404).json({ message: 'Tabungan bersama not found or you are not a member' })
    }

    // Validate period
    const period = await prisma.groupBudgetPeriod.findFirst({
      where: {
        id: periodId,
        groupBudgetId
      }
    })

    if (!period) {
      return res.status(404).json({ message: 'Period not found' })
    }

    // Create transaction
    const transaction = await prisma.groupBudgetTransaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        date: new Date(date),
        groupBudgetId,
        periodId,
        createdBy: userId
      }
    })

    // Update period spent amount
    const newSpent = period.spent + parseFloat(amount)
    await prisma.groupBudgetPeriod.update({
      where: { id: periodId },
      data: { spent: newSpent }
    })

    // Update group budget total spent
    const totalSpent = groupBudget.periods.reduce((sum, p) => sum + p.spent, 0) + parseFloat(amount)
    await prisma.groupBudget.update({
      where: { id: groupBudgetId },
      data: { spent: totalSpent }
    })

    res.json({
      message: 'Transaction added successfully',
      transaction
    })
  } catch (error) {
    console.error('Add tabungan bersama transaction error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get group budget periods
export const getTabunganBersamaPeriods = async (req: Request, res: Response) => {
  try {
    const { groupBudgetId } = req.params
    const userId = (req as any).user.id

    // Check if user is member of the group budget
    const groupBudget = await prisma.groupBudget.findFirst({
      where: {
        id: groupBudgetId,
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
      }
    })

    if (!groupBudget) {
      return res.status(404).json({ message: 'Tabungan bersama not found or you are not a member' })
    }

    const periods = await prisma.groupBudgetPeriod.findMany({
      where: { groupBudgetId },
      include: {
        transactions: {
          include: {
            creator: true
          }
        },
        GroupBudgetPeriodConfirmation: true
      },
      orderBy: { periodNumber: 'asc' }
    })

    res.json(periods)
  } catch (error) {
    console.error('Get tabungan bersama periods error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get group budget period by ID
export const getTabunganBersamaPeriodById = async (req: Request, res: Response) => {
  try {
    const { periodId } = req.params
    const userId = (req as any).user.id

    const period = await prisma.groupBudgetPeriod.findFirst({
      where: {
        id: periodId,
        groupBudget: {
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
        }
      },
      include: {
        groupBudget: true,
        transactions: {
          include: {
            creator: true
          }
        },
        GroupBudgetPeriodConfirmation: true
      }
    })

    if (!period) {
      return res.status(404).json({ message: 'Period not found' })
    }

    res.json(period)
  } catch (error) {
    console.error('Get tabungan bersama period by ID error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Confirm group budget period
export const confirmTabunganBersamaPeriod = async (req: Request, res: Response) => {
  try {
    console.log('=== CONFIRM PERIOD START ===')
    const { periodId } = req.params
    const { confirmed } = req.body
    const userId = (req as any).user.id
    
    console.log('Period ID:', periodId)
    console.log('Confirmed:', confirmed)
    console.log('User ID:', userId)

    // Check if user is member of the group budget
    const period = await prisma.groupBudgetPeriod.findFirst({
      where: {
        id: periodId,
        groupBudget: {
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
        }
      }
    })

    if (!period) {
      return res.status(404).json({ message: 'Period not found or you are not a member' })
    }

    // Create or update confirmation
    console.log('Creating/updating confirmation...')
    const confirmation = await prisma.groupBudgetPeriodConfirmation.upsert({
      where: {
        periodId_userId: {
          periodId,
          userId
        }
      },
      update: {
        confirmedAt: confirmed ? new Date() : null
      },
      create: {
        periodId,
        userId,
        confirmedAt: confirmed ? new Date() : null
      }
    })

    console.log('Confirmation result:', confirmation)
    console.log('=== CONFIRM PERIOD END ===')

    res.json({
      message: 'Period confirmation updated successfully',
      confirmation
    })
  } catch (error) {
    console.error('Confirm tabungan bersama period error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get group budget period confirmations
export const getTabunganBersamaPeriodConfirmations = async (req: Request, res: Response) => {
  try {
    const { periodId } = req.params
    const userId = (req as any).user.id

    // Check if user is member of the group budget
    const period = await prisma.groupBudgetPeriod.findFirst({
      where: {
        id: periodId,
        groupBudget: {
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
        }
      }
    })

    if (!period) {
      return res.status(404).json({ message: 'Period not found or you are not a member' })
    }

    const confirmations = await prisma.groupBudgetPeriodConfirmation.findMany({
      where: { periodId },
      include: {
        user: true
      }
    })

    // Transform data to match frontend expectation
    const transformedConfirmations = confirmations.map(confirmation => ({
      userId: confirmation.userId,
      name: confirmation.user.name,
      confirmedAt: confirmation.confirmedAt
    }))

    res.json(transformedConfirmations)
  } catch (error) {
    console.error('Get tabungan bersama period confirmations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
} 