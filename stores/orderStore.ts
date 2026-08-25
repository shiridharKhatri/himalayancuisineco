import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, OrderStatus } from "@/types";

interface OrderState {
  orders: Order[];
  placeOrder: (order: Omit<Order, "status" | "createdAt" | "paymentStatus">) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrder: (orderId: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      placeOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          status: "NEW",
          paymentStatus: "PAID", // Assume payment succeeds for mock checkout
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        })),

      getOrder: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },
    }),
    {
      name: "himalayan-cuisine-orders",
    }
  )
);
