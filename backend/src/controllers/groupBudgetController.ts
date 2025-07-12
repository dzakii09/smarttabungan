import { Request, Response } from 'express'
import prisma from '../utils/database'
import { sendNotification } from '../services/notificationService'

// Create group budget
export const createGroupBudget = async (req: Request, res: Response) => {
  try {
    const { name, description, amount, period, startDate, endDate, categoryId, invitedEmails } = req.body
    const userId = (req as any).user.id

    // Create group budget
    const groupBudget = await prisma.groupBudget.create({
      data: {
        name,
        description,
        amount: parseFloat(amount),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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

    // Send invitations if emails provided
    if (invitedEmails && invitedEmails.length > 0) {
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

    res.status(201).json({
      message: 'Group budget created successfully',
      groupBudget
    })
  } catch (error) {
    console.error('Create group budget error:', error)
    res.status(500).json({ message: 'Server error' })
  }
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
        invitations: true
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
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
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