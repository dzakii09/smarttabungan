import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  CreditCard, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Bank
} from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  lastSync: string;
  syncFrequency: string;
  isActive: boolean;
}

interface BankTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
  balance: number;
}

const BankIntegration: React.FC = () => {
  const { token } = useApp();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [supportedBanks, setSupportedBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);

  // Form state for connecting bank
  const [connectForm, setConnectForm] = useState({
    bankName: '',
    accountNumber: '',
    apiKey: '',
    apiSecret: ''
  });

  useEffect(() => {
    fetchSupportedBanks();
    fetchBankAccounts();
  }, []);

  const fetchSupportedBanks = async () => {
    try {
      const response = await fetch('/api/bank/supported-banks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSupportedBanks(data.data);
      }
    } catch (error) {
      console.error('Error fetching supported banks:', error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bank/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/bank/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bankName: connectForm.bankName,
          accountNumber: connectForm.accountNumber,
          credentials: {
            apiKey: connectForm.apiKey,
            apiSecret: connectForm.apiSecret
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowConnectModal(false);
        setConnectForm({ bankName: '', accountNumber: '', apiKey: '', apiSecret: '' });
        fetchBankAccounts();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error connecting bank account:', error);
      alert('Gagal menghubungkan rekening bank');
    }
  };

  const syncBankAccount = async (accountId: string) => {
    try {
      setSyncing(accountId);
      const response = await fetch(`/api/bank/sync/${accountId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchBankAccounts();
        alert(`Sinkronisasi berhasil! ${data.data.syncedTransactions} transaksi baru.`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error syncing bank account:', error);
      alert('Gagal sinkronisasi rekening bank');
    } finally {
      setSyncing(null);
    }
  };

  const disconnectBankAccount = async (accountId: string) => {
    if (!confirm('Apakah Anda yakin ingin memutuskan rekening bank ini?')) return;

    try {
      const response = await fetch(`/api/bank/disconnect/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchBankAccounts();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error disconnecting bank account:', error);
      alert('Gagal memutuskan rekening bank');
    }
  };

  const fetchTransactions = async (accountId: string) => {
    try {
      const response = await fetch(`/api/bank/transactions/${accountId}?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Integrasi Bank
          </h1>
          <p className="text-gray-600">
            Hubungkan rekening bank Anda untuk sinkronisasi otomatis transaksi dan saldo
          </p>
        </div>

        {/* Connect Bank Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowConnectModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Hubungkan Rekening Bank
          </button>
        </div>

        {/* Bank Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {accounts.map(account => (
            <div key={account.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Bank className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.bankName}</h3>
                    <p className="text-sm text-gray-500">{account.accountNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => syncBankAccount(account.id)}
                    disabled={syncing === account.id}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                    title="Sync"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing === account.id ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setSelectedAccount(account)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Transactions"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => disconnectBankAccount(account.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Disconnect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Saldo</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tipe Rekening</span>
                  <span className="text-sm text-gray-900">{account.accountType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Sync Terakhir</span>
                  <span className="text-sm text-gray-900">
                    {account.lastSync ? formatDate(account.lastSync) : 'Belum pernah'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Frekuensi Sync</span>
                  <span className="text-sm text-gray-900 capitalize">{account.syncFrequency}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="flex items-center">
                    {account.isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${account.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {account.isActive ? 'Terhubung' : 'Terputus'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {accounts.length === 0 && (
          <div className="text-center py-12">
            <Bank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada rekening bank terhubung
            </h3>
            <p className="text-gray-500 mb-6">
              Hubungkan rekening bank Anda untuk mulai sinkronisasi transaksi otomatis
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Hubungkan Rekening Pertama
            </button>
          </div>
        )}

        {/* Connect Bank Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Hubungkan Rekening Bank</h2>
              <form onSubmit={connectBankAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank
                  </label>
                  <select
                    value={connectForm.bankName}
                    onChange={(e) => setConnectForm({...connectForm, bankName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Bank</option>
                    {supportedBanks.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={connectForm.accountNumber}
                    onChange={(e) => setConnectForm({...connectForm, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nomor rekening"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={connectForm.apiKey}
                    onChange={(e) => setConnectForm({...connectForm, apiKey: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan API Key"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={connectForm.apiSecret}
                    onChange={(e) => setConnectForm({...connectForm, apiSecret: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan API Secret"
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Hubungkan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions Modal */}
        {selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Transaksi - {selectedAccount.bankName}
                </h2>
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={() => fetchTransactions(selectedAccount.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Muat Transaksi
                </button>
              </div>

              {transactions.length > 0 && (
                <div className="space-y-3">
                  {transactions.map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <DollarSign className={`w-4 h-4 ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount, selectedAccount.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Saldo: {formatCurrency(transaction.balance, selectedAccount.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Klik "Muat Transaksi" untuk melihat data transaksi</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankIntegration; 