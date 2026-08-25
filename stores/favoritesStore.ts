import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  itemIds: string[];
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      itemIds: [],
      toggleFavorite: (itemId) =>
        set((state) => {
          const exists = state.itemIds.includes(itemId);
          if (exists) {
            return { itemIds: state.itemIds.filter((id) => id !== itemId) };
          } else {
            return { itemIds: [...state.itemIds, itemId] };
          }
        }),
      isFavorite: (itemId) => get().itemIds.includes(itemId),
    }),
    {
      name: "himalayan-cuisine-favorites",
    }
  )
);
