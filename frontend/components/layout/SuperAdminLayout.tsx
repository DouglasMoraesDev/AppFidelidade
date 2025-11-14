import React, { useState } from 'react';
import SuperAdminSidebar from './SuperAdminSidebar';
import { SuperAdminPage } from '../../types';
import { MenuIcon } from '../icons/Icons';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  currentPage: SuperAdminPage;
  setCurrentPage: (page: SuperAdminPage) => void;
  onLogout: () => void;
}

const pageTitles: Record<SuperAdminPage, string> = {
  superDashboard: 'Dashboard Geral',
  manageEstablishments: 'Gerenciar Estabelecimentos',
  themeSettings: 'Aparência do App',
};

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children, currentPage, setCurrentPage, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = pageTitles[currentPage] || 'Super Admin';

  return (
    <div className="min-h-screen flex text-on-surface">
      <SuperAdminSidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col transition-all duration-300">
         <header className="bg-surface sticky top-0 z-10 flex items-center justify-between p-4 shadow-md md:justify-end">
            <button
                onClick={() => setSidebarOpen(true)}
                className="text-on-surface-secondary hover:text-on-surface md:hidden"
                aria-label="Open menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-on-surface md:hidden">{title}</h1>
            <div className="w-6 md:hidden"></div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;