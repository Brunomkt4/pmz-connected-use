import { useState } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AISearchBar = () => {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('q', query.trim());
      window.location.href = `/search?${searchParams.toString()}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-ai text-white px-5 py-3 rounded-full text-base font-medium mb-8">
          <Sparkles className="h-5 w-5" />
          AI Agent Procurement
        </div>
        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-6 font-inter">
          What protein products are you looking for today?
        </h1>
      </div>

      <div className={`relative group ${isActive ? 'ai-glow' : ''}`}>
        <div className="relative bg-search-bg border border-search-border rounded-xl p-2 shadow-soft smooth-transition group-hover:shadow-glow group-hover:border-primary/50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 pl-4">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsActive(true)}
              onBlur={() => setIsActive(false)}
              onKeyPress={handleKeyPress}
              placeholder="I need premium beef for export to Indonesia..."
              className="flex-1 border-0 bg-transparent text-xl md:text-2xl placeholder:text-muted-foreground focus-visible:ring-0 font-inter py-3"
            />
            
            <Button
              onClick={handleSearch}
              disabled={!query.trim()}
              size="sm"
              className="bg-primary hover:bg-primary/90 smooth-transition rounded-lg px-5 py-3 h-auto text-base font-medium"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};