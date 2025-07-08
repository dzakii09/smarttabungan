import React from 'react';
import { User, Menu, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useApp();

  return (
    <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SW</span>
              </div>
              <h1 className="ml-3 text-xl font-bold font-inter text-neutral-800">
                SmartWealth
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                  <Settings size={20} />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700 hidden sm:block">
                    {user?.name || 'Pengguna'}
                  </span>
                </div>
              </>
            ) : (
              <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                <Menu size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;