import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  newPassword?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, course?: string, phone?: string) => Promise<void>;
  updateUserProfileData: (payload: UpdateProfilePayload) => Promise<void>;
  logout: () => Promise<void>;
  toggleAdminRole: () => Promise<void>;
  isAdmin: boolean;
  isAllowedAdmin: boolean;
  isProfileDrawerOpen: boolean;
  openProfileDrawer: () => void;
  closeProfileDrawer: () => void;
  googleLoginNotice: boolean;
  dismissGoogleNotice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_UIDS = ['eoiieEs25XSFKq1a7RFka7zwDiG3', 'buBPrXXBoOYhqE2IUiF0Jw6woio2'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAllowedAdmin, setIsAllowedAdmin] = useState<boolean>(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [googleLoginNotice, setGoogleLoginNotice] = useState<boolean>(false);

  const openProfileDrawer = () => setIsProfileDrawerOpen(true);
  const closeProfileDrawer = () => setIsProfileDrawerOpen(false);
  const dismissGoogleNotice = () => setGoogleLoginNotice(false);

  // Sync user profile in Firestore
  const syncUserProfile = async (
    user: User,
    extraData?: { name?: string; course?: string; phone?: string }
  ): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', user.uid);
    const isSpecificallyAdmin = ADMIN_UIDS.includes(user.uid);

    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const allowedInDb = isSpecificallyAdmin || data.role === 'admin' || data.isAllowedAdmin === true || data.isAdmin === true;
        setIsAllowedAdmin(allowedInDb);

        const currentActiveRole: UserRole = allowedInDb ? (data.activeRole || 'admin') : 'maker';

        const profile: UserProfile = {
          uid: user.uid,
          name: data.name || user.displayName || 'Maker IFSP',
          email: data.email || user.email || '',
          role: currentActiveRole,
          createdAt: data.createdAt || new Date().toISOString(),
          course: data.course || extraData?.course || '',
          phone: data.phone || extraData?.phone || ''
        };

        // Update firestore if extra data was provided
        if (extraData?.course || extraData?.phone || extraData?.name) {
          try {
            await setDoc(userDocRef, {
              course: profile.course,
              phone: profile.phone,
              name: profile.name
            }, { merge: true });
          } catch (e) {
            console.warn('Could not merge extra profile fields in Firestore:', e);
          }
        }

        setUserProfile(profile);

        if (isSpecificallyAdmin && (data.role !== 'admin' || !data.isAllowedAdmin)) {
          try {
            await setDoc(userDocRef, { role: 'admin', isAllowedAdmin: true, isAdmin: true, activeRole: data.activeRole || 'admin' }, { merge: true });
          } catch (e) {
            console.warn('Could not update admin flags on user doc:', e);
          }
        }

        return profile;
      } else {
        setIsAllowedAdmin(isSpecificallyAdmin);
        const newProfile: UserProfile = {
          uid: user.uid,
          name: extraData?.name || user.displayName || user.email?.split('@')[0] || 'Maker IFSP',
          email: user.email || '',
          role: isSpecificallyAdmin ? 'admin' : 'maker',
          createdAt: new Date().toISOString(),
          course: extraData?.course || '',
          phone: extraData?.phone || ''
        };
        try {
          await setDoc(userDocRef, {
            ...newProfile,
            isAllowedAdmin: isSpecificallyAdmin,
            isAdmin: isSpecificallyAdmin,
            activeRole: isSpecificallyAdmin ? 'admin' : 'maker'
          });
        } catch (e) {
          console.warn('Could not create new user profile doc:', e);
        }
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Error fetching user profile from Firestore, using local fallback:', err);
      setIsAllowedAdmin(isSpecificallyAdmin);
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        name: extraData?.name || user.displayName || user.email?.split('@')[0] || 'Maker IFSP',
        email: user.email || '',
        role: isSpecificallyAdmin ? 'admin' : 'maker',
        createdAt: new Date().toISOString(),
        course: extraData?.course || '',
        phone: extraData?.phone || ''
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
        setIsAllowedAdmin(false);
        setGoogleLoginNotice(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      const profile = await syncUserProfile(result.user);
      // If course or phone are not populated, activate Google login notice
      if (!profile.course || !profile.phone) {
        setGoogleLoginNotice(true);
      }
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await syncUserProfile(result.user);
    }
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    pass: string,
    course?: string,
    phone?: string
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
      await syncUserProfile(result.user, { name, course, phone });
    }
  };

  const updateUserProfileData = async (payload: UpdateProfilePayload) => {
    if (!currentUser || !userProfile) throw new Error('Nenhum usuário autenticado.');

    const userDocRef = doc(db, 'users', currentUser.uid);
    const updatesDoc: Record<string, any> = {};

    // 1. Update Password if requested
    if (payload.newPassword && payload.newPassword.trim().length > 0) {
      if (payload.newPassword.trim().length < 6) {
        throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
      }
      try {
        await updatePassword(currentUser, payload.newPassword.trim());
      } catch (err: any) {
        if (err.code === 'auth/requires-recent-login') {
          throw new Error('Por segurança, faça login novamente na sua conta antes de alterar a senha.');
        }
        throw new Error(err.message || 'Falha ao atualizar a senha.');
      }
    }

    // 2. Update Email if requested
    if (payload.email && payload.email.trim() !== currentUser.email) {
      const newEmail = payload.email.trim();
      try {
        await updateEmail(currentUser, newEmail);
        updatesDoc.email = newEmail;
      } catch (err: any) {
        if (err.code === 'auth/requires-recent-login') {
          throw new Error('Por segurança, faça login novamente na sua conta antes de alterar o e-mail de acesso.');
        } else if (err.code === 'auth/email-already-in-use') {
          throw new Error('Este e-mail já está em uso por outra conta.');
        }
        throw new Error(err.message || 'Falha ao atualizar o e-mail de acesso.');
      }
    }

    // 3. Update Display Name if requested
    if (payload.name && payload.name.trim() !== userProfile.name) {
      const newName = payload.name.trim();
      await updateProfile(currentUser, { displayName: newName });
      updatesDoc.name = newName;
    }

    // 4. Update Course and Phone
    if (payload.course !== undefined) updatesDoc.course = payload.course.trim();
    if (payload.phone !== undefined) updatesDoc.phone = payload.phone.trim();

    // Update Firestore document
    if (Object.keys(updatesDoc).length > 0) {
      try {
        await setDoc(userDocRef, updatesDoc, { merge: true });
      } catch (e) {
        console.warn('Could not update Firestore user document:', e);
      }
    }

    // Update local state
    const updatedProfile: UserProfile = {
      ...userProfile,
      name: updatesDoc.name ?? userProfile.name,
      email: updatesDoc.email ?? userProfile.email,
      course: updatesDoc.course ?? userProfile.course ?? '',
      phone: updatesDoc.phone ?? userProfile.phone ?? ''
    };

    setUserProfile(updatedProfile);

    // If course and phone are now filled, dismiss google notice
    if (updatedProfile.course && updatedProfile.phone) {
      setGoogleLoginNotice(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setIsAllowedAdmin(false);
    setGoogleLoginNotice(false);
    closeProfileDrawer();
  };

  const toggleAdminRole = async () => {
    if (!currentUser || !userProfile || !isAllowedAdmin) return;
    const newRole: UserRole = userProfile.role === 'admin' ? 'maker' : 'admin';
    const updatedProfile = { ...userProfile, role: newRole };
    setUserProfile(updatedProfile);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { activeRole: newRole });
    } catch (err) {
      console.warn('Failed to update activeRole in Firestore:', err);
    }
  };

  const isAdmin = isAllowedAdmin && userProfile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        updateUserProfileData,
        logout,
        toggleAdminRole,
        isAdmin,
        isAllowedAdmin,
        isProfileDrawerOpen,
        openProfileDrawer,
        closeProfileDrawer,
        googleLoginNotice,
        dismissGoogleNotice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

