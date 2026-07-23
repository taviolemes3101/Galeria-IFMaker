import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project, ProjectStatus, DevelopmentStatus, FeedbackItem, ProjectAttachment, DeletionNotification } from '../types';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  saveProject: (project: Partial<Project>, isSubmission?: boolean) => Promise<string>;
  moderateProject: (
    projectId: string,
    newStatus: ProjectStatus,
    feedbackMessage?: string,
    authorName?: string,
    authorId?: string,
    devStatus?: DevelopmentStatus
  ) => Promise<void>;
  deleteProject: (projectId: string, reason?: string, adminName?: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  syncStatus: 'synced' | 'syncing' | 'offline';
  deletionNotifications: DeletionNotification[];
  markNotificationAsRead: (notificationId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ifmaker_projects_cache';

// Defensive parser to prevent undefined.map()
export const sanitizeProject = (raw: any): Project => {
  return {
    id: raw?.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: raw?.title || 'Projeto sem título',
    summary: raw?.summary || '',
    description: raw?.description || '',
    authors: raw?.authors || 'Autor Desconhecido',
    authorId: raw?.authorId || 'anonymous',
    authorName: raw?.authorName || 'Maker',
    authorEmail: raw?.authorEmail || '',
    status: (raw?.status as ProjectStatus) || 'draft',
    developmentStatus: (raw?.developmentStatus as DevelopmentStatus) || 'não iniciado',
    coverImage: raw?.coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    galleryImages: Array.isArray(raw?.galleryImages) ? raw.galleryImages.filter((img: any) => typeof img === 'string') : [],
    categories: Array.isArray(raw?.categories) ? raw.categories : [],
    attachments: Array.isArray(raw?.attachments) ? raw.attachments.map((att: any) => ({
      id: att?.id || `att_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: att?.name || 'Arquivo',
      url: att?.url || '#',
      type: att?.type || 'stl',
      size: att?.size || 0
    })) : [],
    feedbackHistory: Array.isArray(raw?.feedbackHistory) ? raw.feedbackHistory.map((fb: any) => ({
      id: fb?.id || `fb_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      date: fb?.date || new Date().toISOString(),
      author: fb?.author || 'Avaliador IFMaker',
      authorId: fb?.authorId || '',
      message: fb?.message || ''
    })) : [],
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || new Date().toISOString()
  };
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed.map(sanitizeProject) : [];
      }
    } catch (e) {
      console.warn('Failed to load projects from localStorage cache:', e);
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [deletionNotifications, setDeletionNotifications] = useState<DeletionNotification[]>(() => {
    try {
      const cached = localStorage.getItem('ifmaker_deletion_notifications');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}
    return [];
  });

  // Sync deletion notifications from Firestore
  useEffect(() => {
    try {
      const notifRef = collection(db, 'deletion_notifications');
      getDocs(notifRef).then((snap) => {
        const list: DeletionNotification[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as DeletionNotification);
        });
        if (list.length > 0) {
          setDeletionNotifications((prev) => {
            const merged = [...prev];
            list.forEach((item) => {
              const idx = merged.findIndex((m) => m.id === item.id);
              if (idx >= 0) {
                merged[idx] = item;
              } else {
                merged.push(item);
              }
            });
            try {
              localStorage.setItem('ifmaker_deletion_notifications', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      }).catch((e) => console.warn('Error fetching deletion notifications:', e));
    } catch (e) {}
  }, []);

  // Load and listen to Firestore projects
  useEffect(() => {
    setSyncStatus('syncing');
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Project[] = [];
        snapshot.forEach((doc) => {
          list.push(sanitizeProject({ id: doc.id, ...doc.data() }));
        });
        setProjects(list);
        setLoading(false);
        setSyncStatus('synced');
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        } catch (err) {
          console.warn('LocalStorage size limit or error:', err);
        }
      },
      (error) => {
        console.warn('Firestore subscription failed, using local resilience cache:', error);
        setSyncStatus('offline');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save Project (Draft or Submit)
  const saveProject = async (projectData: Partial<Project>, isSubmission: boolean = false): Promise<string> => {
    setSyncStatus('syncing');
    const now = new Date().toISOString();
    const projectId = projectData.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Find existing project if editing
    const existingProj = projects.find((p) => p.id === projectId);

    // Rule:
    // 1. If explicitly requesting adjustments ('revision'), set 'revision'
    // 2. If project was already published or explicitly published, keep it published when modified
    // 3. Otherwise, set 'pending' if submitting or keep draft/given status
    let newStatus: ProjectStatus;
    if (projectData.status === 'revision') {
      newStatus = 'revision';
    } else if (existingProj?.status === 'published' || projectData.status === 'published') {
      newStatus = 'published';
    } else {
      newStatus = isSubmission ? 'pending' : (projectData.status || 'draft');
    }

    const updatedProject = sanitizeProject({
      ...projectData,
      id: projectId,
      status: newStatus,
      updatedAt: now,
      createdAt: projectData.createdAt || existingProj?.createdAt || now
    });

    // 1. Instant local state & localStorage update (No UI freezing!)
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === projectId);
      const newArr = exists ? prev.map((p) => (p.id === projectId ? updatedProject : p)) : [updatedProject, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newArr));
      } catch (e) {}
      return newArr;
    });

    // 2. Asynchronous sync to Firestore
    try {
      const docRef = doc(db, 'projects', projectId);
      const firestoreData = {
        title: updatedProject.title,
        summary: updatedProject.summary,
        description: updatedProject.description,
        authors: updatedProject.authors,
        authorId: updatedProject.authorId,
        authorName: updatedProject.authorName,
        authorEmail: updatedProject.authorEmail || '',
        status: updatedProject.status,
        coverImage: updatedProject.coverImage && updatedProject.coverImage.length > 700000 && updatedProject.coverImage.startsWith('data:')
          ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
          : updatedProject.coverImage,
        galleryImages: (updatedProject.galleryImages || []).map((img) =>
          img && img.length > 700000 && img.startsWith('data:') ? '' : img
        ).filter(Boolean),
        categories: updatedProject.categories,
        attachments: (updatedProject.attachments || []).map((att) => ({
          id: att.id,
          name: att.name,
          url: att.url && att.url.length > 700000 && att.url.startsWith('data:')
            ? '#local-data-url-exceeded-firestore-limit'
            : att.url,
          type: att.type,
          size: att.size
        })),
        feedbackHistory: updatedProject.feedbackHistory,
        createdAt: updatedProject.createdAt,
        updatedAt: now
      };
      await setDoc(docRef, firestoreData, { merge: true });
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Error saving to Firestore, preserved in local storage:', err);
      setSyncStatus('offline');
    }

    return projectId;
  };

  // Moderate Project (Approve as published, Request Revision, etc.)
  const moderateProject = async (
    projectId: string,
    newStatus: ProjectStatus,
    feedbackMessage?: string,
    authorName: string = 'Avaliador Admin',
    authorId: string = 'admin',
    devStatus?: DevelopmentStatus
  ) => {
    setSyncStatus('syncing');
    const now = new Date().toISOString();

    setProjects((prev) => {
      const newArr = prev.map((p) => {
        if (p.id !== projectId) return p;
        const newHistory = [...p.feedbackHistory];
        if (feedbackMessage && feedbackMessage.trim().length > 0) {
          newHistory.push({
            id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            date: now,
            author: authorName,
            authorId: authorId,
            message: feedbackMessage.trim()
          });
        }
        return sanitizeProject({
          ...p,
          status: newStatus,
          developmentStatus: devStatus || p.developmentStatus || 'não iniciado',
          feedbackHistory: newHistory,
          updatedAt: now
        });
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newArr));
      } catch (e) {}
      return newArr;
    });

    try {
      const target = projects.find((p) => p.id === projectId);
      const newHistory = target ? [...target.feedbackHistory] : [];
      if (feedbackMessage && feedbackMessage.trim().length > 0) {
        newHistory.push({
          id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          date: now,
          author: authorName,
          authorId: authorId,
          message: feedbackMessage.trim()
        });
      }

      const docRef = doc(db, 'projects', projectId);
      const updateData: any = {
        status: newStatus,
        feedbackHistory: newHistory,
        updatedAt: now
      };
      if (devStatus) {
        updateData.developmentStatus = devStatus;
      }
      await setDoc(docRef, updateData, { merge: true });
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Error updating status in Firestore:', err);
      setSyncStatus('offline');
    }
  };

  // Delete Project
  const deleteProject = async (projectId: string, reason?: string, adminName?: string) => {
    setSyncStatus('syncing');

    const target = projects.find((p) => p.id === projectId);

    // If reason is provided (deletion by admin), record notification
    if (reason && reason.trim().length > 0) {
      const newNotif: DeletionNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        projectId: projectId,
        projectTitle: target?.title || 'Projeto sem Título',
        authorId: target?.authorId || '',
        authorEmail: target?.authorEmail || '',
        authorName: target?.authorName || target?.authors || 'Maker',
        reason: reason.trim(),
        adminName: adminName || 'Administrador IFMaker',
        deletedAt: new Date().toISOString(),
        read: false
      };

      setDeletionNotifications((prev) => {
        const updated = [newNotif, ...prev];
        try {
          localStorage.setItem('ifmaker_deletion_notifications', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      try {
        await setDoc(doc(db, 'deletion_notifications', newNotif.id), newNotif);
      } catch (e) {
        console.warn('Error saving deletion notification to Firestore:', e);
      }
    }

    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== projectId);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Error deleting project from Firestore:', err);
      setSyncStatus('offline');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    setDeletionNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      try {
        localStorage.setItem('ifmaker_deletion_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'deletion_notifications', notificationId), { read: true }, { merge: true });
    } catch (e) {}
  };

  const getProjectById = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        saveProject,
        moderateProject,
        deleteProject,
        getProjectById,
        syncStatus,
        deletionNotifications,
        markNotificationAsRead
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
