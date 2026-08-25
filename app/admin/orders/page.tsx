"use client";

import * as React from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";

export default function AdminOrdersPage() {
  const { addToast } = useUIStore();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [activeStatus, setActiveStatus] = React.useState("ALL");
  const [activeType, setActiveType] = React.useState("ALL");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${activeStatus}&type=${activeType}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch orders list", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, [activeStatus, activeType]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        addToast(`Order updated to ${status}`, "success");
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status }));
        }
        fetchOrders();
      }
    } catch (err) {
      addToast("Failed to update order status", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">COMPLETED</span>;
      case "PREPARING":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">PREPARING</span>;
      case "READY":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">READY FOR PICKUP</span>;
      case "OUT_FOR_DELIVERY":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">OUT FOR DELIVERY</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#B51C20]/10 text-[#B51C20]">NEW ORDER</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">Live Order Management</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Track kitchen preparation, dispatch delivery drivers, and review detailed guest orders.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchOrders} className="bg-white">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Orders
        </Button>
      </div>

      {/* FILTER TABS */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "NEW", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeStatus === st
                  ? "bg-[#B51C20] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-semibold uppercase">Fulfillment:</span>
          <select
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
          >
            <option value="ALL">All Types (Pickup &amp; Delivery)</option>
            <option value="PICKUP">Pickup Only</option>
            <option value="DELIVERY">Delivery Only</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Time Placed</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">View Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B51C20] mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-sans">
                    No orders found matching the selected filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#141414]">
                      #{o.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono">
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{o.customerName || "Guest"}</span>
                      <span className="text-[10px] text-neutral-400 block">{o.customerPhone || o.customerEmail}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.type === "PICKUP"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {o.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#141414]">
                      ${Number(o.total || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(o.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 py-1 px-3 bg-white"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      <Dialog
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Details #${selectedOrder.id.slice(-6).toUpperCase()}` : "Order Details"}
      >
        {selectedOrder && (
          <div className="space-y-5 text-left text-xs font-sans">
            {/* Status Switcher Banner */}
            <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Change Status:</span>
                <span className="font-semibold text-neutral-800">Current: {selectedOrder.status}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["NEW", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      selectedOrder.status === st
                        ? "bg-[#B51C20] text-white shadow-xs"
                        : "bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-neutral-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Customer Contact</span>
                <p className="font-bold text-neutral-900 text-sm">{selectedOrder.customerName || "Guest"}</p>
                {selectedOrder.customerPhone && (
                  <p className="text-neutral-600 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-neutral-400" />
                    <span>{selectedOrder.customerPhone}</span>
                  </p>
                )}
                {selectedOrder.customerEmail && (
                  <p className="text-neutral-600 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-neutral-400" />
                    <span>{selectedOrder.customerEmail}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Fulfillment Method</span>
                <span className="font-bold text-neutral-900 text-sm block uppercase">{selectedOrder.type}</span>
                {selectedOrder.deliveryStreet && (
                  <p className="text-neutral-600 flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#B51C20] shrink-0 mt-0.5" />
                    <span>{selectedOrder.deliveryStreet}, {selectedOrder.deliveryCity}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Items in this Order</span>
              <div className="rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100 bg-white">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {item.quantity}x {item.menuItem?.name || "Dish Item"}
                      </p>
                      {item.modifiers?.length > 0 && (
                        <p className="text-[10px] text-neutral-400">
                          + {item.modifiers.map((m: any) => m.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      ${Number(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5 font-mono">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>${Number(selectedOrder.subtotal || selectedOrder.total * 0.8).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Tax</span>
                <span>${Number(selectedOrder.tax || selectedOrder.total * 0.08).toFixed(2)}</span>
              </div>
              {selectedOrder.tip > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Driver Tip</span>
                  <span>+${Number(selectedOrder.tip).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#141414] border-t border-neutral-200 pt-1.5 mt-1.5">
                <span>Total Amount Paid</span>
                <span>${Number(selectedOrder.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
