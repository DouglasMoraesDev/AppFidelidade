
import React from 'react';
import { Page } from '../../types';
import { 
  HomeIcon, 
  UserPlusIcon, 
  PlusCircleIcon, 
  UsersIcon, 
  BellIcon, 
  CogIcon, 
  XIcon, 
  GiftIcon,
  TicketIcon,
  LogoutIcon
} from '../icons/Icons';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentPage, setCurrentPage, onLogout }) => {
  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    setIsOpen(false);
  };

  const navItems = [
    { page: 'dashboard' as Page, label: 'Resumo', icon: <HomeIcon className="h-5 w-5" /> },
    { page: 'addClient' as Page, label: 'Cadastrar Cliente', icon: <UserPlusIcon className="h-5 w-5" /> },
    { page: 'addPoints' as Page, label: 'Adicionar Pontos', icon: <PlusCircleIcon className="h-5 w-5" /> },
    { page: 'clients' as Page, label: 'Clientes', icon: <UsersIcon className="h-5 w-5" /> },
    { page: 'notifications' as Page, label: 'Notificações', icon: <BellIcon className="h-5 w-5" /> },
    { page: 'pointsLink' as Page, label: 'Pontos', icon: <TicketIcon className="h-5 w-5" /> },
    { page: 'settings' as Page, label: 'Configurações', icon: <CogIcon className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-surface w-64 text-on-surface flex flex-col z-30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-background">
          <div className="flex items-center gap-2">
            <GiftIcon className="h-8 w-8 text-primary"/>
            <h1 className="text-xl font-bold">LoyaltyApp</h1>
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
                      ? 'bg-primary text-white font-semibold'
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

export default Sidebar;