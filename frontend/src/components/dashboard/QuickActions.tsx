import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Target, 
  BarChart3, 
  Users, 
  TrendingUp,
  Settings
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  hoverColor: string;
  route: string;
  description: string;
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'add-transaction',
      label: 'Tambah Transaksi',
      icon: Plus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      route: '/transactions',
      description: 'Catat pemasukan atau pengeluaran baru'
    },
    {
      id: 'create-budget',
      label: 'Buat Budget',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      route: '/budgets',
      description: 'Atur anggaran untuk kategori tertentu'
    },
    {
      id: 'set-goal',
      label: 'Set Goal',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      route: '/goals',
      description: 'Tentukan tujuan keuangan Anda'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      route: '/analytics',
      description: 'Lihat analisis keuangan mendalam'
    },
    {
      id: 'tabungan-bersama',
      label: 'Tabungan Bersama',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      route: '/tabungan-bersama',
      description: 'Kelola tabungan bersama keluarga/teman'
    }
  ];

  const handleQuickAction = (action: QuickAction) => {
    // Add a small delay for better UX
    setTimeout(() => {
      navigate(action.route);
    }, 150);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Aksi Cepat</h3>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              className={`group relative flex flex-col items-center p-4 ${action.bgColor} rounded-xl ${action.hoverColor} transition-all duration-200 hover:scale-105 hover:shadow-md`}
              title={action.description}
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              
              {/* Icon container */}
              <div className={`relative p-2 ${action.bgColor.replace('50', '100')} rounded-lg group-hover:${action.bgColor.replace('50', '200')} transition-colors duration-200`}>
                <Icon className={`w-5 h-5 ${action.color}`} />
              </div>
              
              {/* Label */}
              <span className={`relative text-xs font-medium ${action.color.replace('600', '700')} mt-2 text-center leading-tight`}>
                {action.label}
              </span>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 group-active:opacity-0 transition-opacity duration-200"></div>
            </button>
          );
        })}
      </div>
      
      {/* Quick tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-1">Tips Cepat</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Gunakan aksi cepat di atas untuk mengakses fitur-fitur utama dengan mudah. 
              Hover pada setiap tombol untuk melihat deskripsi lengkap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 