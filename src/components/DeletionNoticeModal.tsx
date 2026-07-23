import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export const DeletionNoticeModal: React.FC = () => {
  const { deletionNotifications, markNotificationAsRead } = useProjects();
  const { currentUser, userProfile } = useAuth();

  if (!deletionNotifications || deletionNotifications.length === 0) return null;

  // Find unread notification relevant to the current user
  const unreadNotif = deletionNotifications.find((n) => {
    if (n.read) return false;

    // Check if user matches authorId or authorEmail or authorName
    if (currentUser) {
      if (n.authorId && n.authorId === currentUser.uid) return true;
      if (n.authorEmail && currentUser.email && n.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (n.authorName && currentUser.displayName && n.authorName.toLowerCase() === currentUser.displayName.toLowerCase()) return true;
      if (userProfile?.email && n.authorEmail && n.authorEmail.toLowerCase() === userProfile.email.toLowerCase()) return true;
      if (userProfile?.name && n.authorName && n.authorName.toLowerCase() === userProfile.name.toLowerCase()) return true;
    }
    
    // If notification has matching user info or user is the author
    return Boolean(currentUser);
  });

  if (!unreadNotif) return null;

  const formattedDate = unreadNotif.deletedAt
    ? new Date(unreadNotif.deletedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-red-200 relative overflow-hidden">
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        <button
          type="button"
          onClick={() => markNotificationAsRead(unreadNotif.id)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 pt-1">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-200 shadow-2xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Projeto Excluído pela Moderação
            </h3>
            <p className="text-xs text-red-700 font-medium">
              Notificação do Laboratório IFMaker
            </p>
          </div>
        </div>

        {/* Project info card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Projeto afetado:
          </p>
          <p className="text-sm font-black text-slate-900">
            "{unreadNotif.projectTitle}"
          </p>
        </div>

        {/* Justification Box */}
        <div className="bg-red-50/80 p-4 rounded-2xl border border-red-200 space-y-2 text-xs">
          <p className="font-extrabold text-red-900 uppercase tracking-wider text-[10px]">
            Motivo da Exclusão informado pelo Administrador:
          </p>
          <p className="text-slate-800 font-medium leading-relaxed italic bg-white p-3 rounded-xl border border-red-100">
            "{unreadNotif.reason}"
          </p>
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          Ação realizada por <strong className="text-slate-800">{unreadNotif.adminName}</strong>
          {formattedDate ? ` em ${formattedDate}` : ''}.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => markNotificationAsRead(unreadNotif.id)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer uppercase tracking-wider"
          >
            Entendido, Ciente da Exclusão
          </button>
        </div>
      </div>
    </div>
  );
};
