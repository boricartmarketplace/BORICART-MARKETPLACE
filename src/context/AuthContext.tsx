import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginDemoAdmin: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Master admin email provided in user session
const AUTHORIZED_ADMIN_EMAILS = [
  'boricartmarketplace@gmail.com',
  'admin@boricart.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    // Check if session admin was previously saved in localStorage
    return localStorage.getItem('boricart_admin_session') === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const isAuthAdmin =
          Boolean(firebaseUser.email && AUTHORIZED_ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())) ||
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
      const isAuthAdmin =
        Boolean(result.user.email && AUTHORIZED_ADMIN_EMAILS.includes(result.user.email.toLowerCase()));
      if (isAuthAdmin) {
        localStorage.setItem('boricart_admin_session', 'true');
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoAdmin = () => {
    localStorage.setItem('boricart_admin_session', 'true');
    setIsAdmin(true);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('boricart_admin_session');
      setIsAdmin(false);
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
        isLoading,
        loginWithGoogle,
        loginDemoAdmin,
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
