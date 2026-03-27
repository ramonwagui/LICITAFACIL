import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, BarChart3, LogOut, Briefcase, FileSignature, Users, Globe } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/licitacoes', icon: FileText, label: 'Licitações' },
    { to: '/contratos', icon: FileSignature, label: 'Contratos' },
    { to: '/convenios', icon: Globe, label: 'Convênios' },
    { to: '/fornecedores', icon: Users, label: 'Fornecedores' },
    { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-primary text-white z-50 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-primary-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">LicitaFácil</h1>
                <p className="text-xs text-white/70">Gestão de Licitações</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-primary-light">
            <div className="flex items-center gap-3 mb-4 px-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium">
                {user?.nome?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.nome || 'Admin'}</p>
                <p className="text-xs text-white/60 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>

          <div className="p-4 text-center text-xs text-white/40 border-t border-primary-light">
            v1.0.0 - MVP
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;