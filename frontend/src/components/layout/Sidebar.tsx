import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  Target, 
  MessageCircle,
  TrendingUp,
  Settings,
  LogOut,
  Repeat,
  Lightbulb,
  User
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useApp();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Transaksi', path: '/transactions' },
    { icon: Repeat, label: 'Transaksi Berulang', path: '/recurring-transactions' },
    { icon: PiggyBank, label: 'Anggaran', path: '/budgets' },
    { icon: Target, label: 'Tujuan Keuangan', path: '/goals' },
    { icon: TrendingUp, label: 'Analisis', path: '/analytics' },
    { icon: MessageCircle, label: 'Chat AI', path: '/chatbot' },
    { icon: Lightbulb, label: 'AI Recommendations', path: '/ai-recommendations' },
  ];

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-neutral-100">
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium font-inter">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-6 space-y-2">
          <button
            onClick={() => navigate('/preferences')}
            className="w-full flex items-center px-4 py-3 text-left rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-200"
          >
            <User size={20} className="mr-3" />
            <span className="font-medium font-inter">Preferences</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center px-4 py-3 text-left rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-200"
          >
            <Settings size={20} className="mr-3" />
            <span className="font-medium font-inter">Pengaturan</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium font-inter">Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;