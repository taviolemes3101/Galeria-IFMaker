import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  Tag,
  Check,
  AlertCircle,
  FileCode,
  Box,
  Plus,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  FileText,
  Archive,
  X,
  AlertTriangle,
  FileX,
  ShieldAlert
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_OPTIONS, Project, ProjectAttachment, ProjectStatus, DevelopmentStatus } from '../types';
import { DevelopmentStatusBadge } from '../components/StatusBadge';
import { uploadProjectFile, readFileAsDataURL } from '../lib/storageHelper';

// File Validation Constants
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'];

const ALLOWED_ATTACHMENT_EXTENSIONS = [
  'stl', 'obj', '3mf', 'ply', 'step', 'stp', 'gcode', 'blend', 'f3d',
  'dxf', 'dwg', 'ai', 'cdr', 'eps',
  'ino', 'cpp', 'c', 'h', 'hpp', 'py', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'java', 'cs', 'sh', 'txt',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv',
  'zip', 'rar', '7z', 'tar', 'gz',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'
];

const BANNED_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'msi', 'iso', 'dmg', 'vbs', 'ps1', 'apk', 'app', 'com', 'scr',
  'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'mp3', 'm4a', 'wav', 'aac', 'flac', 'ogg'
];

interface FileWarningModalState {
  isOpen: boolean;
  title: string;
  fileName: string;
  fileType: string;
  fileSizeMB?: string;
  reason: 'size' | 'unsupported_type' | 'image_type';
  message: string;
}

// Helper to auto detect file type from filename or mime type
const detectFileType = (filename: string, mimeType?: string): string => {
  const nameLower = (filename || '').toLowerCase();
  const ext = nameLower.includes('.') ? nameLower.split('.').pop() || '' : '';

  if (['stl', 'obj', '3mf', 'ply', 'step', 'stp', 'gcode', 'blend', 'f3d'].includes(ext)) {
    return 'stl';
  }
  if (ext === 'pdf' || mimeType?.includes('pdf')) {
    return 'pdf';
  }
  if (['ino', 'cpp', 'c', 'h', 'hpp', 'py', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'java', 'cs', 'sh'].includes(ext)) {
    return 'ino';
  }
  if (['dxf', 'svg', 'dwg', 'ai', 'cdr', 'eps'].includes(ext)) {
    return 'dxf';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'zip';
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext) || mimeType?.startsWith('image/')) {
    return 'image';
  }
  return ext || 'arquivo';
};

const getAttachmentIcon = (type: string, filename?: string) => {
  const t = (type || '').toLowerCase();
  const f = (filename || '').toLowerCase();
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

export const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveProject, deleteProject, getProjectById } = useProjects();
  const { currentUser, userProfile, isAdmin } = useAuth();

  const isEditing = Boolean(id);
  const existingProject = id ? getProjectById(id) : undefined;

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [authors, setAuthors] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [developmentStatus, setDevelopmentStatus] = useState<DevelopmentStatus>('não iniciado');
  
  // Admin Curation State
  const [adminStatus, setAdminStatus] = useState<ProjectStatus>('published');
  const [adminFeedback, setAdminFeedback] = useState<string>('');

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Warning Modal State
  const [fileWarningModal, setFileWarningModal] = useState<FileWarningModalState>({
    isOpen: false,
    title: '',
    fileName: '',
    fileType: '',
    reason: 'unsupported_type',
    message: ''
  });

  // Form item inputs
  const [newAttName, setNewAttName] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Track initialized state to prevent re-renders from overwriting user input
  const loadedProjectIdRef = useRef<string | null>(null);
  const initializedNewRef = useRef<boolean>(false);

  useEffect(() => {
    if (existingProject && loadedProjectIdRef.current !== existingProject.id) {
      loadedProjectIdRef.current = existingProject.id;
      setTitle(existingProject.title || '');
      setSummary(existingProject.summary || '');
      setDescription(existingProject.description || '');
      setAuthors(existingProject.authors || existingProject.authorName || '');
      setCoverImage(existingProject.coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80');
      setGalleryImages(Array.isArray(existingProject.galleryImages) ? existingProject.galleryImages : []);
      setCategories(Array.isArray(existingProject.categories) ? existingProject.categories : []);
      setAttachments(Array.isArray(existingProject.attachments) ? existingProject.attachments : []);
      setDevelopmentStatus(existingProject.developmentStatus || 'não iniciado');
      setAdminStatus(existingProject.status || 'published');
    } else if (!id && !initializedNewRef.current && (userProfile || currentUser)) {
      initializedNewRef.current = true;
      setAuthors(userProfile?.name || currentUser?.displayName || '');
    }
  }, [existingProject, id, userProfile, currentUser]);

  // Toggle category choice
  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Cover Image File Upload from Computer
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileWarningModal({
        isOpen: true,
        title: 'Imagem de Capa Muito Grande',
        fileName: file.name,
        fileType: ext.toUpperCase() || 'IMAGEM',
        fileSizeMB,
        reason: 'size',
        message: `A imagem selecionada possui ${fileSizeMB} MB, excedendo o limite máximo permitido de ${MAX_FILE_SIZE_MB} MB.`
      });
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/') && !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      setFileWarningModal({
        isOpen: true,
        title: 'Formato de Imagem Inválido',
        fileName: file.name,
        fileType: ext.toUpperCase() || 'DESCONHECIDO',
        reason: 'image_type',
        message: `O arquivo "${file.name}" não é um formato de imagem válido. Envie apenas JPG, PNG, WEBP ou SVG.`
      });
      e.target.value = '';
      return;
    }

    setUploadingCover(true);
    setErrorMsg(null);
    try {
      const dataUrl = await readFileAsDataURL(file);
      setCoverImage(dataUrl);

      // Async upload to Firebase Storage in background if enabled
      const projId = id || `temp_${Date.now()}`;
      uploadProjectFile(projId, file, true)
        .then((cloudUrl) => {
          if (cloudUrl) {
            setCoverImage(cloudUrl);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao carregar a imagem do computador.');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  // Gallery Photos Upload from Computer
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    let rejectedModalInfo: FileWarningModalState | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejectedModalInfo = {
          isOpen: true,
          title: 'Foto da Galeria Muito Grande',
          fileName: file.name,
          fileType: ext.toUpperCase() || 'FOTO',
          fileSizeMB,
          reason: 'size',
          message: `A foto "${file.name}" possui ${fileSizeMB} MB e excede o limite máximo permitido de ${MAX_FILE_SIZE_MB} MB.`
        };
        continue;
      }

      if (!file.type.startsWith('image/') && !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
        rejectedModalInfo = {
          isOpen: true,
          title: 'Formato de Foto Não Suportado',
          fileName: file.name,
          fileType: ext.toUpperCase() || 'DESCONHECIDO',
          reason: 'image_type',
          message: `O arquivo "${file.name}" não é uma imagem suportada na galeria. Utilize apenas JPG, PNG, WEBP ou SVG.`
        };
        continue;
      }

      validFiles.push(file);
    }

    if (rejectedModalInfo) {
      setFileWarningModal(rejectedModalInfo);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setUploadingGallery(true);
    setErrorMsg(null);
    try {
      const addedUrls: string[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const dataUrl = await readFileAsDataURL(file);
        addedUrls.push(dataUrl);

        const projId = id || `temp_${Date.now()}`;
        uploadProjectFile(projId, file, true)
          .then((cloudUrl) => {
            if (cloudUrl) {
              setGalleryImages((prev) =>
                prev.map((img) => (img === dataUrl ? cloudUrl : img))
              );
            }
          })
          .catch(() => {});
      }
      setGalleryImages((prev) => [...prev, ...addedUrls]);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao carregar as fotos da galeria.');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const addGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setGalleryImages((prev) => [...prev, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Attachment File Upload from Computer (Automatic Type Detection & Format/Size Validation)
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    let rejectedModalInfo: FileWarningModalState | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

      // Check size limit
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejectedModalInfo = {
          isOpen: true,
          title: 'Arquivo Muito Grande',
          fileName: file.name,
          fileType: ext.toUpperCase() || 'ARQUIVO',
          fileSizeMB,
          reason: 'size',
          message: `O arquivo "${file.name}" possui ${fileSizeMB} MB, o que excede o limite máximo permitido de ${MAX_FILE_SIZE_MB} MB por anexo para manter a estabilidade da plataforma.`
        };
        continue;
      }

      // Check format
      const isBanned = BANNED_EXTENSIONS.includes(ext);
      const isAllowed = ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext);

      if (isBanned || (!isAllowed && ext.length > 0)) {
        rejectedModalInfo = {
          isOpen: true,
          title: 'Formato de Arquivo Não Suportado',
          fileName: file.name,
          fileType: ext.toUpperCase() || 'ARQUIVO',
          reason: 'unsupported_type',
          message: `O formato .${ext.toUpperCase() || 'desconhecido'} ("${file.name}") não é permitido como anexo técnico. Por segurança e compatibilidade, envie apenas modelagens 3D (.stl, .obj), códigos (.ino, .cpp, .py), documentos (.pdf) ou arquivos compactados (.zip).`
        };
        continue;
      }

      validFiles.push(file);
    }

    if (rejectedModalInfo) {
      setFileWarningModal(rejectedModalInfo);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setUploadingAttachment(true);
    setErrorMsg(null);
    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const autoType = detectFileType(file.name, file.type);
        const dataUrl = await readFileAsDataURL(file);

        const newAttachment: ProjectAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 5)}_${i}`,
          name: newAttName.trim() || file.name,
          url: dataUrl,
          type: autoType,
          size: file.size
        };

        setAttachments((prev) => [...prev, newAttachment]);

        // Async upload to Firebase Storage in background if enabled
        const projId = id || `temp_${Date.now()}`;
        uploadProjectFile(projId, file, false)
          .then((cloudUrl) => {
            if (cloudUrl) {
              setAttachments((prev) =>
                prev.map((att) => (att.id === newAttachment.id ? { ...att, url: cloudUrl } : att))
              );
            }
          })
          .catch(() => {});
      }
      setNewAttName('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao anexar arquivo.');
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // Delete Project Handler
  const confirmDeleteProject = async () => {
    const targetId = existingProject?.id || id;
    if (!targetId) return;

    if (isAdmin && !deleteReason.trim()) {
      setErrorMsg('A justificativa de exclusão é obrigatória para administradores.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const adminName = userProfile?.name || currentUser?.displayName || 'Administrador IFMaker';
      await deleteProject(
        targetId,
        isAdmin ? deleteReason.trim() : 'Excluído pelo próprio autor',
        adminName
      );
      setShowDeleteModal(false);
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao excluir o projeto.');
      setSubmitting(false);
    }
  };

  // Handle Form Submission for Makers (Draft or Submit for Review)
  const handleSave = async (isSubmission: boolean) => {
    if (!title.trim()) {
      setErrorMsg('O título do projeto é obrigatório.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const teamOrAuthors = authors.trim() || existingProject?.authors || userProfile?.name || currentUser?.displayName || 'Maker IFSP';
      const creatorName = existingProject?.authorName || userProfile?.name || currentUser?.displayName || 'Maker IFSP';
      const creatorEmail = existingProject?.authorEmail || currentUser?.email || '';
      const creatorId = existingProject?.authorId || currentUser?.uid || 'anon';

      const projectData: Partial<Project> = {
        id: existingProject?.id,
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        authors: teamOrAuthors,
        authorId: creatorId,
        authorName: creatorName,
        authorEmail: creatorEmail,
        coverImage: coverImage,
        galleryImages: galleryImages,
        categories: categories,
        attachments: attachments,
        feedbackHistory: existingProject?.feedbackHistory || [],
        status: existingProject?.status || 'draft',
        developmentStatus: existingProject?.developmentStatus || developmentStatus || 'não iniciado'
      };

      const savedId = await saveProject(projectData, isSubmission);
      navigate(isSubmission ? '/dashboard' : `/project/${savedId}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Falha ao salvar o projeto. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Form Submission for Admin (Saves Edits + Curation Status + Feedback Note)
  const handleAdminSave = async () => {
    if (!title.trim()) {
      setErrorMsg('O título do projeto é obrigatório.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const teamOrAuthors = authors.trim() || existingProject?.authors || existingProject?.authorName || 'Maker IFSP';
      const creatorName = existingProject?.authorName || 'Maker IFSP';
      const creatorEmail = existingProject?.authorEmail || '';
      const creatorId = existingProject?.authorId || 'anon';

      const updatedHistory = existingProject?.feedbackHistory ? [...existingProject.feedbackHistory] : [];
      if (adminFeedback.trim().length > 0) {
        updatedHistory.push({
          id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          date: new Date().toISOString(),
          author: userProfile?.name || currentUser?.displayName || 'Avaliador Admin',
          authorId: currentUser?.uid || 'admin',
          message: adminFeedback.trim()
        });
      }

      const projectData: Partial<Project> = {
        id: existingProject?.id,
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        authors: teamOrAuthors,
        authorId: creatorId,
        authorName: creatorName,
        authorEmail: creatorEmail,
        coverImage: coverImage,
        galleryImages: galleryImages,
        categories: categories,
        attachments: attachments,
        feedbackHistory: updatedHistory,
        status: adminStatus,
        developmentStatus: developmentStatus
      };

      await saveProject(projectData, false);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Falha ao salvar a edição e avaliação do projeto. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const canDelete = isEditing && existingProject && (currentUser?.uid === existingProject.authorId || isAdmin);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-3">
          {canDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={submitting}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Projeto</span>
            </button>
          )}

          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            {isEditing ? 'Editar Projeto Maker' : 'Novo Projeto Maker'}
          </h2>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Basic Info Block */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            1. Dados Básicos do Projeto
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título do Projeto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Braço Robótico Articulado 4-Eixos com Arduino"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Resumo do Projeto (Breve Apresentação)
            </label>
            <input
              type="text"
              maxLength={200}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Resumo em 1 ou 2 frases para os cards da galeria..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Autores / Equipe do Projeto
            </label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="Ex: Ricardo Oliveira, Ana Souza (Curso de Mecatrônica)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descrição Detalhada (Funcionamento, Componentes, Instruções)
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhamento completo do protótipo, materiais utilizados, especificações técnicas, biblioteca usada no código..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all resize-none"
            />
          </div>
        </div>

        {/* Categories Block */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-if-green" />
            <span>2. Categorias & Tecnologias</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-if-green text-white border-if-green shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cover & Gallery Images Block */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-if-green" />
            <span>3. Imagens do Projeto (Capa & Galeria)</span>
          </h3>

          {/* Cover Image Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Imagem de Capa (Principal)
            </label>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-56 h-36 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative shrink-0 shadow-2xs">
                <img
                  src={coverImage}
                  alt="Capa Prévia"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              <div className="space-y-3 flex-1 w-full">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Upload da Imagem de Capa do Computador
                  </label>
                  <label className="inline-flex items-center gap-2 bg-if-green hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm border border-emerald-700 cursor-pointer transition-all active:scale-98">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingCover ? 'Enviando imagem...' : 'Escolher Imagem no Computador'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ou URL da Imagem de Capa
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-if-green transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Gallery Images Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Galeria de Fotos Adicionais ({galleryImages.length})
                </label>
                <p className="text-[11px] text-slate-500">
                  Adicione fotos extras do projeto, protótipo montado, fotos de testes ou bastidores.
                </p>
              </div>
            </div>

            {/* Gallery Image Previews */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-2xs">
                    <img src={imgUrl} alt={`Foto extra ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 text-white font-mono text-[9px] rounded-md backdrop-blur-xs">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add Gallery Photo Tool */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <label className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingGallery ? 'Carregando fotos...' : 'Upload de Fotos do Computador'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 flex gap-2">
                  <input
                    type="url"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="ou cole a URL de uma foto..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-if-green shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={addGalleryUrl}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments & Files Block */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-if-green" />
            <span>4. Arquivos Técnicos & Anexos ({attachments.length})</span>
          </h3>

          {/* List of current attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      {getAttachmentIcon(att.type, att.name)}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-slate-800 truncate block">{att.name}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded uppercase inline-block">
                        {att.type || 'ARQUIVO'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 shrink-0 cursor-pointer"
                    title="Remover anexo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Attachment Tool */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800">Anexar Arquivo Técnico (Max 15MB)</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                Detecção automática de tipo & ícone
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newAttName}
                onChange={(e) => setNewAttName(e.target.value)}
                placeholder="Nome/Descrição do arquivo (Opcional - ex: Modelo_3D_Case.stl)"
                className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-if-green shadow-2xs"
              />
              <label className="sm:w-auto inline-flex items-center justify-center gap-2 bg-if-green hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm border border-emerald-700 cursor-pointer transition-all active:scale-98 text-center shrink-0">
                <Upload className="w-4 h-4 shrink-0" />
                <span>{uploadingAttachment ? 'Anexando...' : 'Escolher Ficheiro / Arquivo'}</span>
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentUpload}
                  disabled={uploadingAttachment}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * O sistema identifica o tipo e seleciona o ícone apropriado automaticamente com base na extensão (.stl, .pdf, .ino, .dxf, .zip, etc.).
            </p>
          </div>
        </div>

        {/* Project Development Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Status de Execução do Projeto</h2>
              <p className="text-xs text-slate-500">
                Indica o estágio atual do desenvolvimento do projeto no laboratório.
              </p>
            </div>
            <DevelopmentStatusBadge status={developmentStatus} size="md" />
          </div>

          {isAdmin ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Alterar Status do Projeto (Exclusivo Administrador):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDevelopmentStatus('não iniciado')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    developmentStatus === 'não iniciado'
                      ? 'bg-slate-800 text-white border-slate-800 font-bold shadow-sm ring-2 ring-slate-400/50'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold">Não Iniciado</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Em planejamento/ideação</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDevelopmentStatus('em andamento')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    developmentStatus === 'em andamento'
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm ring-2 ring-blue-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold">Em Andamento</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Em fabricação/execução</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDevelopmentStatus('concluído')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    developmentStatus === 'concluído'
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm ring-2 ring-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold">Concluído</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Finalizado e testado</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Status de execução:</span>
                <DevelopmentStatusBadge status={developmentStatus} size="sm" />
              </div>
              <span className="text-[11px] text-slate-400 italic">Apenas o administrador pode alterar este status.</span>
            </div>
          )}
        </div>

        {/* Admin Curation & Review Block */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-lg border border-amber-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg leading-tight">Curadoria & Avaliação Técnico-Pedagógica</h3>
                <p className="text-xs text-amber-100">
                  Defina o status de homologação do projeto e envie parecer/orientações ao maker.
                </p>
              </div>
            </div>

            {/* Status Selection Buttons */}
            <div>
              <label className="block text-xs font-bold text-amber-100 uppercase tracking-wider mb-2">
                Selecione o Status do Projeto:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAdminStatus('published')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    adminStatus === 'published'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-md ring-2 ring-white/50'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Aprovar & Publicar</p>
                    <p className="text-[10px] opacity-80">Homologado na galeria</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminStatus('revision')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    adminStatus === 'revision'
                      ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-md ring-2 ring-white/50'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <RotateCcw className="w-5 h-5 text-purple-300 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Solicitar Ajustes</p>
                    <p className="text-[10px] opacity-80">Retorna com parecer</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminStatus('draft')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    adminStatus === 'draft'
                      ? 'bg-slate-700 text-white border-slate-500 font-bold shadow-md ring-2 ring-white/50'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 text-slate-300 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Devolver Rascunho</p>
                    <p className="text-[10px] opacity-80">Não aprovado no momento</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Feedback / Parecer Técnico */}
            <div>
              <label className="block text-xs font-bold text-amber-100 uppercase tracking-wider mb-2">
                Parecer Técnico / Orientações para o Maker (Opcional):
              </label>
              <textarea
                rows={3}
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="Ex: O modelo 3D necessita de ajustes na espessura de parede antes da homologação final no laboratório..."
                className="w-full bg-white text-slate-800 rounded-2xl p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all resize-none shadow-inner"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          {isAdmin ? (
            <>
              <p className="text-xs text-slate-400">
                Como <strong className="text-amber-400">Administrador</strong>, suas alterações nos dados do projeto e na avaliação serão salvas juntas.
              </p>

              <div className="flex gap-3 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleAdminSave}
                  disabled={submitting}
                  className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-7 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Salvando...' : 'Salvar Edição do Projeto'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Você pode salvar como <strong className="text-white">Rascunho</strong> para continuar depois, ou <strong className="text-emerald-400">Enviar para Avaliação</strong> da moderação.
              </p>

              <div className="flex gap-3 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={submitting}
                  className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Rascunho</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={submitting}
                  className="flex-1 sm:flex-none bg-if-green hover:bg-emerald-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar para Avaliação</span>
                </button>
              </div>
            </>
          )}
        </div>
      </form>

      {/* Delete Confirmation Warning Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-red-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                Excluir Projeto Permanentemente?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você está prestes a excluir o projeto{' '}
                <strong className="text-slate-900">"{existingProject?.title || title || 'Sem Título'}"</strong>. Esta ação é <strong className="text-red-600 font-bold">irreversível</strong> e removerá todos os dados, anexos e histórico.
              </p>
            </div>

            {isAdmin && (
              <div className="space-y-1.5 text-left bg-red-50/50 p-3.5 rounded-2xl border border-red-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Justificativa da Exclusão <span className="text-red-600">* (Obrigatória)</span>
                </label>
                <textarea
                  rows={3}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Digite o motivo técnico ou pedagógico para a exclusão deste projeto..."
                  className="w-full bg-white border border-red-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none shadow-xs"
                />
                {deleteReason.trim().length === 0 && (
                  <p className="text-[11px] text-red-600 font-semibold">
                    * A justificativa é obrigatória para excluir como administrador.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-xl transition-all border border-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteProject}
                disabled={submitting || (isAdmin && deleteReason.trim().length === 0)}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>{submitting ? 'Excluindo...' : 'Sim, Deletar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Validation Warning Pop-up Modal */}
      {fileWarningModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-amber-200 relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500" />

            <button
              type="button"
              onClick={() => setFileWarningModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pt-1">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {fileWarningModal.title}
                </h3>
                <p className="text-xs text-amber-700 font-medium">
                  Aviso da plataforma IFMaker
                </p>
              </div>
            </div>

            {/* File details container */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {fileWarningModal.fileName}
                </span>
                <span className="text-[10px] bg-red-100 text-red-700 font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0">
                  .{fileWarningModal.fileType}
                </span>
              </div>
              {fileWarningModal.fileSizeMB && (
                <p className="text-[11px] text-slate-500 font-medium">
                  Tamanho detectado: <strong className="text-slate-700">{fileWarningModal.fileSizeMB} MB</strong> (Limite máximo: {MAX_FILE_SIZE_MB} MB)
                </p>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {fileWarningModal.message}
            </p>

            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                Formatos suportados e recomendados:
              </p>
              <p className="leading-normal">
                • <strong>Modelagem 3D & CAD:</strong> .stl, .obj, .step, .dxf, .dwg
                <br />
                • <strong>Códigos & Eletrônica:</strong> .ino, .cpp, .py, .js, .json
                <br />
                • <strong>Documentos & Imagens:</strong> .pdf, .zip, .png, .jpg
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setFileWarningModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
              >
                Entendido, escolher outro arquivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
