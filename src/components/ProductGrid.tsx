import { useState } from "react";
import { Eye, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductDetailsDialog } from "@/components/ProductDetailsDialog";
import { OrderFormDialog } from "@/components/OrderFormDialog";

export interface Product {
  id: string;
  name: string;
  image: string;
  price?: string;
  priceOnRequest?: boolean;
  seller: string;
  sellerEmail: string;
  interestedCount: number;
  isHotPick?: boolean;
  category: string;
  assets?: string[]; // Array of asset codes: 'S', 'R', 'B', 'L', 'H'
}

const products: Product[] = [
  {
    id: "1",
    name: "Frozen Pork Whole Ears",
    image: "/assets/Asset_Carne.png",
    price: "€ 1,85",
    seller: "MeatBorsa",
    sellerEmail: "contact@meatborsa.com",
    interestedCount: 126,
    isHotPick: true,
    category: "pork",
    assets: ["S", "R", "H"]
  },
  {
    id: "2",
    name: "Frozen Pork 70/30 Trimmings",
    image: "/assets/Asset_Carne.png",
    price: "€ 2,05",
    seller: "MeatBorsa", 
    sellerEmail: "contact@meatborsa.com",
    interestedCount: 145,
    isHotPick: true,
    category: "pork",
    assets: ["S", "R"]
  },
  {
    id: "3",
    name: "Frozen Chicken Leg Quarter",
    image: "/assets/Asset_Frango.png",
    price: "€ 1,65",
    seller: "MeatBorsa",
    sellerEmail: "contact@meatborsa.com", 
    interestedCount: 308,
    isHotPick: true,
    category: "poultry",
    assets: ["S", "R", "H", "B"]
  },
  {
    id: "4",
    name: "CLQ B-grade",
    image: "/assets/Asset_Frango.png",
    price: "€ 1,15",
    seller: "GenbαFood",
    sellerEmail: "info@genbafood.com",
    interestedCount: 10,
    category: "poultry",
    assets: ["S"]
  },
  {
    id: "5",
    name: "Frozen Duck Carcass 1.5-2kg",
    image: "/assets/Asset_Peru.png",
    price: "€ 2,32",
    seller: "karpatαplan@gmail.com",
    sellerEmail: "karpatαplan@gmail.com",
    interestedCount: 20,
    category: "poultry",
    assets: ["S", "R", "H"]
  },
  {
    id: "6",
    name: "Frozen Female Turkey Breast Fillet Class A",
    image: "/assets/Asset_Peru.png",
    price: "€ 8,15",
    seller: "Frostmeat Global Sp.z.o.o.",
    sellerEmail: "info@frostmeat.com",
    interestedCount: 30,
    category: "poultry",
    assets: ["S", "R", "B", "L"]
  },
  {
    id: "7",
    name: "Pork Fat Pork Lard",
    image: "/assets/Asset_Carne.png",
    priceOnRequest: true,
    seller: "Oshropol",
    sellerEmail: "info@oshropol.com",
    interestedCount: 34,
    category: "pork",
    assets: ["S", "H"]
  },
  {
    id: "8",
    name: "10t / weekly fresh pork silverside",
    image: "/assets/Asset_Carne.png",
    price: "€ 3,98",
    seller: "Anmex",
    sellerEmail: "info@anmex.com",
    interestedCount: 63,
    category: "beef",
    assets: ["S", "R", "B", "L", "H"]
  },
  {
    id: "9",
    name: "Fresh halal poultry from hand slaughter",
    image: "/assets/Asset_Frango.png",
    priceOnRequest: true,
    seller: "jaroslav@acefoodservice.co.uk",
    sellerEmail: "jaroslav@acefoodservice.co.uk", 
    interestedCount: 7,
    category: "poultry",
    assets: ["H"]
  },
  {
    id: "10",
    name: "Ribeye / rib steak - Ribeye, Lip-On",
    image: "/assets/Asset_Boi.png",
    priceOnRequest: true,
    seller: "Kazbeef",
    sellerEmail: "info@kazbeef.com",
    interestedCount: 23,
    category: "beef",
    assets: ["S", "R", "B", "L"]
  },
  {
    id: "11",
    name: "Belly grade A boneless",
    image: "/assets/Asset_Costela.png",
    price: "€ 3,40",
    seller: "MARK'S Marszałkowscy",
    sellerEmail: "info@marks.com",
    interestedCount: 15,
    category: "pork",
    assets: ["S", "R"]
  },
  {
    id: "12",
    name: "Pork back fat",
    image: "/assets/Asset_Carne.png",
    price: "€ 0,90",
    seller: "BUYMEAT.pl",
    sellerEmail: "info@buymeat.pl",
    interestedCount: 8,
    category: "pork",
    assets: ["S"]
  },
  {
    id: "13",
    name: "Premium Lamb Leg",
    image: "/assets/Asset_Carne.png",
    price: "€ 6,45",
    seller: "Alpine Meats",
    sellerEmail: "info@alpinemeats.com",
    interestedCount: 42,
    isHotPick: true,
    category: "lamb",
    assets: ["S", "R", "H", "B"]
  },
  {
    id: "14",
    name: "Artisan Sausages Mixed Pack",
    image: "/assets/Asset_Carne.png",
    price: "€ 4,20",
    seller: "European Delicatessen",
    sellerEmail: "orders@eurodel.com",
    interestedCount: 67,
    category: "specialty",
    assets: ["S", "R", "L"]
  },
  {
    id: "15",
    name: "Grass-Fed Beef Alcatra",
    image: "/assets/Asset_Boi.png",
    price: "€ 9,80",
    seller: "Pampa Premium",
    sellerEmail: "sales@pampapremium.com",
    interestedCount: 89,
    isHotPick: true,
    category: "beef",
    assets: ["S", "R", "B", "L", "H"]
  },
  {
    id: "16",
    name: "Organic Free-Range Chicken",
    image: "/assets/Asset_Frango.png",
    priceOnRequest: true,
    seller: "Farm Fresh Organics",
    sellerEmail: "contact@farmfreshorg.com",
    interestedCount: 156,
    category: "poultry",
    assets: ["S", "H", "B"]
  }
];

export const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleSendOrder = () => {
    setShowProductDetails(false);
    setShowOrderForm(true);
  };

  const handleCloseProductDetails = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
  };

  const handleCloseOrderForm = () => {
    setShowOrderForm(false);
    setSelectedProduct(null);
  };

  // Asset color mapping based on FilterTags colors
  const getAssetStyle = (asset: string) => {
    switch (asset) {
      case 'S': // Sanitary Inspection
        return 'bg-brand-blue text-white';
      case 'R': // Refrigerated Transport
        return 'bg-brand-orange text-white';
      case 'B': // Bank Guarantees
        return 'bg-brand-red text-white';
      case 'L': // Letter of Credit
        return 'bg-brand-navy text-white';
      case 'H': // Halal/Kosher Certification
        return 'bg-brand-burgundy text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Organize products: beef first, then poultry, then pork, then lamb, then specialty
  const sortedProducts = [...products].sort((a, b) => {
    const categoryOrder = { beef: 1, poultry: 2, pork: 3, lamb: 4, specialty: 5 };
    return categoryOrder[a.category as keyof typeof categoryOrder] - categoryOrder[b.category as keyof typeof categoryOrder];
  });

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-9 gap-3">
        {sortedProducts.map((product) => (
          <Card 
            key={product.id} 
            className="group cursor-pointer bg-gradient-card border-0 shadow-soft hover:shadow-medium card-hover rounded-md overflow-hidden smooth-transition"
            onClick={() => handleProductClick(product)}
          >
            <CardContent className="p-0 relative">
              {/* Asset Badges */}
              {product.assets && product.assets.length > 0 && (
                <div className="absolute top-1 right-1 z-10 flex gap-1">
                  {product.assets.map((asset, index) => (
                    <div
                      key={asset}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${getAssetStyle(asset)}`}
                    >
                      {asset}
                    </div>
                  ))}
                </div>
              )}

              {/* Hot Pick Badge */}
              {product.isHotPick && (
                  <Badge className="absolute top-1 left-1 z-10 bg-gradient-accent text-white flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full shadow-soft font-medium">
                    <Flame className="h-2 w-2" />
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 smooth-transition"></div>
              </div>
              
              {/* Product Info */}
              <div className="p-2 space-y-1.5">
                <h3 className="font-semibold text-card-foreground text-xs leading-tight line-clamp-2 min-h-[2rem] group-hover:text-primary smooth-transition font-inter">
                  {product.name}
                </h3>
                
                {/* Price */}
                <div>
                  {product.priceOnRequest ? (
                    <span className="text-xs font-semibold text-brand-orange bg-brand-rose/20 px-1.5 py-0.5 rounded text-center block">
                      PORequest
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-brand-navy font-inter block text-center">{product.price}</span>
                  )}
                </div>
                
                {/* Seller */}
                <div className="flex items-center gap-1 p-1.5 bg-muted/30 rounded border border-muted">
                  <div className="w-1 h-1 bg-brand-blue rounded-full"></div>
                  <span className="text-xs text-muted-foreground truncate font-medium font-inter">{product.seller}</span>
                </div>
                
                {/* Interest Count */}
                <div className="flex items-center justify-center gap-1 text-xs">
                  <Flame className="h-2.5 w-2.5 text-brand-orange" />
                  <span className="text-muted-foreground font-inter">{product.interestedCount}</span>
                </div>
                
                {/* View Details Button */}
                <Button
                  variant="default"
                  size="sm" 
                  className="w-full h-6 text-xs font-medium bg-gradient-button hover:shadow-glow smooth-transition rounded font-inter"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {sortedProducts.length === 0 && (
        <div className="text-center py-16 col-span-full">
          <div className="bg-muted/50 rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-muted-foreground text-lg mb-2">
              No products found
            </p>
            <p className="text-muted-foreground text-sm">
              Try adjusting the filters to see more results
            </p>
          </div>
        </div>
      )}

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        product={selectedProduct}
        isOpen={showProductDetails}
        onClose={handleCloseProductDetails}
        onSendOrder={handleSendOrder}
      />

      {/* Order Form Dialog */}
      <OrderFormDialog
        product={selectedProduct}
        isOpen={showOrderForm}
        onClose={handleCloseOrderForm}
      />
    </div>
  );
};