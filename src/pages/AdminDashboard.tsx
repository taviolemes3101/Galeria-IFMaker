import React, { useState, useMemo } from 'react';
import { ShieldCheck, ShieldAlert, Filter, CheckCircle2, RotateCcw, AlertCircle, Clock } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectStatus, Project } from '../types';
import { FeedbackModal } from '../components/FeedbackModal';
import { ModerationModal } from '../components/ModerationModal';

export const AdminDashboard: React.FC = () => {
  const { projects, loading } = useProjects();
  const { isAdmin } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'pending' | 'all' | ProjectStatus>('pending');
  const [selectedProjectForFeedback, setSelectedProjectForFeedback] = useState<Project | null>(null);
  const [selectedProjectForModeration, setSelectedProjectForModeration] = useState<Project | null>(null);

  // Queue counts
  const pendingQueue = useMemo(() => (projects || []).filter((p) => p.status === 'pending'), [projects]);
  const revisionQueue = useMemo(() => (projects || []).filter((p) => p.status === 'revision'), [projects]);
  const publishedQueue = useMemo(() => (projects || []).filter((p) => p.status === 'published'), [projects]);
  const draftQueue = useMemo(() => (projects || []).filter((p) => p.status === 'draft'), [projects]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return (projects || []).filter((p) => p.status === activeFilter);
  }, [projects, activeFilter]);

  if (!isAdmin) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md shadow-lg">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Acesso Restrito a Administradores</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Esta área é exclusiva para a equipe de moderação e curadoria técnico-pedagógica do IFMaker.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 shrink-0 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Fila de Curadoria Global</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Painel do Avaliador</h2>
          <p className="text-xs text-slate-400">
            Análise técnica, homologação e pareceres de projetos submetidos pelos alunos e servidores.
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 shrink-0">
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-center min-w-[90px]">
            <p className="text-[10px] text-amber-400 font-bold uppercase">Pendentes</p>
            <p className="text-xl font-black text-amber-400">{pendingQueue.length}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-2xl text-center min-w-[90px]">
            <p className="text-[10px] text-purple-400 font-bold uppercase">Revisão</p>
            <p className="text-xl font-black text-purple-400">{revisionQueue.length}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-center min-w-[90px]">
            <p className="text-[10px] text-emerald-400 font-bold uppercase">Publicados</p>
            <p className="text-xl font-black text-emerald-400">{publishedQueue.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pt-2 pb-1 shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveFilter('pending')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'pending'
              ? 'text-amber-600 border-amber-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Fila de Espera (Pendentes)</span>
          <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold">
            {pendingQueue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('revision')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'revision'
              ? 'text-purple-600 border-purple-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Em Revisão</span>
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">
            {revisionQueue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('published')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'published'
              ? 'text-emerald-600 border-emerald-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Homologados (Publicados)</span>
          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">
            {publishedQueue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('all')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'all'
              ? 'text-slate-800 border-slate-800'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Todos ({projects.length})</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 h-72 animate-pulse space-y-3">
              <div className="h-36 bg-slate-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3 max-w-md mx-auto w-full my-8">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Sem projetos nesta fila</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nenhum projeto requer ação nesta categoria no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenFeedback={(p) => setSelectedProjectForFeedback(p)}
              onOpenModeration={(p) => setSelectedProjectForModeration(p)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedProjectForFeedback && (
        <FeedbackModal
          project={selectedProjectForFeedback}
          onClose={() => setSelectedProjectForFeedback(null)}
        />
      )}

      {selectedProjectForModeration && (
        <ModerationModal
          project={selectedProjectForModeration}
          onClose={() => setSelectedProjectForModeration(null)}
        />
      )}
    </div>
  );
};
