"use client";

import * as React from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Flame,
  Star,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";

export default function AdminMenuPage() {
  const { addToast } = useUIStore();
  const [items, setItems] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  // Form fields
  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [image, setImage] = React.useState("/images/dish_momo_jhol.jpg");
  const [dietaryTags, setDietaryTags] = React.useState("");
  const [allergens, setAllergens] = React.useState("");
  const [spiceLevel, setSpiceLevel] = React.useState("0");
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [isPopular, setIsPopular] = React.useState(false);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/menu");
      const data = await res.json();
      setItems(data.items || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch menu items", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMenu();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setPrice("");
    setImage("/images/dish_momo_jhol.jpg");
    setDietaryTags("");
    setAllergens("");
    setSpiceLevel("0");
    setIsAvailable(true);
    setIsFeatured(false);
    setIsPopular(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setDescription(item.description || "");
    setPrice(String(item.price));
    setImage(item.image || "/images/dish_momo_jhol.jpg");
    setDietaryTags(item.dietaryTags || "");
    setAllergens(item.allergens || "");
    setSpiceLevel(String(item.spiceLevel || 0));
    setIsAvailable(item.isAvailable ?? true);
    setIsFeatured(Boolean(item.isFeatured));
    setIsPopular(Boolean(item.isPopular));
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !price) {
      addToast("Please fill in Name, Category, and Price.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const method = editingItem ? "PUT" : "POST";
      const payload = {
        ...(editingItem ? { id: editingItem.id } : {}),
        name,
        categoryId,
        description,
        price: parseFloat(price),
        image,
        dietaryTags,
        allergens,
        spiceLevel: parseInt(spiceLevel, 10),
        isAvailable,
        isFeatured,
        isPopular,
      };

      const res = await fetch("/api/admin/menu", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save menu item");

      addToast(
        editingItem ? `Updated "${name}" successfully!` : `Created new dish "${name}"!`,
        "success"
      );
      setIsModalOpen(false);
      fetchMenu();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailability = async (item: any) => {
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
        );
        addToast(`Set "${item.name}" to ${!item.isAvailable ? "Available" : "Sold Out"}`, "success");
      }
    } catch (err) {
      addToast("Failed to update availability", "error");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/menu?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Dish deleted successfully.", "success");
        setDeleteConfirmId(null);
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      addToast("Failed to delete dish", "error");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category?.slug === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* TITLE & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">Menu Management</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Add dishes, modify pricing, toggle kitchen availability, and update spice ratings.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add New Dish
        </Button>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#B51C20] text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            All Dishes ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.slug
                  ? "bg-[#B51C20] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish name or ingredient..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-[#B51C20] focus:bg-white"
          />
        </div>
      </div>

      {/* MENU ITEMS TABLE */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Spice Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B51C20] mb-2" />
                    Loading dishes catalog...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 font-sans">
                    No dishes found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Dish name & thumb */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                          <Image src={item.image || "/images/dish_momo_jhol.jpg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-sm text-[#141414] leading-tight">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {item.isFeatured && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800">
                                Featured
                              </span>
                            )}
                            {item.isPopular && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-[#B51C20]/10 text-[#B51C20]">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-600">
                        {item.category?.name || "General"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono font-bold text-[#141414]">
                      ${Number(item.price).toFixed(2)}
                    </td>

                    {/* Spice Level */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-neutral-600">
                        <Flame className={`h-3.5 w-3.5 ${item.spiceLevel > 0 ? "text-[#B51C20]" : "text-neutral-300"}`} />
                        {item.spiceLevel === 0 ? "Mild" : item.spiceLevel === 1 ? "Medium" : "Hot"}
                      </span>
                    </td>

                    {/* Stock Availability */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                          item.isAvailable
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Sold Out</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Edit Dish"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT DISH DIALOG */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit: ${editingItem.name}` : "Add New Dish to Menu"}
      >
        <form onSubmit={handleSaveItem} className="space-y-4 text-left">
          <Input
            label="Dish Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Traditional Chicken Jhol Momo"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Menu Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white font-sans text-sm text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Price ($ USD)"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="16.95"
              required
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rich description of mountain spices, preparation, and accompaniment..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white font-sans text-sm text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Image URL or Path"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/images/dish_momo_jhol.jpg"
            />

            <div className="flex flex-col space-y-1.5">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Spice Rating
              </label>
              <select
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white font-sans text-sm text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              >
                <option value="0">0 - Mild (No heat)</option>
                <option value="1">1 - Medium (Comfortable kick)</option>
                <option value="2">2 - Hot (Fiery Himalayan Chilies)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dietary Tags (comma-separated)"
              value={dietaryTags}
              onChange={(e) => setDietaryTags(e.target.value)}
              placeholder="Vegetarian, Gluten-Free, Vegan"
            />
            <Input
              label="Allergens (comma-separated)"
              value={allergens}
              onChange={(e) => setAllergens(e.target.value)}
              placeholder="Dairy, Nuts, Soy"
            />
          </div>

          {/* Badges Toggles */}
          <div className="pt-2 flex flex-wrap gap-4 border-t border-neutral-200">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="rounded border-neutral-300 text-[#B51C20] focus:ring-[#B51C20] h-4 w-4"
              />
              <span>In Stock (Available for ordering)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-neutral-300 text-[#B51C20] focus:ring-[#B51C20] h-4 w-4"
              />
              <span>Feature on Homepage</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded border-neutral-300 text-[#B51C20] focus:ring-[#B51C20] h-4 w-4"
              />
              <span>Mark as Chef's Popular Pick</span>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-4" isLoading={isSaving}>
            {editingItem ? "Save Dish Changes" : "Create Dish"}
          </Button>
        </form>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Delete Dish"
      >
        <div className="space-y-4 text-left">
          <p className="font-sans text-sm text-neutral-600 leading-relaxed">
            Are you sure you want to permanently delete this dish from the menu? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => deleteConfirmId && handleDeleteItem(deleteConfirmId)}
            >
              Delete Dish
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
