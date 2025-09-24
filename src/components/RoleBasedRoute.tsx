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
    if (!loading && isAuthenticated) {
      if (!profile || !allowedAccountTypes.includes(profile.account_type_id)) {
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

  if (!isAuthenticated || !profile || !allowedAccountTypes.includes(profile.account_type_id)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;