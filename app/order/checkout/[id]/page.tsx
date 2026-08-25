"use client";

import { use } from "react";
import { CheckoutView } from "@/components/ordering/CheckoutView";

export default function CheckoutDynamicPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <CheckoutView checkoutId={resolvedParams.id} />;
}
