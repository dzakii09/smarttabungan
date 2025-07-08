import React, { useState, useEffect } from 'react';
import { 
  RecurringTransaction, 
  CreateRecurringTransactionData, 
  UpdateRecurringTransactionData,
  recurringTransactionService 
} from '../../services/recurringTransactionService';
import { Category } from '../../types';
import { Plus } from 'lucide-react';
import CustomCategoryModal from '../categories/CustomCategoryModal';

interface RecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recurringTransaction?: RecurringTransaction;
  categories: Category[];
}

export const RecurringTransactionModal: React.FC<RecurringTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  recurringTransaction,
  categories
}) => {
  const [formData, setFormData] = useState<CreateRecurringTransactionData>({
    description: '',
    amount: 0,
    type: 'expense',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    categoryId: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);

  const isEdit = !!recurringTransaction;

  useEffect(() => {
    if (recurringTransaction) {
      setFormData({
        description: recurringTransaction.description,
        amount: recurringTransaction.amount,
        type: recurringTransaction.type,
        frequency: recurringTransaction.frequency,
        startDate: recurringTransaction.startDate.split('T')[0],
        endDate: recurringTransaction.endDate?.split('T')[0] || '',
        categoryId: recurringTransaction.categoryId || ''
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        type: 'expense',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        categoryId: ''
      });
    }
    setErrors({});
  }, [recurringTransaction, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Jumlah harus lebih dari 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Tanggal mulai wajib diisi';
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'Tanggal berakhir harus setelah tanggal mulai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const transactionData = {
        ...formData,
        amount: Number(formData.amount),
        categoryId: formData.type === 'income' ? undefined : formData.categoryId
      };

      if (isEdit) {
        const updateData: UpdateRecurringTransactionData = transactionData;
        await recurringTransactionService.update(recurringTransaction.id, updateData);
      } else {
        await recurringTransactionService.create(transactionData);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving recurring transaction:', error);
      setErrors({ submit: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateRecurringTransactionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset categoryId when switching to income type
    if (field === 'type' && value === 'income') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        categoryId: ''
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEdit ? 'Edit Transaksi Berulang' : 'Buat Transaksi Berulang'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Contoh: Gaji bulanan"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              step="0.01"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>

          {/* Category - Only show for expense type */}
          {formData.type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Pilih kategori</option>
                  {categories.filter(cat => cat.type === 'expense').map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCustomCategoryModal(true)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                  title="Tambah Kategori Baru"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frekuensi
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {recurringTransactionService.getFrequencyOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Berakhir (Opsional)
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
              min={formData.startDate}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan')}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Category Modal */}
      <CustomCategoryModal
        isOpen={showCustomCategoryModal}
        onClose={() => setShowCustomCategoryModal(false)}
        onSuccess={() => {
          // Refresh categories after adding new one
          // This will be handled by the parent component
        }}
        type="expense"
      />
    </div>
  );
}; 