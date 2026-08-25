"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ShoppingBag, MapPin, ChevronRight, ChevronDown, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { LocationPicker } from "@/components/ordering/LocationPicker";
import type { DeliveryAddress } from "@/stores/cartStore";

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { isCartOpen, setCartOpen, addToast } = useUIStore();
  const {
    items,
    deliveryType,
    deliveryAddress,
    tip,
    couponCode,
    couponDiscountPercent,
    removeItem,
    updateQuantity,
    setDeliveryType,
    setDeliveryAddress,
    setTip,
    applyCoupon,
    removeCoupon,
    getTotals,
  } = useCartStore();

  const [promoInput, setPromoInput] = React.useState("");
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);

  // Generate next 7 days dynamically
  const datesList = React.useMemo(() => {
    const dates = [];
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      let dayLabel = daysShort[d.getDay()];
      if (i === 0) dayLabel = "Today";
      else if (i === 1) dayLabel = "Tomorrow";

      const dateLabel = `${monthsShort[d.getMonth()]} ${d.getDate()}`;

      dates.push({
        id: `date-${i}`,
        day: dayLabel,
        date: dateLabel,
        fullString: `${dayLabel}, ${dateLabel}`,
      });
    }
    return dates;
  }, []);

  const timeSlots = [
    "1:15 PM MDT",
    "1:30 PM MDT",
    "1:45 PM MDT",
    "2:00 PM MDT",
    "2:15 PM MDT",
    "2:30 PM MDT",
    "2:45 PM MDT",
    "3:00 PM MDT"
  ];

  const [showTimeModal, setShowTimeModal] = React.useState(false);
  const [selectedDateId, setSelectedDateId] = React.useState("date-1"); // Default Tomorrow
  const [selectedTime, setSelectedTime] = React.useState("1:00 PM MDT"); // Default Time
  const [showAllDates, setShowAllDates] = React.useState(true);

  // Temporary select state in modal before clicking Schedule
  const [tempDateId, setTempDateId] = React.useState("date-1");
  const [tempTime, setTempTime] = React.useState("1:15 PM MDT");

  const selectedDateLabel = React.useMemo(() => {
    const d = datesList.find(item => item.id === selectedDateId);
    return d ? d.fullString : "Tomorrow, Aug 26";
  }, [selectedDateId, datesList]);

  const selectedTimeLabel = `${selectedDateLabel.split(",")[0]}, ${selectedTime}`;

  const { subtotal, tax, deliveryFee, discount, total } = getTotals();

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === "NEPAL20") {
      applyCoupon("NEPAL20", 20);
      addToast("Coupon NEPAL20 (20% off) applied successfully!", "success");
      setPromoInput("");
    } else {
      addToast("Invalid coupon code. Try NEPAL20.", "error");
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let checkoutId = "";
    for (let i = 0; i < 12; i++) {
      checkoutId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    router.push(`/order/checkout/${checkoutId}`);
  };

  return (
    <>
      <Drawer
        isOpen={isCartOpen}
        onClose={() => setCartOpen(false)}
        title="Cart"
        noPadding={true}
        footer={
          items.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <span className="font-sans text-lg font-medium text-charcoal tracking-tight">Subtotal</span>
                <span className="font-sans text-lg font-bold text-charcoal">${subtotal.toFixed(2)}</span>
              </div>

              {/* Points & Checkout Card */}
              <div className="bg-[#FAF0EE] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center gap-2">
                <p className="font-sans text-xs text-charcoal text-center pt-0.5">
                  You&apos;ll earn <strong className="font-bold text-charcoal">{Math.round((subtotal - discount) * 10)} points</strong> with this order
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full h-11 sm:h-12 flex items-center justify-center gap-1.5 font-sans font-semibold text-sm rounded-xl bg-[#B51C20] hover:bg-[#9B181B] text-white border-0 cursor-pointer transition-colors"
                >
                  <span>Go to checkout</span>
                  <ArrowRight className="h-4 w-4 shrink-0 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ) : undefined
        }
      >
        <div className="flex flex-col h-full animate-fade-in">
          {/* Cart items list */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 px-6 text-center">
              <div className="rounded-full bg-cream-dark p-4 text-muted-gray mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-medium text-charcoal mb-2">
                Your cart is empty
              </h3>
              <p className="font-sans text-sm text-muted-gray max-w-[240px] mb-6">
                Browse our menu and discover authentic Himalayan flavors.
              </p>
              <Link href="/menu" onClick={() => setCartOpen(false)}>
                <Button variant="primary" size="sm">
                  Explore Menu
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Delivery/Pickup Selector & Details Row */}
              <div className="space-y-3">
                {/* Toggle switch */}
                <div className="grid grid-cols-2 p-1 bg-cream-dark rounded-full border-0">
                  <button
                    onClick={() => setDeliveryType("PICKUP")}
                    className={`py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-full cursor-pointer ${deliveryType === "PICKUP"
                        ? "bg-charcoal text-cream-light shadow-sm"
                        : "text-muted-gray hover:text-charcoal"
                      }`}
                  >
                    Pickup
                  </button>
                  <button
                    onClick={() => setDeliveryType("DELIVERY")}
                    className={`py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-full cursor-pointer ${deliveryType === "DELIVERY"
                        ? "bg-charcoal text-cream-light shadow-sm"
                        : "text-muted-gray hover:text-charcoal"
                      }`}
                  >
                    Delivery
                  </button>
                </div>

                {/* Address selector button & time dropdown */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="h-11 px-3.5 rounded-xl border border-neutral-warm/80 bg-cream-light font-sans text-xs font-medium text-charcoal text-left truncate hover:bg-cream-dark transition-colors cursor-pointer"
                  >
                    <span className="truncate block">
                      {deliveryType === "DELIVERY" && deliveryAddress
                        ? deliveryAddress.street
                        : "Delivery address..."
                      }
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTempDateId(selectedDateId);
                      setTempTime(selectedTime);
                      setShowTimeModal(true);
                    }}
                    className="h-11 px-3.5 rounded-xl border border-neutral-warm/80 bg-cream-light font-sans text-xs font-medium text-charcoal flex items-center justify-between hover:bg-cream-dark transition-colors cursor-pointer"
                  >
                    <span className="truncate">{selectedTimeLabel}</span>
                    <ChevronDown className="h-4 w-4 text-muted-gray shrink-0" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Items scroll block */}
              <div className="space-y-3.5 division-y division-neutral-warm/40">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3.5 pt-3.5 first:pt-0">
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
                      <div className="flex justify-between items-start">
                        <h4 className="font-sans text-sm font-semibold text-charcoal pr-2 truncate">
                          {item.menuItem.name}
                        </h4>
                      </div>

                      {/* Modifiers description list */}
                      {(item.protein || item.spiceLevel || item.selectedModifiers.length > 0) ? (
                        <div className="mt-0.5 flex flex-col space-y-0.5 font-sans text-xs text-muted-gray">
                          {item.protein && <div>{item.protein}</div>}
                          {item.spiceLevel && <div>Spice: {item.spiceLevel}</div>}
                          {item.selectedModifiers.map((mod) => (
                            <div key={mod.id}>
                              + {mod.name} (${mod.price.toFixed(2)})
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-0.5 font-sans text-xs text-muted-gray">
                          Regular
                        </div>
                      )}

                      {/* Quantity controls & Price */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center bg-cream-dark/60 border border-neutral-warm/20 rounded-full py-1 px-2.5">
                          <button
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
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-1 text-charcoal hover:text-brand-red transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price on right */}
                        <span className="font-sans text-sm font-bold text-charcoal">
                          ${(item.singleItemPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex space-x-2 pt-3 border-t border-neutral-warm/30">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="PROMO CODE (e.g. NEPAL20)"
                  className="flex-1 h-9 px-3 rounded-full border border-neutral-warm bg-cream-light font-sans text-xs uppercase tracking-wider text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
                />
                <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold">
                  Apply
                </Button>
              </form>
              {couponCode && (
                <div className="flex justify-between items-center bg-brand-red-soft/50 border border-brand-red/10 rounded-xl px-3 py-1.5 font-sans text-xs text-brand-red-dark">
                  <span>Coupon applied: <strong>{couponCode}</strong> ({couponDiscountPercent}% off)</span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      addToast("Coupon removed.", "info");
                    }}
                    className="font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Drawer>

      {/* Location Picker Dialog */}
      <Dialog
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        title="Delivery Location"
      >
        <LocationPicker
          initialAddress={deliveryAddress}
          onConfirm={(address) => {
            setDeliveryAddress(address);
            setShowLocationPicker(false);
          }}
          onCancel={() => setShowLocationPicker(false)}
        />
      </Dialog>

      {/* Order Time Dialog - MATCHING SCREENSHOT EXACTLY */}
      <Dialog
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        title="Order time"
      >
        <div className="flex flex-col space-y-6 text-left">
          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {(showAllDates ? datesList : datesList.slice(0, 4)).map((item) => {
              const isSelected = tempDateId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTempDateId(item.id)}
                  className={`flex justify-between items-center px-4 py-3 rounded-xl border font-sans text-xs transition-all cursor-pointer ${isSelected
                      ? "bg-charcoal text-cream-light border-transparent font-bold"
                      : "bg-cream-light text-charcoal border-neutral-warm/60 hover:bg-cream-dark/40 font-medium"
                    }`}
                >
                  <span>{item.day}</span>
                  <span className={isSelected ? "opacity-90" : "text-muted-gray"}>{item.date}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle show all dates button */}
          <button
            type="button"
            onClick={() => setShowAllDates(!showAllDates)}
            className="w-full py-2.5 border border-neutral-warm/60 bg-cream-light hover:bg-cream-dark/40 rounded-xl font-sans text-xs font-bold text-charcoal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{showAllDates ? "Less dates" : "More dates"}</span>
            <ChevronDown className={`h-4.5 w-4.5 transition-transform duration-200 ${showAllDates ? "rotate-180" : ""}`} strokeWidth={2.5} />
          </button>

          {/* Times list with radio controls */}
          <div className="border-t border-neutral-warm/20 pt-2 flex flex-col">
            {timeSlots.map((time) => {
              const isSelected = tempTime === time;
              return (
                <div
                  key={time}
                  onClick={() => setTempTime(time)}
                  className="flex items-center gap-4 py-3.5 border-b border-neutral-warm/25 cursor-pointer text-left transition-colors hover:bg-cream-dark/10 px-1"
                >
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected
                      ? "border-charcoal bg-charcoal text-cream-light"
                      : "border-neutral-warm"
                    }`}>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-cream-light" />
                    )}
                  </div>
                  <span className="font-sans text-sm font-semibold text-charcoal">{time}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Schedule Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedDateId(tempDateId);
              setSelectedTime(tempTime);
              setShowTimeModal(false);
              addToast(`Order scheduled for ${tempTime}.`, "success");
            }}
            className="w-full h-12 rounded-xl bg-[#C9252D] hover:bg-[#A81E24] text-white font-sans font-bold text-sm tracking-wide border-0 cursor-pointer transition-colors mt-4"
          >
            Schedule order
          </button>
        </div>
      </Dialog>
    </>
  );
};
