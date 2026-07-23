export type UserRole = 'maker' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  course?: string;
  phone?: string;
}

export type ProjectStatus = 'draft' | 'pending' | 'revision' | 'published';
export type DevelopmentStatus = 'não iniciado' | 'em andamento' | 'concluído';

export interface ProjectAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // e.g. 'stl', 'pdf', 'zip', 'ino', 'dxf', 'image'
  size?: number;
}

export interface FeedbackItem {
  id: string;
  date: string;
  author: string;
  authorId: string;
  message: string;
}

export interface DeletionNotification {
  id: string;
  projectId: string;
  projectTitle: string;
  authorId?: string;
  authorEmail?: string;
  authorName?: string;
  reason: string;
  adminName: string;
  deletedAt: string;
  read: boolean;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  authors: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  status: ProjectStatus;
  developmentStatus?: DevelopmentStatus;
  coverImage: string;
  galleryImages?: string[];
  categories: string[];
  attachments: ProjectAttachment[];
  feedbackHistory: FeedbackItem[];
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_OPTIONS = [
  'Impressão 3d',
  'Corte a Laser',
  'Eletrônica',
  'Design',
  'Programação',
  'Outros'
] as const;
