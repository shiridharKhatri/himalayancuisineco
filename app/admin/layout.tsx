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
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Search,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Menu Items", href: "/admin/menu", icon: UtensilsCrossed },
    { label: "Live Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Reservations", href: "/admin/reservations", icon: CalendarDays },
    { label: "Catering", href: "/admin/catering", icon: Wine },
    { label: "Gift Cards", href: "/admin/gift-cards", icon: Gift },
    { label: "Job Applicants", href: "/admin/careers", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-[#F4F3EE] text-[#1E1E1E] flex flex-col md:flex-row antialiased font-sans selection:bg-[#B51C20] selection:text-white">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#141414] text-[#E0E0E0] border-r border-[#262626] shrink-0 sticky top-0 h-screen z-30 justify-between">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Admin Header / Brand */}
          <div className="p-5 border-b border-[#262626] flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl bg-[#B51C20] p-1.5 flex items-center justify-center shadow-md">
                <Image src="/images/logo.png" alt="Admin Logo" fill className="object-contain invert" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm text-white tracking-wide block">
                  HIMALAYAN
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#B51C20] font-bold block">
                  Control Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? "bg-[#B51C20] text-white font-semibold shadow-sm"
                      : "text-[#A0A0A0] hover:text-white hover:bg-[#1E1E1E]"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#A0A0A0]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#262626] space-y-3 bg-[#0F0F0F]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1E1E1E] text-xs font-medium text-[#C0C0C0] hover:text-white hover:bg-[#282828] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-[#B51C20]" />
              <span>Live Website</span>
            </span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#B51C20]/20 text-[#B51C20] rounded font-mono font-bold">
              PUBLIC
            </span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-[#262626] border border-[#3A3A3A] flex items-center justify-center font-bold text-xs text-white">
                TS
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Tashi Sherpa</p>
                <p className="text-[10px] text-[#888888] font-mono">Master Admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="p-1.5 rounded-lg text-[#888888] hover:text-[#B51C20] hover:bg-[#1E1E1E] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOPBAR & DRAWER */}
      <div className="md:hidden sticky top-0 z-40 bg-[#141414] text-white border-b border-[#262626] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 rounded-lg bg-[#B51C20] p-1 flex items-center justify-center">
            <Image src="/images/logo.png" alt="Logo" fill className="object-contain invert" />
          </div>
          <span className="font-serif text-xs font-bold tracking-wide">Admin Panel</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-[#1E1E1E] text-xs text-[#A0A0A0] hover:text-white"
            title="Live Site"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-[#1E1E1E] text-white"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION MENU */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-x-0 top-[53px] bottom-0 bg-[#141414] z-40 p-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm ${
                  isActive ? "bg-[#B51C20] text-white font-bold" : "text-[#A0A0A0] hover:bg-[#1E1E1E]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-[#262626] mt-4">
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#262626] text-sm font-semibold text-[#B51C20]"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out of Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN ADMIN CONTENT AREA (No public header/footer) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F3EE] overflow-y-auto min-h-screen">
        {/* Top bar header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200/80 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-[#141414]">
              {navItems.find((n) => n.href === pathname)?.label || "Administration"}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Database Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F3EE] border border-neutral-200 text-xs text-neutral-500">
              <ShieldCheck className="h-4 w-4 text-[#B51C20]" />
              <span className="font-mono">admin@himalayancuisineco.com</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-6 md:p-8 flex-1 max-w-[1500px] w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
