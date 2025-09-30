import { Home, History, Heart, MessageSquare, Settings, Building2, ShoppingCart, Ship, Shield, CreditCard, Award, TrendingUp, LayoutDashboard } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  icon: any;
  allowedAccountTypes: number[];
}

const allMenuItems: MenuItem[] = [
  { id: "home", label: "Home", url: "/", icon: Home, allowedAccountTypes: [1, 2, 3, 4, 5, 6] },
  { id: "dashboard", label: "Dashboard", url: "/dashboard", icon: LayoutDashboard, allowedAccountTypes: [1, 2, 3, 4, 5, 6] },
  { id: "marketplace", label: "Marketplace", url: "/marketplace", icon: ShoppingCart, allowedAccountTypes: [2] }, // Only Buyers
  { id: "history", label: "History", url: "/history", icon: History, allowedAccountTypes: [1, 2, 3, 4, 5, 6] },
  { id: "favorites", label: "Favorites", url: "/favorites", icon: Heart, allowedAccountTypes: [1, 2, 3, 4, 5, 6] },
  { id: "messages", label: "Messages", url: "/messages", icon: MessageSquare, allowedAccountTypes: [1, 2, 3, 4, 5, 6] },
  { id: "transactions", label: "Transaction Intel", url: "/transaction-intelligence", icon: TrendingUp, allowedAccountTypes: [1, 2, 3, 4, 5, 6] },
  { id: "supplier", label: "Supplier Registration", url: "/supplier-registration", icon: Building2, allowedAccountTypes: [1] }, // Only Sellers
  { id: "buyer", label: "Buyer Registration", url: "/buyer-registration", icon: ShoppingCart, allowedAccountTypes: [2] }, // Only Buyers
  { id: "transport", label: "Transport Registration", url: "/transport-registration", icon: Ship, allowedAccountTypes: [3] }, // Only Carriers
  { id: "guarantee", label: "Bank Guarantee", url: "/bank-guarantee-registration", icon: Shield, allowedAccountTypes: [5] }, // Only Bank Guarantee
  { id: "credit", label: "Letter of Credit", url: "/letter-of-credit-registration", icon: CreditCard, allowedAccountTypes: [6] }, // Only Financing
  { id: "certification", label: "Certification", url: "/certification-registration", icon: Award, allowedAccountTypes: [4] }, // Only Insurance
  { id: "settings", label: "Settings", url: "/settings", icon: Settings, allowedAccountTypes: [1, 2, 3, 4, 5, 6] },
];

export function RoleBasedSidebar() {
  const location = useLocation();
  const { profile, loading } = useUserProfile();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  // Filter menu items based on account type and logged in status
  const getVisibleMenuItems = () => {
    // If user is not logged in, show NO icons
    if (!profile) {
      return [];
    }
    
    // User is logged in - remove home and filter by account type
    let filteredItems = allMenuItems.filter(item => item.id !== "home");
    
    // Filter by account type if available
    if (profile.account_type_id) {
      filteredItems = filteredItems.filter(item => 
        item.allowedAccountTypes.includes(profile.account_type_id)
      );
    } else {
      // If logged in but account_type_id not loaded, show only universal items
      filteredItems = filteredItems.filter(item => 
        item.allowedAccountTypes.length === 6
      );
    }
    
    return filteredItems;
  };

  const visibleMenuItems = getVisibleMenuItems();

  // Don't render sidebar at all if user is not logged in
  if (!profile && !loading) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <Sidebar className="w-12 bg-background border-r border-border/50" collapsible="none">
        <SidebarContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="text-sm">Loading...</div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      className="w-12 bg-background border-r border-border/50"
      collapsible="none"
    >
      <SidebarContent className="pt-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className="h-10 w-10 p-0 rounded-lg hover:bg-muted/50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground mx-auto"
                      tooltip={item.label}
                    >
                      <NavLink to={item.url} className="flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}