import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogleAuth, signOutUser, testConnection } from '../services/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest?: boolean;
}

export type AnyUser = User | AppUser;

interface AuthContextType {
  user: AnyUser | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  isDomainUnauthorized: boolean;
  currentDomain: string;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const GUEST_FLAG_KEY = 'focustrack_guest_session_active';
const GUEST_UID_KEY = 'focustrack_guest_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AnyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isDomainUnauthorized, setIsDomainUnauthorized] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  const initGuestUser = (): AppUser => {
    let guestId = localStorage.getItem(GUEST_UID_KEY);
    if (!guestId) {
      guestId = 'student_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(GUEST_UID_KEY, guestId);
    }
    return {
      uid: 'guest_' + guestId,
      displayName: 'Student (Local Mode)',
      email: 'student@focustrack.local',
      photoURL: null,
      isGuest: true,
    };
  };

  useEffect(() => {
    testConnection().catch(() => {});

    const wasGuest = localStorage.getItem(GUEST_FLAG_KEY) === 'true';

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          localStorage.removeItem(GUEST_FLAG_KEY);
          setUser(currentUser);
        } else if (wasGuest) {
          setUser(initGuestUser());
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Auth state error:', err);
        if (wasGuest) {
          setUser(initGuestUser());
        } else {
          setError(err.message);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    setErrorCode(null);
    setIsDomainUnauthorized(false);
    try {
      await signInWithGoogleAuth();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      const code = err.code || '';
      setErrorCode(code);
      if (code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setIsDomainUnauthorized(true);
        setError(`Domain not authorized: Firebase requires "${window.location.hostname}" in your Firebase Console's Authorized Domains list.`);
      } else if (code === 'auth/popup-blocked') {
        setError('Google Sign-In popup was blocked by your browser. Please allow popups for this site.');
      } else if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please click "Continue with Google" to log in.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
      throw err;
    }
  };

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_FLAG_KEY, 'true');
    setUser(initGuestUser());
    setError(null);
    setErrorCode(null);
    setIsDomainUnauthorized(false);
  };

  const logout = async () => {
    setError(null);
    setErrorCode(null);
    setIsDomainUnauthorized(false);
    localStorage.removeItem(GUEST_FLAG_KEY);
    try {
      if (auth.currentUser) {
        await signOutUser();
      }
      setUser(null);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      setUser(null);
    }
  };

  const clearError = () => {
    setError(null);
    setErrorCode(null);
    setIsDomainUnauthorized(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        errorCode,
        isDomainUnauthorized,
        currentDomain,
        signInWithGoogle,
        continueAsGuest,
        logout,
        clearError,
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
