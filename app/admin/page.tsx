"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Wine,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  Plus,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";

export default function AdminDashboardPage() {
  const { addToast } = useUIStore();
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      addToast("Failed to load dashboard metrics", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
      if (res.ok) {
        addToast(`Order updated to ${nextStatus}`, "success");
        fetchStats();
      }
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-[#B51C20]" />
        <p className="font-serif text-base font-semibold text-neutral-600">Loading live restaurant telemetry...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || { last7Days: [], channelSplit: [] };
  const recentOrders = data?.recentOrders || [];

  // Calculate highest revenue day for chart scaling
  const maxRevenue = Math.max(...charts.last7Days.map((d: any) => d.revenue), 1000);

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">Executive Overview</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Real-time analytics, revenue distribution, and live kitchen orders queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            isLoading={isRefreshing}
            className="border-neutral-300 text-neutral-700 bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh Telemetry
          </Button>

          <Link href="/admin/menu">
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Menu Dish
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans">
              Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#141414]">
              ${Number(stats.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1 font-sans">
              <ArrowUpRight className="h-3 w-3" />
              <span>+18.4% vs last week</span>
            </p>
          </div>
        </div>

        {/* Live Orders */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans">
              Total Orders Placed
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#B51C20]/10 text-[#B51C20] flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#141414]">
              {stats.totalOrders || 0}
            </h3>
            <p className="text-[11px] text-[#B51C20] font-semibold mt-1 font-sans">
              {stats.activeOrdersCount || 0} active in prep / transit
            </p>
          </div>
        </div>

        {/* Reservations */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans">
              Table Reservations
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#141414]">
              {stats.totalReservations || 0}
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium mt-1 font-sans">
              Confirmed dining parties
            </p>
          </div>
        </div>

        {/* Active Dishes */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans">
              Catalog Items
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#141414]">
              {stats.totalMenuItems || 0} Dishes
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium mt-1 font-sans">
              Across 5 Himalayan categories
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-DAY REVENUE BAR GRAPH */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#141414]">7-Day Revenue Trends</h3>
              <p className="text-xs text-neutral-400 font-sans">Daily digital takeout & dining income</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600">
              USD ($)
            </span>
          </div>

          {/* Clean SVG Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-neutral-200">
            {charts.last7Days.map((d: any) => {
              const heightPercent = Math.max(15, Math.round((d.revenue / maxRevenue) * 100));
              return (
                <div key={d.day + d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-mono text-neutral-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    ${d.revenue}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-[#8E1418] to-[#B51C20] group-hover:brightness-110 transition-all duration-300 relative shadow-sm"
                  />
                  <div className="mt-3 text-center">
                    <span className="block text-xs font-bold text-neutral-700">{d.day}</span>
                    <span className="block text-[10px] text-neutral-400 font-mono">{d.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ORDER CHANNEL DISTRIBUTION */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#141414]">Sales by Channel</h3>
            <p className="text-xs text-neutral-400 font-sans mb-6">Fulfillment breakdown</p>

            <div className="space-y-4">
              {charts.channelSplit.map((c: any) => (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-semibold text-neutral-700">{c.name}</span>
                    <span className="font-mono font-bold text-[#141414]">{c.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      style={{ width: `${c.value}%`, backgroundColor: c.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Peak ordering hour:</span>
            <span className="font-mono font-bold text-[#141414]">6:30 PM - 8:15 PM</span>
          </div>
        </div>
      </div>

      {/* LIVE ORDERS QUEUE */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#141414]">Live Kitchen &amp; Takeout Queue</h3>
            <p className="text-xs text-neutral-400 font-sans">Recent orders awaiting fulfillment or pickup</p>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="text-xs">
              View All Orders ({stats.totalOrders || 0})
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400 font-sans">
                    No recent orders in queue.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#141414]">
                      #{o.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{o.customerName || "Guest Customer"}</span>
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
                    <td className="py-3.5 px-4 font-medium">
                      {o.items?.length || 1} items
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#141414]">
                      ${Number(o.total || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          o.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "PREPARING"
                            ? "bg-amber-100 text-amber-800"
                            : o.status === "READY"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-[#B51C20]"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {o.status === "NEW" && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="text-[11px] py-1 px-2.5 h-7"
                          onClick={() => handleUpdateOrderStatus(o.id, "PREPARING")}
                        >
                          Send to Kitchen
                        </Button>
                      )}
                      {o.status === "PREPARING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[11px] py-1 px-2.5 h-7 border-blue-500 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleUpdateOrderStatus(o.id, "READY")}
                        >
                          Mark Ready
                        </Button>
                      )}
                      {o.status === "READY" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[11px] py-1 px-2.5 h-7 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleUpdateOrderStatus(o.id, "COMPLETED")}
                        >
                          Complete Order
                        </Button>
                      )}
                      {o.status === "COMPLETED" && (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
