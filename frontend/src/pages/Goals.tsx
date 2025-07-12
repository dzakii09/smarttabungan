import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import api from '../api';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import ExportModal from '../components/export/ExportModal';

const Goals: React.FC = () => {
  const { goals, fetchGoals } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: '',
    title: '', // ganti dari name ke title
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (goal: any) => {
    setForm({
      id: goal.id,
      title: goal.title, // ganti dari name ke title
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
      description: goal.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus goal ini?')) return;
    setIsLoading(true);
    try {
      await api.delete(`/goals/${id}`);
      await fetchGoals();
      toast.success('Goal berhasil dihapus');
    } catch (err: any) {
      setError('Gagal menghapus goal');
      toast.error('Gagal menghapus goal');
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (form.id) {
        await api.put(`/goals/${form.id}`, {
          ...form,
          targetAmount: parseFloat(form.targetAmount),
          currentAmount: parseFloat(form.currentAmount)
        });
        toast.success('Goal berhasil diperbarui');
      } else {
        await api.post('/goals', {
          ...form,
          targetAmount: parseFloat(form.targetAmount),
          currentAmount: parseFloat(form.currentAmount)
        });
        toast.success('Goal berhasil ditambahkan');
      }
      setShowForm(false);
      setForm({ id: '', title: '', targetAmount: '', currentAmount: '', targetDate: '', description: '' });
      await fetchGoals();
    } catch (err: any) {
      setError('Gagal menyimpan goal');
      toast.error('Gagal menyimpan goal');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Tujuan Keuangan</h2>
        <div className="flex items-center space-x-3">
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
              setForm({ id: '', title: '', targetAmount: '', currentAmount: '', targetDate: '', description: '' });
              setShowForm(true);
            }}
          >
            Tambah Goal
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Goal</label>
            <input name="title" value={form.title} onChange={handleInput} className="w-full border rounded-xl px-3 py-2" required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Target Dana</label>
              <input name="targetAmount" type="number" value={form.targetAmount} onChange={handleInput} className="w-full border rounded-xl px-3 py-2" required min={1} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Dana Terkumpul</label>
              <input name="currentAmount" type="number" value={form.currentAmount} onChange={handleInput} className="w-full border rounded-xl px-3 py-2" required min={0} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Target Tanggal</label>
              <input name="targetDate" type="date" value={form.targetDate} onChange={handleInput} className="w-full border rounded-xl px-3 py-2" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <input name="description" value={form.description} onChange={handleInput} className="w-full border rounded-xl px-3 py-2" />
            </div>
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
        <h3 className="text-lg font-semibold mb-4">Daftar Goals</h3>
        <div className="divide-y">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-neutral-800">{goal.title}</div>
                <div className="text-sm text-neutral-500">Target: {goal.targetAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} | Terkumpul: {goal.currentAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</div>
                <div className="text-xs text-neutral-400">{goal.targetDate && `Target: ${new Date(goal.targetDate).toLocaleDateString('id-ID')}`}</div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => handleEdit(goal)} className="text-primary-500 hover:underline">Edit</button>
                <button onClick={() => handleDelete(goal.id)} className="text-red-500 hover:underline flex items-center gap-2" disabled={isLoading}>
                  {isLoading ? <span className="loader w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span> : null}
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        type="goals"
      />
    </div>
  );
};

export default Goals; 