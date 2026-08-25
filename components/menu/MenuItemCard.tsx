"use client";

import * as React from "react";
import Image from "next/image";
import { Heart, Flame, Plus } from "lucide-react";
import { MenuItem } from "@/types";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { Badge } from "@/components/ui/Badge";

interface MenuItemCardProps {
  item: MenuItem;
  onCustomize: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onCustomize }) => {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();

  const favorited = isFavorite(item.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
    addToast(
      favorited ? `${item.name} removed from favorites.` : `${item.name} added to favorites!`,
      "info"
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If the item has customization options (modifier groups), open customization dialog
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      onCustomize(item);
    } else {
      // Direct add to cart
      addItem({
        menuItem: item,
        quantity: 1,
        selectedModifiers: [],
      });
      addToast(`${item.name} added to cart!`, "success");
    }
  };

  return (
    <div
      onClick={() => onCustomize(item)}
      className="group relative flex flex-col bg-cream-light border border-neutral-warm rounded-[14px] overflow-hidden transition-all duration-300 hover:border-brand-red/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(21,21,21,0.02)] cursor-pointer text-left"
    >
      {/* Item Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-dark">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Floating Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col space-y-1.5 z-10">
          {item.isPopular && <Badge variant="soft-red">Popular</Badge>}
          {item.isFeatured && <Badge variant="primary">Signature</Badge>}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-cream-light/90 hover:bg-cream-light border border-neutral-warm/20 text-charcoal hover:text-brand-red shadow-[0_2px_8px_rgba(21,21,21,0.04)] transition-all cursor-pointer"
          aria-label={favorited ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${favorited ? "fill-brand-red text-brand-red" : "text-charcoal"}`} />
        </button>
      </div>

      {/* Item Details */}
      <div className="flex-1 flex flex-col p-5 md:p-6 justify-between">
        <div className="space-y-2">
          
          {/* Title & Price Header */}
          <div className="flex justify-between items-start">
            <h3 className="font-serif text-lg font-semibold text-charcoal leading-tight group-hover:text-brand-red transition-colors">
              {item.name}
            </h3>
            <span className="font-sans text-base font-semibold text-charcoal pl-2">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          <p className="font-sans text-xs text-muted-gray leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Badges, Spice level, & Call to action */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-warm/40">
          
          {/* Dietary tags & Spice level */}
          <div className="flex items-center space-x-2">
            {item.spiceLevel > 0 && (
              <div className="flex items-center text-brand-red" title={`Spice Level: ${item.spiceLevel}`}>
                {Array.from({ length: item.spiceLevel }).map((_, i) => (
                  <Flame key={i} className="h-4.5 w-4.5 fill-current" />
                ))}
              </div>
            )}
            
            {item.dietaryTags.map((tag) => (
              <span key={tag} className="font-sans text-[10px] uppercase font-bold tracking-wider text-accent-green bg-accent-green/10 px-1.5 py-0.5 rounded-sm">
                {tag}
              </span>
            ))}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center p-2 rounded-full bg-brand-red text-cream-light hover:bg-brand-red-dark transition-colors cursor-pointer"
            aria-label={`Add ${item.name} to order`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
