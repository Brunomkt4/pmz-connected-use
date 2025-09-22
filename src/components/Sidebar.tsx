import { Beef, ChefHat, Menu, PiggyBank, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const Sidebar = ({ activeCategory, onCategoryChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categories = [
    { id: "bovino", label: "Bovino", icon: Beef },
    { id: "frango", label: "Frango", icon: ChefHat },
    { id: "suino", label: "Suíno", icon: PiggyBank },
    { id: "outros", label: "Outros", icon: Layers },
  ];

  return (
    <aside className={cn(
      "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        {/* Toggle Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-sidebar-accent"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Categories */}
        <nav className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "ghost"}
                className={cn(
                  "w-full transition-all duration-200",
                  isCollapsed ? "justify-center px-2" : "justify-start px-3",
                  activeCategory === category.id 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                onClick={() => onCategoryChange(category.id)}
                title={isCollapsed ? category.label : undefined}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <span className="truncate">{category.label}</span>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};