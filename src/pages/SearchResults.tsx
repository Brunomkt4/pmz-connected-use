import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductGrid, Product } from '@/components/ProductGrid';
import { Badge } from '@/components/ui/badge';

type SearchStep = 'analyzing' | 'understanding' | 'searching' | 'results';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [currentStep, setCurrentStep] = useState<SearchStep>('analyzing');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Mock analysis results based on query
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!query) {
      navigate('/');
      return;
    }

    // Simulate AI analysis process
    const steps = [
      { step: 'analyzing', duration: 2000 },
      { step: 'understanding', duration: 2500 },
      { step: 'searching', duration: 3000 },
      { step: 'results', duration: 1000 }
    ];

    let currentIndex = 0;
    
    const processStep = () => {
      if (currentIndex < steps.length) {
        const { step, duration } = steps[currentIndex];
        setCurrentStep(step as SearchStep);
        
        setTimeout(() => {
          if (step === 'understanding') {
            // Simulate analysis results
            const mockAnalysis = generateAnalysisResults(query);
            setAnalysisResults(mockAnalysis);
          }
          
          if (step === 'results') {
            setAnalysisComplete(true);
            setTimeout(() => {
              setShowResults(true);
              // Filter products based on query
              const products = filterProductsByQuery(query);
              setFilteredProducts(products);
            }, 500);
          }
          
          currentIndex++;
          processStep();
        }, duration);
      }
    };

    processStep();
  }, [query, navigate]);

  const generateAnalysisResults = (searchQuery: string): string[] => {
    const lowerQuery = searchQuery.toLowerCase();
    const results = [];
    
    if (lowerQuery.includes('beef') || lowerQuery.includes('carne')) {
      results.push('beef products', 'premium quality', 'export ready');
    }
    if (lowerQuery.includes('chicken') || lowerQuery.includes('frango')) {
      results.push('poultry products', 'frozen chicken', 'halal certified');
    }
    if (lowerQuery.includes('pork') || lowerQuery.includes('porco')) {
      results.push('pork products', 'frozen cuts', 'eu standards');
    }
    if (lowerQuery.includes('premium') || lowerQuery.includes('quality')) {
      results.push('high quality', 'certified suppliers');
    }
    if (lowerQuery.includes('indonesia') || lowerQuery.includes('export')) {
      results.push('export grade', 'international shipping');
    }
    
    return results.length > 0 ? results : ['protein products', 'quality assurance', 'global suppliers'];
  };

  const filterProductsByQuery = (searchQuery: string): Product[] => {
    // Mock filtering - in real app this would be API call
    const allProducts: Product[] = [
      {
        id: "1", name: "Frozen Pork Whole Ears", image: "/lovable-uploads/pork-leg.jpg",
        price: "€ 1,85", seller: "MeatBorsa", sellerEmail: "contact@meatborsa.com",
        interestedCount: 126, isHotPick: true, category: "pork", assets: ["S", "R", "H"]
      },
      {
        id: "3", name: "Frozen Chicken Leg Quarter", image: "/lovable-uploads/chicken-breast.jpg",
        price: "€ 1,65", seller: "MeatBorsa", sellerEmail: "contact@meatborsa.com",
        interestedCount: 308, isHotPick: true, category: "poultry", assets: ["S", "R", "H", "B"]
      },
      {
        id: "8", name: "10t / weekly fresh pork silverside", image: "/lovable-uploads/beef-alcatra.jpg",
        price: "€ 3,98", seller: "Anmex", sellerEmail: "info@anmex.com",
        interestedCount: 63, category: "beef", assets: ["S", "R", "B", "L", "H"]
      }
    ];
    
    return allProducts;
  };

  const getStepIcon = (step: SearchStep) => {
    switch (step) {
      case 'analyzing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'understanding':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'searching':
        return <Search className="h-4 w-4" />;
      case 'results':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStepText = (step: SearchStep) => {
    switch (step) {
      case 'analyzing':
        return 'Analyzing your needs to find products';
      case 'understanding':
        return 'Understanding requirements';
      case 'searching':
        return 'Searching verified suppliers';
      case 'results':
        return 'Results found';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">AI Agent Procurement</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        {/* Sidebar - Chat Interface */}
        <div className="w-full lg:w-96 border-r border-border bg-card p-6">
          <div className="space-y-4">
            {/* User Query */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">Your search:</p>
              <p className="text-foreground">{query}</p>
            </div>

            {/* AI Analysis Process */}
            <Card className="border-0 shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-ai rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold">AI Procurement Agent</span>
                </div>

                {/* Analysis Steps */}
                <div className="space-y-3">
                  {(['analyzing', 'understanding', 'searching', 'results'] as SearchStep[]).map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`transition-colors duration-300 ${
                        currentStep === step ? 'text-primary' : 
                        ['analyzing', 'understanding', 'searching', 'results'].indexOf(currentStep) > index ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        {getStepIcon(step)}
                      </div>
                      <span className={`text-sm transition-colors duration-300 ${
                        currentStep === step ? 'text-foreground font-medium' : 
                        ['analyzing', 'understanding', 'searching', 'results'].indexOf(currentStep) > index ? 'text-muted-foreground' : 'text-muted-foreground/60'
                      }`}>
                        {getStepText(step)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Analysis Results */}
                {analysisResults.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Identified requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.map((result, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {result}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {analysisComplete && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Found {filteredProducts.length} matching products from verified suppliers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content - Results */}
        <div className="flex-1 p-6">
          {showResults ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Search Results
                </h1>
                <p className="text-muted-foreground">
                  Found {filteredProducts.length} products matching your requirements
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group cursor-pointer bg-gradient-card border-0 shadow-soft hover:shadow-medium card-hover rounded-md overflow-hidden smooth-transition">
                    <CardContent className="p-0 relative">
                      {/* Asset Badges */}
                      {product.assets && product.assets.length > 0 && (
                        <div className="absolute top-1 right-1 z-10 flex gap-1">
                          {product.assets.map((asset) => (
                            <div
                              key={asset}
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                asset === 'S' ? 'bg-brand-blue text-white' :
                                asset === 'R' ? 'bg-brand-orange text-white' :
                                asset === 'B' ? 'bg-brand-red text-white' :
                                asset === 'L' ? 'bg-brand-navy text-white' :
                                'bg-brand-burgundy text-white'
                              }`}
                            >
                              {asset}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Hot Pick Badge */}
                      {product.isHotPick && (
                        <Badge className="absolute top-1 left-1 z-10 bg-gradient-accent text-white flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full shadow-soft font-medium">
                          <span className="text-xs">🔥</span>
                          Hot
                        </Badge>
                      )}
                      
                      {/* Product Image */}
                      <div className="aspect-square overflow-hidden relative bg-muted/20">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-3">
                        <h3 className="font-semibold text-card-foreground text-sm leading-tight line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        
                        <div className="text-lg font-bold text-brand-navy mb-2">
                          {product.price}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-3">
                          {product.seller}
                        </div>
                        
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => window.location.href = `mailto:${product.sellerEmail}?subject=Inquiry about ${product.name}`}
                        >
                          Contact Supplier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Preparing your results...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}