import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react'
import groupBudgetService, { GroupBudget, GroupBudgetPeriod, AddGroupBudgetTransactionData } from '../services/groupBudgetService'

const GroupBudgetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [groupBudget, setGroupBudget] = useState<GroupBudget | null>(null)
  const [periods, setPeriods] = useState<GroupBudgetPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<GroupBudgetPeriod | null>(null)
  const [transactionData, setTransactionData] = useState<AddGroupBudgetTransactionData>({
    groupBudgetId: id || '',
    periodId: '',
    amount: 0,
    description: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [periodConfirmations, setPeriodConfirmations] = useState<Record<string, Array<{userId: string, name: string, confirmedAt: string | null}>>>({})

  useEffect(() => {
    if (id) {
      loadGroupBudgetDetail()
    }
  }, [id])

  useEffect(() => {
    // Ambil userId dari token/localStorage (atau dari API /auth/me jika ada)
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserId(payload.id || payload.userId || null)
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (periods.length > 0) {
      periods.forEach(async (period) => {
        const confirmations = await groupBudgetService.getPeriodConfirmations(period.id)
        setPeriodConfirmations(prev => ({ ...prev, [period.id]: confirmations }))
      })
    }
  }, [periods])

  const loadGroupBudgetDetail = async () => {
    try {
      setLoading(true)
      const [budgetData, periodsData] = await Promise.all([
        groupBudgetService.getGroupBudgetById(id!),
        groupBudgetService.getGroupBudgetPeriods(id!)
      ])
      setGroupBudget(budgetData)
      setPeriods(periodsData)
    } catch (error) {
      console.error('Error loading group budget detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPeriod) return

    try {
      const response = await groupBudgetService.addGroupBudgetTransaction({
        ...transactionData,
        periodId: selectedPeriod.id
      })

      // Show warning if transaction is late
      if (response.isLate) {
        alert(`⚠️ Transaksi terlambat!\n\n${response.warning}\n\nTransaksi tetap berhasil ditambahkan.`)
      } else {
        alert('✅ Transaksi berhasil ditambahkan!')
      }

      // Reload periods to get updated data
      const updatedPeriods = await groupBudgetService.getGroupBudgetPeriods(id!)
      setPeriods(updatedPeriods)

      // Reset form
      setTransactionData({
        groupBudgetId: id || '',
        periodId: '',
        amount: 0,
        description: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      })
      setShowTransactionModal(false)
      setSelectedPeriod(null)
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('❌ Gagal menambahkan transaksi. Silakan coba lagi.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Check if period is active or ended
  const getPeriodStatus = (period: GroupBudgetPeriod) => {
    const now = new Date()
    const endDate = new Date(period.endDate)
    const isEnded = now > endDate
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      isActive: !isEnded,
      isEnded,
      daysLeft: isEnded ? 0 : daysLeft,
      statusText: isEnded ? 'Berakhir' : daysLeft <= 3 ? 'Hampir Berakhir' : 'Aktif'
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Berakhir': return 'text-red-600 bg-red-50'
      case 'Hampir Berakhir': return 'text-orange-600 bg-orange-50'
      default: return 'text-green-600 bg-green-50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!groupBudget) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Group Budget Not Found</h2>
          <button
            onClick={() => navigate('/tabungan-bersama')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Group Budgets
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/tabungan-bersama')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{groupBudget.name}</h1>
          <p className="text-gray-600">{groupBudget.description}</p>
        </div>
      </div>

      {/* Group Budget Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold">Total Budget</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(groupBudget.amount)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Spent: {formatCurrency(groupBudget.spent)}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold">Duration</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {groupBudget.duration} {groupBudget.period}
            {groupBudget.duration > 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatDate(groupBudget.startDate)} - {formatDate(groupBudget.endDate)}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold">Members</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {groupBudget.members.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Created by {groupBudget.creator.name}
          </div>
        </div>
      </div>

      {/* Periods */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Periods</h2>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Transaction
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {periods.map((period) => {
            const status = getPeriodStatus(period)
            const confirmations = periodConfirmations[period.id] || []
            const userConfirmation = confirmations.find(c => c.userId === userId)
            return (
              <div key={period.id} className="bg-white rounded-lg p-6 shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Period {period.periodNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </p>
                    {/* Status Badge */}
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(status.statusText)}`}>
                      {status.statusText}
                      {status.daysLeft > 0 && status.daysLeft <= 7 && (
                        <span className="ml-1">• {status.daysLeft} hari lagi</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPeriod(period)
                      setTransactionData(prev => ({
                        ...prev,
                        periodId: period.id
                      }))
                      setShowTransactionModal(true)
                    }}
                    className={`text-sm font-medium ${
                      status.isEnded 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                    disabled={status.isEnded}
                    title={status.isEnded ? 'Periode sudah berakhir' : 'Tambah transaksi'}
                  >
                    {status.isEnded ? 'Periode Berakhir' : 'Add Transaction'}
                  </button>
                </div>

                {/* Tabel konfirmasi member */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Konfirmasi Setoran Member</h4>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-1 px-2 text-left">Nama</th>
                        <th className="py-1 px-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmations.map(member => {
                        let statusText = 'Belum Konfirmasi'
                        let statusColor = 'text-gray-500'
                        let isLate = false
                        if (member.confirmedAt) {
                          const confirmedDate = new Date(member.confirmedAt)
                          const periodEnd = new Date(period.endDate)
                          isLate = confirmedDate > periodEnd
                          statusText = isLate ? 'Terlambat' : 'Terkonfirmasi'
                          statusColor = isLate ? 'text-red-600' : 'text-green-600'
                        }
                        return (
                          <tr key={member.userId}>
                            <td className="py-1 px-2">{member.name}</td>
                            <td className={`py-1 px-2 font-semibold ${statusColor}`}>
                              {member.confirmedAt ? (
                                <>
                                  {statusText} {isLate && <span title="Terlambat">⚠️</span>} <span className="text-xs">({formatDate(member.confirmedAt!)})</span>
                                </>
                              ) : (
                                statusText
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {/* Tombol konfirmasi hanya untuk user login yang belum konfirmasi */}
                  {!userConfirmation?.confirmedAt && (
                    <button
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={async () => {
                        await groupBudgetService.confirmPeriod(period.id)
                        const confirmations = await groupBudgetService.getPeriodConfirmations(period.id)
                        setPeriodConfirmations(prev => ({ ...prev, [period.id]: confirmations }))
                        alert('Konfirmasi setoran berhasil!')
                      }}
                    >
                      Konfirmasi Setoran
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium">{formatCurrency(period.budget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium">{formatCurrency(period.spent)}</span>
                    </div>
                  </div>

                  {/* Progress berdasarkan konfirmasi member */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress Konfirmasi</span>
                      {(() => {
                        const totalMembers = confirmations.length
                        const confirmedMembers = confirmations.filter(m => m.confirmedAt).length
                        const progress = totalMembers === 0 ? 0 : (confirmedMembers / totalMembers) * 100
                        return (
                          <span className={`font-medium ${
                            progress >= 100 ? 'text-green-600' :
                            progress >= 80 ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {progress.toFixed(1)}% ({confirmedMembers}/{totalMembers} konfirmasi)
                          </span>
                        )
                      })()}
                    </div>
                    {(() => {
                      const totalMembers = confirmations.length
                      const confirmedMembers = confirmations.filter(m => m.confirmedAt).length
                      const progress = totalMembers === 0 ? 0 : (confirmedMembers / totalMembers) * 100
                      return (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Transactions */}
                  {period.transactions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Transactions</h4>
                      <div className="space-y-2">
                        {period.transactions.slice(0, 3).map((transaction) => (
                          <div key={transaction.id} className="flex justify-between items-center text-sm">
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-gray-500">{formatDate(transaction.date)}</div>
                            </div>
                            <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Add Transaction {selectedPeriod && `- Period ${selectedPeriod.periodNumber}`}
            </h2>
            
            {/* Period Status Warning */}
            {selectedPeriod && (() => {
              const status = getPeriodStatus(selectedPeriod)
              if (status.isEnded) {
                return (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <span className="text-sm font-medium">⚠️ Periode Sudah Berakhir</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Periode ini sudah berakhir pada {formatDate(selectedPeriod.endDate)}. 
                      Transaksi tetap bisa ditambahkan tapi akan ditandai sebagai terlambat.
                    </p>
                  </div>
                )
              } else if (status.daysLeft <= 3) {
                return (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <span className="text-sm font-medium">⏰ Periode Hampir Berakhir</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      Periode ini akan berakhir dalam {status.daysLeft} hari. 
                      Pastikan untuk menambahkan transaksi sebelum periode berakhir.
                    </p>
                  </div>
                )
              }
              return null
            })()}
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  required
                  value={transactionData.amount || ''}
                  onChange={(e) => setTransactionData({ ...transactionData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={transactionData.type}
                  onChange={(e) => setTransactionData({ ...transactionData, type: e.target.value as 'income' | 'expense' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={transactionData.date}
                  onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionModal(false)
                    setSelectedPeriod(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupBudgetDetail 