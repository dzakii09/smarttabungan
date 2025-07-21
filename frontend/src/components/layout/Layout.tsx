import React from 'react';
import { useApp } from '../../contexts/AppContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useApp();
  
  console.log('🔍 Debug: Layout rendering, isAuthenticated:', isAuthenticated);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {isAuthenticated && <Sidebar />}
        
        <main className={`flex-1 overflow-auto ${
          isAuthenticated ? 'lg:ml-64' : ''
        }`}>
          <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;