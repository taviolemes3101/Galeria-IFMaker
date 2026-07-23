import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { LabifMakerLogo } from './LabifMakerLogo';

export const Footer: React.FC = () => {
  const { syncStatus } = useProjects();

  return (
    <footer className="h-9 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 text-[11px] text-slate-500">
      <div className="flex items-center gap-2">
        <LabifMakerLogo size="sm" textColor="dark" />
        <p>&copy; 2026 LABIF MAKER | Repositório de Projetos</p>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced'
                ? 'bg-emerald-500 animate-pulse'
                : syncStatus === 'syncing'
                ? 'bg-amber-500 animate-spin'
                : 'bg-slate-400'
            }`}
          ></span>
          {syncStatus === 'synced' && <span className="text-emerald-700">Sincronizado com Firebase</span>}
          {syncStatus === 'syncing' && <span className="text-amber-700">Sincronizando com Firestore...</span>}
          {syncStatus === 'offline' && <span className="text-slate-600">Modo Cache Resiliente Local</span>}
        </span>
        <span className="text-slate-400 font-mono text-[10px] uppercase">v2.4.0-stable</span>
      </div>
    </footer>
  );
};
