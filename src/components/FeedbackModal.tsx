import React, { useState } from 'react';
import { X, MessageSquare, Send, Shield, User } from 'lucide-react';
import { Project } from '../types';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

interface FeedbackModalProps {
  project: Project;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ project, onClose }) => {
  const { moderateProject } = useProjects();
  const { userProfile, currentUser, isAdmin } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const isAuthor = currentUser && currentUser.uid === project.authorId;
  const canViewFeedback = isAdmin || isAuthor;
  const feedbackHistory = project.feedbackHistory || [];

  if (!canViewFeedback) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-100">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800">Acesso Restrito ao Parecer</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Os pareceres e observações deste projeto são visíveis apenas para os administradores e o criador do projeto.
          </p>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all uppercase tracking-wide"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const authorName = userProfile?.name || currentUser?.displayName || 'Membro IFMaker';
      const authorId = currentUser?.uid || 'anon';
      await moderateProject(
        project.id,
        project.status,
        newMessage.trim(),
        authorName,
        authorId
      );
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Pareceres da Moderação</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {feedbackHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">Nenhum parecer técnico registrado ainda.</p>
            </div>
          ) : (
            feedbackHistory.map((fb, index) => {
              const formattedDate = new Date(fb.date).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={fb.id || index}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Shield className="w-3.5 h-3.5 text-purple-600" />
                      <span>{fb.author || 'Moderação IFMaker'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{formattedDate}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{fb.message}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Add comment box */}
        {currentUser && (
          <form onSubmit={handleAddComment} className="p-4 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escrever observação ou parecer..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-if-green text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
