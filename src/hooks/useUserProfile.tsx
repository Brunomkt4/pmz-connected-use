import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockProfiles, accountTypes } from '@/services/mockData';

interface UserProfile {
  id: string;
  account_type_id: number;
  full_name: string;
  email: string;
  phone?: string;
  language?: string;
  timezone?: string;
  notifications_enabled?: boolean;
  date_format?: string;
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

        // Fetch user profile from mock data
        const profileData = mockProfiles.get(user.id);

        if (!profileData) {
          console.warn('No profile found for user:', user.id);
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch account type details
        if (profileData?.account_type_id) {
          const accountTypeData = accountTypes.find(
            at => at.id === profileData.account_type_id
          );

          if (accountTypeData) {
            setAccountType(accountTypeData);
          }
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