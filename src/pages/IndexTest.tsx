import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const IndexTest = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="p-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Test Page - PMZ Protein Marketplace
        </h1>
        
        {user ? (
          <div>
            <p className="text-xl text-muted-foreground mb-4">
              Welcome back! You are logged in.
            </p>
            <Button>Search Products</Button>
          </div>
        ) : (
          <div>
            <p className="text-xl text-muted-foreground mb-4">
              You are not logged in. Please sign in to access the platform.
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexTest;