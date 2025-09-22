import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shadow-sm">
      {/* Logo - Based on PM2 Design */}
      <div className="flex items-center">
        <SidebarTrigger />
        <div className="flex items-center space-x-3 ml-4">
          <div className="relative">
            <img 
              src="/lovable-uploads/b2670e2d-b9db-468d-be24-1486054a28ff.png" 
              alt="PMZ Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-primary leading-tight font-tanker">PROTEIN</h1>
            <h2 className="text-xl font-bold text-primary leading-tight font-tanker">MARKAZ</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">AI-Enhanced Meat Marketplace</p>
          </div>
        </div>
      </div>

      {/* User Controls */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="hover:bg-muted"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="default">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};