"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, MapPin, Printer, ArrowRight, RefreshCw, ShoppingBag } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { useUIStore } from "@/stores/uiStore";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OrderStatus } from "@/types";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("orderId");
  const { getOrder, updateOrderStatus } = useOrderStore();
  const { addToast } = useUIStore();

  const order = React.useMemo(() => {
    if (!orderId) return undefined;
    return getOrder(orderId);
  }, [orderId, getOrder]);

  // Redirect if no orderId
  React.useEffect(() => {
    if (!orderId) {
      router.push("/menu");
    }
  }, [orderId, router]);

  // Simulate kitchen order status tracking timeline transitions
  React.useEffect(() => {
    if (!order || order.status === "COMPLETED" || order.status === "CANCELLED" || order.status === "REFUNDED") {
      return;
    }

    const statusFlow: OrderStatus[] = [
      "NEW",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "COMPLETED",
    ];

    const currentIdx = statusFlow.indexOf(order.status);
    if (currentIdx === -1) return;

    // Advance status every 20 seconds
    const interval = setInterval(() => {
      let nextIdx = currentIdx + 1;
      
      // Skip OUT_FOR_DELIVERY if PICKUP
      if (order.type === "PICKUP" && statusFlow[nextIdx] === "OUT_FOR_DELIVERY") {
        nextIdx += 1;
      }

      if (nextIdx < statusFlow.length) {
        const nextStatus = statusFlow[nextIdx];
        updateOrderStatus(order.id, nextStatus);
        
        let statusMessage = "Your order status has been updated!";
        if (nextStatus === "CONFIRMED") statusMessage = "Himalayan Kitchen has confirmed your order.";
        if (nextStatus === "PREPARING") statusMessage = "Our chefs are preparing your hand-made momos!";
        if (nextStatus === "READY") statusMessage = "Your order is ready for pickup!";
        if (nextStatus === "OUT_FOR_DELIVERY") statusMessage = "Your food is out for delivery!";
        if (nextStatus === "COMPLETED") statusMessage = "Order completed. Enjoy your meal!";

        addToast(statusMessage, "info", 5000);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [order, updateOrderStatus, addToast]);

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-cream-base">
        <Header />
        <div className="flex-grow flex items-center justify-center p-12">
          <div className="animate-spin text-brand-red">
            <RefreshCw className="h-8 w-8" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Define steps based on type
  const isDelivery = order.type === "DELIVERY";
  const steps = isDelivery
    ? [
        { label: "Received", status: "NEW" },
        { label: "Preparing", status: "PREPARING" },
        { label: "Out for Delivery", status: "OUT_FOR_DELIVERY" },
        { label: "Delivered", status: "COMPLETED" },
      ]
    : [
        { label: "Received", status: "NEW" },
        { label: "Confirmed", status: "CONFIRMED" },
        { label: "Preparing", status: "PREPARING" },
        { label: "Ready for Pickup", status: "READY" },
      ];

  const getStepIndex = () => {
    if (order.status === "NEW" || order.status === "CONFIRMED") return 0;
    if (order.status === "PREPARING") return 1;
    if (order.status === "READY" || order.status === "OUT_FOR_DELIVERY") return 2;
    if (order.status === "COMPLETED") return 3;
    return -1;
  };

  const activeStepIdx = getStepIndex();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-[900px] px-6">
          
          {/* Confirmed Banner */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-brand-red-soft rounded-full text-brand-red mb-4">
              <CheckCircle2 className="h-10 w-10 fill-current bg-cream-base rounded-full" />
            </div>
            <Badge variant="success" className="mb-2">Order Confirmed</Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Dhanyabaad!
            </h1>
            <p className="font-sans text-sm md:text-base text-muted-gray max-w-md mx-auto">
              Thank you for ordering. Your order <strong>#{order.id}</strong> has been sent to our kitchen.
            </p>
          </div>

          {/* STATUS TRACKER BAR */}
          <Card className="mb-8">
            <div className="px-2 py-4 text-center">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-gray mb-6">
                Live Order Tracker (Status: <span className="text-brand-red font-bold">{order.status}</span>)
              </h3>
              
              <div className="relative flex items-center justify-between w-full">
                {/* Horizontal line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-warm -z-0" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-red transition-all duration-1000 -z-0"
                  style={{ width: `${(activeStepIdx / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                  const isCompleted = idx <= activeStepIdx;
                  const isActive = idx === activeStepIdx;

                  return (
                    <div key={step.label} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center font-sans text-xs font-bold transition-all duration-300 ${
                          isCompleted
                            ? "bg-brand-red text-cream-light"
                            : "bg-cream-dark border border-neutral-warm text-muted-gray"
                        } ${isActive ? "ring-4 ring-brand-red-soft" : ""}`}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <span
                        className={`mt-2 font-sans text-[10px] md:text-xs font-semibold uppercase tracking-wider ${
                          isCompleted ? "text-charcoal" : "text-muted-gray"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Estimate times */}
              <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 pt-6 border-t border-neutral-warm/40 font-sans text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-brand-red" />
                  <span>Estimated {order.type === "DELIVERY" ? "Delivery" : "Ready"} Time: <strong>{order.scheduledTime === "ASAP" ? "ASAP (30-40 mins)" : order.scheduledTime}</strong></span>
                </div>
                <div className="hidden md:block h-4 w-px bg-neutral-warm" />
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-brand-red" />
                  <span>Service Type: <strong>{order.type}</strong></span>
                </div>
              </div>
            </div>
          </Card>

          {/* TWO COLUMN INVOICE AND SIGNUP */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Invoice Detail */}
            <div className="md:col-span-8 space-y-6 text-left">
              <Card padded={false} className="border border-neutral-warm">
                <div className="px-6 py-4 border-b border-neutral-warm bg-cream-light flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold">Order Details</h3>
                  <button
                    onClick={handlePrint}
                    className="flex items-center space-x-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-muted-gray hover:text-brand-red transition-colors cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Receipt</span>
                  </button>
                </div>
                
                {/* Items */}
                <div className="p-6 divide-y divide-neutral-warm/30">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-start text-sm first:pt-0">
                      <div>
                        <h4 className="font-sans font-semibold text-charcoal">{item.menuItemName}</h4>
                        <span className="font-sans text-xs text-muted-gray">Qty: {item.quantity}</span>
                        {(item.protein || item.spiceLevel || item.selectedModifiers.length > 0) && (
                          <div className="text-[10px] text-muted-gray mt-0.5 space-y-0.5">
                            {item.protein && <div>Style: {item.protein}</div>}
                            {item.spiceLevel && <div>Spice: {item.spiceLevel}</div>}
                            {item.selectedModifiers.map((m, idx) => (
                              <div key={idx}>+ {m.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-sans text-sm font-semibold text-charcoal">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals */}
                <div className="p-6 bg-cream-light/40 border-t border-neutral-warm/40 space-y-2.5 font-sans text-sm text-charcoal">
                  <div className="flex justify-between">
                    <span className="text-muted-gray">Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-brand-red-dark">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-gray">Tax (8.25%)</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  {order.type === "DELIVERY" && (
                    <div className="flex justify-between">
                      <span className="text-muted-gray">Delivery Fee</span>
                      <span>${order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {order.tip > 0 && (
                    <div className="flex justify-between text-accent-green">
                      <span>Staff Tip</span>
                      <span>${order.tip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-neutral-warm/40 my-1" />
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span>Total Paid</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              {/* Delivery Details block (if delivery) */}
              {isDelivery && (
                <Card>
                  <h4 className="font-serif text-lg font-bold mb-3">Delivery Destination</h4>
                  <div className="font-sans text-sm text-charcoal space-y-1">
                    <p className="font-semibold">{order.customerName}</p>
                    <p>{order.deliveryStreet}</p>
                    <p>{order.deliveryCity}, {order.deliveryState} {order.deliveryZip}</p>
                    <p className="text-muted-gray text-xs pt-1.5">Phone: {order.customerPhone}</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Loyalty/Signup Promotion Box */}
            <div className="md:col-span-4 space-y-6 text-left">
              <Card className="border border-brand-red/20 bg-brand-red-soft/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red block mb-1">
                  Himalayan Rewards
                </span>
                <h4 className="font-serif text-xl font-bold text-charcoal mb-2">
                  Earn 180 Points!
                </h4>
                <p className="font-sans text-xs text-muted-gray leading-relaxed mb-4">
                  Create an account to save this order. You'll instantly unlock points toward free momos, curries, and members-only deals.
                </p>
                <Link href="/sign-up">
                  <Button variant="primary" size="sm" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </Card>

              <div className="flex flex-col space-y-3">
                <Link href="/menu">
                  <Button variant="outline" size="md" className="w-full">
                    Order Something Else
                  </Button>
                </Link>
                <Link href="/" className="text-center font-sans text-xs font-semibold uppercase tracking-wider text-muted-gray hover:text-brand-red transition-colors">
                  Go back to Homepage
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream-base text-muted-gray font-sans">Loading Order Details...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
