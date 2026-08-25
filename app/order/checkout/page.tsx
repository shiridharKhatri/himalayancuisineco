"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ShoppingBag, ArrowLeft, CreditCard, Clock, MapPin } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useUIStore } from "@/stores/uiStore";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, deliveryType, tip, couponCode, couponDiscountPercent, getTotals, clearCart } = useCartStore();
  const { placeOrder } = useOrderStore();
  const { addToast } = useUIStore();

  const { subtotal, tax, deliveryFee, discount, total } = getTotals();

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      addToast("Your cart is empty. Add dishes before checkout.", "warning");
      router.push("/menu");
    }
  }, [items, router, addToast]);

  // Form State
  const [name, setName] = React.useState(session?.user?.name || "");
  const [email, setEmail] = React.useState(session?.user?.email || "");
  const [phone, setPhone] = React.useState("");

  // Delivery State
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("CA");
  const [zipCode, setZipCode] = React.useState("");

  // Scheduling State
  const [timeOption, setTimeOption] = React.useState<"asap" | "later">("asap");
  const [scheduledTime, setScheduledTime] = React.useState("");

  // Payment State
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvc, setCardCvc] = React.useState("");

  // Error States
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync session details when loaded
  React.useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = "Valid email is required";
    if (!phone.trim() || phone.length < 10) errs.phone = "Valid phone number is required";

    if (deliveryType === "DELIVERY") {
      if (!street.trim()) errs.street = "Street address is required";
      if (!city.trim()) errs.city = "City is required";
      if (!zipCode.trim() || zipCode.length < 5) errs.zipCode = "Valid ZIP code is required";
    }

    if (timeOption === "later" && !scheduledTime) {
      errs.scheduledTime = "Please select a preferred pickup/delivery time";
    }

    // Mock payment validation
    if (!cardNumber.trim() || cardNumber.length < 16) errs.cardNumber = "Enter a valid 16-digit card number";
    if (!cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry)) errs.cardExpiry = "Expiry date must be MM/YY";
    if (!cardCvc.trim() || cardCvc.length < 3) errs.cardCvc = "CVC is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please correct the errors in the form.", "error");
      return;
    }

    setIsSubmitting(true);

    // Simulate payment authorization processing
    setTimeout(() => {
      const orderId = `HC-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderItems = items.map((item, index) => ({
        id: `item-${index}`,
        menuItemId: item.menuItem.id,
        menuItemName: item.menuItem.name,
        menuItemImage: item.menuItem.image,
        quantity: item.quantity,
        price: item.singleItemPrice,
        protein: item.protein,
        spiceLevel: item.spiceLevel,
        selectedModifiers: item.selectedModifiers.map((m) => ({ name: m.name, price: m.price })),
      }));

      // Place order in Zustand store
      placeOrder({
        id: orderId,
        userId: session?.user?.email || null,
        type: deliveryType,
        scheduledTime: timeOption === "later" ? scheduledTime : "ASAP",
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        deliveryStreet: deliveryType === "DELIVERY" ? street : null,
        deliveryCity: deliveryType === "DELIVERY" ? city : null,
        deliveryState: deliveryType === "DELIVERY" ? state : null,
        deliveryZip: deliveryType === "DELIVERY" ? zipCode : null,
        deliveryFee,
        subtotal,
        tax,
        tip,
        discount,
        total,
        items: orderItems,
      });

      addToast("Order placed successfully!", "success");
      clearCart();
      setIsSubmitting(false);
      router.push(`/order/confirmation?orderId=${orderId}`);
    }, 1500);
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          
          {/* Back Button */}
          <Link href="/menu" className="inline-flex items-center text-sm font-semibold text-muted-gray hover:text-brand-red mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-12">
            Secure Checkout
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* LEFT COLUMN: FORMS */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              {/* CONTACT INFO */}
              <Card>
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-neutral-warm/40">
                  <div className="bg-brand-red-soft p-2 rounded-sm text-brand-red">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold">1. Contact Information</h2>
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    placeholder="Enter your name"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                      placeholder="email@example.com"
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      error={errors.phone}
                      placeholder="(555) 000-0000"
                    />
                  </div>
                </div>
              </Card>

              {/* TIMING SELECTION */}
              <Card>
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-neutral-warm/40">
                  <div className="bg-brand-red-soft p-2 rounded-sm text-brand-red">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold">2. Service Schedule</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTimeOption("asap")}
                      className={`p-4 border rounded-sm font-sans text-sm font-semibold tracking-wide text-center transition-all cursor-pointer ${
                        timeOption === "asap"
                          ? "border-brand-red bg-brand-red-soft/20 text-brand-red-dark"
                          : "border-neutral-warm bg-cream-light text-charcoal hover:bg-cream-dark/30"
                      }`}
                    >
                      ASAP (Approx. 25-45 mins)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeOption("later")}
                      className={`p-4 border rounded-sm font-sans text-sm font-semibold tracking-wide text-center transition-all cursor-pointer ${
                        timeOption === "later"
                          ? "border-brand-red bg-brand-red-soft/20 text-brand-red-dark"
                          : "border-neutral-warm bg-cream-light text-charcoal hover:bg-cream-dark/30"
                      }`}
                    >
                      Schedule for Later
                    </button>
                  </div>

                  {timeOption === "later" && (
                    <Select
                      label="Select Available Slots"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      error={errors.scheduledTime}
                      options={[
                        { value: "", label: "-- Choose a Time Slot --" },
                        { value: "Today, 5:30 PM", label: "Today, 5:30 PM" },
                        { value: "Today, 6:00 PM", label: "Today, 6:00 PM" },
                        { value: "Today, 6:30 PM", label: "Today, 6:30 PM" },
                        { value: "Today, 7:00 PM", label: "Today, 7:00 PM" },
                        { value: "Today, 7:30 PM", label: "Today, 7:30 PM" },
                        { value: "Today, 8:00 PM", label: "Today, 8:00 PM" },
                      ]}
                    />
                  )}
                </div>
              </Card>

              {/* DELIVERY ADDRESS (Conditional) */}
              {deliveryType === "DELIVERY" && (
                <Card>
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-neutral-warm/40">
                    <div className="bg-brand-red-soft p-2 rounded-sm text-brand-red">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <h2 className="font-serif text-xl font-semibold">3. Delivery Address</h2>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Street Address"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      error={errors.street}
                      placeholder="e.g. 123 Main St, Apt 4"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        error={errors.city}
                        placeholder="San Francisco"
                      />
                      <Select
                        label="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        options={[{ value: "CA", label: "California" }]}
                      />
                      <Input
                        label="ZIP Code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        error={errors.zipCode}
                        placeholder="94102"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* PAYMENT DETAILS */}
              <Card>
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-neutral-warm/40">
                  <div className="bg-brand-red-soft p-2 rounded-sm text-brand-red">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold">
                    {deliveryType === "DELIVERY" ? "4. Payment Details" : "3. Payment Details"}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-cream-dark/50 border border-neutral-warm rounded-sm px-4 py-3 text-xs text-muted-gray mb-4">
                    <strong>Demo Mode:</strong> You can enter any mock card credentials to complete this payment. No actual funds will be charged.
                  </div>

                  <Input
                    label="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    error={errors.cardNumber}
                    placeholder="1234 5678 1234 5678"
                    maxLength={16}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      error={errors.cardExpiry}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    <Input
                      label="CVC / CVV"
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      error={errors.cardCvc}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
            <div className="lg:col-span-5 lg:sticky lg:top-[160px]">
              <Card padded={false} className="border border-neutral-warm">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-warm bg-cream-light">
                  <h3 className="font-serif text-lg font-bold text-charcoal">
                    Order Summary
                  </h3>
                </div>

                {/* Cart list scroll area */}
                <div className="px-6 py-4 max-h-[300px] overflow-y-auto divide-y divide-neutral-warm/30">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex items-start space-x-3 text-sm first:pt-0">
                      {item.menuItem.image && (
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-cream-dark flex-shrink-0 border border-neutral-warm/40">
                          <Image
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-sans font-semibold text-charcoal truncate">{item.menuItem.name}</h4>
                        <span className="font-sans text-xs text-muted-gray">Qty: {item.quantity}</span>
                        {(item.protein || item.spiceLevel || item.selectedModifiers.length > 0) && (
                          <div className="text-[10px] text-muted-gray mt-0.5 space-y-0.5">
                            {item.protein && <div>Style: {item.protein}</div>}
                            {item.spiceLevel && <div>Spice: {item.spiceLevel}</div>}
                            {item.selectedModifiers.map((m) => (
                              <div key={m.id}>+ {m.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-sans text-sm font-semibold text-charcoal flex-shrink-0">
                        ${(item.singleItemPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals area */}
                <div className="px-6 py-4 bg-cream-light/70 border-t border-neutral-warm/40 space-y-2.5 font-sans text-sm text-charcoal">
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
                    <span>Total Amount</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit action */}
                <div className="p-6 border-t border-neutral-warm">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Place Order &bull; ${total.toFixed(2)}
                  </Button>
                  <p className="text-[10px] text-muted-gray text-center mt-3 leading-normal">
                    By clicking place order, you authorize this transaction. See terms of sale.
                  </p>
                </div>

              </Card>
            </div>

          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
