"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Calculator, Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";

function CateringOrderContent() {
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();

  const preselectedPackage = searchParams?.get("package") || "";

  // Step state
  const [step, setStep] = React.useState(1);

  // Form parameters state
  const [eventType, setEventType] = React.useState("corporate");
  const [guestCount, setGuestCount] = React.useState(15);
  const [eventDate, setEventDate] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [menuPackage, setMenuPackage] = React.useState(preselectedPackage || "cat-pkg-himalayan-feast");
  const [dietary, setDietary] = React.useState("");
  const [serviceNeeded, setServiceNeeded] = React.useState("dropoff");
  
  // Contacts state
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Confirmation state
  const [quoteReference, setQuoteReference] = React.useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Pricing values
  const pricingTiers: Record<string, number> = {
    "cat-pkg-himalayan-feast": 32,
    "cat-pkg-kathmandu-social": 28,
    "cat-pkg-everest-premium": 55,
    custom: 40,
  };

  const serviceFees: Record<string, number> = {
    dropoff: 0,
    buffet: 150,
    fullstaff: 450,
  };

  const getPackageLabel = (id: string) => {
    if (id === "cat-pkg-himalayan-feast") return "The Himalayan Feast ($32/head)";
    if (id === "cat-pkg-kathmandu-social") return "Kathmandu Social Platter ($28/head)";
    if (id === "cat-pkg-everest-premium") return "Everest Chef's Experience ($55/head)";
    return "Custom Menu Construction ($40/head)";
  };

  const getServiceLabel = (id: string) => {
    if (id === "dropoff") return "Platter Drop-off (Free)";
    if (id === "buffet") return "Buffet Setup & Chafing Utensils (+$150.00)";
    return "Full Table Servers & On-site Chef Cook (+$450.00)";
  };

  // Live calculation
  const calculateEstimate = () => {
    const rate = pricingTiers[menuPackage] || 40;
    const serviceFee = serviceFees[serviceNeeded] || 0;
    const subtotal = rate * Math.max(10, guestCount);
    const total = subtotal + serviceFee;
    return {
      subtotal,
      serviceFee,
      total,
    };
  };

  const { subtotal, serviceFee, total } = calculateEstimate();

  const handleNextStep = () => {
    const errs: Record<string, string> = {};
    
    if (step === 2) {
      if (guestCount < 10) errs.guestCount = "Minimum guest count for catering is 10 guests";
      if (!eventDate) errs.eventDate = "Please pick a date for your event";
      if (!location.trim()) errs.location = "Please enter an event venue or destination address";
    }

    if (step === 3) {
      if (!name.trim()) errs.name = "Full name is required";
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = "Valid email is required";
      if (!phone.trim() || phone.length < 10) errs.phone = "Valid phone is required";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      addToast("Please check parameters in this step.", "error");
      return;
    }

    setErrors({});
    setStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const quoteCode = `QT-${Math.floor(10000 + Math.random() * 90000)}`;
      setQuoteReference({
        code: quoteCode,
        name,
        email,
        phone,
        eventType,
        guestCount,
        eventDate,
        location,
        menuPackage: getPackageLabel(menuPackage),
        serviceNeeded: getServiceLabel(serviceNeeded),
        dietary,
        estimatedPrice: total,
      });

      addToast("Catering quote requested successfully!", "success");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-[1000px] px-6 text-left">
          
          <Link href="/catering" className="inline-flex items-center text-sm font-semibold text-muted-gray hover:text-brand-red mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catering
          </Link>

          {!quoteReference ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* BUILDER SIDEBAR SUMMARY (Right on mobile, left on desktop) */}
              <div className="lg:col-span-5 order-last lg:order-first lg:sticky lg:top-[160px]">
                <Card padded={false} className="border border-neutral-warm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-brand-red" />
                  
                  <div className="px-6 py-4 border-b border-neutral-warm bg-cream-light flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-brand-red" />
                    <h3 className="font-serif text-lg font-bold">Quote Estimator</h3>
                  </div>

                  <div className="px-6 py-5 space-y-4 font-sans text-sm text-charcoal">
                    <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                      <span className="text-muted-gray">Package Rate</span>
                      <span>${pricingTiers[menuPackage] || 40} / head</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                      <span className="text-muted-gray">Guests Count</span>
                      <span>{guestCount} guests</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                      <span className="text-muted-gray">Food Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                      <span className="text-muted-gray">Setup / Staffing</span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-neutral-warm/40 my-1" />
                    <div className="flex justify-between font-bold text-base pt-1 text-brand-red-dark">
                      <span>Estimated Quote</span>
                      <span>${total.toFixed(2)}*</span>
                    </div>
                  </div>

                  {/* Warning label */}
                  <div className="p-6 border-t border-neutral-warm/40 bg-cream-dark/30 flex items-start space-x-2.5 text-[11px] text-muted-gray leading-normal">
                    <Info className="h-4.5 w-4.5 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      *This is a preliminary estimation. Sales tax, delivery transport distance, and holiday surcharges will be verified by a coordinator before drafting a final contract.
                    </div>
                  </div>
                </Card>
              </div>

              {/* BUILDER STEPS PANEL (Right) */}
              <div className="lg:col-span-7 space-y-6">
                <Card>
                  
                  {/* Step indicators */}
                  <div className="flex items-center space-x-3 mb-8 border-b border-neutral-warm/40 pb-4">
                    <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-red">
                      Step {step} of 4
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-gray" />
                    <span className="font-serif text-lg font-semibold text-charcoal">
                      {step === 1 && "Event Options & Menu"}
                      {step === 2 && "Event Logistics"}
                      {step === 3 && "Contact Details"}
                      {step === 4 && "Review & Submit"}
                    </span>
                  </div>

                  {/* STEP 1: EVENT TYPE & PACKAGE */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <Select
                        label="Event Category"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        options={[
                          { value: "corporate", label: "Corporate Gathering / Board Lunch" },
                          { value: "wedding", label: "Wedding Ceremony or Reception" },
                          { value: "birthday", label: "Birthday Party Celebration" },
                          { value: "private", label: "Intimate Private Dining Gathering" },
                          { value: "other", label: "Other Banquet Celebration" },
                        ]}
                      />

                      <Select
                        label="Catering Package Tier"
                        value={menuPackage}
                        onChange={(e) => setMenuPackage(e.target.value)}
                        options={[
                          { value: "cat-pkg-himalayan-feast", label: "The Himalayan Feast ($32/head)" },
                          { value: "cat-pkg-kathmandu-social", label: "Kathmandu Social Platter ($28/head)" },
                          { value: "cat-pkg-everest-premium", label: "Everest Chef's Experience ($55/head)" },
                          { value: "custom", label: "Custom Culinary Selection ($40/head)" },
                        ]}
                      />

                      <Select
                        label="Service Staffing Requirements"
                        value={serviceNeeded}
                        onChange={(e) => setServiceNeeded(e.target.value)}
                        options={[
                          { value: "dropoff", label: "Platter Drop-off (Standard delivery)" },
                          { value: "buffet", label: "Buffet Table Setup & Chafing Utensils (+$150)" },
                          { value: "fullstaff", label: "Full Table Staffing, Servers, and Chef cook station (+$450)" },
                        ]}
                      />
                    </div>
                  )}

                  {/* STEP 2: LOGISTICS */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <Input
                        label="Guest Count"
                        type="number"
                        min={10}
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value) || 10)}
                        error={errors.guestCount}
                        helperText="Minimum catering guest size is 10."
                      />

                      <Input
                        label="Event Date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        error={errors.eventDate}
                        min={new Date().toISOString().split("T")[0]}
                      />

                      <Input
                        label="Event Venue / Address"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        error={errors.location}
                        placeholder="e.g. 123 Main St, San Francisco, CA"
                      />
                    </div>
                  )}

                  {/* STEP 3: CONTACTS */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        placeholder="Organizer's full name"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          error={errors.email}
                          placeholder="organizer@example.com"
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

                      <div className="flex flex-col space-y-1.5">
                        <label className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                          Dietary Requirements or Menu Restrictions
                        </label>
                        <textarea
                          value={dietary}
                          onChange={(e) => setDietary(e.target.value)}
                          placeholder="e.g. 3 Gluten-free guests, 2 Vegan guests, nut allergies..."
                          rows={2}
                          className="w-full px-4 py-3 rounded-sm border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: REVIEW */}
                  {step === 4 && (
                    <div className="space-y-6 font-sans text-sm text-charcoal">
                      <h4 className="font-serif text-base font-bold border-b border-neutral-warm/20 pb-2">
                        Summary Review Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong className="block text-xs uppercase text-muted-gray mb-0.5">Organizer</strong>
                          <span>{name} ({phone})</span>
                        </div>
                        <div>
                          <strong className="block text-xs uppercase text-muted-gray mb-0.5">Email</strong>
                          <span>{email}</span>
                        </div>
                        <div>
                          <strong className="block text-xs uppercase text-muted-gray mb-0.5">Event Type</strong>
                          <span className="capitalize">{eventType}</span>
                        </div>
                        <div>
                          <strong className="block text-xs uppercase text-muted-gray mb-0.5">Guest Count</strong>
                          <span>{guestCount} dining guests</span>
                        </div>
                        <div>
                          <strong className="block text-xs uppercase text-muted-gray mb-0.5">Date / Venue</strong>
                          <span>{eventDate} &bull; {location}</span>
                        </div>
                        <div>
                          <strong className="block text-xs uppercase text-muted-gray mb-0.5">Selected Package</strong>
                          <span>{getPackageLabel(menuPackage)}</span>
                        </div>
                        <div>
                          <strong className="block text-xs uppercase text-muted-gray mb-0.5">Staff Service Style</strong>
                          <span>{getServiceLabel(serviceNeeded)}</span>
                        </div>
                        {dietary && (
                          <div className="md:col-span-2">
                            <strong className="block text-xs uppercase text-muted-gray mb-0.5">Dietary Notes</strong>
                            <p className="text-xs text-muted-gray">{dietary}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-1.5 pt-4 border-t border-neutral-warm/40">
                        <label className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                          Additional Event Notes or Timing Specifications
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Speeches will begin at 6 PM. Table setup must be ready by 5 PM."
                          rows={2}
                          className="w-full px-4 py-3 rounded-sm border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex justify-between items-center pt-8 mt-6 border-t border-neutral-warm/40">
                    {step > 1 ? (
                      <Button onClick={handlePrevStep} variant="secondary" size="md">
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {step < 4 ? (
                      <Button onClick={handleNextStep} variant="primary" size="md" className="ml-auto flex items-center">
                        <span>Continue</span>
                        <ArrowRight className="ml-1.5 h-4.5 w-4.5" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitQuote}
                        variant="primary"
                        size="lg"
                        className="ml-auto"
                        isLoading={isSubmitting}
                      >
                        Submit Request Quote
                      </Button>
                    )}
                  </div>

                </Card>
              </div>

            </div>
          ) : (
            // WIZARD CONFIRMATION VIEW
            <div className="max-w-md mx-auto">
              <Card className="border border-brand-red/20 bg-cream-light text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />
                
                <div className="inline-flex items-center justify-center h-12 w-12 bg-brand-red-soft rounded-full text-brand-red mb-4 mt-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                
                <Badge variant="success" className="mb-2">Request Submitted</Badge>
                <h3 className="font-serif text-2xl font-bold mb-1">Quote Request Sent!</h3>
                <span className="font-sans text-xs text-muted-gray block mb-6">Quote Reference: <strong>{quoteReference.code}</strong></span>

                <div className="h-px bg-neutral-warm/40 my-4" />

                <div className="space-y-3 text-left font-sans text-sm text-charcoal mb-6">
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Guest Count</span>
                    <span className="font-semibold">{quoteReference.guestCount} Guests</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Package Tier</span>
                    <span className="font-semibold truncate max-w-[200px]">{quoteReference.menuPackage}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Event Location</span>
                    <span className="font-semibold truncate max-w-[200px]">{quoteReference.location}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2 text-brand-red-dark font-bold">
                    <span>Estimated Total</span>
                    <span>${quoteReference.estimatedPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-cream-dark/50 border border-neutral-warm rounded-sm px-4 py-3 text-xs text-muted-gray text-left leading-normal mb-6">
                  <strong>What's Next?</strong> A Himalayan Cuisine Co. coordinator will review your location coordinates, group size, and dietary constraints, and will email you a finalized quote and booking contract within 24 hours.
                </div>

                <Link href="/catering">
                  <Button variant="outline" size="sm" className="w-full">
                    Close & Return
                  </Button>
                </Link>
              </Card>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CateringOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream-base text-muted-gray font-sans">Loading Catering Builder...</div>}>
      <CateringOrderContent />
    </Suspense>
  );
}
