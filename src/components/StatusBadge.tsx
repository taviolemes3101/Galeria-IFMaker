import React from 'react';
import { ProjectStatus, DevelopmentStatus } from '../types';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getDetails = (s: ProjectStatus) => {
    switch (s) {
      case 'published':
        return { label: 'Publicado', bg: 'status-published', text: 'text-white' };
      case 'pending':
        return { label: 'Aguardando Aprovação', bg: 'status-pending', text: 'text-white' };
      case 'revision':
        return { label: 'Ajustes Necessários', bg: 'status-revision', text: 'text-white' };
      case 'draft':
      default:
        return { label: 'Rascunho', bg: 'status-draft', text: 'text-white' };
    }
  };

  const { label, bg, text } = getDetails(status);

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-full',
    md: 'text-xs px-3 py-1 font-bold uppercase tracking-wider rounded-full',
    lg: 'text-sm px-4 py-1.5 font-bold uppercase tracking-wider rounded-full'
  };

  return (
    <span className={`inline-flex items-center gap-1 ${bg} ${text} ${sizeClasses[size]} shadow-xs`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80 animate-pulse"></span>
      {label}
    </span>
  );
};

interface DevelopmentStatusBadgeProps {
  status?: DevelopmentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const DevelopmentStatusBadge: React.FC<DevelopmentStatusBadgeProps> = ({
  status = 'não iniciado',
  size = 'sm'
}) => {
  const getDetails = (s: DevelopmentStatus) => {
    switch (s) {
      case 'concluído':
        return {
          label: 'Concluído',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'em andamento':
        return {
          label: 'Em Andamento',
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          dot: 'bg-blue-500'
        };
      case 'não iniciado':
      default:
        return {
          label: 'Não Iniciado',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400'
        };
    }
  };

  const validStatuses: DevelopmentStatus[] = ['não iniciado', 'em andamento', 'concluído'];
  const safeStatus: DevelopmentStatus = (status && validStatuses.includes(status as DevelopmentStatus))
    ? (status as DevelopmentStatus)
    : 'não iniciado';
  const { label, bg, dot } = getDetails(safeStatus);

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-md border',
    md: 'text-xs px-3 py-1 font-bold uppercase tracking-wider rounded-md border',
    lg: 'text-xs px-3.5 py-1.5 font-bold uppercase tracking-wider rounded-lg border'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${bg} ${sizeClasses[size]} shadow-2xs`}>
      <span className={`w-2 h-2 rounded-full ${dot}`}></span>
      <span>{label}</span>
    </span>
  );
};
