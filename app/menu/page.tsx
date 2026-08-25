"use client";

import * as React from "react";
import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Flame, X, ShoppingBag } from "lucide-react";
import { MENU_ITEMS, CATEGORIES } from "@/lib/data";
import { MenuItem } from "@/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { CustomizationModal } from "@/components/ordering/CustomizationModal";
import { Badge } from "@/components/ui/Badge";
import { CuisineLoader } from "@/components/ui/CuisineLoader";

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected Category (loaded from URL query if available)
  const categoryParam = searchParams?.get("category") || "all";

  // State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDiet, setSelectedDiet] = React.useState<string[]>([]);
  const [selectedSpice, setSelectedSpice] = React.useState<number | null>(null);
  const [showOnlyPopular, setShowOnlyPopular] = React.useState(false);
  const [customizingItem, setCustomizingItem] = React.useState<MenuItem | null>(null);
  
  // Mobile filters panel state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  // Handle category changing
  const handleCategorySelect = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (categorySlug === "all") {
      params.delete("category");
    } else {
      params.set("category", categorySlug);
    }
    router.push(`/menu?${params.toString()}`);
  };

  const handleToggleDiet = (tag: string) => {
    setSelectedDiet((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedDiet([]);
    setSelectedSpice(null);
    setShowOnlyPopular(false);
  };

  // Filter menu items
  const filteredItems = React.useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Category filter
      if (categoryParam !== "all") {
        const cat = CATEGORIES.find((c) => c.slug === categoryParam);
        if (cat && item.categoryId !== cat.id) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.dietaryTags.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      // Dietary filter
      if (selectedDiet.length > 0) {
        const matchesAllDiets = selectedDiet.every((diet) =>
          item.dietaryTags.map(t => t.toLowerCase()).includes(diet.toLowerCase())
        );
        if (!matchesAllDiets) return false;
      }

      // Spice filter
      if (selectedSpice !== null && item.spiceLevel !== selectedSpice) {
        return false;
      }

      // Popular filter
      if (showOnlyPopular && !item.isPopular) {
        return false;
      }

      return true;
    });
  }, [categoryParam, searchQuery, selectedDiet, selectedSpice, showOnlyPopular]);

  const dietaryFilterOptions = [
    { label: "Gluten-Free", value: "gluten-free" },
    { label: "Dairy-Free", value: "dairy-free" },
    { label: "Vegetarian", value: "vegetarian" },
    { label: "Vegan", value: "vegan" },
    { label: "Nut-Free", value: "nut-free" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream-base">
      <Header />

      {/* HEADER SECTION */}
      <section className="bg-cream-light py-12 md:py-16 border-b border-neutral-warm/40 text-center">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <Badge variant="soft-red" className="mb-2">
            Order Online
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal tracking-tight">
            Our Menu
          </h1>
          <p className="font-sans text-sm md:text-base text-muted-gray mt-3 max-w-xl mx-auto leading-relaxed">
            Savor the fresh, hand-pulled grains, house-made cheeses, steamed dumplings, and authentic slow-simmered curries of Nepal.
          </p>

          {/* Mobile Search & Filter Action Bar */}
          <div className="flex md:hidden items-center justify-center mt-6">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 h-11 px-4 border border-neutral-warm bg-cream-light rounded-xl font-sans text-sm font-semibold text-charcoal hover:bg-cream-dark transition-colors cursor-pointer relative"
              aria-label="Search & Filters"
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-gray" />
              <span>Search & Filter Menu</span>
              {(selectedDiet.length > 0 || selectedSpice !== null || showOnlyPopular || searchQuery) && (
                <span className="h-2 w-2 bg-brand-red rounded-full ml-1" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* STICKY CATEGORIES BAR */}
      <div className="sticky top-[68px] md:top-[76px] z-30 w-full bg-cream-light border-b border-neutral-warm/40 shadow-[0_4px_16px_rgba(21,21,21,0.01)]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="flex items-center space-x-1.5 overflow-x-auto py-3.5 no-scrollbar scroll-smooth">
            <button
              onClick={() => handleCategorySelect("all")}
              className={`px-4.5 py-1.5 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                categoryParam === "all"
                  ? "bg-brand-red text-cream-light"
                  : "bg-cream-dark text-charcoal border border-neutral-warm/30 hover:bg-neutral-warm/50"
              }`}
            >
              All Items
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4.5 py-1.5 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  categoryParam === cat.slug
                    ? "bg-brand-red text-cream-light"
                    : "bg-cream-dark text-charcoal border border-neutral-warm/30 hover:bg-neutral-warm/50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CATALOG LAYOUT */}
      <section className="py-12 md:py-16 flex-1">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* DESKTOP SIDEBAR FILTERS */}
          <aside className="hidden lg:flex flex-col space-y-8 sticky top-[160px] h-fit">
            
            {/* Header info */}
            <div className="flex justify-between items-center pb-4 border-b border-neutral-warm/40">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal">
                Filters
              </h3>
              {(selectedDiet.length > 0 || selectedSpice !== null || showOnlyPopular || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="font-sans text-xs text-brand-red hover:underline font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Search Bar inside filters */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu..."
                className="w-full h-10 pl-10 pr-8 rounded-xl border border-neutral-warm bg-cream-light font-sans text-xs text-charcoal transition-colors placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red focus-ring"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-gray hover:bg-cream-dark transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Popular Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm text-charcoal">Show Popular Only</span>
              <input
                type="checkbox"
                checked={showOnlyPopular}
                onChange={(e) => setShowOnlyPopular(e.target.checked)}
                className="accent-brand-red h-4.5 w-4.5 cursor-pointer"
              />
            </div>

            {/* Dietary Preference checkboxes */}
            <div className="space-y-3 flex flex-col">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal">
                Dietary Preference
              </span>
              {dietaryFilterOptions.map((diet) => {
                const isChecked = selectedDiet.includes(diet.value);
                return (
                  <label key={diet.value} className="flex items-center space-x-3 text-sm text-muted-gray hover:text-charcoal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleDiet(diet.value)}
                      className="accent-brand-red h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>{diet.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Spice levels */}
            <div className="space-y-3">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal">
                Spice Intensity
              </span>
              <div className="flex space-x-2">
                {[0, 1, 2].map((level) => {
                  const label = level === 0 ? "Mild" : level === 1 ? "Medium" : "Hot";
                  const isSelected = selectedSpice === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedSpice(selectedSpice === level ? null : level)}
                      className={`flex-1 py-1.5 border rounded-sm font-sans text-xs font-medium tracking-wide transition-all cursor-pointer ${
                        isSelected
                          ? "bg-brand-red text-cream-light border-transparent"
                          : "bg-cream-light text-charcoal border-neutral-warm hover:bg-cream-dark"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* MAIN PRODUCT GRID */}
          <div className="lg:col-span-3 flex flex-col space-y-8">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-cream-light border border-neutral-warm rounded-[14px] p-8">
                <h3 className="font-serif text-2xl font-medium text-charcoal mb-2">
                  No dishes found
                </h3>
                <p className="font-sans text-sm text-muted-gray max-w-sm mb-6">
                  We couldn't find any dishes matching your filters or search query. Try clearing filters.
                </p>
                <Button onClick={handleClearFilters} variant="primary" size="sm">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-xs font-sans text-muted-gray">
                  <span>Showing {filteredItems.length} dishes</span>
                  {categoryParam !== "all" && (
                    <span className="uppercase tracking-wider font-semibold text-brand-red">
                      {categoryParam}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onCustomize={setCustomizingItem}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </section>

      {/* MOBILE FILTERS PANEL */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-cream-light flex flex-col p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-warm/40">
            <h2 className="font-serif text-xl font-bold text-charcoal">Filter Options</h2>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-1.5 rounded-full bg-cream-dark text-charcoal cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-8 text-left">
            {/* Search Bar inside filters */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu..."
                className="w-full h-11 pl-10 pr-8 rounded-xl border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal transition-colors placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red focus-ring"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-gray hover:bg-cream-dark transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Popular Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm font-semibold text-charcoal">Show Popular Only</span>
              <input
                type="checkbox"
                checked={showOnlyPopular}
                onChange={(e) => setShowOnlyPopular(e.target.checked)}
                className="accent-brand-red h-5 w-5 cursor-pointer"
              />
            </div>

            {/* Dietary */}
            <div className="space-y-4 flex flex-col">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal">
                Dietary Preference
              </span>
              {dietaryFilterOptions.map((diet) => {
                const isChecked = selectedDiet.includes(diet.value);
                return (
                  <label key={diet.value} className="flex items-center space-x-3 text-sm text-muted-gray hover:text-charcoal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleDiet(diet.value)}
                      className="accent-brand-red h-5 w-5 cursor-pointer"
                    />
                    <span>{diet.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Spice levels */}
            <div className="space-y-4">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-charcoal">
                Spice Intensity
              </span>
              <div className="flex space-x-2">
                {[0, 1, 2].map((level) => {
                  const label = level === 0 ? "Mild" : level === 1 ? "Medium" : "Hot";
                  const isSelected = selectedSpice === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedSpice(selectedSpice === level ? null : level)}
                      className={`flex-1 py-2 border rounded-sm font-sans text-sm font-medium tracking-wide transition-all cursor-pointer ${
                        isSelected
                          ? "bg-brand-red text-cream-light border-transparent"
                          : "bg-cream-light text-charcoal border-neutral-warm"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-neutral-warm/40 flex space-x-4">
            <Button
              onClick={() => {
                handleClearFilters();
                setIsMobileFiltersOpen(false);
              }}
              variant="secondary"
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              onClick={() => setIsMobileFiltersOpen(false)}
              variant="primary"
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Item customizing modal */}
      <CustomizationModal
        menuItem={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
      />

      <Footer />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
          <CuisineLoader
            variant="steamer"
            size="md"
            message="Curating Himalayan delicacies..."
            submessage="Loading authentic recipes"
          />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
