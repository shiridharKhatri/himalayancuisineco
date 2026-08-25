"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingBag,
  Calendar,
  Award,
  MapPin,
  User,
  LogOut,
  ChevronRight,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import Avatar from "boring-avatars";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { MENU_ITEMS } from "@/lib/data";

interface DBAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface DBReservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  seatingArea: string;
  specialOccasion: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

interface DBOrder {
  id: string;
  status: string;
  type: string;
  total: number;
  createdAt: string;
  items: Array<{
    menuItemName: string;
    quantity: number;
    price: number;
  }>;
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addItem } = useCartStore();
  const { setCartOpen, addToast } = useUIStore();

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "orders" | "rewards" | "reservations" | "addresses"
  >("overview");

  // Profile data states
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [points, setPoints] = React.useState(0);
  const [addresses, setAddresses] = React.useState<DBAddress[]>([]);
  const [reservations, setReservations] = React.useState<DBReservation[]>([]);
  const [dbOrders, setDbOrders] = React.useState<DBOrder[]>([]);

  // Address creation form states
  const [isAddAddressOpen, setIsAddAddressOpen] = React.useState(false);
  const [newStreet, setNewStreet] = React.useState("");
  const [newCity, setNewCity] = React.useState("");
  const [newState, setNewState] = React.useState("CO");
  const [newZipCode, setNewZipCode] = React.useState("");
  const [newIsDefault, setNewIsDefault] = React.useState(false);
  const [isSavingAddress, setIsSavingAddress] = React.useState(false);
  const [addressErrors, setAddressErrors] = React.useState<Record<string, string>>({});

  const fetchProfile = React.useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to load user profile");
      const data = await response.json();
      const user = data.user || {};

      setPoints(user.rewardAccount?.points || 0);
      setAddresses(user.addresses || []);
      setReservations(user.reservations || []);

      // Parse DB orders format to match display requirements
      const formattedOrders = (user.orders || []).map((order: any) => ({
        id: order.id,
        status: order.status,
        type: order.type,
        total: order.total,
        createdAt: order.createdAt,
        items: (order.items || []).map((item: any) => ({
          menuItemName: item.menuItem?.name || "Nepali Platter",
          quantity: item.quantity,
          price: item.price,
        })),
      }));

      setDbOrders(formattedOrders);
    } catch (err: any) {
      console.error(err);
      addToast("Failed to fetch account information", "error");
    } finally {
      setProfileLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  // Handle re-ordering
  const handleReorder = (orderId: string) => {
    const targetOrder = dbOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    let addedCount = 0;
    let unavailableCount = 0;

    targetOrder.items.forEach((item) => {
      const catalogItem = MENU_ITEMS.find((m) => m.name === item.menuItemName);
      if (catalogItem && catalogItem.isAvailable) {
        addItem({
          menuItem: catalogItem,
          quantity: item.quantity,
          selectedModifiers: [],
        });
        addedCount++;
      } else {
        unavailableCount++;
      }
    });

    if (addedCount > 0) {
      if (unavailableCount > 0) {
        addToast("Reordered! Some items were unavailable and skipped.", "warning");
      } else {
        addToast("All items from previous order added to cart!", "success");
      }
      setCartOpen(true);
    } else {
      addToast("Failed to reorder. Items are currently unavailable.", "error");
    }
  };

  const handleRedeemReward = (cost: number, label: string) => {
    if (points >= cost) {
      setPoints((p) => p - cost);
      addToast(`Redeemed free ${label}! Added to your member rewards ledger.`, "success");
    } else {
      addToast("Insufficient points balance.", "error");
    }
  };

  // Add Address Action
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newStreet.trim()) errs.street = "Street address is required";
    if (!newCity.trim()) errs.city = "City is required";
    if (!newZipCode.trim() || newZipCode.length < 5) errs.zipCode = "Valid ZIP is required";

    setAddressErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSavingAddress(true);

    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street: newStreet.trim(),
          city: newCity.trim(),
          state: newState,
          zipCode: newZipCode.trim(),
          isDefault: newIsDefault,
        }),
      });

      if (!res.ok) throw new Error("Failed to save address");

      addToast("New saved address added successfully!", "success");
      setIsAddAddressOpen(false);

      // Reset address inputs
      setNewStreet("");
      setNewCity("");
      setNewState("CO");
      setNewZipCode("");
      setNewIsDefault(false);

      // Re-fetch profile
      fetchProfile();
    } catch {
      addToast("Error saving address. Please try again.", "error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Delete Address Action
  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete address");

      addToast("Address removed successfully.", "info");
      fetchProfile();
    } catch {
      addToast("Failed to remove address.", "error");
    }
  };

  // Auth Protection View
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="max-w-md w-full px-6 text-center space-y-6">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-brand-red-soft rounded-full text-brand-red mb-2">
              <User className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight">Member Portal</h2>
            <p className="font-sans text-sm text-muted-gray leading-relaxed">
              Please sign in to access your order history, active reservations, and loyalty rewards points tracker.
            </p>
            <div className="flex flex-col space-y-3">
              <Link href="/sign-in">
                <Button variant="primary" className="w-full">
                  Sign In / Sign Up
                </Button>
              </Link>
              <Link
                href="/"
                className="font-sans text-xs uppercase tracking-wider font-semibold text-muted-gray hover:text-brand-red transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === "loading" || (status === "authenticated" && profileLoading)) {
    return (
      <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
          <span className="font-sans text-sm text-muted-gray">Loading Member Dashboard...</span>
        </div>
        <Footer />
      </div>
    );
  }

  const US_STATES = [
    { value: "CO", label: "Colorado" },
    { value: "WY", label: "Wyoming" },
    { value: "UT", label: "Utah" },
    { value: "NM", label: "New Mexico" },
    { value: "NE", label: "Nebraska" },
    { value: "KS", label: "Kansas" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          {/* Welcome User Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 text-left pb-6 border-b border-neutral-warm/40">
            <div className="flex items-center gap-4">
              <div className="rounded-full overflow-hidden shrink-0 border border-neutral-warm/30 flex items-center justify-center">
                <Avatar
                  size={64}
                  name={session?.user?.name || session?.user?.email || "Member"}
                  variant="beam"
                  colors={["#C9252D", "#991D24", "#F4D9D8", "#ECE7DF", "#151515"]}
                />
              </div>
              <div>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-red">
                  Customer Account Dashboard
                </span>
                <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mt-1">
                  Namaste, {session?.user?.name || "Member"}
                </h1>
              </div>
            </div>
            <Button
              onClick={() => {
                signOut({ callbackUrl: "/" });
                addToast("Logged out successfully.", "info");
              }}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1.5 shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* SIDEBAR TABS NAV */}
            <aside className="lg:col-span-3 flex flex-col space-y-1.5 text-left border-r border-neutral-warm/20 pr-4">
              {[
                { id: "overview", label: "Overview", icon: <User className="h-4.5 w-4.5" /> },
                { id: "orders", label: "Order History", icon: <ShoppingBag className="h-4.5 w-4.5" /> },
                { id: "rewards", label: "Himalayan Rewards", icon: <Award className="h-4.5 w-4.5" /> },
                { id: "reservations", label: "Table Bookings", icon: <Calendar className="h-4.5 w-4.5" /> },
                { id: "addresses", label: "Saved Addresses", icon: <MapPin className="h-4.5 w-4.5" /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-sans text-sm font-semibold tracking-wide transition-colors text-left cursor-pointer ${
                      isActive
                        ? "bg-brand-red text-cream-light"
                        : "text-charcoal hover:bg-cream-dark/50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </aside>

            {/* MAIN TAB CONTENT */}
            <div className="lg:col-span-9 space-y-6">
              {/* OVERVIEW CONTENT */}
              {activeTab === "overview" && (
                <div className="space-y-6 text-left animate-fade-in">
                  {/* Summary Dashboard Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-muted-gray">
                        Loyalty Ledger
                      </span>
                      <h3 className="font-serif text-3xl font-bold text-brand-red-dark mt-1">
                        {points} pts
                      </h3>
                      <p className="font-sans text-xs text-muted-gray mt-2 leading-relaxed">
                        Earned on all dine-in and takeout orders. Redeeming starts at 100 points.
                      </p>
                    </Card>
                    <Card>
                      <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-muted-gray">
                        Order Count
                      </span>
                      <h3 className="font-serif text-3xl font-bold mt-1">
                        {dbOrders.length} Completed
                      </h3>
                      <p className="font-sans text-xs text-muted-gray mt-2 leading-relaxed">
                        Track active orders or re-order your favorite momos in one click.
                      </p>
                    </Card>
                    <Card>
                      <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-muted-gray">
                        Dining Level
                      </span>
                      <h3 className="font-serif text-3xl font-bold text-accent-green mt-1">
                        Mustang Silver
                      </h3>
                      <p className="font-sans text-xs text-muted-gray mt-2 leading-relaxed">
                        Unlock Gold level at 500 points for free dessert additions.
                      </p>
                    </Card>
                  </div>

                  {/* Recent Order Preview */}
                  <Card>
                    <h3 className="font-serif text-xl font-bold border-b border-neutral-warm/40 pb-3 mb-4">
                      Recent Activity
                    </h3>
                    {dbOrders.length === 0 ? (
                      <p className="font-sans text-sm text-muted-gray py-6">
                        No orders recorded yet. View our menu to place your first order.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-sans">
                          <div>
                            <span className="font-semibold text-charcoal block">
                              Order #{dbOrders[0].id.slice(-8).toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-gray">
                              {new Date(dbOrders[0].createdAt).toLocaleDateString()} &bull;{" "}
                              {dbOrders[0].type}
                            </span>
                          </div>
                          <Badge variant="soft-red">{dbOrders[0].status}</Badge>
                        </div>
                        <p className="font-sans text-xs text-muted-gray">
                          Items:{" "}
                          {dbOrders[0].items
                            .map((i) => `${i.menuItemName} x${i.quantity}`)
                            .join(", ")}
                        </p>
                        <div className="flex justify-end pt-2 border-t border-neutral-warm/20">
                          <Button
                            onClick={() => handleReorder(dbOrders[0].id)}
                            variant="secondary"
                            size="sm"
                            className="flex items-center space-x-1.5"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Quick Reorder</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* ORDERS HISTORY CONTENT */}
              {activeTab === "orders" && (
                <div className="space-y-6 text-left animate-fade-in">
                  <h3 className="font-serif text-2xl font-bold border-b border-neutral-warm/40 pb-3 mb-6">
                    Historical Orders
                  </h3>

                  {dbOrders.length === 0 ? (
                    <div className="text-center py-12 bg-cream-light border border-neutral-warm/40 rounded-xl">
                      <p className="font-sans text-sm text-muted-gray mb-4">
                        No order history recorded.
                      </p>
                      <Link href="/menu">
                        <Button variant="primary" size="sm">
                          Browse Menu
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {dbOrders.map((order) => (
                        <Card key={order.id}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-warm/30 pb-4 mb-4 font-sans text-sm">
                            <div>
                              <strong className="block text-charcoal">
                                Order #{order.id.slice(-8).toUpperCase()}
                              </strong>
                              <span className="text-xs text-muted-gray">
                                Placed on: {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="neutral">{order.type}</Badge>
                              <Badge variant="soft-red">{order.status}</Badge>
                              <span className="font-bold text-charcoal">
                                ${order.total.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4 font-sans text-sm">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-muted-gray text-xs">
                                <span>
                                  {item.menuItemName} x{item.quantity}
                                </span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end pt-4 border-t border-neutral-warm/30">
                            <Button
                              onClick={() => handleReorder(order.id)}
                              variant="secondary"
                              size="sm"
                              className="flex items-center space-x-1.5"
                            >
                              <RotateCcw className="h-4 w-4" />
                              <span>Order This Again</span>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REWARDS CONTENT */}
              {activeTab === "rewards" && (
                <div className="space-y-6 text-left animate-fade-in">
                  <h3 className="font-serif text-2xl font-bold border-b border-neutral-warm/40 pb-3 mb-6">
                    Rewards & Loyalty
                  </h3>

                  <Card className="border border-brand-red/20 bg-brand-red-soft/10 mb-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-brand-red block mb-1">
                          Mustang Membership Points
                        </span>
                        <h4 className="font-serif text-3xl font-bold text-charcoal">
                          {points} Loyalty Points
                        </h4>
                      </div>
                      <Award className="h-10 w-10 text-brand-red" />
                    </div>
                  </Card>

                  <h4 className="font-serif text-xl font-semibold mb-4">
                    Available Reward Redemptions
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="flex flex-col justify-between">
                      <div>
                        <Badge variant="primary" className="mb-2">
                          100 Points
                        </Badge>
                        <h5 className="font-serif text-lg font-bold">Free Soft Drink</h5>
                        <p className="font-sans text-xs text-muted-gray mt-1 leading-relaxed">
                          Redeem a Mango Cardamom Lassi or Nepali Spiced Chai.
                        </p>
                      </div>
                      <Button
                        onClick={() => handleRedeemReward(100, "Lassi / Chai Drink")}
                        disabled={points < 100}
                        variant="secondary"
                        size="sm"
                        className="w-full mt-6"
                      >
                        Redeem Reward
                      </Button>
                    </Card>

                    <Card className="flex flex-col justify-between">
                      <div>
                        <Badge variant="primary" className="mb-2">
                          250 Points
                        </Badge>
                        <h5 className="font-serif text-lg font-bold">Free Appetizer</h5>
                        <p className="font-sans text-xs text-muted-gray mt-1 leading-relaxed">
                          Get a free plate of Chicken Choila or Steamed Momos.
                        </p>
                      </div>
                      <Button
                        onClick={() => handleRedeemReward(250, "Appetizer (Momo/Choila)")}
                        disabled={points < 250}
                        variant="secondary"
                        size="sm"
                        className="w-full mt-6"
                      >
                        Redeem Reward
                      </Button>
                    </Card>

                    <Card className="flex flex-col justify-between">
                      <div>
                        <Badge variant="primary" className="mb-2">
                          500 Points
                        </Badge>
                        <h5 className="font-serif text-lg font-bold">Free Entrée Platter</h5>
                        <p className="font-sans text-xs text-muted-gray mt-1 leading-relaxed">
                          Redeem a complete Goat Curry or Sherpa Thukpa set.
                        </p>
                      </div>
                      <Button
                        onClick={() => handleRedeemReward(500, "Entrée Platter")}
                        disabled={points < 500}
                        variant="secondary"
                        size="sm"
                        className="w-full mt-6"
                      >
                        Redeem Reward
                      </Button>
                    </Card>
                  </div>
                </div>
              )}

              {/* RESERVATIONS CONTENT */}
              {activeTab === "reservations" && (
                <div className="space-y-6 text-left animate-fade-in">
                  <h3 className="font-serif text-2xl font-bold border-b border-neutral-warm/40 pb-3 mb-6">
                    Booked Dining Tables
                  </h3>

                  {reservations.length === 0 ? (
                    <div className="bg-cream-light border border-neutral-warm/40 rounded-xl p-6 text-center">
                      <p className="font-sans text-sm text-muted-gray mb-4">
                        No active table bookings allocated. Need a spot for tonight?
                      </p>
                      <Link href="/reservations">
                        <Button variant="primary" size="sm">
                          Book Table Reservation
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reservations.map((res) => (
                        <Card key={res.id}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-charcoal">
                                  {res.guests} Guest{res.guests > 1 ? "s" : ""}
                                </span>
                                <Badge variant={res.status === "CONFIRMED" ? "success" : "neutral"}>
                                  {res.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-gray">
                                Date: {new Date(res.date).toLocaleDateString()} &bull; Time: {res.time}
                              </p>
                              {res.notes && (
                                <p className="text-xs text-charcoal/80 italic mt-1">
                                  Notes: &ldquo;{res.notes}&rdquo;
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-xs text-muted-gray">
                                ID: {res.id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <div className="text-center pt-2">
                        <Link href="/reservations">
                          <Button variant="outline" size="sm">
                            Book Another Table
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES CONTENT */}
              {activeTab === "addresses" && (
                <div className="space-y-6 text-left animate-fade-in">
                  <div className="flex justify-between items-center border-b border-neutral-warm/40 pb-3 mb-6">
                    <h3 className="font-serif text-2xl font-bold">Saved Addresses</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddAddressOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add New Address
                    </Button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-12 bg-cream-light border border-neutral-warm/40 rounded-xl">
                      <p className="font-sans text-sm text-muted-gray mb-4">
                        No saved delivery addresses yet.
                      </p>
                      <Button variant="primary" size="sm" onClick={() => setIsAddAddressOpen(true)}>
                        Create Saved Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <Card key={addr.id} className="flex justify-between items-center">
                          <div className="font-sans text-sm text-charcoal">
                            <div className="flex items-center space-x-2">
                              <strong>Delivery Address</strong>
                              {addr.isDefault && <Badge variant="neutral">Default</Badge>}
                            </div>
                            <p className="text-muted-gray mt-1">{addr.street}</p>
                            <p className="text-muted-gray">
                              {addr.city}, {addr.state} {addr.zipCode}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2 text-muted-gray hover:text-brand-red hover:bg-brand-red-soft/20 rounded-full transition-all cursor-pointer"
                            aria-label="Delete address"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Address Dialog */}
      <Dialog
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        title="Add Saved Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4 text-left">
          <Input
            label="Street Address"
            value={newStreet}
            onChange={(e) => setNewStreet(e.target.value)}
            error={addressErrors.street}
            placeholder="e.g. 123 Main St"
            disabled={isSavingAddress}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              error={addressErrors.city}
              placeholder="Glenwood Springs"
              disabled={isSavingAddress}
            />
            <Select
              label="State"
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              options={US_STATES}
              disabled={isSavingAddress}
            />
            <Input
              label="ZIP Code"
              value={newZipCode}
              onChange={(e) => setNewZipCode(e.target.value)}
              error={addressErrors.zipCode}
              placeholder="81601"
              disabled={isSavingAddress}
            />
          </div>

          <label className="flex items-center gap-2 pt-1 font-sans text-sm text-charcoal select-none cursor-pointer">
            <input
              type="checkbox"
              checked={newIsDefault}
              onChange={(e) => setNewIsDefault(e.target.checked)}
              className="rounded border-neutral-warm text-brand-red focus:ring-brand-red cursor-pointer"
              disabled={isSavingAddress}
            />
            Set as default delivery address
          </label>

          <div className="flex items-center gap-3 pt-3">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSavingAddress}
            >
              <Check className="h-4 w-4 mr-2" />
              Save Address
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddAddressOpen(false)}
              disabled={isSavingAddress}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>

      <Footer />
    </div>
  );
}
