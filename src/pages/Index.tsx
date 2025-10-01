import { Header } from "@/components/Header";
import { AISearchBar } from "@/components/AISearchBar";
import { FilterTags } from "@/components/FilterTags";
import { ProductGrid } from "@/components/ProductGrid";
import { ExplanationSections } from "@/components/ExplanationSections";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const navigate = useNavigate();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && profile && !loading) {
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* AI Search Hero Section */}
      <section className="py-32 px-6 min-h-[70vh] flex items-center">
        {user ? (
          <AISearchBar />
        ) : (
          <div className="w-full max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Welcome to PMZ Protein Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with certified meat suppliers worldwide. Use AI-powered search to find premium protein products.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-brand-navy hover:bg-brand-navy/90 text-primary-foreground text-lg px-8 py-6">
                Get Started - Sign In
              </Button>
            </Link>
          </div>
        )}
      </section>

      <main className="w-full">
        <FilterTags />
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-foreground mb-3 font-inter">
              Premium Protein Products
            </h2>
            <p className="text-muted-foreground font-inter text-lg">
              Discover our curated selection of high-quality meat products from certified global suppliers.
            </p>
          </div>
          <ProductGrid />
        </div>
        
        <div className="px-6">
          <ExplanationSections />
        </div>
      </main>
    </div>
  );
};

export default Index;