"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Store,
  Clock,
  MapPin,
  Check,
  ChevronDown,
  CreditCard,
  Plus,
  Minus,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useUIStore } from "@/stores/uiStore";
import { Dialog } from "@/components/ui/Dialog";
import { CuisineLoader } from "@/components/ui/CuisineLoader";
import { calculateDistanceInMiles } from "@/lib/geo";

export function CheckoutView({ checkoutId }: { checkoutId?: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    items,
    deliveryType,
    deliveryAddress,
    tip,
    couponCode,
    couponDiscountPercent,
    getTotals,
    clearCart,
    setTip,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    setDeliveryType,
  } = useCartStore();
  const { placeOrder } = useOrderStore();
  const { addToast } = useUIStore();

  const { subtotal, tax, deliveryFee, discount, total } = getTotals();

  const [hasMounted, setHasMounted] = React.useState(false);
  const [deliverySettings, setDeliverySettings] = React.useState<{
    latitude: number;
    longitude: number;
    maxRadiusMiles: number;
    enforceRadius: boolean;
    outOfRangeMessage: string;
  } | null>(null);

  React.useEffect(() => {
    setHasMounted(true);
    fetch("/api/delivery-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setDeliverySettings({
            latitude: data.settings.latitude ?? 39.5505,
            longitude: data.settings.longitude ?? -107.3248,
            maxRadiusMiles: data.settings.maxRadiusMiles ?? 10.0,
            enforceRadius: data.settings.enforceRadius ?? true,
            outOfRangeMessage:
              data.settings.outOfRangeMessage ||
              "Sorry, your address is outside our delivery zone. We only deliver within {radius} miles.",
          });
        }
      })
      .catch(() => {});
  }, []);

  const addressDistance = React.useMemo(() => {
    if (!deliveryAddress?.lat || !deliveryAddress?.lng || !deliverySettings) return null;
    return calculateDistanceInMiles(
      deliverySettings.latitude,
      deliverySettings.longitude,
      deliveryAddress.lat,
      deliveryAddress.lng
    );
  }, [deliveryAddress, deliverySettings]);

  const isAddressOutOfRange = React.useMemo(() => {
    if (addressDistance === null || !deliverySettings) return false;
    return deliverySettings.enforceRadius && addressDistance > deliverySettings.maxRadiusMiles;
  }, [addressDistance, deliverySettings]);


  // Redirect if cart is empty, only after client hydration has completed
  React.useEffect(() => {
    if (hasMounted && items.length === 0) {
      router.push("/menu");
    }
  }, [hasMounted, items, router]);

  // Form State
  const [phone, setPhone] = React.useState("");
  const [firstName, setFirstName] = React.useState(
    session?.user?.name ? session.user.name.split(" ")[0] : ""
  );
  const [lastName, setLastName] = React.useState(
    session?.user?.name ? session.user.name.split(" ").slice(1).join(" ") : ""
  );
  const [email, setEmail] = React.useState(session?.user?.email || "");
  const [promoEmails, setPromoEmails] = React.useState(true);
  const [promoTexts, setPromoTexts] = React.useState(false);

  // Payment Form State
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvc, setCardCvc] = React.useState("");
  const [country, setCountry] = React.useState("Nepal");

  // Auto-detect card brand from card number
  const detectedCardType = React.useMemo(() => {
    const raw = cardNumber.replace(/\D/g, "");
    if (!raw) return null;
    if (/^4/.test(raw)) return "visa";
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(raw)) return "mastercard";
    if (/^3[47]/.test(raw)) return "amex";
    if (/^(6011|65|64[4-9]|622)/.test(raw)) return "discover";
    return null;
  }, [cardNumber]);

  // Card input change handler with auto-formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (/^3[47]/.test(value)) {
      value = value.substring(0, 15);
      const match = value.match(/(\d{1,4})(\d{0,6})?(\d{0,5})?/);
      if (match) {
        value = [match[1], match[2], match[3]].filter(Boolean).join(" ");
      }
    } else {
      value = value.substring(0, 16);
      const match = value.match(/(\d{1,4})(\d{0,4})?(\d{0,4})?(\d{0,4})?/);
      if (match) {
        value = [match[1], match[2], match[3], match[4]].filter(Boolean).join(" ");
      }
    }
    setCardNumber(value);
  };

  // Expiry date formatter (MM / YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").substring(0, 4);
    let formatted = raw;
    if (raw.length >= 3) {
      formatted = `${raw.substring(0, 2)} / ${raw.substring(2)}`;
    }
    setCardExpiry(formatted);
  };

  // Phone number formatter ((555) 555-5555)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").substring(0, 10);
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `(${raw.substring(0, 3)}) ${raw.substring(3, 6)}-${raw.substring(6)}`;
    } else if (raw.length > 3) {
      formatted = `(${raw.substring(0, 3)}) ${raw.substring(3)}`;
    } else if (raw.length > 0) {
      formatted = `(${raw}`;
    }
    setPhone(formatted);
  };

  // Promo coupon toggle
  const [showPromoInput, setShowPromoInput] = React.useState(false);
  const [promoCodeInput, setPromoCodeInput] = React.useState("");
  const [showTaxesDetail, setShowTaxesDetail] = React.useState(false);

  // Tip Selection State (10, 15, 20, 0, or custom)
  const [selectedTipMode, setSelectedTipMode] = React.useState<string>("0");
  const [showCustomTipModal, setShowCustomTipModal] = React.useState(false);
  const [customTipAmount, setCustomTipAmount] = React.useState("0.00");
  const [customTipPercent, setCustomTipPercent] = React.useState("0");

  // Sync session details when loaded
  React.useEffect(() => {
    if (session?.user) {
      if (session.user.name) {
        const parts = session.user.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (session.user.email) {
        setEmail(session.user.email);
      }
    }
  }, [session]);

  // Update calculated tip when subtotal or tip option changes
  const tipOptions = React.useMemo(() => {
    return [
      { id: "10", percent: 10, amount: subtotal * 0.1 },
      { id: "15", percent: 15, amount: subtotal * 0.15 },
      { id: "20", percent: 20, amount: subtotal * 0.2 },
      { id: "0", percent: 0, amount: 0 }
    ];
  }, [subtotal]);

  const handleSelectTip = (id: string, amount: number) => {
    setSelectedTipMode(id);
    setTip(amount);
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomTipAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && subtotal > 0) {
      setCustomTipPercent(Math.round((num / subtotal) * 100).toString());
    } else {
      setCustomTipPercent("0");
    }
  };

  const handleCustomPercentChange = (val: string) => {
    setCustomTipPercent(val);
    const num = parseFloat(val);
    if (!isNaN(num) && subtotal > 0) {
      setCustomTipAmount(((subtotal * num) / 100).toFixed(2));
    } else {
      setCustomTipAmount("0.00");
    }
  };

  const handleApplyCustomTip = () => {
    const amount = parseFloat(customTipAmount) || 0;
    setTip(Math.max(0, amount));
    setSelectedTipMode("custom");
    setShowCustomTipModal(false);
  };

  // Estimated savings vs 3rd party apps (approx 11% markup savings)
  const savingsAmount = (subtotal * 0.11).toFixed(2);

  // Error States
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      errs.phone = "Valid 10-digit mobile number is required";
    }
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Valid email address is required";
    }

    if (!cardNumber.trim() || cardNumber.replace(/\s/g, "").length < 15) {
      errs.cardNumber = "Enter a valid card number";
    }
    if (!cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      errs.cardExpiry = "Expiry format must be MM/YY";
    }
    if (!cardCvc.trim() || cardCvc.length < 3) {
      errs.cardCvc = "CVC is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCodeInput.trim().toUpperCase() === "NEPAL20") {
      applyCoupon("NEPAL20", 20);
      addToast("Coupon NEPAL20 (20% off) applied!", "success");
      setPromoCodeInput("");
      setShowPromoInput(false);
    } else {
      addToast("Invalid code. Try NEPAL20 for 20% off.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please fill in all required fields.", "error");
      return;
    }

    if (deliveryType === "DELIVERY" && isAddressOutOfRange) {
      const errMsg =
        deliverySettings?.outOfRangeMessage
          ?.replace("{radius}", deliverySettings.maxRadiusMiles.toFixed(1))
          ?.replace("{distance}", addressDistance?.toFixed(1) || "") ||
        "Address is outside our delivery zone. Please switch to Pickup.";
      addToast(errMsg, "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          deliveryType,
          tip,
          couponCode,
          customerDetails: {
            name: `${firstName} ${lastName}`.trim(),
            email,
            phone
          },
          deliveryDetails: deliveryAddress || {
            street: "115 6th St",
            city: "Glenwood Springs",
            state: "CO",
            zipCode: "81601"
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process order");
      }

      const orderId = data.order?.id || `HC-${Math.floor(100000 + Math.random() * 900000)}`;

      placeOrder({
        id: orderId,
        userId: email,
        type: deliveryType,
        scheduledTime: "Tomorrow by 12:30 PM MDT",
        customerName: `${firstName} ${lastName}`.trim(),
        customerEmail: email,
        customerPhone: phone,
        deliveryStreet: deliveryAddress?.street || null,
        deliveryCity: deliveryAddress?.city || null,
        deliveryState: deliveryAddress?.state || null,
        deliveryZip: deliveryAddress?.zipCode || null,
        deliveryFee,
        subtotal,
        tax,
        tip,
        discount,
        total,
        items: items.map((item, index) => ({
          id: `item-${index}`,
          menuItemId: item.menuItem.id,
          menuItemName: item.menuItem.name,
          menuItemImage: item.menuItem.image,
          quantity: item.quantity,
          price: item.singleItemPrice,
          protein: item.protein,
          spiceLevel: item.spiceLevel,
          selectedModifiers: item.selectedModifiers.map((m) => ({ name: m.name, price: m.price }))
        }))
      });

      clearCart();
      router.push(`/order/confirmation/${orderId}`);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to process order. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasMounted || items.length === 0) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF8] text-charcoal font-sans antialiased">
      <main className="flex-grow py-8 sm:py-12">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 md:px-8">
          {/* Top back navigation */}
          <Link
            href="/menu"
            className="inline-flex items-center text-sm font-medium text-charcoal/80 hover:text-brand-red mb-6 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Menu
          </Link>

          {/* Checkout Main Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-charcoal tracking-tight mb-8">
            Checkout
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* LEFT COLUMN: Checkout Form Sections */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* 1. Pickup / Delivery details */}
              <div>
                <h2 className="font-serif text-2xl font-normal text-charcoal mb-3">
                  {deliveryType === "DELIVERY" ? "Delivery details" : "Pickup details"}
                </h2>

                <div className="rounded-2xl border border-neutral-warm/70 bg-white overflow-hidden shadow-xs">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-charcoal">
                      <div className="shrink-0 text-charcoal">
                        {deliveryType === "DELIVERY" ? (
                          <MapPin className="h-5 w-5" />
                        ) : (
                          <Store className="h-5 w-5" />
                        )}
                      </div>
                      <p>
                        {deliveryType === "DELIVERY" ? (
                          <>
                            Deliver to{" "}
                            <strong>
                              {deliveryAddress?.street || "115 6th St"}, {deliveryAddress?.city || "Glenwood Springs"}
                            </strong>
                          </>
                        ) : (
                          <>
                            Pick up from <strong>115 6th St, Glenwood Springs</strong>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-charcoal">
                      <div className="shrink-0 text-charcoal">
                        <Clock className="h-5 w-5" />
                      </div>
                      <p>Tomorrow by 12:30 PM MDT</p>
                    </div>
                  </div>

                  {/* Out of Range Error Banner */}
                  {deliveryType === "DELIVERY" && isAddressOutOfRange && (
                    <div className="bg-red-50 border-t border-red-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#B51C20] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-sans text-xs font-bold text-[#B51C20]">
                            Out of Delivery Range ({addressDistance?.toFixed(1)} miles away)
                          </p>
                          <p className="font-sans text-xs text-red-700">
                            Our maximum delivery radius is {deliverySettings?.maxRadiusMiles} miles. Please switch to Pickup to complete this order.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryType("PICKUP");
                          addToast("Switched order to Pickup", "info");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#B51C20] hover:bg-[#9B181B] text-white font-sans text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Switch to Pickup
                      </button>
                    </div>
                  )}

                  {/* Pink Savings Banner */}
                  <div className="bg-[#FAF0EE] px-4 py-3 border-t border-neutral-warm/30 font-sans text-xs text-charcoal">
                    You&apos;re saving <strong>${savingsAmount}</strong> by ordering directly from us vs. other websites
                  </div>
                </div>
              </div>


              {/* 2. Tip Section */}
              <div>
                <h2 className="font-serif text-2xl font-normal text-charcoal mb-3">Tip</h2>
                <div className="grid grid-cols-5 gap-2">
                  {tipOptions.map((opt) => {
                    const isSelected = selectedTipMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectTip(opt.id, opt.amount)}
                        className={`relative p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-2 border-charcoal bg-white shadow-xs"
                            : "border border-neutral-warm/80 bg-white hover:border-charcoal/40"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-charcoal text-white flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                        <div className="font-sans text-xs sm:text-sm font-bold text-charcoal">
                          ${opt.amount.toFixed(2)}
                        </div>
                        <div className="font-sans text-[11px] sm:text-xs text-muted-gray mt-0.5 font-medium">
                          {opt.percent}%
                        </div>
                      </button>
                    );
                  })}

                  {/* Custom Tip Card */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTipMode !== "custom") {
                        setCustomTipAmount(tip > 0 ? tip.toFixed(2) : "0.00");
                        setCustomTipPercent(subtotal > 0 ? Math.round((tip / subtotal) * 100).toString() : "0");
                      }
                      setShowCustomTipModal(true);
                    }}
                    className={`relative p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                      selectedTipMode === "custom"
                        ? "border-2 border-charcoal bg-white shadow-xs"
                        : "border border-neutral-warm/80 bg-white hover:border-charcoal/40"
                    }`}
                  >
                    {selectedTipMode === "custom" && (
                      <div className="absolute top-2 right-2 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-charcoal text-white flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                    <div className="font-sans text-xs sm:text-sm font-bold text-charcoal truncate">
                      {selectedTipMode === "custom" ? `$${tip.toFixed(2)}` : "Custom"}
                    </div>
                    <div className="font-sans text-[11px] sm:text-xs text-muted-gray mt-0.5 font-medium">
                      {selectedTipMode === "custom" ? `${customTipPercent}%` : "Other"}
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Your information Section */}
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-normal text-charcoal mb-3">Your information</h2>

                <div>
                  <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                    Mobile number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 555-5555"
                    maxLength={14}
                    className={`w-full h-11 px-4 rounded-xl border bg-white font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-charcoal ${
                      errors.phone ? "border-brand-red ring-1 ring-brand-red" : "border-neutral-warm/80"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-brand-red font-medium">{errors.phone}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className={`w-full h-11 px-4 rounded-xl border bg-white font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-charcoal ${
                        errors.firstName ? "border-brand-red ring-1 ring-brand-red" : "border-neutral-warm/80"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-brand-red font-medium">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className={`w-full h-11 px-4 rounded-xl border bg-white font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-charcoal ${
                        errors.lastName ? "border-brand-red ring-1 ring-brand-red" : "border-neutral-warm/80"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-brand-red font-medium">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className={`w-full h-11 px-4 rounded-xl border bg-white font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-charcoal ${
                      errors.email ? "border-brand-red ring-1 ring-brand-red" : "border-neutral-warm/80"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-brand-red font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Promotional Checkboxes */}
                <div className="space-y-2 pt-1">
                  <label
                    onClick={() => setPromoEmails(!promoEmails)}
                    className="flex items-center gap-2.5 text-xs text-charcoal cursor-pointer select-none"
                  >
                    <div
                      className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-colors ${
                        promoEmails ? "bg-charcoal border-charcoal text-white" : "border-neutral-warm/80 bg-white"
                      }`}
                    >
                      {promoEmails && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span>Get promotional emails from Himalayan Cuisine</span>
                  </label>

                  <label
                    onClick={() => setPromoTexts(!promoTexts)}
                    className="flex items-center gap-2.5 text-xs text-charcoal cursor-pointer select-none"
                  >
                    <div
                      className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-colors ${
                        promoTexts ? "bg-charcoal border-charcoal text-white" : "border-neutral-warm/80 bg-white"
                      }`}
                    >
                      {promoTexts && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span>Get promotional texts from Himalayan Cuisine</span>
                  </label>
                </div>
              </div>

              {/* 4. Payment Section */}
              <div className="space-y-4 pt-2">
                <h2 className="font-serif text-2xl font-normal text-charcoal mb-3">Payment</h2>

                <div>
                  <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                    Card number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 1234 1234 1234"
                      maxLength={19}
                      className={`w-full h-11 pl-4 pr-36 rounded-xl border bg-white font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-charcoal ${
                        errors.cardNumber ? "border-brand-red ring-1 ring-brand-red" : "border-neutral-warm/80"
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <span
                        className={`px-1.5 py-0.5 rounded bg-[#1A1F71] text-white text-[10px] font-extrabold tracking-tighter transition-all duration-200 ${
                          detectedCardType && detectedCardType !== "visa" ? "opacity-25 grayscale scale-95" : "opacity-100 shadow-xs scale-100"
                        }`}
                      >
                        VISA
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded bg-[#EB001B] text-white text-[10px] font-bold transition-all duration-200 ${
                          detectedCardType && detectedCardType !== "mastercard" ? "opacity-25 grayscale scale-95" : "opacity-100 shadow-xs scale-100"
                        }`}
                      >
                        MC
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded bg-[#006FCF] text-white text-[10px] font-bold transition-all duration-200 ${
                          detectedCardType && detectedCardType !== "amex" ? "opacity-25 grayscale scale-95" : "opacity-100 shadow-xs scale-100"
                        }`}
                      >
                        AMEX
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded bg-[#FF6000] text-white text-[10px] font-bold transition-all duration-200 ${
                          detectedCardType && detectedCardType !== "discover" ? "opacity-25 grayscale scale-95" : "opacity-100 shadow-xs scale-100"
                        }`}
                      >
                        DISC
                      </span>
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-xs text-brand-red font-medium">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                      Expiry date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM / YY"
                      maxLength={7}
                      className={`w-full h-11 px-4 rounded-xl border bg-white font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-charcoal ${
                        errors.cardExpiry ? "border-brand-red ring-1 ring-brand-red" : "border-neutral-warm/80"
                      }`}
                    />
                    {errors.cardExpiry && (
                      <p className="mt-1 text-xs text-brand-red font-medium">{errors.cardExpiry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                      Security code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        maxLength={4}
                        className={`w-full h-11 pl-4 pr-10 rounded-xl border bg-white font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-charcoal ${
                          errors.cardCvc ? "border-brand-red ring-1 ring-brand-red" : "border-neutral-warm/80"
                        }`}
                      />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-gray/70 pointer-events-none" />
                    </div>
                    {errors.cardCvc && (
                      <p className="mt-1 text-xs text-brand-red font-medium">{errors.cardCvc}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                    Country/Territory
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-11 pl-4 pr-10 rounded-xl border border-neutral-warm/80 bg-white font-sans text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal appearance-none cursor-pointer"
                    >
                      <option value="Nepal">Nepal</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="India">India</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray pointer-events-none" />
                  </div>
                </div>

                {/* Terms notice */}
                <p className="text-[11px] text-muted-gray leading-relaxed pt-1">
                  By providing your card information, you allow Himalayan Cuisine to charge your card for future payments in accordance with their terms.
                </p>

                {/* Place Order CTA button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 rounded-xl bg-[#B51C20] hover:bg-[#9B181B] text-white font-sans font-semibold text-base flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs mt-3"
                >
                  <span>{isSubmitting ? "Placing order..." : "Place order"}</span>
                  {!isSubmitting && <span className="text-lg leading-none">&gt;</span>}
                </button>

                {/* Legal Sub-disclaimer */}
                <p className="text-[11px] text-muted-gray leading-normal pt-1">
                  By signing up, you agree to receive email marketing communications from Himalayan Cuisine and consent to our{" "}
                  <Link href="/privacy" className="underline hover:text-charcoal">
                    Terms &amp; Policies
                  </Link>
                  . You may receive email or SMS notifications from us for order updates and account access and can opt out any time.
                </p>

                {/* Owner and Legal Footer */}
                <div className="pt-4 border-t border-neutral-warm/30 space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal">
                    <div className="h-3.5 w-3.5 rounded-full bg-charcoal flex items-center justify-center text-white text-[8px] font-black">
                      H
                    </div>
                    <span>Powered by Himalayan Cuisine Direct</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-gray">
                    <Link href="/terms" className="hover:text-charcoal transition-colors">
                      Terms of Service
                    </Link>
                    <Link href="/accessibility" className="hover:text-charcoal transition-colors">
                      Accessibility
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary Sticky Card */}
            <div className="lg:col-span-5 text-left self-start lg:sticky lg:top-8 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-normal text-charcoal mb-4">
                    Order summary
                  </h2>

                  {/* Summary Totals Table */}
                  <div className="space-y-2.5 font-sans text-sm">
                    <div className="flex justify-between items-center text-charcoal">
                      <span>Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-charcoal">
                      <button
                        type="button"
                        onClick={() => setShowTaxesDetail(!showTaxesDetail)}
                        className="flex items-center gap-1 text-charcoal hover:text-brand-red cursor-pointer"
                      >
                        <span>Taxes &amp; fees</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showTaxesDetail ? "rotate-180" : ""}`} />
                      </button>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>

                    {showTaxesDetail && (
                      <div className="pl-3 text-xs text-muted-gray space-y-1">
                        <div className="flex justify-between">
                          <span>Sales Tax (8.25%)</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        {deliveryFee > 0 && (
                          <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span>${deliveryFee.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-charcoal">
                      <span>Tip</span>
                      <span className="font-medium">${tip.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between items-center text-brand-red font-medium">
                        <span>Discount ({couponDiscountPercent}% off)</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Add coupon or gift card link */}
                    <div className="pt-1">
                      {!showPromoInput && !couponCode && (
                        <button
                          type="button"
                          onClick={() => setShowPromoInput(true)}
                          className="font-sans text-xs text-charcoal/90 underline hover:text-brand-red transition-colors cursor-pointer"
                        >
                          Add coupon or gift card
                        </button>
                      )}

                      {showPromoInput && !couponCode && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                            placeholder="Enter code (e.g. NEPAL20)"
                            className="h-8 px-2.5 text-xs uppercase border border-neutral-warm/80 rounded-lg bg-white flex-1 focus:outline-none focus:ring-1 focus:ring-charcoal"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="h-8 px-3 text-xs font-semibold rounded-lg bg-charcoal text-white cursor-pointer hover:bg-neutral-800 transition-colors"
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPromoInput(false)}
                            className="text-xs text-muted-gray hover:text-charcoal"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {couponCode && (
                        <div className="flex justify-between items-center text-xs text-brand-red bg-brand-red-soft/40 px-2.5 py-1 rounded-lg">
                          <span>Coupon <strong>{couponCode}</strong> applied</span>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="underline hover:text-brand-red-dark font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-neutral-warm/40 pt-3 mt-3 flex justify-between items-center text-charcoal">
                      <span className="font-sans text-lg font-bold">Total</span>
                      <span className="font-sans text-xl font-bold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Items List in Order Summary */}
                <div className="border-t border-neutral-warm/30 pt-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3.5">
                      {item.menuItem.image && (
                        <div className="relative w-15 h-15 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0 border border-neutral-warm/20">
                          <Image
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            fill
                            className="object-cover"
                            sizes="60px"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans text-sm font-semibold text-charcoal truncate">
                          {item.menuItem.name}
                        </h4>

                        {/* Modifiers description list */}
                        {(item.protein || item.spiceLevel || item.selectedModifiers.length > 0) ? (
                          <div className="mt-0.5 text-xs text-muted-gray space-y-0.5">
                            {item.protein && <div>{item.protein}</div>}
                            {item.spiceLevel && <div>Spice: {item.spiceLevel}</div>}
                            {item.selectedModifiers.map((mod) => (
                              <div key={mod.id}>
                                + {mod.name} (${mod.price.toFixed(2)})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-0.5 text-xs text-muted-gray">Regular</div>
                        )}

                        {/* Quantity controls & Price */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center bg-cream-dark/60 border border-neutral-warm/20 rounded-full py-1 px-2.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-1 text-charcoal hover:text-brand-red transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 font-sans text-xs font-bold text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-1 text-charcoal hover:text-brand-red transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="font-sans text-sm font-semibold text-charcoal">
                            ${(item.singleItemPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </main>

      {/* Custom Tip Modal Dialog */}
      <Dialog
        isOpen={showCustomTipModal}
        onClose={() => setShowCustomTipModal(false)}
        title="Custom tip"
      >
        <div className="space-y-6 text-left">
          {/* Synchronized inputs row */}
          <div className="flex items-center gap-3">
            {/* Amount input */}
            <div className="flex-1">
              <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-sans text-sm font-medium text-charcoal">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customTipAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-11 pl-8 pr-3 rounded-xl border border-charcoal bg-white font-sans text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal"
                />
              </div>
            </div>

            {/* Equals symbol */}
            <div className="pt-6 font-sans text-lg font-medium text-charcoal/60">
              =
            </div>

            {/* Percent input */}
            <div className="flex-1">
              <label className="block font-sans text-xs font-semibold text-charcoal/80 mb-1.5">
                Percent
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={customTipPercent}
                  onChange={(e) => handleCustomPercentChange(e.target.value)}
                  placeholder="0"
                  className="w-full h-11 pl-3 pr-8 rounded-xl border border-neutral-warm/80 bg-white font-sans text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-sans text-sm font-medium text-charcoal/60">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* CTA Done Button */}
          <button
            type="button"
            onClick={handleApplyCustomTip}
            className="w-full h-12 rounded-xl bg-[#B51C20] hover:bg-[#9B181B] text-white font-sans font-semibold text-sm tracking-wide flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>Done</span>
            <span className="text-base leading-none">&gt;</span>
          </button>
        </div>
      </Dialog>

      {/* Submission Loading Overlay */}
      {isSubmitting && (
        <CuisineLoader
          variant="momo"
          size="fullscreen"
          message="Sending order to the kitchen..."
          submessage="Our chefs are preparing your authentic Himalayan feast"
        />
      )}
    </div>
  );
}
