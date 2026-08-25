"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  UtensilsCrossed,
  Layers,
  Settings,
  ShieldCheck,
  CheckCircle,
  Clock,
  Ban,
  Undo2,
  DollarSign
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { MENU_ITEMS, CATEGORIES } from "@/lib/data";
import { MenuItem, OrderStatus } from "@/types";
import { useOrderStore } from "@/stores/orderStore";
import { useUIStore } from "@/stores/uiStore";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const { orders, updateOrderStatus } = useOrderStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = React.useState<"overview" | "orders" | "menu" | "reservations" | "catering">("overview");

  // Auth local inputs for login
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // Local state copy of Menu items for CMS editor
  const [cmsMenuItems, setCmsMenuItems] = React.useState<MenuItem[]>(MENU_ITEMS);

  // Mock catering requests state
  const [cateringLeads, setCateringLeads] = React.useState([
    { id: "QT-8802", name: "Corporate Summit LLC", event: "Corporate Lunch", guests: 45, date: "2026-09-12", total: 1590.00, status: "NEW" },
    { id: "QT-9012", name: "Rana Wedding Anniversary", event: "Private Feast Dinner", guests: 22, date: "2026-09-19", total: 854.00, status: "CONTACTED" },
  ]);

  // Mock reservations state
  const [reservations, setReservations] = React.useState([
    { id: "RES-1022", name: "Devendra Pandey", date: "Today", time: "6:00 PM", guests: 4, area: "INDOOR", status: "CONFIRMED" },
    { id: "RES-2098", name: "Lois Lane", date: "Today", time: "7:30 PM", guests: 2, area: "OUTDOOR", status: "PENDING" },
  ]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const result = await signIn("credentials", {
      email: adminEmail,
      password: adminPassword,
      redirect: false,
    });
    setIsLoggingIn(false);

    if (result?.ok) {
      addToast("Welcome back, Administrator!", "success");
    } else {
      addToast("Invalid administrator credentials. Try admin@himalayan.com / adminpassword.", "error");
    }
  };

  // Menu CMS price updates
  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    setCmsMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, price: newPrice } : item))
    );
    addToast("Price updated successfully!", "success");
  };

  // Menu CMS availability toggling
  const handleToggleAvailability = (itemId: string) => {
    setCmsMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextState = !item.isAvailable;
          addToast(
            `${item.name} is now ${nextState ? "Available" : "Unavailable"}.`,
            nextState ? "success" : "warning"
          );
          
          // Propagate back to core items array
          const originalItem = MENU_ITEMS.find((m) => m.id === itemId);
          if (originalItem) originalItem.isAvailable = nextState;
          
          return { ...item, isAvailable: nextState };
        }
        return item;
      })
    );
  };

  // Catering Quote accept
  const handleUpdateCateringStatus = (leadId: string, status: string) => {
    setCateringLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    addToast(`Catering quote ${leadId} status updated to ${status}.`, "success");
  };

  // Reservations status update
  const handleUpdateReservationStatus = (resId: string, status: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status } : r))
    );
    addToast(`Table booking ${resId} marked as ${status}.`, "success");
  };

  // Authenticate checker: NextAuth session and admin role check
  const isAdmin = session?.user && (session.user as any).role === "ADMIN";

  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen bg-cream-base">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Badge variant="neutral" className="animate-pulse">Authorizing Admin Console...</Badge>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="max-w-md w-full px-6">
            <Card className="text-center space-y-6">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-brand-red-soft rounded-full text-brand-red mb-2">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="font-serif text-3xl font-bold tracking-tight">Admin Gatekeeper</h2>
              <p className="font-sans text-xs md:text-sm text-muted-gray leading-relaxed">
                Unauthorized access detected. Please log in using the administrator portal credentials.
              </p>

              <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                <Input
                  label="Administrator Email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@himalayan.com"
                  required
                />
                <Input
                  label="Security Password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoggingIn}>
                  Authorize Admin Login
                </Button>
              </form>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate live analytics numbers
  const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0) + 2440.00;
  const totalOrdersCount = orders.length + 38;

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          
          {/* Header Dashboard Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 text-left pb-6 border-b border-neutral-warm/40">
            <div>
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-red">
                Management Console
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Restaurant Administration
              </h1>
            </div>
            <div className="text-sm font-sans text-muted-gray shrink-0">
              Admin Session: <strong>{session.user?.name}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ADMIN SIDEBAR NAV */}
            <aside className="lg:col-span-3 flex flex-col space-y-1.5 text-left border-r border-neutral-warm/20 pr-4">
              {[
                { id: "overview", label: "Overview Metrics", icon: <TrendingUp className="h-4.5 w-4.5" /> },
                { id: "orders", label: "Live Orders Feed", icon: <ShoppingBag className="h-4.5 w-4.5" /> },
                { id: "menu", label: "Menu CMS Editor", icon: <UtensilsCrossed className="h-4.5 w-4.5" /> },
                { id: "reservations", label: "Reservations Seating", icon: <Calendar className="h-4.5 w-4.5" /> },
                { id: "catering", label: "Catering Quote Leads", icon: <Layers className="h-4.5 w-4.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-sm font-sans text-sm font-semibold tracking-wide transition-colors text-left cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-brand-red text-cream-light"
                      : "text-charcoal hover:bg-cream-dark/50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </aside>

            {/* ADMIN MAIN CONTENT */}
            <div className="lg:col-span-9 space-y-6">

              {/* OVERVIEW CONTENT */}
              {activeTab === "overview" && (
                <div className="space-y-6 text-left animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-muted-gray">Today's Revenue</span>
                      <h3 className="font-serif text-3xl font-bold text-accent-green mt-1">${todayRevenue.toFixed(2)}</h3>
                    </Card>
                    <Card>
                      <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-muted-gray">Orders Placed</span>
                      <h3 className="font-serif text-3xl font-bold mt-1">{totalOrdersCount} orders</h3>
                    </Card>
                    <Card>
                      <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-muted-gray">Pending Tables</span>
                      <h3 className="font-serif text-3xl font-bold mt-1">{reservations.filter((r) => r.status === "PENDING").length} tables</h3>
                    </Card>
                    <Card>
                      <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-muted-gray">New Catering Leads</span>
                      <h3 className="font-serif text-3xl font-bold text-brand-red-dark mt-1">{cateringLeads.filter((l) => l.status === "NEW").length} leads</h3>
                    </Card>
                  </div>

                  <Card>
                    <h3 className="font-serif text-xl font-bold border-b border-neutral-warm/40 pb-3 mb-4">Active Orders Feed</h3>
                    {orders.length === 0 ? (
                      <p className="font-sans text-sm text-muted-gray py-6">No incoming digital orders currently queued.</p>
                    ) : (
                      <div className="space-y-4 divide-y divide-neutral-warm/25">
                        {orders.slice(0, 3).map((ord) => (
                          <div key={ord.id} className="flex justify-between items-center text-sm pt-4 first:pt-0">
                            <div>
                              <strong>Order #{ord.id} ({ord.customerName})</strong>
                              <span className="block text-xs text-muted-gray">{ord.type} &bull; Total: ${ord.total.toFixed(2)}</span>
                            </div>
                            <Badge variant="primary">{ord.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* ORDERS CMS PANEL */}
              {activeTab === "orders" && (
                <div className="space-y-6 text-left animate-fade-in">
                  <h3 className="font-serif text-2xl font-bold border-b border-neutral-warm/40 pb-3 mb-6">Live Order Control Board</h3>
                  
                  {orders.length === 0 ? (
                    <Card>
                      <p className="font-sans text-sm text-muted-gray py-12 text-center">No digital orders placed in this session.</p>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((ord) => (
                        <Card key={ord.id}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-warm/30 pb-4 mb-4">
                            <div>
                              <h4 className="font-serif text-lg font-bold">Order #{ord.id}</h4>
                              <p className="font-sans text-xs text-muted-gray">Customer: {ord.customerName} ({ord.customerPhone})</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="primary">{ord.status}</Badge>
                              <span className="font-bold text-charcoal font-sans text-sm">${ord.total.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="space-y-1 mb-6 font-sans text-xs text-muted-gray">
                            {ord.items.map((i, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{i.menuItemName} x{i.quantity} {i.protein ? `[${i.protein}]` : ""}</span>
                                <span>${(i.price * i.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Action update status buttons */}
                          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-neutral-warm/30">
                            <button
                              onClick={() => updateOrderStatus(ord.id, "CONFIRMED")}
                              className="px-3 py-1 bg-cream-dark text-charcoal border border-neutral-warm text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-warm transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateOrderStatus(ord.id, "PREPARING")}
                              className="px-3 py-1 bg-cream-dark text-charcoal border border-neutral-warm text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-warm transition-colors cursor-pointer"
                            >
                              Prepare
                            </button>
                            <button
                              onClick={() => updateOrderStatus(ord.id, "READY")}
                              className="px-3 py-1 bg-cream-dark text-charcoal border border-neutral-warm text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-warm transition-colors cursor-pointer"
                            >
                              Mark Ready
                            </button>
                            <button
                              onClick={() => updateOrderStatus(ord.id, "COMPLETED")}
                              className="px-3 py-1 bg-accent-green text-cream-light text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-opacity-90 transition-all cursor-pointer"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateOrderStatus(ord.id, "CANCELLED")}
                              className="px-3 py-1 bg-brand-red text-cream-light text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-brand-red-dark transition-colors cursor-pointer ml-auto"
                            >
                              Refund
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MENU CMS PANEL */}
              {activeTab === "menu" && (
                <div className="space-y-6 text-left animate-fade-in">
                  <h3 className="font-serif text-2xl font-bold border-b border-neutral-warm/40 pb-3 mb-6">Menu Catalog Management</h3>
                  
                  <div className="space-y-4">
                    {cmsMenuItems.map((item) => (
                      <Card key={item.id} padded={false}>
                        <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-sm">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-sm bg-cream-dark overflow-hidden relative shrink-0">
                              <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
                            </div>
                            <div>
                              <strong className="block text-charcoal font-serif text-base">{item.name}</strong>
                              <span className="text-xs text-muted-gray">Base cost: ${item.price.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            {/* Price adjust input */}
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-gray uppercase tracking-wider font-semibold">Price:</span>
                              <input
                                type="number"
                                defaultValue={item.price}
                                onBlur={(e) => handleUpdatePrice(item.id, parseFloat(e.target.value) || item.price)}
                                className="w-16 h-8 px-2 border border-neutral-warm rounded-sm bg-cream-light text-center focus:outline-none focus:ring-1 focus:ring-brand-red font-sans text-sm"
                              />
                            </div>

                            {/* Availability Toggle */}
                            <button
                              onClick={() => handleToggleAvailability(item.id)}
                              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-sm border cursor-pointer transition-colors ${
                                item.isAvailable
                                  ? "bg-accent-green/10 border-accent-green/20 text-accent-green"
                                  : "bg-brand-red-soft/20 border-brand-red/20 text-brand-red-dark"
                              }`}
                            >
                              {item.isAvailable ? "Available" : "Locked / Out"}
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* RESERVATIONS CMS PANEL */}
              {activeTab === "reservations" && (
                <div className="space-y-6 text-left animate-fade-in">
                  <h3 className="font-serif text-2xl font-bold border-b border-neutral-warm/40 pb-3 mb-6">Reservations Book Manager</h3>
                  
                  <div className="space-y-4">
                    {reservations.map((res) => (
                      <Card key={res.id}>
                        <div className="flex justify-between items-center border-b border-neutral-warm/20 pb-3 mb-3 font-sans text-sm">
                          <div>
                            <strong>{res.name} ({res.guests} guests)</strong>
                            <span className="block text-xs text-muted-gray">{res.date} at {res.time} &bull; Area: {res.area}</span>
                          </div>
                          <Badge variant={res.status === "CONFIRMED" ? "success" : "warning"}>{res.status}</Badge>
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, "CONFIRMED")}
                            className="px-3 py-1 bg-cream-dark text-charcoal border border-neutral-warm text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-warm cursor-pointer"
                          >
                            Confirm Table
                          </button>
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, "ARRIVED")}
                            className="px-3 py-1 bg-accent-green text-cream-light text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-opacity-95 cursor-pointer"
                          >
                            Seated
                          </button>
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, "NOSHOW")}
                            className="px-3 py-1 bg-cream-dark text-muted-gray border border-neutral-warm text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-cream-dark cursor-pointer"
                          >
                            No Show
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* CATERING CMS LEADS PANEL */}
              {activeTab === "catering" && (
                <div className="space-y-6 text-left animate-fade-in">
                  <h3 className="font-serif text-2xl font-bold border-b border-neutral-warm/40 pb-3 mb-6">Catering Quote leads pipeline</h3>
                  
                  <div className="space-y-4">
                    {cateringLeads.map((lead) => (
                      <Card key={lead.id}>
                        <div className="flex justify-between items-center border-b border-neutral-warm/20 pb-3 mb-3 font-sans text-sm">
                          <div>
                            <strong>{lead.name}</strong>
                            <p className="text-xs text-muted-gray">{lead.event} &bull; {lead.guests} guests &bull; Date: {lead.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold block">${lead.total.toFixed(2)}</span>
                            <Badge variant={lead.status === "CONFIRMED" ? "success" : "neutral"}>{lead.status}</Badge>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => handleUpdateCateringStatus(lead.id, "CONTACTED")}
                            className="px-3 py-1 bg-cream-dark text-charcoal border border-neutral-warm text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-warm cursor-pointer"
                          >
                            Contact Lead
                          </button>
                          <button
                            onClick={() => handleUpdateCateringStatus(lead.id, "QUOTE_SENT")}
                            className="px-3 py-1 bg-cream-dark text-charcoal border border-neutral-warm text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-warm cursor-pointer"
                          >
                            Send Quote PDF
                          </button>
                          <button
                            onClick={() => handleUpdateCateringStatus(lead.id, "CONFIRMED")}
                            className="px-3 py-1 bg-accent-green text-cream-light text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-opacity-95 cursor-pointer"
                          >
                            Book Contract
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
