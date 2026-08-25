"use client";

import * as React from "react";
import Image from "next/image";
import { Heart, Flame, Plus } from "lucide-react";
import { MenuItem } from "@/types";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";

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
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      onCustomize(item);
    } else {
      addItem({
        menuItem: item,
        quantity: 1,
        selectedModifiers: [],
      });
      addToast(`${item.name} added to cart!`, "success");
    }
  };

  // Helper to style dietary tags cleanly
  const getDietaryTagStyle = (tag: string) => {
    const upper = tag.toUpperCase();
    if (upper.includes("VEG")) {
      return "bg-[#EAF3EC] text-[#2D6A4F]";
    }
    if (upper.includes("GLUTEN")) {
      return "bg-[#FDF3E7] text-[#B4691B]";
    }
    if (upper.includes("DAIRY")) {
      return "bg-[#EBF3FB] text-[#2B6CB0]";
    }
    return "bg-neutral-warm/30 text-charcoal/80";
  };

  return (
    <div
      onClick={() => onCustomize(item)}
      className="group relative flex flex-col bg-white border border-neutral-warm/70 rounded-2xl overflow-hidden transition-all duration-300 hover:border-charcoal/30 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] cursor-pointer text-left"
    >
      {/* Item Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5F2ED]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient shadow overlay on top */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.isFeatured && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#B51C20] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              Signature
            </span>
          )}
          {item.isPopular && !item.isFeatured && (
            <span className="px-2.5 py-0.5 rounded-full bg-charcoal text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              Popular
            </span>
          )}
        </div>

        {/* Favorite Glass Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 w-8.5 h-8.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-md text-charcoal hover:text-[#B51C20] shadow-xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          aria-label={favorited ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              favorited ? "fill-[#B51C20] text-[#B51C20]" : "text-charcoal/80"
            }`}
          />
        </button>
      </div>

      {/* Item Details */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Title & Price Header */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif text-lg font-semibold text-charcoal leading-snug group-hover:text-[#B51C20] transition-colors">
              {item.name}
            </h3>
            <span className="font-sans text-base font-bold text-charcoal shrink-0">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          <p className="font-sans text-xs text-muted-gray leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Badges, Spice level & Call to action */}
        <div className="flex items-center justify-between pt-2">
          {/* Dietary tags & Spice level */}
          <div className="flex items-center flex-wrap gap-1.5">
            {item.spiceLevel > 0 && (
              <div className="flex items-center gap-0.5 text-[#C9252D]" title={`Spice Level: ${item.spiceLevel}`}>
                {Array.from({ length: item.spiceLevel }).map((_, i) => (
                  <Flame key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            )}

            {item.dietaryTags.map((tag) => (
              <span
                key={tag}
                className={`font-sans text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getDietaryTagStyle(
                  tag
                )}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Quick Add CTA Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-8.5 h-8.5 rounded-full bg-[#B51C20] hover:bg-[#9B181B] active:scale-95 text-white flex items-center justify-center shadow-xs transition-all shrink-0 cursor-pointer ml-2"
            aria-label={`Add ${item.name} to order`}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
