import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Eye } from "lucide-react";
import { Product } from "@/components/ProductGrid";

interface ProductDetailsDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSendOrder: () => void;
}

export const ProductDetailsDialog = ({ product, isOpen, onClose, onSendOrder }: ProductDetailsDialogProps) => {
  if (!product) return null;

  // Asset color mapping
  const getAssetStyle = (asset: string) => {
    switch (asset) {
      case 'S': return 'bg-brand-blue text-white';
      case 'R': return 'bg-brand-orange text-white';
      case 'B': return 'bg-brand-red text-white';
      case 'L': return 'bg-brand-navy text-white';
      case 'H': return 'bg-brand-burgundy text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Product Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            
            {/* Asset Badges */}
            {product.assets && product.assets.length > 0 && (
              <div className="absolute top-3 right-3 flex gap-2">
                {product.assets.map((asset) => (
                  <div
                    key={asset}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${getAssetStyle(asset)}`}
                  >
                    {asset}
                  </div>
                ))}
              </div>
            )}

            {/* Hot Pick Badge */}
            {product.isHotPick && (
              <Badge className="absolute top-3 left-3 bg-gradient-accent text-white flex items-center gap-1 px-3 py-1 rounded-full shadow-soft">
                <Flame className="h-3 w-3" />
                Hot Pick
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-inter">
              {product.name}
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-brand-navy font-inter">
                {product.priceOnRequest ? (
                  <span className="text-lg font-semibold text-brand-orange bg-brand-rose/20 px-3 py-1 rounded">
                    Price on Request
                  </span>
                ) : (
                  product.price
                )}
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flame className="h-4 w-4 text-brand-orange" />
                <span>{product.interestedCount} interested</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-muted/30 rounded-lg p-4 border border-muted">
              <h3 className="font-semibold text-foreground mb-2">Seller Information</h3>
              <p className="text-foreground font-medium">{product.seller}</p>
              <p className="text-muted-foreground text-sm">{product.sellerEmail}</p>
            </div>

            {/* Category */}
            <div>
              <Badge variant="secondary" className="capitalize">
                {product.category}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={onSendOrder}
              className="flex-1 bg-gradient-button hover:shadow-glow smooth-transition"
            >
              Send Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};