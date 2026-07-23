import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Compass, FolderKanban, ShieldAlert, BookOpen, X, Shield, LogOut, User as UserIcon } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { ManualMakerModal } from './ManualMakerModal';
import { LabifMakerLogo } from './LabifMakerLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { projects } = useProjects();
  const { currentUser, userProfile, isAdmin, isAllowedAdmin, toggleAdminRole, logout, openProfileDrawer } = useAuth();
  const [showManual, setShowManual] = useState(false);
  const location = useLocation();

  // Auto-close menu when navigating
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  if (!isOpen) return null;

  // Stats calculation
  const myProjects = currentUser ? projects.filter((p) => p.authorId === currentUser.uid) : [];
  const myProjectsCount = myProjects.length;

  const canViewStats = isAdmin || myProjectsCount > 0;
  const relevantProjects = isAdmin ? projects : myProjects;

  const totalCount = relevantProjects.length;
  const publishedCount = relevantProjects.filter((p) => p.status === 'published').length;
  const pendingCount = relevantProjects.filter((p) => p.status === 'pending').length;
  const revisionCount = relevantProjects.filter((p) => p.status === 'revision').length;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Hamburger Drawer Panel */}
      <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col p-5 overflow-y-auto animate-slide-in-left border-r border-slate-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <LabifMakerLogo size="md" textColor="dark" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Fechar Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card if logged in */}
        {currentUser && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openProfileDrawer();
                }}
                className="flex items-center gap-2.5 text-left overflow-hidden group hover:opacity-80 transition-all cursor-pointer flex-1"
                title="Editar Cadastro no Menu Lateral"
              >
                <div className="w-9 h-9 bg-if-green/10 text-if-green rounded-full flex items-center justify-center font-bold text-sm shrink-0 uppercase border border-if-green/20 group-hover:bg-if-green group-hover:text-white transition-all">
                  {userProfile?.name?.[0] || currentUser.email?.[0] || 'M'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-if-green transition-colors">
                    {userProfile?.name || currentUser.displayName || 'Maker IFSP'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                </div>
              </button>

              {/* Toggle Admin role ONLY if permitted in database */}
              {isAllowedAdmin && (
                <button
                  onClick={toggleAdminRole}
                  title="Alternar Modo Admin / Maker"
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 shrink-0 ml-1 ${
                    isAdmin
                      ? 'bg-amber-400 text-slate-900 border-amber-300'
                      : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>{isAdmin ? 'Admin' : 'Maker'}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                openProfileDrawer();
              }}
              className="w-full text-center text-[10px] font-bold text-if-green bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-xl border border-emerald-200/60 transition-all flex items-center justify-center gap-1"
            >
              <UserIcon className="w-3 h-3" />
              <span>Editar Informações de Cadastro</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="space-y-1 mb-6">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Navegação</h2>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-50 text-if-green border border-emerald-100 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Compass className="w-4 h-4 text-if-green" />
            <span>Explorar Galeria</span>
          </NavLink>

          {currentUser && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-if-green border border-emerald-100 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="w-4 h-4 text-emerald-600" />
                <span>Meus Projetos</span>
              </div>
              {myProjectsCount > 0 && (
                <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {myProjectsCount}
                </span>
              )}
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Fila de Curadoria</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-bounce">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          )}
        </div>

        {/* Lab Stats */}
        {canViewStats && (
          <div className="space-y-3 mb-6">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
              {isAdmin ? 'Estatísticas IFMaker' : 'Estatísticas dos Seus Projetos'}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-slate-400 shadow-2xs">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Total Geral</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{totalCount}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs">
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Publicados</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{publishedCount}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs">
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Pendentes</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{pendingCount}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-2xs">
                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Em Revisão</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{revisionCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Banner */}
        <div className="mt-auto bg-slate-900 rounded-2xl p-4 text-white shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <BookOpen className="w-4 h-4" />
            <p className="text-[11px] font-bold uppercase tracking-wide">Laboratório IFMaker</p>
          </div>
          <p className="text-xs font-semibold text-slate-200 leading-snug">
            Guia de Submissão & Diretrizes do Campus
          </p>
          <button
            onClick={() => setShowManual(true)}
            className="w-full bg-if-green hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs uppercase tracking-wide cursor-pointer"
          >
            MANUAL MAKER
          </button>
        </div>
      </aside>

      {showManual && <ManualMakerModal onClose={() => setShowManual(false)} />}
    </>
  );
};
