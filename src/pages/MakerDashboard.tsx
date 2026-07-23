import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutDashboard, FolderPlus, Layers, AlertCircle, MessageSquare } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectStatus, Project } from '../types';
import { FeedbackModal } from '../components/FeedbackModal';
import { ModerationModal } from '../components/ModerationModal';

export const MakerDashboard: React.FC = () => {
  const { projects, loading } = useProjects();
  const { currentUser, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | ProjectStatus>('all');
  const [selectedProjectForFeedback, setSelectedProjectForFeedback] = useState<Project | null>(null);
  const [selectedProjectForModeration, setSelectedProjectForModeration] = useState<Project | null>(null);

  // User's own projects
  const myProjects = useMemo(() => {
    if (!currentUser) return [];
    return (projects || []).filter((p) => p.authorId === currentUser.uid);
  }, [projects, currentUser]);

  // Tab counts
  const publishedCount = myProjects.filter((p) => p.status === 'published').length;
  const pendingCount = myProjects.filter((p) => p.status === 'pending').length;
  const revisionCount = myProjects.filter((p) => p.status === 'revision').length;
  const draftCount = myProjects.filter((p) => p.status === 'draft').length;

  const filteredProjects = useMemo(() => {
    if (activeTab === 'all') return myProjects;
    return myProjects.filter((p) => p.status === activeTab);
  }, [myProjects, activeTab]);

  if (!currentUser) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md shadow-lg">
          <div className="w-14 h-14 bg-emerald-50 text-if-green rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Acesso Restrito ao Painel</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Faça login com seu e-mail para gerenciar seus projetos, acompanhar avaliações e submeter novos protótipos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Painel do Maker
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Meus Projetos</h2>
          <p className="text-xs text-slate-500">
            Gerencie rascunhos, acompanhe submissões e edite seus modelos.
          </p>
        </div>

        <Link
          to="/project/new"
          className="bg-if-green hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 uppercase tracking-wide self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NOVO PROJETO</span>
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pt-2 pb-1 shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'all'
              ? 'text-if-green border-if-green'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Todos</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
            {myProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('published')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'published'
              ? 'text-emerald-600 border-emerald-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Publicados</span>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">
            {publishedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'pending'
              ? 'text-amber-600 border-amber-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Pendentes</span>
          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px]">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('revision')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'revision'
              ? 'text-purple-600 border-purple-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Em Revisão</span>
          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">
            {revisionCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('draft')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'draft'
              ? 'text-slate-700 border-slate-700'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Rascunhos</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
            {draftCount}
          </span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 h-72 animate-pulse space-y-3">
              <div className="h-36 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 max-w-md mx-auto w-full my-8">
          <div className="w-16 h-16 bg-emerald-50 text-if-green rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Nenhum projeto nesta aba</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Você ainda não possui projetos cadastrados neste status.
            </p>
          </div>
          <Link
            to="/project/new"
            className="inline-block bg-if-green text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs uppercase"
          >
            Cadastrar Primeiro Projeto
          </Link>
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
