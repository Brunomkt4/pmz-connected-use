import React, { createContext, useContext, useEffect, useState } from 'react';
import { mockAuth, MockUser, MockSession } from '@/services/mockAuth';

interface AuthContextType {
  user: MockUser | null;
  session: MockSession | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, accountTypeId: number, companyName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const subscription = mockAuth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    const currentSession = mockAuth.getSession();
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setLoading(false);

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, accountTypeId: number, companyName?: string) => {
    try {
      const { error } = await mockAuth.signUp(email, password, fullName, accountTypeId, companyName);

      if (error) {
        console.error("Sign Up Error:", error.message);
      }

      return { error };
    } catch (error: any) {
      console.error("Sign Up Error:", error.message);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await mockAuth.signIn(email, password);

      if (error) {
        console.error("Sign In Error:", error.message);
      }

      return { error };
    } catch (error: any) {
      console.error("Sign In Error:", error.message);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await mockAuth.signOut();
    } catch (error: any) {
      console.error("Sign Out Error:", error.message);
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) {
        return { error: { message: "No user logged in" } };
      }

      const { error } = await mockAuth.deleteAccount(user.id);

      if (error) {
        console.error("Account Deletion Error:", error.message);
        return { error };
      }

      await signOut();
      return { error: null };
    } catch (error: any) {
      console.error("Account Deletion Error:", error.message);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};