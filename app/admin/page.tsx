"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
  CalendarDays,
  ChevronDown,
  Download,
  Eye,
  Gift,
  MousePointer,
  Mail,
  MoreHorizontal,
  Star,
  Layers,
  UtensilsCrossed,
  Truck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";

export default function AdminDashboardPage() {
  const { addToast } = useUIStore();
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Time filter state
  const [timeFilter, setTimeFilter] = React.useState("Last 30 days");
  const [showTimeDropdown, setShowTimeDropdown] = React.useState(false);

  // Hover state on revenue chart
  const [hoveredPointIndex, setHoveredPointIndex] = React.useState<number | null>(null);

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
        <p className="font-sans text-sm font-semibold text-neutral-600">
          Loading live restaurant telemetry...
        </p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const bestSelling = data?.bestSelling || [];
  const raw7Days = data?.charts?.last7Days || [];
  const dayActivity = data?.charts?.dayActivity || [];

  // Construct chart coordinates dynamically with high resolution (600w x 180h)
  const maxDataRev = Math.max(0, ...raw7Days.map((d: any) => d.revenue || 0));
  const maxChartRev = (maxDataRev > 0 ? maxDataRev : 100) * 1.15;
  const chartPoints = raw7Days.map((d: any, index: number) => {
    const x = raw7Days.length > 1 ? (index / (raw7Days.length - 1)) * 560 + 20 : 300;
    const y = 160 - (d.revenue / maxChartRev) * 130;
    return {
      ...d,
      x,
      y,
    };
  });

  // Generate smooth cubic Bézier SVG path string
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i != pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const linePathD = generateSmoothPath(chartPoints);
  const areaPathD =
    chartPoints.length > 0
      ? `${linePathD} L ${chartPoints[chartPoints.length - 1].x} 175 L ${chartPoints[0].x} 175 Z`
      : "";

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">
            Restaurant Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Real-time sales telemetry, kitchen order pipeline, and dining trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            isLoading={isRefreshing}
            className="border-neutral-200 text-neutral-700 bg-white shadow-2xs h-8 text-xs font-semibold"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Refresh
          </Button>

          {/* Time Filter Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs cursor-pointer h-8"
            >
              <span>{timeFilter}</span>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
            </button>

            {showTimeDropdown && (
              <div className="absolute right-0 mt-1 w-40 rounded-xl bg-white border border-neutral-200 shadow-lg py-1 z-30 font-sans text-xs">
                {["Today", "Last 7 days", "Last 30 days", "This Quarter", "This Year"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setTimeFilter(opt);
                      setShowTimeDropdown(false);
                      fetchStats();
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-neutral-50 cursor-pointer ${
                      timeFilter === opt ? "font-bold text-[#B51C20]" : "text-neutral-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Menu Item CTA */}
          <Link href="/admin/menu">
            <Button variant="primary" size="sm" className="h-8 text-xs font-bold shadow-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Dish
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. TOP 4 DYNAMIC METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Sales */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 font-sans">
              Gross Revenue
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#141414]">
                ${Number(stats.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-1 font-sans">
              {stats.totalOrders || 0} total order transactions
            </p>
          </div>
        </div>

        {/* Card 2: Total Customers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 font-sans">
              Registered Customers
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#141414]">
                {stats.totalCustomers || 0}
              </h3>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-1 font-sans">
              Active customer accounts
            </p>
          </div>
        </div>

        {/* Card 3: Avg Order Value */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 font-sans">
              Average Order Value
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#141414]">
                ${Number(stats.avgOrderValue || 0).toFixed(2)}
              </h3>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-1 font-sans">
              Average per placed order
            </p>
          </div>
        </div>

        {/* Card 4: Orders Placed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 font-sans">
              Total Orders Placed
            </span>
            <div className="h-7 w-7 rounded-lg bg-red-50 text-[#B51C20] flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#141414]">
                {stats.totalOrders || 0}
              </h3>
              {stats.activeOrdersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B51C20] text-white">
                  {stats.activeOrdersCount} live
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 font-sans">
              {stats.pickupOrdersCount || 0} pickup &bull; {stats.deliveryOrdersCount || 0} delivery
            </p>
          </div>
        </div>
      </div>

      {/* 3. MAIN 8 / 4 WORKBENCH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (8 cols): Revenue Trend Chart & Best Selling Products */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Total Profit / Revenue Area Curve Chart */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-neutral-500 font-sans">
                  Revenue &amp; Sales Trajectory
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#141414]">
                    ${Number(stats.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-700">
                    Last 7 Days Telemetry
                  </span>
                </div>
              </div>

              {/* Dynamic Legend */}
              <div className="flex items-center gap-4 text-xs text-neutral-500 font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#B51C20]" />
                  <span>Daily Revenue ($)</span>
                </span>
              </div>
            </div>

            {/* Pixel-Perfect Clean SVG Chart */}
            <div className="relative w-full h-56 pt-2">
              {/* Background Grid Lines */}
              <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-neutral-300">
                <div className="border-b border-neutral-100/80 h-0 flex items-center justify-end pr-1">
                  <span>${Math.round(maxChartRev).toLocaleString()}</span>
                </div>
                <div className="border-b border-neutral-100/80 h-0 flex items-center justify-end pr-1">
                  <span>${Math.round(maxChartRev * 0.66).toLocaleString()}</span>
                </div>
                <div className="border-b border-neutral-100/80 h-0 flex items-center justify-end pr-1">
                  <span>${Math.round(maxChartRev * 0.33).toLocaleString()}</span>
                </div>
                <div className="border-b border-neutral-100 h-0 flex items-center justify-end pr-1">
                  <span>$0</span>
                </div>
              </div>

              {/* SVG Area & Line Paths */}
              <svg
                viewBox="0 0 600 180"
                className="w-full h-44 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B51C20" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#B51C20" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area fill */}
                {areaPathD && (
                  <path d={areaPathD} fill="url(#chartGradient)" />
                )}

                {/* Smooth Curve Stroke */}
                {linePathD && (
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="#B51C20"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {chartPoints.map((pt: any, i: number) => {
                  const isHovered = hoveredPointIndex === i;
                  return (
                    <g key={pt.date} className="cursor-pointer">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4}
                        className={`transition-all duration-150 ${
                          isHovered
                            ? "fill-[#B51C20] stroke-white stroke-2"
                            : "fill-white stroke-[#B51C20] stroke-2"
                        }`}
                        onMouseEnter={() => setHoveredPointIndex(i)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip Card on Hover */}
              {hoveredPointIndex !== null && chartPoints[hoveredPointIndex] && (
                <div
                  className="absolute z-20 bg-white rounded-xl p-3 shadow-lg border border-neutral-200 text-left font-sans text-xs pointer-events-none transition-all duration-150"
                  style={{
                    left: `${(chartPoints[hoveredPointIndex].x / 600) * 100}%`,
                    top: `${(chartPoints[hoveredPointIndex].y / 180) * 100}%`,
                    transform: "translate(-50%, -125%)",
                  }}
                >
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    {chartPoints[hoveredPointIndex].day}, {chartPoints[hoveredPointIndex].date}
                  </p>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm font-black text-[#141414] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#B51C20]" />
                      <span>${chartPoints[hoveredPointIndex].revenue.toLocaleString()}</span>
                    </p>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      {chartPoints[hoveredPointIndex].orders} orders placed
                    </p>
                  </div>
                </div>
              )}

              {/* X Axis Labels */}
              <div className="flex justify-between text-[11px] font-sans text-neutral-400 pt-2 px-2">
                {chartPoints.map((pt: any) => (
                  <span key={pt.date} className="text-center font-medium">
                    {pt.day}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom 3 Channel Breakdown Cards */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Channel 1: Takeout / Pickup */}
                <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#B51C20]" />
                      <span className="text-xs font-bold text-[#141414]">
                        {stats.pickupOrdersCount || 0} Orders
                      </span>
                    </div>
                    <span className="text-xs font-black text-neutral-800">
                      ${Number(stats.pickupRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans">
                    Takeout / Direct Pickup
                  </p>
                </div>

                {/* Channel 2: Online Delivery */}
                <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <span className="text-xs font-bold text-[#141414]">
                        {stats.deliveryOrdersCount || 0} Orders
                      </span>
                    </div>
                    <span className="text-xs font-black text-neutral-800">
                      ${Number(stats.deliveryRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans">
                    Delivery Hub Dispatch
                  </p>
                </div>

                {/* Channel 3: Catering & Events */}
                <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
                      <span className="text-xs font-bold text-[#141414]">
                        {stats.totalCatering || 0} Requests
                      </span>
                    </div>
                    <span className="text-xs font-black text-neutral-800">
                      {stats.totalReservations || 0} Tables
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans">
                    Catering &amp; Table Diners
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Best Selling Dishes Table */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#141414]">
                  Best Selling Dishes
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  High margin dishes ranked by sales volume and ratings.
                </p>
              </div>
              <Link href="/admin/menu">
                <Button variant="outline" size="sm" className="h-7 text-xs bg-white">
                  Manage Menu
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">DISH NAME</th>
                    <th className="pb-3 font-semibold text-center">ORDERS</th>
                    <th className="pb-3 font-semibold text-center">REVENUE</th>
                    <th className="pb-3 font-semibold text-right">RATING</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {bestSelling.map((p: any) => (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 font-mono text-neutral-400">{p.id}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          {p.image && p.image.startsWith("/") ? (
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
                              <Image src={p.image} alt={p.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-red-50 text-[#B51C20] flex items-center justify-center shrink-0">
                              <UtensilsCrossed className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-neutral-900">{p.name}</p>
                            <p className="text-[11px] text-neutral-400">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-center text-neutral-500 font-medium">{p.sold}</td>
                      <td className="py-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                          {p.revenue}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-medium text-amber-600">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{p.rating}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Most Day Active, Repeat Rate & Live Kitchen Orders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Most Day Active Histogram */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-[#141414]">
                Weekly Dining Traffic
              </h3>
              <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">
                7 Days
              </span>
            </div>

            {/* Vertical Rounded Bars */}
            <div className="flex items-end justify-between h-32 pt-4 px-1">
              {dayActivity.map((bar: any, idx: number) => {
                const maxCount = Math.max(...dayActivity.map((b: any) => b.count), 1);
                const isPeak = bar.count === maxCount;
                const heightPercent = Math.max(20, (bar.count / maxCount) * 100);

                return (
                  <div key={bar.day} className="flex flex-col items-center gap-1.5 flex-1">
                    {isPeak && (
                      <span className="text-[9px] font-bold text-[#B51C20] font-mono">
                        {bar.count}
                      </span>
                    )}
                    <div
                      className={`w-5 rounded-full transition-all duration-300 ${
                        isPeak
                          ? "bg-[#B51C20] shadow-xs"
                          : "bg-neutral-100 hover:bg-neutral-200"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span
                      className={`text-[10px] font-sans ${
                        isPeak ? "font-bold text-[#B51C20]" : "text-neutral-400"
                      }`}
                    >
                      {bar.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Repeat Customer Rate Gauge */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3 text-center">
            <div className="flex items-center justify-between text-left">
              <h3 className="font-serif text-sm font-bold text-[#141414]">
                Customer Retention
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                (stats.repeatCustomerRate || 0) > 0
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-neutral-500 bg-neutral-100"
              }`}>
                {(stats.repeatCustomerRate || 0) > 0 ? "Healthy" : "Baseline"}
              </span>
            </div>

            {/* Radial Arc Gauge with Perfect Centered Fit */}
            <div className="relative flex flex-col items-center justify-center pt-2 pb-1">
              <div className="relative w-44 h-26 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 120 70">
                  {/* Background Track Arc */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Active Progress Arc */}
                  <path
                    d="M 15 60 A 45 45 0 0 1 105 60"
                    fill="none"
                    stroke="#B51C20"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="141.37"
                    strokeDashoffset={
                      141.37 -
                      (141.37 * Math.min(100, Math.max(0, stats.repeatCustomerRate || 0))) / 100
                    }
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Centered Percentage & Label within the Arc */}
                <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center">
                  <span className="font-sans text-2xl font-black text-[#141414] leading-tight">
                    {stats.repeatCustomerRate || 0}%
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Repeat diner rate
                  </span>
                </div>
              </div>
            </div>

            <Link href="/admin/orders" className="block pt-1">
              <button
                type="button"
                className="w-full py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                View Diner History
              </button>
            </Link>
          </div>

          {/* Card 3: Live Kitchen Orders Queue (Replacing AI Widget) */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-serif text-sm font-bold text-[#141414]">
                  Live Orders Queue
                </h3>
              </div>
              <Link href="/admin/orders" className="text-xs text-[#B51C20] font-bold hover:underline">
                View all &rarr;
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">
                No active orders at the moment.
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 4).map((order: any) => (
                  <div
                    key={order.id}
                    className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-2 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-800">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            order.type === "DELIVERY"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {order.type}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#141414]">
                        ${(order.total || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="truncate">{order.customerName}</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                          order.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.status === "PREPARING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-[#B51C20]"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {order.status !== "COMPLETED" && (
                      <div className="pt-1 flex items-center gap-1.5">
                        {order.status === "NEW" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                            className="flex-1 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Accept &amp; Prep
                          </button>
                        )}
                        {order.status === "PREPARING" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, "READY")}
                            className="flex-1 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === "READY" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, "COMPLETED")}
                            className="flex-1 py-1 rounded-lg bg-[#B51C20] hover:bg-[#9B181B] text-white text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Complete Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
