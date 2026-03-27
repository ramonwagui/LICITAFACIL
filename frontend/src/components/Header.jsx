import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const [title, setTitle] = useState('Dashboard');

  useEffect(() => {
    const pathTitles = {
      '/dashboard': 'Dashboard',
      '/licitacoes': 'Licitações',
      '/contratos': 'Contratos',
      '/convenios': 'Convênios',
      '/fornecedores': 'Fornecedores',
      '/relatorios': 'Relatórios',
    };
    
    const basePath = '/' + location.pathname.split('/')[1];
    setTitle(pathTitles[basePath] || 'Dashboard');
  }, [location]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;