import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  account_type_id: number;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
}

interface AccountType {
  id: number;
  name: string;
  description: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setAccountType(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProfile(profileData);

        // Fetch account type details
        if (profileData?.account_type_id) {
          const { data: accountTypeData, error: accountTypeError } = await supabase
            .from('account_types')
            .select('*')
            .eq('id', profileData.account_type_id)
            .single();

          if (accountTypeError) {
            throw accountTypeError;
          }

          setAccountType(accountTypeData);
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return {
    profile,
    accountType,
    loading,
    error,
    isAuthenticated: !!user,
  };
};