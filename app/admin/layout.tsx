"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  CalendarDays,
  Wine,
  Gift,
  Briefcase,
  MapPin,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Settings,
  Flame,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const mainNavItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: "46" },
    { label: "Products / Menu", href: "/admin/menu", icon: UtensilsCrossed },
    { label: "Delivery Zone", href: "/admin/delivery", icon: MapPin },
    { label: "Reservations", href: "/admin/reservations", icon: CalendarDays },
  ];

  const secondaryNavItems = [
    { label: "Catering", href: "/admin/catering", icon: Wine },
    { label: "Gift Cards", href: "/admin/gift-cards", icon: Gift },
    { label: "Job Applicants", href: "/admin/careers", icon: Briefcase },
  ];

  const systemNavItems = [
    { label: "Settings", href: "/admin/delivery", icon: Settings },
    { label: "Live Website", href: "/", icon: ExternalLink, external: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E1E1E] flex flex-col md:flex-row antialiased font-sans selection:bg-[#B51C20] selection:text-white">
      {/* DESKTOP SIDEBAR */}
      <aside
        className="hidden md:flex flex-col w-64 bg-white text-[#4A4A4A] border-r border-[#EBEBEB] shrink-0 sticky top-0 h-screen z-30 justify-between overflow-hidden"
        data-lenis-prevent="true"
        data-lenis-prevent-wheel="true"
        data-lenis-prevent-touch="true"
      >
        <div
          className="flex flex-col flex-1 overflow-y-auto overscroll-contain px-4 py-5"
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
        >
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 mb-6">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl bg-[#B51C20] p-1.5 flex items-center justify-center shadow-xs">
                <Image src="/images/logo.png" alt="Admin Logo" fill className="object-contain invert" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base text-[#141414] tracking-tight">
                  Himalayan
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#B51C20]" />
              </div>
            </Link>
          </div>

          {/* Main Navigation Section */}
          <div className="space-y-6">
            <div>
              <div className="px-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Main
                </span>
              </div>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-[#FDF2F2] text-[#B51C20] font-bold shadow-xs"
                          : "text-neutral-600 hover:text-[#141414] hover:bg-neutral-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#B51C20]" : "text-neutral-500"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-[#B51C20] text-white"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Operations Section */}
            <div>
              <div className="px-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Operations &amp; Events
                </span>
              </div>
              <nav className="space-y-1">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-[#FDF2F2] text-[#B51C20] font-bold shadow-xs"
                          : "text-neutral-600 hover:text-[#141414] hover:bg-neutral-100/70"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#B51C20]" : "text-neutral-500"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* System / General Section */}
            <div>
              <div className="px-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  System
                </span>
              </div>
              <nav className="space-y-1">
                {systemNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-[#FDF2F2] text-[#B51C20] font-bold shadow-xs"
                          : "text-neutral-600 hover:text-[#141414] hover:bg-neutral-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#B51C20]" : "text-neutral-500"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.external && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded font-mono font-semibold">
                          Live
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Promo / Live Kitchen Status Card (Matching Screenshot Bottom Card) */}
        <div className="p-4 border-t border-neutral-100 space-y-3">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#B51C20] via-[#9B181B] to-[#6A0E10] p-4 text-white shadow-md">
            <div className="relative z-10 space-y-2">
              <div className="h-7 w-7 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-xs">Live Kitchen System</h4>
                <p className="text-[11px] text-white/80 mt-0.5 leading-snug">
                  Active orders sync directly with kitchen prep queue.
                </p>
              </div>
              <Link href="/admin/orders" className="block">
                <button
                  type="button"
                  className="w-full py-1.5 px-3 rounded-xl bg-white text-[#B51C20] font-sans font-bold text-xs hover:bg-white/90 transition-colors shadow-xs cursor-pointer"
                >
                  View Kitchen Queue
                </button>
              </Link>
            </div>
          </div>

          {/* Admin User Strip */}
          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-xs text-[#B51C20]">
                TS
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-800 truncate">Tashi Sherpa</p>
                <p className="text-[10px] text-neutral-400 font-mono">Master Admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#B51C20] hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOPBAR & DRAWER */}
      <div className="md:hidden sticky top-0 z-40 bg-white text-[#141414] border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 rounded-lg bg-[#B51C20] p-1 flex items-center justify-center">
            <Image src="/images/logo.png" alt="Logo" fill className="object-contain invert" />
          </div>
          <span className="font-serif text-sm font-bold tracking-wide">Himalayan Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-neutral-100 text-xs text-neutral-600 hover:text-black"
            title="Live Site"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-neutral-100 text-[#141414]"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION MENU */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-[53px] bottom-0 bg-white z-40 p-4 overflow-y-auto overscroll-contain space-y-1"
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
        >
          {[...mainNavItems, ...secondaryNavItems, ...systemNavItems].map((item: any) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm ${
                  isActive ? "bg-[#FDF2F2] text-[#B51C20] font-bold" : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#B51C20] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-neutral-200 mt-4">
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-sm font-semibold text-[#B51C20]"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN ADMIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] overflow-y-auto min-h-screen">
        {/* Dynamic Page Content */}
        <div className="p-6 md:p-8 flex-1 max-w-[1600px] w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
