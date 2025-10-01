import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const FirstTimeSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (!user) return;

      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type_id')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile?.account_type_id) return;

        const accountTypeId = profile.account_type_id;

        // Check if specific role data exists
        let hasRoleData = false;

        if (accountTypeId === 1) {
          // Buyer
          const { data } = await supabase
            .from('buyers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          hasRoleData = !!data;
        } else if (accountTypeId === 2) {
          // Supplier
          const { data } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          hasRoleData = !!data;
        } else if (accountTypeId === 3) {
          // Carrier
          const { data } = await supabase
            .from('carriers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          hasRoleData = !!data;
        }

        // If no role data exists, redirect to appropriate registration page
        if (!hasRoleData) {
          let targetRoute = '';
          
          switch (accountTypeId) {
            case 1:
              targetRoute = '/buyer-registration';
              break;
            case 2:
              targetRoute = '/supplier-registration';
              break;
            case 3:
              targetRoute = '/transport-registration';
              break;
            default:
              return;
          }

          // Only redirect if not already on the registration page
          if (location.pathname !== targetRoute) {
            navigate(targetRoute);
          }
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
      }
    };

    checkSetupStatus();
  }, [user, navigate, location]);

  return null;
};
