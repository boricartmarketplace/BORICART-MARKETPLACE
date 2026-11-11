import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { AdminRole, AdminUser } from '../types';
import { INITIAL_STAFF } from '../data/initialCatalog';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminRole: AdminRole;
  staffUser: AdminUser | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  registerWithEmailPassword: (name: string, email: string, password: string, role?: AdminRole) => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  loginDemoAdmin: (role?: AdminRole) => void;
  switchRole: (role: AdminRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Master super admin emails
const SUPER_ADMIN_EMAILS = [
  'boricartmarketplace@gmail.com',
  'admin@boricart.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('boricart_admin_session') === 'true';
  });
  const [adminRole, setAdminRole] = useState<AdminRole>(() => {
    const saved = localStorage.getItem('boricart_admin_role') as AdminRole;
    return saved || 'overall_admin';
  });
  const [staffUser, setStaffUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Lookup role from Firestore when user authenticates
  const checkStaffRole = async (email: string) => {
    try {
      const q = query(collection(db, 'admins'), where('email', '==', email.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data() as AdminUser;
        if (data.status !== 'suspended') {
          setStaffUser({ ...data, id: snap.docs[0].id });
          setAdminRole(data.role || 'overall_admin');
          localStorage.setItem('boricart_admin_role', data.role || 'overall_admin');
          return true;
        }
      }
    } catch (e) {
      console.warn('Could not query staff role from Firestore:', e);
    }
    // Fallback if super admin
    if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
      setAdminRole('overall_admin');
      localStorage.setItem('boricart_admin_role', 'overall_admin');
      return true;
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser?.email) {
        const isStaff = await checkStaffRole(firebaseUser.email);
        const isAuthAdmin =
          isStaff ||
          SUPER_ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase()) ||
          localStorage.getItem('boricart_admin_session') === 'true';
        setIsAdmin(isAuthAdmin);
      } else {
        const localAdmin = localStorage.getItem('boricart_admin_session') === 'true';
        setIsAdmin(localAdmin);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        await checkStaffRole(result.user.email);
      }
      localStorage.setItem('boricart_admin_session', 'true');
      setIsAdmin(true);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmailPassword = async (name: string, email: string, password: string, role: AdminRole = 'overall_admin') => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    try {
      // 1. Try Firebase Auth (if enabled in console)
      try {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        if (cred.user) {
          await updateProfile(cred.user, { displayName: cleanName });
        }
      } catch (authErr: any) {
        console.warn('Firebase Auth note (using resilient administrative directory):', authErr?.code || authErr?.message);
      }

      // 2. Save credentials in local resilient directory
      try {
        const credsRaw = localStorage.getItem('boricart_staff_credentials');
        const credsList: any[] = credsRaw ? JSON.parse(credsRaw) : [];
        const filtered = credsList.filter((c) => c.email?.toLowerCase() !== cleanEmail);
        filtered.push({
          email: cleanEmail,
          password: cleanPass,
          name: cleanName,
          role: role,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('boricart_staff_credentials', JSON.stringify(filtered));
      } catch (e) {
        console.warn('Could not cache credentials locally:', e);
      }

      // 3. Register staff in Firestore admins collection
      const { saveStaffMember } = await import('../firebase/services');
      const staffDoc = await saveStaffMember({
        id: `admin-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
        name: cleanName,
        email: cleanEmail,
        role: role,
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      setStaffUser(staffDoc);
      setAdminRole(role);
      localStorage.setItem('boricart_admin_role', role);
      localStorage.setItem('boricart_admin_session', 'true');
      setIsAdmin(true);
    } catch (error) {
      console.error('Email registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      if (!cleanEmail) throw new Error('Please enter your email address');
      if (!cleanPass) throw new Error('Please enter your password');

      let authenticated = false;
      let matchedRole: AdminRole = 'overall_admin';
      let matchedStaffUser: AdminUser | null = null;

      // Check 1: Super Admin Direct Match (boricartmarketplace@gmail.com)
      if (SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
        authenticated = true;
        matchedRole = 'overall_admin';
        matchedStaffUser = {
          id: 'admin-overall-super',
          name: 'Boricart Super Admin',
          email: cleanEmail,
          role: 'overall_admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
      }

      // Check 2: Pre-seeded standard staff accounts
      if (!authenticated) {
        const initialMatch = INITIAL_STAFF.find((s) => s.email.toLowerCase() === cleanEmail);
        if (initialMatch && initialMatch.status !== 'suspended') {
          authenticated = true;
          matchedRole = initialMatch.role;
          matchedStaffUser = initialMatch;
        }
      }

      // Check 3: Registered accounts in local credentials store
      if (!authenticated) {
        try {
          const credsRaw = localStorage.getItem('boricart_staff_credentials');
          if (credsRaw) {
            const credsList: any[] = JSON.parse(credsRaw);
            const found = credsList.find((c) => c.email?.toLowerCase() === cleanEmail);
            if (found) {
              if (found.password && found.password !== cleanPass) {
                throw new Error('Incorrect password for registered staff account.');
              }
              authenticated = true;
              matchedRole = found.role || 'overall_admin';
              matchedStaffUser = {
                id: `admin-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
                name: found.name || cleanEmail.split('@')[0],
                email: cleanEmail,
                role: matchedRole,
                status: 'active',
                createdAt: found.createdAt || new Date().toISOString(),
              };
            }
          }
        } catch (e: any) {
          if (e.message?.includes('Incorrect password')) throw e;
        }
      }

      // Check 4: Try Firebase Auth signInWithEmailAndPassword
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        if (cred.user?.email) {
          await checkStaffRole(cred.user.email);
          authenticated = true;
        }
      } catch (authErr: any) {
        console.warn('Firebase Auth login notice:', authErr?.code || authErr?.message);
      }

      // Check 5: Look up Firestore admins collection
      if (!authenticated) {
        const hasStaff = await checkStaffRole(cleanEmail);
        if (hasStaff) {
          authenticated = true;
        }
      }

      if (!authenticated) {
        throw new Error(
          `No staff account registered for ${cleanEmail}. Please click "Register Admin" tab to create your credentials or use Instant Access below.`
        );
      }

      // Successful login
      if (matchedStaffUser) {
        setStaffUser(matchedStaffUser);
      }
      setAdminRole(matchedRole);
      localStorage.setItem('boricart_admin_role', matchedRole);
      localStorage.setItem('boricart_admin_session', 'true');
      setIsAdmin(true);
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoAdmin = (role: AdminRole = 'overall_admin') => {
    localStorage.setItem('boricart_admin_session', 'true');
    localStorage.setItem('boricart_admin_role', role);
    setAdminRole(role);
    const mockStaff = INITIAL_STAFF.find((s) => s.role === role) || INITIAL_STAFF[0];
    setStaffUser(mockStaff);
    setIsAdmin(true);
  };

  const switchRole = (role: AdminRole) => {
    setAdminRole(role);
    localStorage.setItem('boricart_admin_role', role);
    const mockStaff = INITIAL_STAFF.find((s) => s.role === role) || INITIAL_STAFF[0];
    setStaffUser(mockStaff);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('boricart_admin_session');
      localStorage.removeItem('boricart_admin_role');
      setIsAdmin(false);
      setStaffUser(null);
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        adminRole,
        staffUser,
        isLoading,
        loginWithGoogle,
        registerWithEmailPassword,
        loginWithEmailPassword,
        loginDemoAdmin,
        switchRole,
        logout,
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
