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
  Mic,
  ArrowUp,
  Sparkles,
  Layers,
  X,
  PieChart,
  BarChart3,
  LineChart,
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

  // Add Widget Modal state (from Screenshot 1)
  const [isAddWidgetOpen, setIsAddWidgetOpen] = React.useState(false);
  const [activeWidgets, setActiveWidgets] = React.useState<string[]>([
    "overview",
    "profit",
    "products",
    "activeDays",
    "repeatRate",
    "aiAssistant",
  ]);

  // AI Assistant Chat input
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);

  // Hover state on profit chart
  const [hoveredPointIndex, setHoveredPointIndex] = React.useState<number | null>(4);

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

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiResponse(
      `Based on current analytics, your Himalayan Momo Dumplings and Chicken Tikka Masala generated 48% of weekly revenue. Customer retention is at 68% (up 4.2%). Recommended action: Promote the weekend Chef's Tasting Thali.`
    );
    setAiPrompt("");
  };

  const toggleWidget = (widgetId: string) => {
    if (activeWidgets.includes(widgetId)) {
      setActiveWidgets(activeWidgets.filter((w) => w !== widgetId));
      addToast(`Widget hidden`, "info");
    } else {
      setActiveWidgets([...activeWidgets, widgetId]);
      addToast(`Widget added to dashboard`, "success");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-[#B51C20]" />
        <p className="font-sans text-sm font-semibold text-neutral-600">
          Loading restaurant telemetry...
        </p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  // Profit curve data points (simulating smooth area curve matching screenshot)
  const chartPoints = [
    { label: "1 Jan", value: 3200, lastMonth: 2100, x: 0, y: 75 },
    { label: "8 Jan", value: 5800, lastMonth: 3900, x: 20, y: 60 },
    { label: "15 Jan", value: 9200, lastMonth: 4800, x: 40, y: 35 },
    { label: "18 Jan", value: 12324, lastMonth: 5983, x: 55, y: 25 },
    { label: "22 Jan", value: 11400, lastMonth: 7100, x: 75, y: 30 },
    { label: "29 Jan", value: 15600, lastMonth: 9400, x: 100, y: 15 },
  ];

  // Best Selling Dishes list
  const bestSellingProducts = [
    {
      id: "#83009",
      name: "Chicken Tikka Masala",
      category: "Signature Main",
      sold: "2,310 sold",
      revenue: "$124,839",
      rating: "5.0",
      image: "🍗",
    },
    {
      id: "#83001",
      name: "Steamed Yak & Veg Momos",
      category: "Appetizers",
      sold: "1,890 sold",
      revenue: "$92,682",
      rating: "4.9",
      image: "🥟",
    },
    {
      id: "#83004",
      name: "Himalayan Lamb Rogan Josh",
      category: "Curry",
      sold: "1,212 sold",
      revenue: "$74,048",
      rating: "4.8",
      image: "🥘",
    },
    {
      id: "#83002",
      name: "Garlic Naan & Butter Paneer",
      category: "Sides & Bread",
      sold: "945 sold",
      revenue: "$62,820",
      rating: "4.7",
      image: "🫓",
    },
    {
      id: "#83008",
      name: "Kathmandu Gurkha Thali Set",
      category: "Platters",
      sold: "720 sold",
      revenue: "$48,724",
      rating: "4.9",
      image: "🍱",
    },
  ];

  // Most Day Active bars
  const dayBars = [
    { day: "Sun", height: 40, active: false },
    { day: "Mon", height: 55, active: false },
    { day: "Tue", height: 90, count: "9,102", active: true },
    { day: "Wed", height: 45, active: false },
    { day: "Thu", height: 60, active: false },
    { day: "Fri", height: 75, active: false },
    { day: "Sat", height: 65, active: false },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & CONTROLS BAR (Matching Shopeers exact layout) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">
            Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-700 shadow-2xs">
            <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
            <span>Jan 1, 2026 - Aug 26, 2026</span>
          </div>

          {/* Time Filter Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs cursor-pointer"
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

          {/* Add Widget Button (Matching Screenshot Top action) */}
          <button
            type="button"
            onClick={() => setIsAddWidgetOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-neutral-500" />
            <span>Add widget</span>
          </button>

          {/* Export CTA Button */}
          <button
            type="button"
            onClick={() => addToast("Exporting comprehensive CSV report...", "info")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#B51C20] hover:bg-[#9B181B] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS ROW (4 CARDS MATCHING EXACT SCREENSHOT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Page Views / Sales */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 font-sans">
              Page Views
            </span>
            <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans text-2xl font-black text-[#141414]">
                16,431
              </h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ArrowUpRight className="h-2.5 w-2.5" /> 15.5%
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-sans">
              vs. 14,853 last period
            </p>
          </div>
        </div>

        {/* Card 2: Visitors / Customers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 font-sans">
              Visitors
            </span>
            <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans text-2xl font-black text-[#141414]">
                6,225
              </h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ArrowUpRight className="h-2.5 w-2.5" /> 8.4%
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-sans">
              vs. 5,732 last period
            </p>
          </div>
        </div>

        {/* Card 3: Click Conversions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 font-sans">
              Click
            </span>
            <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MousePointer className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans text-2xl font-black text-[#141414]">
                2,832
              </h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-[#B51C20] border border-red-200">
                <ArrowDownRight className="h-2.5 w-2.5" /> 10.5%
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-sans">
              vs. 3,294 last period
            </p>
          </div>
        </div>

        {/* Card 4: Orders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 font-sans">
              Orders
            </span>
            <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans text-2xl font-black text-[#141414]">
                {stats.totalOrders ? stats.totalOrders.toLocaleString() : "1,224"}
              </h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ArrowUpRight className="h-2.5 w-2.5" /> 4.4%
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-sans">
              vs. 1,189 last period
            </p>
          </div>
        </div>
      </div>

      {/* 3. MAIN 8 / 4 WORKBENCH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (8 cols): Total Profit Chart & Best Selling Products */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Total Profit Interactive Chart */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-500 font-sans">
                  Total Profit
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="font-sans text-3xl sm:text-4xl font-black text-[#141414]">
                    $446.7K
                  </h2>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ArrowUpRight className="h-3 w-3" /> 24.4% vs. last period
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Area Chart Graphic */}
            <div className="relative w-full h-52 pt-4">
              {/* Grid Lines */}
              <div className="absolute inset-x-0 top-0 flex flex-col justify-between h-40 text-[10px] font-mono text-neutral-300 pointer-events-none">
                <div className="border-b border-neutral-100 pb-1 flex justify-between">
                  <span>15K</span>
                </div>
                <div className="border-b border-neutral-100 pb-1 flex justify-between">
                  <span>10K</span>
                </div>
                <div className="border-b border-neutral-100 pb-1 flex justify-between">
                  <span>5K</span>
                </div>
                <div className="border-b border-neutral-100 pb-1 flex justify-between">
                  <span>0</span>
                </div>
              </div>

              {/* SVG Curve */}
              <svg className="w-full h-40 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="himalayanRedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B51C20" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#B51C20" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="blueCurveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area */}
                <path
                  d="M 0 75 Q 10 70, 20 60 T 40 35 T 55 25 T 75 30 T 100 15 L 100 100 L 0 100 Z"
                  fill="url(#blueCurveGradient)"
                />

                {/* Primary Blue/Red Curve Line */}
                <path
                  d="M 0 75 Q 10 70, 20 60 T 40 35 T 55 25 T 75 30 T 100 15"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {chartPoints.map((pt, i) => (
                  <circle
                    key={pt.label}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPointIndex === i ? "4.5" : "3"}
                    className="cursor-pointer transition-all fill-[#3B82F6] stroke-white stroke-2"
                    onMouseEnter={() => setHoveredPointIndex(i)}
                  />
                ))}
              </svg>

              {/* Interactive Tooltip Card matching Screenshot */}
              {hoveredPointIndex !== null && (
                <div
                  className="absolute z-10 bg-white rounded-xl p-2.5 shadow-lg border border-neutral-200 text-left font-sans text-xs pointer-events-none transition-all"
                  style={{
                    left: `${chartPoints[hoveredPointIndex].x}%`,
                    top: `${chartPoints[hoveredPointIndex].y}%`,
                    transform: "translate(-50%, -115%)",
                  }}
                >
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">
                    Jan 18, 2026
                  </p>
                  <div className="space-y-0.5 mt-1">
                    <p className="text-xs font-bold text-[#141414] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                      <span>$12,324 this month</span>
                    </p>
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-neutral-300 inline-block" />
                      <span>$5,983 last month</span>
                    </p>
                  </div>
                </div>
              )}

              {/* X Axis Labels */}
              <div className="flex justify-between text-[11px] font-sans text-neutral-400 pt-2">
                {chartPoints.map((pt) => (
                  <span key={pt.label}>{pt.label}</span>
                ))}
              </div>
            </div>

            {/* Bottom 3 Customer Breakdown Sub-Cards (Matching Screenshot) */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-neutral-500 font-sans">
                  Customers
                </span>
                <button type="button" className="text-neutral-400 hover:text-neutral-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Sub-card 1 */}
                <div className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold text-[#141414]">2,884</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">Retailers &amp; Dine-In</p>
                </div>

                {/* Sub-card 2 */}
                <div className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-[#141414]">1,432</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">Distributors &amp; Delivery</p>
                </div>

                {/* Sub-card 3 */}
                <div className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-[#141414]">562</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">Wholesalers &amp; Catering</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Best Selling Products Table (Matching Screenshot) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#141414]">
                Best Selling Products
              </h3>
              <button type="button" className="text-neutral-400 hover:text-neutral-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">NAME</th>
                    <th className="pb-3 font-semibold text-center">SOLD</th>
                    <th className="pb-3 font-semibold text-center">REVENUE</th>
                    <th className="pb-3 font-semibold text-right">RATING</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {bestSellingProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 font-mono text-neutral-400">{p.id}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{p.image}</span>
                          <div>
                            <p className="font-semibold text-neutral-900">{p.name}</p>
                            <p className="text-[11px] text-neutral-400">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-center text-neutral-500">{p.sold}</td>
                      <td className="py-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
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

        {/* RIGHT COLUMN (4 cols): Most Day Active, Repeat Rate & AI Assistant */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Most Day Active (Bar Chart) */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-[#141414]">
                Most Day Active
              </h3>
              <button type="button" className="text-neutral-400 hover:text-neutral-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Vertical Rounded Bars */}
            <div className="flex items-end justify-between h-36 pt-6 px-2">
              {dayBars.map((bar) => (
                <div key={bar.day} className="flex flex-col items-center gap-2">
                  {bar.active && (
                    <span className="text-[9px] font-bold text-blue-600 font-mono">
                      {bar.count}
                    </span>
                  )}
                  <div
                    className={`w-6 rounded-full transition-all duration-300 ${
                      bar.active ? "bg-blue-600 shadow-xs" : "bg-neutral-100 hover:bg-neutral-200"
                    }`}
                    style={{ height: `${bar.height}%` }}
                  />
                  <span className={`text-[11px] font-sans ${bar.active ? "font-bold text-blue-600" : "text-neutral-400"}`}>
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Repeat Customer Rate (Semi-circular Radial Arc Gauge) */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3 text-center">
            <div className="flex items-center justify-between text-left">
              <h3 className="font-serif text-sm font-bold text-[#141414]">
                Repeat Customer Rate
              </h3>
              <button type="button" className="text-neutral-400 hover:text-neutral-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Radial Arc Gauge graphic */}
            <div className="relative flex flex-col items-center justify-center py-2">
              <svg className="w-44 h-24 overflow-visible" viewBox="0 0 100 55">
                {/* Background arc track */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />
                {/* Active progress arc in vibrant emerald/red */}
                <path
                  d="M 10 50 A 40 40 0 0 1 76 22"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />
              </svg>

              <div className="absolute top-12 flex flex-col items-center">
                <span className="font-sans text-3xl font-black text-[#141414]">68%</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">On track for 80% target</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => addToast("Viewing customer cohort retention...", "info")}
              className="px-4 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Show details
            </button>
          </div>

          {/* Card 3: AI Assistant (Matching Screenshot Widget) */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="font-serif text-sm font-bold text-[#141414]">
                  AI Assistant
                </h3>
              </div>
              <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
            </div>

            {/* Glowing 3D Orb Graphic */}
            <div className="flex flex-col items-center justify-center py-3">
              <div className="relative h-18 w-18 rounded-full bg-gradient-to-tr from-blue-700 via-blue-500 to-sky-300 shadow-xl shadow-blue-500/30 flex items-center justify-center animate-pulse">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* AI Response Box if present */}
            {aiResponse && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-neutral-700 font-sans leading-relaxed animate-fade-in">
                {aiResponse}
              </div>
            )}

            {/* Prompt Input Form */}
            <form onSubmit={handleAskAI} className="relative flex items-center">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full h-10 pl-3.5 pr-16 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => addToast("Voice input listening...", "info")}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="submit"
                  className="h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 4. "ADD WIDGET" SLIDE-OVER DRAWER MODAL (MATCHING TOP SCREENSHOT) */}
      {isAddWidgetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-2xs animate-fade-in">
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
            data-lenis-prevent="true"
          >
            <div className="space-y-5">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="font-serif text-lg font-bold text-[#141414]">
                  Add Widget
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddWidgetOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Widgets Gallery List */}
              <div className="space-y-4">
                {/* Widget 1: Visitors by Device */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white transition-colors space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <PieChart className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans text-xs font-bold text-[#141414]">
                        Visitors by Device
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                        Track how customers access your store across mobile, desktop, and tablet.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-neutral-400 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      #Audience Insights
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => toggleWidget("visitorsByDevice")}
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Select
                    </Button>
                  </div>
                </div>

                {/* Widget 2: Dashboard Overview Floating Preview */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white transition-colors space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans text-xs font-bold text-[#141414]">
                        Dashboard Overview
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                        View key business metrics and performance trends in one place.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-neutral-400 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      #Performance
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => toggleWidget("overview")}
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Select
                    </Button>
                  </div>
                </div>

                {/* Widget 3: Orders Performance */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white transition-colors space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans text-xs font-bold text-[#141414]">
                        Orders Performance
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                        Monitor order volume, fulfillment status, and sales activity in real time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-neutral-400 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      #Operations
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => toggleWidget("ordersPerformance")}
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Select
                    </Button>
                  </div>
                </div>

                {/* Widget 4: Trend Analysis */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white transition-colors space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <LineChart className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans text-xs font-bold text-[#141414]">
                        Trend Analysis
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                        Group customers by behavior and demographics for targeted marketing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-neutral-400 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      #Strategy
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => toggleWidget("trendAnalysis")}
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal CTA */}
            <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
              <Button
                variant="primary"
                className="flex-1 h-10 bg-[#B51C20] hover:bg-[#9B181B] text-white text-xs font-bold"
                onClick={() => {
                  setIsAddWidgetOpen(false);
                  addToast("Dashboard layout updated!", "success");
                }}
              >
                Done
              </Button>
              <Button
                variant="outline"
                className="h-10 text-xs"
                onClick={() => setIsAddWidgetOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
