import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, accountTypeId: number, companyName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            account_type_id: accountTypeId,
            company_name: companyName || null,
          }
        }
      });

      if (error) {
        console.error("Sign Up Error:", error.message);
      } else {
        // Send welcome email
        try {
          const { data: accountTypes } = await supabase
            .from("account_types")
            .select("name")
            .eq("id", accountTypeId)
            .single();

          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email,
              name: fullName,
              accountType: accountTypes?.name || 'User'
            }
          });
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
        }
      }

      return { error };
    } catch (error: any) {
      console.error("Sign Up Error:", error.message);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("Sign Out Error:", error.message);
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) {
        return { error: { message: "No user logged in" } };
      }

      // Call edge function to delete user account and all associated data
      const { error } = await supabase.functions.invoke('delete-user-account', {
        body: { userId: user.id }
      });

      if (error) {
        console.error("Account Deletion Error:", error.message);
        return { error };
      }

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