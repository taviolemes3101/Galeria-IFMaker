import React, { useState, useMemo } from 'react';
import { Compass, Filter, Sparkles, FolderPlus, Layers, Search } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { ProjectCard } from '../components/ProjectCard';
import { CATEGORY_OPTIONS, Project } from '../types';
import { FeedbackModal } from '../components/FeedbackModal';
import { ModerationModal } from '../components/ModerationModal';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HomeProps {
  searchQuery: string;
}

export const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const { projects, loading } = useProjects();
  const { currentUser } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProjectForFeedback, setSelectedProjectForFeedback] = useState<Project | null>(null);
  const [selectedProjectForModeration, setSelectedProjectForModeration] = useState<Project | null>(null);

  // Filter only published projects for public vitrine
  const filteredProjects = useMemo(() => {
    return (projects || []).filter((p) => {
      // Must be published to be visible in the gallery
      if (p.status !== 'published') return false;

      // Category filter
      if (selectedCategory !== 'Todos' && !(p.categories || []).includes(selectedCategory)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(query);
        const summaryMatch = (p.summary || '').toLowerCase().includes(query);
        const authorMatch = (p.authors || '').toLowerCase().includes(query);
        const categoryMatch = (p.categories || []).some((c) => c.toLowerCase().includes(query));
        return titleMatch || summaryMatch || authorMatch || categoryMatch;
      }

      return true;
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-emerald-300 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
            <span>Repositório Oficial & Vitrine Pública</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Galeria de Projetos IFMaker
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Explore modelos 3D, cortes a laser, firmware, circuitos e projetos de prototipagem fabricados no Campus São Paulo.
          </p>
        </div>

        {currentUser && (
          <div className="z-10 shrink-0">
            <Link
              to="/project/new"
              className="bg-if-green hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 uppercase tracking-wide border border-emerald-400/30"
            >
              <span>Submeter Projeto</span>
            </Link>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 shrink-0 scrollbar-none">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-if-green" />
          <span>Categorias:</span>
        </div>

        <button
          onClick={() => setSelectedCategory('Todos')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
            selectedCategory === 'Todos'
              ? 'bg-if-green text-white border-if-green shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Todos ({projects.filter((p) => p.status === 'published').length})
        </button>

        {CATEGORY_OPTIONS.map((cat) => {
          const count = projects.filter(
            (p) => p.status === 'published' && (p.categories || []).includes(cat)
          ).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-if-green text-white border-if-green shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 h-72 animate-pulse space-y-3">
              <div className="h-36 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 max-w-lg mx-auto w-full my-8">
          <div className="w-16 h-16 bg-emerald-50 text-if-green rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Nenhum projeto encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Não foram localizados projetos publicados para a categoria ou termo pesquisado.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('Todos');
            }}
            className="text-xs font-bold text-if-green hover:underline uppercase tracking-wide"
          >
            Limpar filtros
          </button>
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
