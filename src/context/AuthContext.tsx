import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogleAuth, signOutUser, testConnection } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test connection once on boot
    testConnection().catch(() => {});

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        console.error('Auth state error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogleAuth();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      // Friendly message for popup blocking or cancellation
      if (err.code === 'auth/popup-blocked') {
        setError('Google Sign-In popup was blocked by your browser. Please allow popups for this site.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please click "Sign in with Google" to log in.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOutUser();
      setUser(null);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      setError(err.message || 'Failed to sign out.');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
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
