import React, { useState, useEffect } from 'react'
import { Users, Check, X, Clock } from 'lucide-react'
import groupBudgetService from '../../services/groupBudgetService'
import { TabunganBersamaInvitation as GroupBudgetInvitation } from '../../services/groupBudgetService'

interface GroupBudgetInvitationsProps {
  onClose: () => void
}

const GroupBudgetInvitations: React.FC<GroupBudgetInvitationsProps> = ({ onClose }) => {
  const [invitations, setInvitations] = useState<GroupBudgetInvitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      setLoading(true)
      const data = await groupBudgetService.getUserInvitations()
      setInvitations(data)
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await groupBudgetService.acceptInvitation(invitationId)
      setInvitations(invitations.filter(inv => inv.id !== invitationId))
    } catch (error) {
      console.error('Error accepting invitation:', error)
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await groupBudgetService.declineInvitation(invitationId)
      setInvitations(invitations.filter(inv => inv.id !== invitationId))
    } catch (error) {
      console.error('Error declining invitation:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-4">
          <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No pending invitations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tabungan Bersama Invitations</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {invitation.tabunganBersama.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Invited by {invitation.inviter.name}
                </p>
                {invitation.tabunganBersama.category && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-500">
                      {invitation.tabunganBersama.category.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>{formatDate(invitation.invitedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAcceptInvitation(invitation.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check size={14} />
                Accept
              </button>
              <button
                onClick={() => handleDeclineInvitation(invitation.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                <X size={14} />
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GroupBudgetInvitations 