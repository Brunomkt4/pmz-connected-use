import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ShoppingCart, Ship, Shield, CreditCard, Award } from 'lucide-react';
import { mockSuppliers, mockBuyers, mockCarriers } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';

const UserDashboard = () => {
  const { profile, accountType, loading } = useUserProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasRoleData, setHasRoleData] = useState<boolean | null>(null);

  // Check if user has completed role-specific registration
  useEffect(() => {
    const checkRoleData = async () => {
      if (!user || !profile?.account_type_id) return;

      try {
        let hasData = false;

        if (profile.account_type_id === 1) {
          const data = mockSuppliers.get(user.id);
          hasData = !!data;
        } else if (profile.account_type_id === 2) {
          const data = mockBuyers.get(user.id);
          hasData = !!data;
        } else if (profile.account_type_id === 3) {
          const data = mockCarriers.get(user.id);
          hasData = !!data;
        }

        setHasRoleData(hasData);
      } catch (error) {
        console.error('Error checking role data:', error);
      }
    };

    checkRoleData();
  }, [user, profile]);

  const getRegistrationInfo = () => {
    if (!profile) return null;

    const registrationRoutes = {
      1: { // Seller
        title: 'Supplier Registration',
        description: 'Register your company as a supplier and showcase your products',
        route: '/supplier-registration',
        icon: Building2,
        color: 'text-blue-600'
      },
      2: { // Buyer
        title: 'Buyer Registration', 
        description: 'Register as a buyer and specify your product requirements',
        route: '/buyer-registration',
        icon: ShoppingCart,
        color: 'text-green-600'
      },
      3: { // Carrier
        title: 'Transport Registration',
        description: 'Register your transportation and logistics services',
        route: '/transport-registration',
        icon: Ship,
        color: 'text-orange-600'
      },
      4: { // Insurance Company
        title: 'Certification Registration',
        description: 'Register your insurance and certification services',
        route: '/certification-registration', 
        icon: Award,
        color: 'text-purple-600'
      },
      5: { // Bank Guarantee
        title: 'Bank Guarantee Registration',
        description: 'Register your bank guarantee services',
        route: '/bank-guarantee-registration',
        icon: Shield,
        color: 'text-red-600'
      },
      6: { // Financing
        title: 'Letter of Credit Registration',
        description: 'Register your financing and letter of credit services',
        route: '/letter-of-credit-registration',
        icon: CreditCard,
        color: 'text-indigo-600'
      }
    };

    return registrationRoutes[profile.account_type_id as keyof typeof registrationRoutes];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  if (!profile || !accountType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Unable to load your profile information. Please try logging in again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const registrationInfo = getRegistrationInfo();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {profile.full_name}!</h1>
        <p className="text-muted-foreground">
          You are registered as: <span className="font-semibold">{accountType.name}</span>
        </p>
      </div>

      {registrationInfo && hasRoleData === false && (
        <Card className="max-w-2xl mx-auto border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <registrationInfo.icon className={`h-12 w-12 ${registrationInfo.color}`} />
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription className="text-lg">
              {registrationInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Button 
                onClick={() => navigate(registrationInfo.route)}
                size="lg"
                className="w-full max-w-sm"
              >
                Complete Registration Now
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              <p>You need to complete your registration to access all platform features.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {registrationInfo && hasRoleData === true && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <registrationInfo.icon className={`h-12 w-12 ${registrationInfo.color}`} />
            </div>
            <CardTitle className="text-2xl">{registrationInfo.title}</CardTitle>
            <CardDescription className="text-lg">
              Update your registration information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Button 
                onClick={() => navigate(registrationInfo.route)}
                size="lg"
                variant="outline"
                className="w-full max-w-sm"
              >
                Edit Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Intelligence</CardTitle>
            <CardDescription>
              View market insights and transaction data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => navigate('/transaction-intelligence')}
              className="w-full"
            >
              View Intelligence
            </Button>
          </CardContent>
        </Card>

        {profile?.account_type_id === 2 && ( // Only show for buyers
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Marketplace</CardTitle>
              <CardDescription>
                Browse and purchase products from suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => navigate('/marketplace')}
                className="w-full"
              >
                Browse Products
              </Button>
            </CardContent>
          </Card>
        )}

        {profile?.account_type_id === 2 && ( // Only show for buyers
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search</CardTitle>
              <CardDescription>
                Find products and services on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => navigate('/search')}
                className="w-full"
              >
                Start Searching
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
              className="w-full"
            >
              Open Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;