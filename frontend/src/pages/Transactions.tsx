import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import api from '../api';
import { toast } from 'sonner';
import { Upload, Download, Plus } from 'lucide-react';
import ImportModal from '../components/import/ImportModal';
import ExportModal from '../components/export/ExportModal';
import CustomCategoryModal from '../components/categories/CustomCategoryModal';

const Transactions: React.FC = () => {
  const { transactions, fetchTransactions, categories, fetchCategories, fetchDashboardData } = useApp();
  
  // Debug: log categories
  console.log('Categories in Transactions:', categories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: '',
    amount: '',
    type: 'expense',
    categoryId: '',
    date: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Reset categoryId when switching to income type
      setForm({ 
        ...form, 
        [name]: value,
        categoryId: value === 'income' ? '' : form.categoryId
      });
    } else {
      setForm({ ...form, [name]: value });
      
      // Auto-categorize when description changes for expense transactions
      if (name === 'description' && form.type === 'expense' && value.trim()) {
        predictCategory(value, form.amount, form.date);
      }
    }
  };

  const predictCategory = async (description: string, amount: string, date: string) => {
    if (!description.trim() || !amount || !date) return;
    
    try {
      const token = getToken();
      const response = await api.post('/ai/predict-category', {
        description: description.trim(),
        amount: parseFloat(amount),
        date,
        type: 'expense'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data as any;
      if (data.success && data.prediction) {
        const prediction = data.prediction;
        if (prediction.confidence >= 0.5) { // Only apply if confidence is high enough
          setForm(prev => ({
            ...prev,
            categoryId: prediction.categoryId
          }));
          toast.success(`AI mendeteksi kategori: ${prediction.categoryName} (${Math.round(prediction.confidence * 100)}% akurat)`);
        }
      }
    } catch (error) {
      // Silently fail - AI prediction is optional
      console.log('AI prediction failed:', error);
    }
  };

  const handleEdit = (tx: any) => {
    setForm({
      id: tx.id,
      amount: tx.amount.toString(),
      type: tx.type,
      categoryId: tx.categoryId || '',
      date: tx.date ? tx.date.slice(0, 10) : '',
      description: tx.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    setIsLoading(true);
    try {
      const token = getToken();
      await api.delete(`/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTransactions();
      await fetchDashboardData(); // Refresh dashboard stats
      toast.success('Transaksi berhasil dihapus');
    } catch (err: any) {
      setError('Gagal menghapus transaksi');
      toast.error('Gagal menghapus transaksi');
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const transactionData = {
        ...form,
        amount: parseFloat(form.amount),
        categoryId: form.type === 'income' ? undefined : form.categoryId
      };

      if (form.id) {
        await api.put(`/transactions/${form.id}`, transactionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Transaksi berhasil diperbarui');
      } else {
        await api.post('/transactions', transactionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Transaksi berhasil ditambahkan');
      }
      setShowForm(false);
      setForm({ id: '', amount: '', type: 'expense', categoryId: '', date: '', description: '' });
      await fetchTransactions();
      await fetchDashboardData(); // Refresh dashboard stats
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      setError('Gagal menyimpan transaksi');
      toast.error('Gagal menyimpan transaksi');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Transaksi</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            <Upload size={16} />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button
            className="bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-600"
            onClick={() => {
              setForm({ id: '', amount: '', type: 'expense', categoryId: '', date: '', description: '' });
              setShowForm(true);
            }}
          >
            Tambah Transaksi
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Jumlah</label>
              <input name="amount" type="number" value={form.amount} onChange={handleInput} className="w-full border rounded-xl px-3 py-2" required min={1} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <select name="type" value={form.type} onChange={handleInput} className="w-full border rounded-xl px-3 py-2">
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            {form.type === 'expense' && (
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <div className="flex gap-2">
                  <select name="categoryId" value={form.categoryId} onChange={handleInput} className="flex-1 border rounded-xl px-3 py-2" required>
                    <option value="">Pilih Kategori</option>
                    {categories.filter(cat => cat.type === 'expense').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCustomCategoryModal(true)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1"
                    title="Tambah Kategori Baru"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
            <div className={form.type === 'expense' ? 'flex-1' : 'w-full'}>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input name="date" type="date" value={form.date} onChange={handleInput} className="w-full border rounded-xl px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleInput} className="w-full border rounded-xl px-3 py-2" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2">
            <button type="submit" disabled={isLoading} className="bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2">
              {isLoading && <span className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-neutral-200 px-4 py-2 rounded-xl font-semibold">Batal</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Daftar Transaksi</h3>
        <div className="divide-y">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-neutral-800">{tx.description}</div>
                <div className="text-sm text-neutral-500">{tx.category?.name || (tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran')} • {new Date(tx.date).toLocaleDateString('id-ID')}</div>
                <div className="text-xs text-neutral-400">{tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-semibold ${tx.type === 'income' ? 'text-secondary-600' : 'text-neutral-800'}`}>
                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </span>
                <button onClick={() => handleEdit(tx)} className="text-primary-500 hover:underline">Edit</button>
                <button onClick={() => handleDelete(tx.id)} className="text-red-500 hover:underline flex items-center gap-2" disabled={isLoading}>
                  {isLoading ? <span className="loader w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span> : null}
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          fetchTransactions();
          toast.success('Transaksi berhasil diimport');
        }}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        type="transactions"
      />

      {/* Custom Category Modal */}
      <CustomCategoryModal
        isOpen={showCustomCategoryModal}
        onClose={() => setShowCustomCategoryModal(false)}
        onSuccess={() => {
          // Refresh categories after adding new one
          fetchCategories();
        }}
        type="expense"
      />
    </div>
  );
};

export default Transactions; 