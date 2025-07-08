import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import api from '../../api';
import { toast } from 'sonner';

interface CustomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'income' | 'expense';
}

const CustomCategoryModal: React.FC<CustomCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type
}) => {
  const { fetchCategories } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    icon: 'DollarSign',
    color: '#6B7280'
  });
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    { name: 'Abu-abu', value: '#6B7280' },
    { name: 'Biru', value: '#2563EB' },
    { name: 'Hijau', value: '#059669' },
    { name: 'Kuning', value: '#F59E0B' },
    { name: 'Ungu', value: '#8B5CF6' },
    { name: 'Merah', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F97316' }
  ];

  const iconOptions = [
    { name: 'Dollar', value: 'DollarSign' },
    { name: 'Shopping', value: 'ShoppingBag' },
    { name: 'Car', value: 'Car' },
    { name: 'Utensils', value: 'Utensils' },
    { name: 'Home', value: 'Home' },
    { name: 'Heart', value: 'Heart' },
    { name: 'Book', value: 'Book' },
    { name: 'Gift', value: 'Gift' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nama kategori wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await api.post('/categories', {
        name: formData.name.trim(),
        type,
        icon: formData.icon,
        color: formData.color
      });
      
      toast.success('Kategori berhasil ditambahkan');
      await fetchCategories();
      onSuccess();
      onClose();
      setFormData({ name: '', icon: 'DollarSign', color: '#6B7280' });
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Gagal menambahkan kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Tambah Kategori {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kategori *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Makan Siang"
              maxLength={50}
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <select
              value={formData.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {iconOptions.map((icon) => (
                <option key={icon.value} value={icon.value}>
                  {icon.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warna
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange('color', color.value)}
                  className={`w-full h-10 rounded-md border-2 transition-all ${
                    formData.color === color.value
                      ? 'border-gray-800 scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

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
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomCategoryModal; 