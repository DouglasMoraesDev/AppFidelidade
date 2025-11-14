import React from 'react';
import { Page } from '../../types';
import { MenuIcon } from '../icons/Icons';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: Page;
}

const pageTitles: Record<Page, string> = {
  dashboard: 'Resumo',
  addClient: 'Cadastrar Cliente',
  addPoints: 'Adicionar Pontos',
  clients: 'Clientes',
  notifications: 'Notificações',
  settings: 'Configurações',
  pointsLink: 'Consulta de Pontos'
};


const Header: React.FC<HeaderProps> = ({ onMenuClick, currentPage }) => {
  const title = pageTitles[currentPage] || 'Dashboard';
  return (
    <header className="bg-surface sticky top-0 z-10 flex items-center justify-between p-4 shadow-md md:justify-end">
      <button
        onClick={onMenuClick}
        className="text-on-surface-secondary hover:text-on-surface md:hidden"
        aria-label="Open menu"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <h1 className="text-xl font-semibold text-on-surface md:hidden">{title}</h1>
      <div className="w-6 md:hidden"></div>
    </header>
  );
};

export default Header;