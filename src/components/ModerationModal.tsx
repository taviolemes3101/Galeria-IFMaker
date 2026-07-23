import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle2, RotateCcw, Trash2, Send } from 'lucide-react';
import { Project, ProjectStatus, DevelopmentStatus } from '../types';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

interface ModerationModalProps {
  project: Project;
  onClose: () => void;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({ project, onClose }) => {
  const { moderateProject, deleteProject } = useProjects();
  const { userProfile, currentUser } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(project.status);
  const [selectedDevStatus, setSelectedDevStatus] = useState<DevelopmentStatus>(
    project.developmentStatus || 'não iniciado'
  );
  const [feedbackText, setFeedbackText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveModeration = async () => {
    setLoading(true);
    try {
      const authorName = userProfile?.name || currentUser?.displayName || 'Avaliador Admin';
      const authorId = currentUser?.uid || 'admin';

      await moderateProject(
        project.id,
        selectedStatus,
        feedbackText,
        authorName,
        authorId,
        selectedDevStatus
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) return;
    setLoading(true);
    try {
      const adminName = userProfile?.name || currentUser?.displayName || 'Avaliador Admin';
      await deleteProject(project.id, deleteReason.trim(), adminName);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Curadoria & Avaliação Técnico-Pedagógica</h3>
              <p className="text-xs text-amber-100 truncate max-w-xs">{project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-amber-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 bg-slate-50">
          {/* Status Selection Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Selecione o Novo Status:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedStatus('published')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  selectedStatus === 'published'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold">Aprovar & Publicar</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('revision')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  selectedStatus === 'revision'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs font-bold">Solicitar Ajustes</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('draft')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  selectedStatus === 'draft'
                    ? 'bg-slate-600 text-white border-slate-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold">Devolver Rascunho</span>
              </button>
            </div>
          </div>

          {/* Development / Execution Status Selection */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status de Execução / Desenvolvimento:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDevStatus('não iniciado')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedDevStatus === 'não iniciado'
                    ? 'bg-slate-800 text-white border-slate-800 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold">Não Iniciado</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDevStatus('em andamento')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedDevStatus === 'em andamento'
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold">Em Andamento</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDevStatus('concluído')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedDevStatus === 'concluído'
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold">Concluído</span>
              </button>
            </div>
          </div>

          {/* Feedback Text Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Parecer Técnico / Orientações para o Maker:
            </label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Ex: O modelo 3D necessita de ajustes de parede fina no arquivo STL antes da homologação final no laboratório..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
            />
          </div>

          {/* Delete Warning Section */}
          <div className="pt-3 border-t border-slate-200">
            {confirmDelete ? (
              <div className="flex flex-col gap-2.5 bg-red-50 p-3.5 rounded-2xl border border-red-200 text-red-700 w-full space-y-1">
                <p className="text-xs font-bold text-red-900">
                  Tem certeza que deseja excluir este projeto?
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-red-900 uppercase tracking-wider mb-1">
                    Justificativa da Exclusão <span className="text-red-600">* (Obrigatória)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Digite o motivo técnico ou pedagógico para a exclusão do projeto..."
                    className="w-full bg-white border border-red-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                  />
                  {deleteReason.trim().length === 0 && (
                    <p className="text-[10px] text-red-600 font-semibold mt-1">
                      A justificativa é obrigatória para excluir como administrador.
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-slate-600 hover:underline px-3 py-1 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading || deleteReason.trim().length === 0}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    Confirmar Exclusão
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1.5 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Projeto</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveModeration}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Salvar Avaliação</span>
          </button>
        </div>
      </div>
    </div>
  );
};
