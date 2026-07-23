import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LogIn, LogOut, User as UserIcon, Shield, Sparkles, FolderPlus, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { LabifMakerLogo } from './LabifMakerLogo';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isNavOpen?: boolean;
  onToggleNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, isNavOpen, onToggleNav }) => {
  const { currentUser, userProfile, logout, isAdmin, isAllowedAdmin, toggleAdminRole, openProfileDrawer } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="bg-if-green text-white h-16 flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-md z-20 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={onToggleNav}
            className="p-2 -ml-1 hover:bg-white/10 rounded-xl text-white transition-colors flex items-center justify-center shrink-0"
            title={isNavOpen ? 'Fechar Menu' : 'Abrir Menu de Navegação'}
            aria-label="Menu Hamburguer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 py-1">
            <LabifMakerLogo size="md" textColor="white" />
            <Link to="/" className="hidden sm:block border-l border-white/20 pl-2.5 hover:opacity-90 transition-opacity">
              <h1 className="text-sm font-bold leading-none uppercase tracking-tight">Galeria IFMaker</h1>
              <p className="text-[9px] opacity-90 uppercase tracking-widest font-medium mt-0.5">Campus São Paulo</p>
            </Link>
          </div>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex items-center relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar projetos, tags ou autores..."
            className="w-full bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
          />
        </div>

        {/* User Info / Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser && (
            <Link
              to="/project/new"
              className="bg-white text-slate-800 hover:bg-slate-100 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FolderPlus className="w-3.5 h-3.5 text-if-green" />
              <span className="hidden sm:inline">Novo Projeto</span>
            </Link>
          )}

          {/* Toggle Admin Role button ONLY for users authorized in the database */}
          {currentUser && isAllowedAdmin && (
            <button
              onClick={toggleAdminRole}
              title="Alternar Papel (Maker / Admin)"
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                isAdmin
                  ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-xs'
                  : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>{isAdmin ? 'Modo Admin' : 'Modo Maker'}</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2.5 sm:gap-3 border-l border-white/20 pl-2.5 sm:pl-4">
              <button
                type="button"
                onClick={openProfileDrawer}
                title="Meu Cadastro (Alterar e-mail, telefone, curso e senha)"
                className="flex items-center gap-2.5 hover:bg-white/10 p-1 rounded-xl transition-all group text-left cursor-pointer"
              >
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold leading-tight truncate max-w-[140px] group-hover:underline">
                    {userProfile?.name || currentUser.displayName || 'Maker IFSP'}
                  </p>
                  <p className="text-[10px] opacity-85 uppercase font-medium">
                    Perfil: <span className="font-bold">{userProfile?.role || 'maker'}</span>
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center border border-white/40 text-xs font-bold text-white shadow-xs uppercase transition-all shrink-0">
                  {userProfile?.name?.[0] || currentUser.email?.[0] || 'M'}
                </div>
              </button>
              <button
                onClick={() => logout()}
                title="Sair da Conta"
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};
