import { useState } from "react";
import { Home, History, Heart, MessageSquare, Settings, Building2, ShoppingCart, Ship, Shield, CreditCard, Award, TrendingUp } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { id: "home", label: "Home", url: "/", icon: Home },
  { id: "history", label: "History", url: "/history", icon: History },
  { id: "favorites", label: "Favorites", url: "/favorites", icon: Heart },
  { id: "messages", label: "Messages", url: "/messages", icon: MessageSquare },
  { id: "transactions", label: "Transaction Intel", url: "/transaction-intelligence", icon: TrendingUp },
  { id: "supplier", label: "Cadastro Fornecedor", url: "/supplier-registration", icon: Building2 },
  { id: "buyer", label: "Buyer Registration", url: "/buyer-registration", icon: ShoppingCart },
  { id: "transport", label: "Transport Registration", url: "/transport-registration", icon: Ship },
  { id: "guarantee", label: "Bank Guarantee", url: "/bank-guarantee-registration", icon: Shield },
  { id: "credit", label: "Letter of Credit", url: "/letter-of-credit-registration", icon: CreditCard },
  { id: "certification", label: "Certification", url: "/certification-registration", icon: Award },
  { id: "settings", label: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className="w-12 bg-background border-r border-border/50"
      collapsible="none"
    >
      <SidebarContent className="pt-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
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