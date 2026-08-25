"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckoutView } from "@/components/ordering/CheckoutView";

export default function CheckoutIndexPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Auto-generate 12-char alphanumeric checkout session ID and update URL cleanly
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let checkoutId = "";
    for (let i = 0; i < 12; i++) {
      checkoutId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    router.replace(`/order/checkout/${checkoutId}`);
  }, [router]);

  return <CheckoutView />;
}
