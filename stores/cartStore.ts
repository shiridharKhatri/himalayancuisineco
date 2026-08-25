import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, MenuItem, SelectedModifier } from "@/types";

interface CartState {
  items: CartItem[];
  deliveryType: "PICKUP" | "DELIVERY";
  tip: number;
  couponCode: string | null;
  couponDiscountPercent: number;
  addItem: (item: Omit<CartItem, "id" | "singleItemPrice">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryType: (type: "PICKUP" | "DELIVERY") => void;
  setTip: (tipAmount: number) => void;
  applyCoupon: (code: string, discountPercent: number) => void;
  removeCoupon: () => void;
  
  // Computed values
  getTotals: () => {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    tip: number;
    total: number;
  };
}

// Generate serializable unique ID for cart items with identical modifiers
const generateCartItemId = (
  menuItemId: string,
  protein?: string,
  spiceLevel?: string,
  modifiers: SelectedModifier[] = []
) => {
  const sortedModIds = [...modifiers].map((m) => m.id).sort().join("-");
  return `${menuItemId}_${protein || ""}_${spiceLevel || ""}_${sortedModIds}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryType: "PICKUP",
      tip: 0,
      couponCode: null,
      couponDiscountPercent: 0,

      addItem: (newItem) => {
        const id = generateCartItemId(
          newItem.menuItem.id,
          newItem.protein,
          newItem.spiceLevel,
          newItem.selectedModifiers
        );

        // Calculate single item price
        const modifiersPrice = newItem.selectedModifiers.reduce((acc, m) => acc + m.price, 0);
        const singleItemPrice = newItem.menuItem.price + modifiersPrice;

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === id);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }
          return {
            items: [...state.items, { ...newItem, id, singleItemPrice }],
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () =>
        set({
          items: [],
          tip: 0,
          couponCode: null,
          couponDiscountPercent: 0,
        }),

      setDeliveryType: (type) => set({ deliveryType: type }),

      setTip: (tipAmount) => set({ tip: tipAmount }),

      applyCoupon: (code, discountPercent) =>
        set({ couponCode: code, couponDiscountPercent: discountPercent }),

      removeCoupon: () => set({ couponCode: null, couponDiscountPercent: 0 }),

      getTotals: () => {
        const { items, deliveryType, tip, couponDiscountPercent } = get();
        
        const subtotal = items.reduce((acc, item) => acc + item.singleItemPrice * item.quantity, 0);
        const discount = subtotal * (couponDiscountPercent / 100);
        const taxableAmount = Math.max(0, subtotal - discount);
        const tax = taxableAmount * 0.0825; // 8.25% tax rate
        const deliveryFee = deliveryType === "DELIVERY" ? 5.0 : 0.0;
        const total = taxableAmount + tax + deliveryFee + tip;

        return {
          subtotal,
          tax,
          deliveryFee,
          discount,
          tip,
          total: Math.max(0, total),
        };
      },
    }),
    {
      name: "himalayan-cuisine-cart",
      partialize: (state) => ({
        items: state.items,
        deliveryType: state.deliveryType,
        tip: state.tip,
        couponCode: state.couponCode,
        couponDiscountPercent: state.couponDiscountPercent,
      }),
    }
  )
);
