"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { isCartOpen, setCartOpen, addToast } = useUIStore();
  const {
    items,
    deliveryType,
    tip,
    couponCode,
    couponDiscountPercent,
    removeItem,
    updateQuantity,
    setDeliveryType,
    setTip,
    applyCoupon,
    removeCoupon,
    getTotals,
  } = useCartStore();

  const [promoInput, setPromoInput] = React.useState("");

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
    router.push("/order/checkout");
  };

  return (
    <Drawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} title="Your Order">
      <div className="flex flex-col h-full justify-between pb-6">
        
        {/* Cart items list */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
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
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            
            {/* Delivery/Pickup Selector */}
            <div className="grid grid-cols-2 p-1 bg-cream-dark rounded-sm border border-neutral-warm/40">
              <button
                onClick={() => setDeliveryType("PICKUP")}
                className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm cursor-pointer ${
                  deliveryType === "PICKUP"
                    ? "bg-cream-light text-brand-red shadow-sm"
                    : "text-muted-gray hover:text-charcoal"
                }`}
              >
                Pickup (Free)
              </button>
              <button
                onClick={() => setDeliveryType("DELIVERY")}
                className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm cursor-pointer ${
                  deliveryType === "DELIVERY"
                    ? "bg-cream-light text-brand-red shadow-sm"
                    : "text-muted-gray hover:text-charcoal"
                }`}
              >
                Delivery ($5.00)
              </button>
            </div>

            {/* Items scroll block */}
            <div className="space-y-4 division-y division-neutral-warm/40">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 pt-4 first:pt-0">
                  {item.menuItem.image && (
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-cream-dark flex-shrink-0 border border-neutral-warm/40">
                      <Image
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-sans text-sm font-semibold text-charcoal pr-2">
                        {item.menuItem.name}
                      </h4>
                      <span className="font-sans text-sm font-semibold text-charcoal">
                        ${(item.singleItemPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Modifiers description list */}
                    {(item.protein || item.spiceLevel || item.selectedModifiers.length > 0) && (
                      <div className="mt-1 flex flex-col space-y-0.5 font-sans text-xs text-muted-gray">
                        {item.protein && <div>Style: {item.protein}</div>}
                        {item.spiceLevel && <div>Spice: {item.spiceLevel}</div>}
                        {item.selectedModifiers.map((mod) => (
                          <div key={mod.id}>
                            + {mod.name} (${mod.price.toFixed(2)})
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quantity controls & remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-neutral-warm rounded-sm bg-cream-light">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-muted-gray hover:text-charcoal transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 font-sans text-xs font-semibold text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-muted-gray hover:text-charcoal transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          removeItem(item.id);
                          addToast(`${item.menuItem.name} removed from cart.`, "info");
                        }}
                        className="text-muted-gray hover:text-brand-red p-1 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tip Selection */}
            <div className="border-t border-neutral-warm/40 pt-4 flex flex-col space-y-2">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                Support our kitchen staff (Add a Tip)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[0, 3, 5, 8].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTip(amount)}
                    className={`py-1.5 border rounded-sm font-sans text-xs font-medium tracking-wide transition-all cursor-pointer ${
                      tip === amount
                        ? "bg-brand-red text-cream-light border-transparent"
                        : "bg-cream-light text-charcoal border-neutral-warm hover:bg-cream-dark"
                    }`}
                  >
                    {amount === 0 ? "No Tip" : `$${amount}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex space-x-2 pt-2 border-t border-neutral-warm/40">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="PROMO CODE (e.g. NEPAL20)"
                className="flex-1 h-9 px-3 rounded-sm border border-neutral-warm bg-cream-light font-sans text-xs uppercase tracking-wider text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
              />
              <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold">
                Apply
              </Button>
            </form>
            {couponCode && (
              <div className="flex justify-between items-center bg-brand-red-soft/50 border border-brand-red/10 rounded-sm px-3 py-1.5 font-sans text-xs text-brand-red-dark">
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

            {/* Bill Summary */}
            <div className="border-t border-neutral-warm/40 pt-4 space-y-2.5 font-sans text-sm text-charcoal">
              <div className="flex justify-between">
                <span className="text-muted-gray">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-red-dark">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-gray">Tax (8.25%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {deliveryType === "DELIVERY" && (
                <div className="flex justify-between">
                  <span className="text-muted-gray">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-accent-green">
                  <span>Staff Tip</span>
                  <span>${tip.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-neutral-warm/40 my-1" />
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Estimated Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

          </div>
        )}

        {/* Action Button */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-neutral-warm/40 shrink-0">
            <Button onClick={handleCheckout} variant="primary" size="lg" className="w-full">
              Checkout &bull; ${total.toFixed(2)}
            </Button>
          </div>
        )}

      </div>
    </Drawer>
  );
};
