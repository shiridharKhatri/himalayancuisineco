"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ClipboardList, UtensilsCrossed, CalendarDays, Award } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CATERING_PACKAGES } from "@/lib/data";

export default function CateringPage() {
  const steps = [
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: "1. Select Package",
      desc: "Choose from our curated Himalayan menu structures or custom builders.",
    },
    {
      icon: <CalendarDays className="h-6 w-6" />,
      title: "2. Build Event Details",
      desc: "Specify guest counts, date, and location coordinates.",
    },
    {
      icon: <UtensilsCrossed className="h-6 w-6" />,
      title: "3. Choose Services",
      desc: "Select full staffing, buffet setups, or simple drop-offs.",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "4. Get Estimate",
      desc: "Receive an instant preliminary pricing calculation before submitting.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      {/* HERO SECTION */}
      <section className="relative py-16 lg:py-20 border-b border-neutral-warm/40 bg-cream-light text-center">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <Badge variant="soft-red" className="mb-2">Himalayan Catering</Badge>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-charcoal max-w-4xl mx-auto leading-snug">
            Bring Himalayan Flavor to Your Event
          </h1>
          <p className="font-sans text-sm md:text-base text-muted-gray mt-3 max-w-2xl mx-auto leading-relaxed">
            From intimate private dinners to corporate banquets, we provide custom momo bars, traditional copper-potted curries, and warm hospitality for any scale.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link href="/catering/order">
              <Button variant="primary" size="lg">
                Request a Catering Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS WIZARD TEASER */}
      <section className="py-16 md:py-20 border-b border-neutral-warm/40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
              Simple Step-by-Step Quote
            </h2>
            <p className="font-sans text-xs md:text-sm text-muted-gray mt-2">
              Our interactive Catering Builder calculates custom quote estimates instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col space-y-3 bg-cream-light p-6 border border-neutral-warm/30 rounded-sm">
                <div className="text-brand-red mb-1 shrink-0">{step.icon}</div>
                <h3 className="font-serif text-lg font-bold text-charcoal">{step.title}</h3>
                <p className="font-sans text-xs text-muted-gray leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATERING PACKAGES SHOWCASE */}
      <section className="py-20 md:py-24 border-b border-neutral-warm/40 bg-cream-light">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <Badge variant="soft-red" className="mb-2">Our Menu Tiers</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Curated Catering Packages</h2>
            <p className="font-sans text-sm text-muted-gray mt-3 leading-relaxed">
              Curated combinations designed for popular party profiles. Fully custom arrangements are also available inside the builder.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            {CATERING_PACKAGES.map((pkg) => (
              <Card key={pkg.id} hoverable className="flex flex-col justify-between h-full bg-cream-base border-neutral-warm">
                <CardHeader className="p-0 mb-4 border-b border-neutral-warm/30 pb-4">
                  <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-brand-red block mb-1">
                    {pkg.guestCount}
                  </span>
                  <CardTitle className="font-serif text-2xl font-bold">{pkg.name}</CardTitle>
                  <div className="mt-2.5 font-sans text-charcoal">
                    <span className="text-3xl font-extrabold">${pkg.startingPrice}</span>
                    <span className="text-xs text-muted-gray"> / guest starting rate</span>
                  </div>
                </CardHeader>

                <CardContent className="p-0 space-y-4">
                  <div>
                    <h5 className="font-sans text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                      Menu Structure
                    </h5>
                    <p className="font-sans text-xs text-muted-gray leading-relaxed">
                      {pkg.menu}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-sans text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                      Included Service Style
                    </h5>
                    <p className="font-sans text-xs text-muted-gray leading-relaxed">
                      {pkg.serviceStyle}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="p-0 mt-8 border-t border-neutral-warm/20 pt-4">
                  <Link href={`/catering/order?package=${pkg.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Customize Package
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* EVENT TYPES BLOCK */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Image side */}
            <div className="lg:col-span-6 relative aspect-[4/3] rounded-[24px] overflow-hidden border border-neutral-warm/60 bg-cream-dark">
              <Image
                src="/images/catering_buffet.jpg"
                alt="Nepalese Momo catering table display"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>

            {/* Info side */}
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="neutral">Any Gathering</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
                Himalayan Flavors for All Occasions
              </h2>
              <p className="font-sans text-sm md:text-base text-muted-gray leading-relaxed">
                Whether you are hosting a formal board meeting, a large backyard wedding, or an intimate birthday celebration, our culinary team will craft a memorable dining experience.
              </p>

              <div className="grid grid-cols-2 gap-4 font-sans text-sm font-semibold text-charcoal pt-4 border-t border-neutral-warm/30">
                <div className="flex items-center space-x-2">
                  <Check className="h-4.5 w-4.5 text-brand-red shrink-0" />
                  <span>Corporate Lunches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4.5 w-4.5 text-brand-red shrink-0" />
                  <span>Weddings & Anniversaries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4.5 w-4.5 text-brand-red shrink-0" />
                  <span>Backyard BBQ & Socials</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4.5 w-4.5 text-brand-red shrink-0" />
                  <span>Holiday Celebrations</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/catering/order">
                  <Button variant="primary">
                    Build Your Custom Order
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
