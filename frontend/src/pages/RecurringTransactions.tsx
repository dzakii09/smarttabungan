import React, { useState, useEffect } from 'react';
import { 
  RecurringTransaction, 
  recurringTransactionService 
} from '../services/recurringTransactionService';
import { RecurringTransactionModal } from '../components/recurring/RecurringTransactionModal';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';

export const RecurringTransactions: React.FC = () => {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | undefined>();
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, categoriesData] = await Promise.all([
        recurringTransactionService.getAll(),
        categoryService.getAll()
      ]);
      setRecurringTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTransaction(undefined);
    setModalOpen(true);
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi berulang ini?')) {
      return;
    }

    try {
      await recurringTransactionService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await recurringTransactionService.toggleStatus(id);
      await loadData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleGenerateTransactions = async () => {
    try {
      setGenerating(true);
      const generated = await recurringTransactionService.generateTransactions();
      alert(`Berhasil menghasilkan ${generated.length} transaksi baru!`);
      await loadData();
    } catch (error) {
      console.error('Error generating transactions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleModalSuccess = () => {
    loadData();
  };

  const getStatusBadge = (transaction: RecurringTransaction) => {
    const isOverdue = recurringTransactionService.isOverdue(transaction.nextDueDate);
    
    if (!transaction.isActive) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Nonaktif</span>;
    }
    
    if (isOverdue) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">Terlambat</span>;
    }
    
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">Aktif</span>;
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '-';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transaksi Berulang</h1>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateTransactions}
            disabled={generating}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {generating ? 'Menghasilkan...' : 'Generate Transaksi'}
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Tambah Baru
          </button>
        </div>
      </div>

      {recurringTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Belum ada transaksi berulang</div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Buat Transaksi Berulang Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frekuensi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jatuh Tempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recurringTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryName(transaction.categoryId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recurringTransactionService.getFrequencyLabel(transaction.frequency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recurringTransactionService.formatNextDueDate(transaction.nextDueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(transaction.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {transaction.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RecurringTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        recurringTransaction={editingTransaction}
        categories={categories}
      />
    </div>
  );
}; 