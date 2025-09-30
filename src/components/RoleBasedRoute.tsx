import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedAccountTypes: number[];
  redirectTo?: string;
}

const RoleBasedRoute = ({ 
  children, 
  allowedAccountTypes, 
  redirectTo = '/' 
}: RoleBasedRouteProps) => {
  const { profile, loading, isAuthenticated } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && profile) {
      const userType = Number(profile.account_type_id);
      console.debug('RoleBasedRoute check', { userType, allowedAccountTypes });
      if (Number.isFinite(userType) && !allowedAccountTypes.includes(userType)) {
        navigate(redirectTo);
      }
    }
  }, [profile, loading, isAuthenticated, allowedAccountTypes, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  const userType = Number(profile.account_type_id);
  if (!Number.isFinite(userType)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!allowedAccountTypes.includes(userType)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;