import React from 'react';
import { ProductGrid } from '@/components/ProductGrid';
import { FilterTags } from '@/components/FilterTags';
import { AISearchBar } from '@/components/AISearchBar';

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Product Marketplace</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse and purchase premium protein products from verified suppliers worldwide
          </p>
        </div>

        {/* AI Search Bar */}
        <div className="mb-8">
          <AISearchBar />
        </div>

        {/* Filter Tags */}
        <div className="mb-8">
          <FilterTags />
        </div>

        {/* Product Grid */}
        <ProductGrid />
      </div>
    </div>
  );
};

export default Marketplace;