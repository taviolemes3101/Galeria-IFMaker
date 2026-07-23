import React from 'react';
import { Sparkles, UserCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileCompletionBanner: React.FC = () => {
  const {
    currentUser,
    userProfile,
    googleLoginNotice,
    dismissGoogleNotice,
    openProfileDrawer
  } = useAuth();

  if (!currentUser) return null;

  // Show if googleLoginNotice is true OR user profile lacks course or phone
  const needsProfileData = !userProfile?.course || !userProfile?.phone;
  const shouldShow = googleLoginNotice || needsProfileData;

  if (!shouldShow) return null;

  return (
    <div className="bg-amber-500 text-slate-900 border-b border-amber-600 px-4 py-2.5 shadow-sm shrink-0 animate-fade-in z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="w-7 h-7 bg-slate-900/10 rounded-full flex items-center justify-center shrink-0 text-slate-900 font-bold">
            <Sparkles className="w-4 h-4 text-slate-900" />
          </div>
          <p className="leading-tight text-slate-950">
            <strong className="font-bold">Atenção ao seu cadastro:</strong> Por favor, informe seu <span className="font-extrabold underline decoration-slate-900">curso</span> e <span className="font-extrabold underline decoration-slate-900">telefone de contato</span> para manter seu perfil Maker atualizado.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openProfileDrawer}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs transition-all flex items-center gap-1.5 uppercase tracking-wide cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Atualizar no Menu Lateral</span>
          </button>
          <button
            onClick={dismissGoogleNotice}
            className="p-1 hover:bg-slate-900/10 rounded-lg text-slate-900 transition-colors"
            title="Ocultar Notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
