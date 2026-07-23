import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, MessageSquare, ShieldCheck, Paperclip, User } from 'lucide-react';
import { Project } from '../types';
import { StatusBadge, DevelopmentStatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';

interface ProjectCardProps {
  project: Project;
  onOpenFeedback?: (project: Project) => void;
  onOpenModeration?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpenFeedback,
  onOpenModeration
}) => {
  const { currentUser, isAdmin } = useAuth();
  const isAuthor = currentUser && currentUser.uid === project.authorId;
  const categories = project.categories || [];
  const attachments = project.attachments || [];
  const feedbackHistory = project.feedbackHistory || [];

  const formattedDate = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group h-full">
      {/* Image Banner */}
      <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0">
        <img
          src={project.coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-start justify-between gap-1.5 pointer-events-none">
          <div className="pointer-events-auto">
            <DevelopmentStatusBadge status={project.developmentStatus} size="sm" />
          </div>
          {(project.status !== 'published' || isAuthor || isAdmin) && (
            <div className="pointer-events-auto ml-auto">
              <StatusBadge status={project.status} />
            </div>
          )}
        </div>
        {attachments.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-xs">
            <Paperclip className="w-3 h-3 text-emerald-400" />
            <span>{attachments.length} {attachments.length === 1 ? 'anexo' : 'anexos'}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-7 flex flex-col flex-1">
        {/* Category Badges */}
        <div className="flex flex-wrap gap-2 mb-3.5">
          {categories.length > 0 ? (
            categories.slice(0, 3).map((cat, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md border border-slate-200"
              >
                {cat}
              </span>
            ))
          ) : (
            <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2.5 py-1 rounded-md">
              Geral
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-1 group-hover:text-if-green transition-colors">
          {project.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-5 leading-relaxed flex-1">
          {project.summary || project.description || 'Sem descrição cadastrada.'}
        </p>

        {/* Author info */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-5 pt-3.5 border-t border-slate-100">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{project.authors || project.authorName}</span>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto gap-3">
          <span className="text-[10px] text-slate-400 font-medium">
            {formattedDate ? `Atualizado ${formattedDate}` : ''}
          </span>

          <div className="flex items-center gap-2">
            {/* Feedback Button for non-admin author if feedback history exists */}
            {!isAdmin && isAuthor && feedbackHistory.length > 0 && onOpenFeedback && (
              <button
                onClick={() => onOpenFeedback(project)}
                title="Ver Parecer da Moderação"
                className="p-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors flex items-center gap-1 text-[10px] font-bold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Parecer ({feedbackHistory.length})</span>
              </button>
            )}

            {/* Single "Revisar" Button for Admin - Navigates to unified Edit & Curation Page */}
            {isAdmin ? (
              <Link
                to={`/project/edit/${project.id}`}
                title="Revisar e Editar Projeto"
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all flex items-center gap-1.5 text-[11px] font-bold shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Revisar</span>
              </Link>
            ) : isAuthor ? (
              /* Edit Button for Author - Green Color for Interactivity */
              <Link
                to={`/project/edit/${project.id}`}
                title="Editar Projeto"
                className="p-2 text-if-green bg-emerald-50/80 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl border border-emerald-200 transition-colors shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Link>
            ) : null}

            {/* View Details Link */}
            <Link
              to={`/project/${project.id}`}
              title="Visualizar Projeto"
              className="p-2 bg-if-green text-white hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
