"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Minus, Flame } from "lucide-react";
import { MenuItem, SelectedModifier } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface CustomizationModalProps {
  menuItem: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ menuItem, isOpen, onClose }) => {
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();

  const [quantity, setQuantity] = React.useState(1);
  const [selectedProtein, setSelectedProtein] = React.useState<string>("");
  const [selectedSpice, setSelectedSpice] = React.useState<"Mild" | "Medium" | "Hot">("Medium");
  const [addons, setAddons] = React.useState<SelectedModifier[]>([]);

  // Reset state when modal opens for a new item
  React.useEffect(() => {
    if (menuItem) {
      setQuantity(1);
      
      // Select default protein if protein group exists
      const proteinGroup = menuItem.modifierGroups?.find((g) => g.id === "grp-protein");
      if (proteinGroup && proteinGroup.modifiers.length > 0) {
        setSelectedProtein(proteinGroup.modifiers[0].name);
      } else {
        setSelectedProtein("");
      }

      // Default spice level based on dish base level
      if (menuItem.spiceLevel === 0) {
        setSelectedSpice("Mild");
      } else if (menuItem.spiceLevel === 1) {
        setSelectedSpice("Medium");
      } else {
        setSelectedSpice("Hot");
      }

      setAddons([]);
    }
  }, [menuItem, isOpen]);

  if (!menuItem) return null;

  // Calculate current single item price
  const basePrice = menuItem.price;
  
  // Find price of selected protein modifier (if not free)
  const proteinGroup = menuItem.modifierGroups?.find((g) => g.id === "grp-protein");
  const proteinModifier = proteinGroup?.modifiers.find((m) => m.name === selectedProtein);
  const proteinPrice = proteinModifier?.price || 0;

  const addonsPrice = addons.reduce((sum, mod) => sum + mod.price, 0);
  const singlePrice = basePrice + proteinPrice + addonsPrice;
  const totalPrice = singlePrice * quantity;

  const handleToggleAddon = (modId: string, name: string, price: number, groupName: string) => {
    setAddons((prev) => {
      const exists = prev.some((m) => m.id === modId);
      if (exists) {
        return prev.filter((m) => m.id !== modId);
      } else {
        return [...prev, { id: modId, name, price, groupName }];
      }
    });
  };

  const handleAddToCart = () => {
    addItem({
      menuItem,
      quantity,
      protein: selectedProtein || undefined,
      spiceLevel: menuItem.spiceLevel > 0 ? selectedSpice : undefined,
      selectedModifiers: addons,
    });

    addToast(`${menuItem.name} added to cart!`, "success");
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Customize Dish">
      <div className="flex flex-col space-y-6">
        
        {/* Item Banner Image & Info */}
        <div className="flex items-start space-x-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-neutral-warm bg-cream-dark">
            <Image
              src={menuItem.image}
              alt={menuItem.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal leading-tight">
              {menuItem.name}
            </h3>
            <p className="font-sans text-xs text-muted-gray mt-1 line-clamp-2">
              {menuItem.description}
            </p>
            <span className="inline-block font-sans text-sm font-semibold text-charcoal mt-1.5">
              ${basePrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="h-px bg-neutral-warm/40" />

        {/* Protein / Subcategory options */}
        {proteinGroup && (
          <div className="space-y-3">
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
              {proteinGroup.name} (Select One)
            </span>
            <div className="grid grid-cols-1 gap-2">
              {proteinGroup.modifiers.map((mod) => (
                <label
                  key={mod.id}
                  className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-colors ${
                    selectedProtein === mod.name
                      ? "border-brand-red bg-brand-red-soft/20 text-brand-red-dark font-medium"
                      : "border-neutral-warm bg-cream-light text-charcoal hover:bg-cream-dark/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="protein-modifier"
                      value={mod.name}
                      checked={selectedProtein === mod.name}
                      onChange={() => setSelectedProtein(mod.name)}
                      className="accent-brand-red h-4 w-4 cursor-pointer"
                    />
                    <span className="font-sans text-sm">{mod.name}</span>
                  </div>
                  {mod.price > 0 && (
                    <span className="font-sans text-xs text-muted-gray">
                      +${mod.price.toFixed(2)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Spice Level selection */}
        {menuItem.spiceLevel > 0 && (
          <div className="space-y-3">
            <span className="flex items-center space-x-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
              <Flame className="h-4 w-4 text-brand-red" />
              <span>Adjust Spice Level</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["Mild", "Medium", "Hot"] as const).map((level) => {
                const isSelected = selectedSpice === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedSpice(level)}
                    className={`py-2 border rounded-sm font-sans text-xs font-medium tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-red text-cream-light border-transparent"
                        : "bg-cream-light text-charcoal border-neutral-warm hover:bg-cream-dark"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Addons / Extras */}
        {menuItem.modifierGroups?.find((g) => g.id === "grp-addons") && (
          <div className="space-y-3">
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
              Add Extras / Side Options
            </span>
            <div className="grid grid-cols-1 gap-2">
              {menuItem.modifierGroups
                .find((g) => g.id === "grp-addons")
                ?.modifiers.map((mod) => {
                  const isChecked = addons.some((m) => m.id === mod.id);
                  return (
                    <label
                      key={mod.id}
                      className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-colors ${
                        isChecked
                          ? "border-brand-red bg-brand-red-soft/20 text-brand-red-dark font-medium"
                          : "border-neutral-warm bg-cream-light text-charcoal hover:bg-cream-dark/30"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleToggleAddon(mod.id, mod.name, mod.price, "Addons")
                          }
                          className="accent-brand-red h-4 w-4 cursor-pointer"
                        />
                        <span className="font-sans text-sm">{mod.name}</span>
                      </div>
                      <span className="font-sans text-xs text-muted-gray">
                        +${mod.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>
        )}

        <div className="h-px bg-neutral-warm/40" />

        {/* Bottom Panel (Quantity & Add) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-neutral-warm rounded-sm bg-cream-light">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3.5 py-2 text-muted-gray hover:text-charcoal transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 font-sans text-sm font-semibold text-charcoal">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3.5 py-2 text-muted-gray hover:text-charcoal transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={handleAddToCart} variant="primary" className="flex-1 ml-4">
            Add to Order &bull; ${totalPrice.toFixed(2)}
          </Button>
        </div>

      </div>
    </Dialog>
  );
};
