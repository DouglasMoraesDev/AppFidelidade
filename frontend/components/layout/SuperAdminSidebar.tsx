import React from 'react';
import { SuperAdminPage } from '../../types';
import { 
  HomeIcon, 
  XIcon, 
  ShieldCheckIcon,
  LogoutIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon
} from '../icons/Icons';

interface SuperAdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentPage: SuperAdminPage;
  setCurrentPage: (page: SuperAdminPage) => void;
  onLogout: () => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ isOpen, setIsOpen, currentPage, setCurrentPage, onLogout }) => {
  const handleNavigation = (page: SuperAdminPage) => {
    setCurrentPage(page);
    setIsOpen(false);
  };

  const navItems = [
    { page: 'superDashboard' as SuperAdminPage, label: 'Dashboard', icon: <HomeIcon className="h-5 w-5" /> },
    { page: 'manageEstablishments' as SuperAdminPage, label: 'Estabelecimentos', icon: <WrenchScrewdriverIcon className="h-5 w-5" /> },
    { page: 'advancedTools' as SuperAdminPage, label: 'Ferramentas Avançadas', icon: <ShieldCheckIcon className="h-5 w-5" /> },
    { page: 'themeSettings' as SuperAdminPage, label: 'Aparência do App', icon: <PaintBrushIcon className="h-5 w-5" /> },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full bg-surface w-64 text-on-surface flex flex-col z-30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-background">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-8 w-8 text-secondary"/>
            <h1 className="text-xl font-bold">Super Admin</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-on-surface-secondary hover:text-on-surface">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-2 flex flex-col justify-between">
          <ul>
            {navItems.map((item) => (
              <li key={item.page}>
                <button
                  onClick={() => handleNavigation(item.page)}
                  className={`w-full flex items-center gap-3 px-4 py-2 my-1 rounded-md text-left transition-colors ${
                    currentPage === item.page
                      ? 'bg-secondary text-white font-semibold'
                      : 'hover:bg-background'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
           <div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 my-1 rounded-md text-left text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;