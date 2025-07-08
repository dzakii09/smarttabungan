import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { DollarSign, ShoppingBag, Car, Utensils } from 'lucide-react';

const CategoryStats: React.FC = () => {
  const { transactions, categories } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return ShoppingBag;
      case 'Car': return Car;
      case 'Utensils': return Utensils;
      default: return DollarSign;
    }
  };

  // Calculate category statistics
  const getCategoryStats = () => {
    const categoryMap = new Map();
    
    // Initialize all categories with 0
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        totalAmount: 0,
        transactionCount: 0
      });
    });

    // Calculate totals from transactions
    transactions.forEach(transaction => {
      if (transaction.categoryId && categoryMap.has(transaction.categoryId)) {
        const category = categoryMap.get(transaction.categoryId);
        category.totalAmount += transaction.amount;
        category.transactionCount += 1;
        categoryMap.set(transaction.categoryId, category);
      }
    });

    // Convert to array and sort by total amount
    return Array.from(categoryMap.values())
      .filter(cat => cat.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5); // Top 5 categories
  };

  const categoryStats = getCategoryStats();

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h3 className="text-lg font-semibold text-neutral-800 font-inter mb-4">
          Statistik Kategori
        </h3>
        <div className="text-center py-8">
          <p className="text-neutral-500">Belum ada transaksi dengan kategori</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <h3 className="text-lg font-semibold text-neutral-800 font-inter mb-6">
        Statistik Kategori
      </h3>
      
      <div className="space-y-4">
        {categoryStats.map((category) => {
          const Icon = getIconComponent(category.icon || 'DollarSign');
          const percentage = transactions.length > 0 
            ? ((category.transactionCount / transactions.length) * 100).toFixed(1)
            : '0';

          return (
            <div key={category.id} className="flex items-center space-x-4 p-3 hover:bg-neutral-50 rounded-xl transition-colors">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: `${category.color}20`, 
                  color: category.color 
                }}
              >
                <Icon size={20} />
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-neutral-800">{category.name}</p>
                <p className="text-sm text-neutral-500">
                  {category.transactionCount} transaksi • {percentage}%
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-neutral-800">
                  {formatCurrency(category.totalAmount)}
                </p>
                <p className={`text-xs font-medium ${
                  category.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryStats; 