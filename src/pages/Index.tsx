import { Header } from "@/components/Header";
import { AISearchBar } from "@/components/AISearchBar";
import { FilterTags } from "@/components/FilterTags";
import { ProductGrid } from "@/components/ProductGrid";
import { ExplanationSections } from "@/components/ExplanationSections";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* AI Search Hero Section */}
      <section className="py-32 px-6 min-h-[70vh] flex items-center">
        <AISearchBar />
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