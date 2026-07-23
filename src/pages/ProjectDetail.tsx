import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Paperclip,
  Download,
  Edit3,
  ShieldCheck,
  MessageSquare,
  Tag,
  FileCode,
  FileText,
  Box,
  Share2,
  Check,
  Image as ImageIcon,
  Archive,
  X
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, DevelopmentStatusBadge } from '../components/StatusBadge';
import { FeedbackModal } from '../components/FeedbackModal';
import { ModerationModal } from '../components/ModerationModal';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById } = useProjects();
  const { currentUser, isAdmin } = useAuth();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const project = id ? getProjectById(id) : undefined;

  if (!project) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md shadow-lg">
          <h3 className="text-lg font-bold text-slate-800">Projeto não localizado</h3>
          <p className="text-xs text-slate-500">
            O projeto solicitado não existe ou foi removido.
          </p>
          <Link
            to="/"
            className="inline-block bg-if-green text-white font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider"
          >
            Voltar para a Galeria
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser && currentUser.uid === project.authorId;
  const categories = project.categories || [];
  const attachments = project.attachments || [];
  const galleryImages = project.galleryImages || [];
  const feedbackHistory = project.feedbackHistory || [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (type: string, name?: string) => {
    const t = (type || '').toLowerCase();
    const f = (name || '').toLowerCase();
    if (t.includes('stl') || t.includes('3d') || t.includes('obj') || f.endsWith('.stl') || f.endsWith('.obj')) {
      return <Box className="w-5 h-5 text-emerald-600 shrink-0" />;
    }
    if (t.includes('pdf') || f.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-600 shrink-0" />;
    }
    if (t.includes('ino') || t.includes('code') || t.includes('cpp') || t.includes('py') || t.includes('js') || f.endsWith('.ino')) {
      return <FileCode className="w-5 h-5 text-purple-600 shrink-0" />;
    }
    if (t.includes('dxf') || t.includes('laser') || f.endsWith('.dxf') || f.endsWith('.svg')) {
      return <FileCode className="w-5 h-5 text-amber-600 shrink-0" />;
    }
    if (t.includes('zip') || t.includes('rar') || f.endsWith('.zip') || f.endsWith('.rar')) {
      return <Archive className="w-5 h-5 text-blue-600 shrink-0" />;
    }
    if (t.includes('image') || t.includes('img') || f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')) {
      return <ImageIcon className="w-5 h-5 text-indigo-600 shrink-0" />;
    }
    return <Paperclip className="w-5 h-5 text-slate-600 shrink-0" />;
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>

          {isAdmin ? (
            <Link
              to={`/project/edit/${project.id}`}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Revisar Projeto</span>
            </Link>
          ) : isAuthor ? (
            <Link
              to={`/project/edit/${project.id}`}
              className="bg-if-green hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Projeto</span>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Main Cover Header */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-72 sm:h-96 bg-slate-100 relative">
          <img
            src={project.coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
            alt={project.title}
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setSelectedImage(project.coverImage || '')}
          />
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-start justify-between gap-2 pointer-events-none">
            <div className="pointer-events-auto">
              <DevelopmentStatusBadge status={project.developmentStatus} size="lg" />
            </div>
            {(project.status !== 'published' || isAuthor || isAdmin) && (
              <div className="pointer-events-auto ml-auto">
                <StatusBadge status={project.status} size="lg" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => (
              <span
                key={idx}
                className="text-xs bg-emerald-50 text-if-green font-bold px-3 py-1 rounded-lg border border-emerald-100 flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                <span>{cat}</span>
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-y border-slate-100 py-3">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-if-green" />
              <span className="font-bold text-slate-700">{project.authors || project.authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Publicado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="font-bold text-slate-700">Status do Projeto:</span>
              <DevelopmentStatusBadge status={project.developmentStatus} size="md" />
            </div>
          </div>

          <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
            "{project.summary || 'Sem resumo disponível.'}"
          </p>
        </div>
      </div>

      {/* Additional Photos Gallery */}
      {galleryImages.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-if-green" />
            <span>Galeria de Imagens ({galleryImages.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group relative hover:ring-2 hover:ring-if-green transition-all shadow-2xs cursor-pointer"
              >
                <img
                  src={imgUrl}
                  alt={`Imagem galeria ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white font-mono text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                  Foto {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description Body */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          Descrição Detalhada do Projeto
        </h2>
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
          {project.description || 'Nenhuma descrição detalhada informada.'}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-if-green" />
            <span>Arquivos Técnicos & Anexos ({attachments.length})</span>
          </h2>
        </div>

        {attachments.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            Nenhum arquivo técnico ou modelo 3D foi anexado a este projeto.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                download={att.name}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-300">
                    {getFileIcon(att.type, att.name)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-if-green">
                      {att.name}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">{att.type || 'arquivo'}</p>
                  </div>
                </div>
                <div className="p-2 bg-white text-slate-600 group-hover:bg-if-green group-hover:text-white rounded-xl border border-slate-200 transition-colors shrink-0 ml-2">
                  <Download className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Section if feedback exists and user is admin or author */}
      {(isAdmin || isAuthor) && feedbackHistory.length > 0 && (
        <div className="bg-purple-50/60 rounded-3xl border border-purple-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-purple-200 pb-3">
            <h2 className="text-base font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span>Histórico de Pareceres da Moderação ({feedbackHistory.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {feedbackHistory.map((fb, idx) => (
              <div key={fb.id || idx} className="bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
                <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="font-bold text-purple-900">{fb.author}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(fb.date).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-xs text-slate-700 pt-1 leading-relaxed">{fb.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showFeedbackModal && (
        <FeedbackModal project={project} onClose={() => setShowFeedbackModal(false)} />
      )}

      {showModerationModal && (
        <ModerationModal project={project} onClose={() => setShowModerationModal(false)} />
      )}
    </div>
  );
};
