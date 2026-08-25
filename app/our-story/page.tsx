"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function OurStoryPage() {
  const timelineEvents = [
    {
      year: "2012",
      title: "Family Beginnings in Kathmandu",
      desc: "Our head chef started cooking in a small family diner in the old city of Kathmandu, perfecting the art of spice blending and hand-folded dumpling wraps.",
    },
    {
      year: "2018",
      title: "The Vision for San Francisco",
      desc: "Moving to California, we noticed a lack of authentic, premium-quality Nepalese cuisine. We set out to change that by blending high-end editorial dining with traditional flavors.",
    },
    {
      year: "2022",
      title: "Opening the Main Dining Hall",
      desc: "We officially opened our doors, introducing Civic Center to our signature cold Chicken Jhol Momo and clay-oven tandoori specialties.",
    },
    {
      year: "2026",
      title: "Launching Local Online Ordering",
      desc: "Continuing our path, we developed this custom digital ordering and rewards platform to bring hot, fresh Himalayan cuisine directly to your home.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      {/* HERO SECTION */}
      <section className="relative py-20 lg:py-24 border-b border-neutral-warm/40 bg-cream-light text-center">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <Badge variant="soft-red" className="mb-2">Our History</Badge>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            From the Himalayas to Your Table
          </h1>
          <p className="font-sans text-sm md:text-base text-muted-gray mt-4 max-w-2xl mx-auto leading-relaxed">
            Discover the heritage, recipes, and culinary passion that shape our premium Nepalese dining experience.
          </p>
        </div>
      </section>

      {/* DETAILED STORY COMPOSITION (Split layout) */}
      <section className="py-20 md:py-24 border-b border-neutral-warm/40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text block */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <Badge variant="neutral">Our Beginning</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-charcoal">
              Nepalese Culinary Heritage
            </h2>
            <p className="font-sans text-sm md:text-base text-muted-gray leading-relaxed">
              True Nepalese cuisine is a delicate, aromatic harmony of Tibetan and Indian influences, shaped by the harsh high-altitude climate of the Himalayas. We don't believe in diluting these flavors.
            </p>
            <p className="font-sans text-sm md:text-base text-muted-gray leading-relaxed">
              Every spice mix used in our kitchen—from the roasted fenugreek in our choila to the Sichuan pepper (timur) in our momo soup—is roasted, ground, and blended daily by hand. We import these spices directly from sustainable small-scale farming cooperatives in the Mustang and Solukhumbu regions of Nepal.
            </p>
          </div>

          {/* Image Collage */}
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-[24px] overflow-hidden border border-neutral-warm/60 bg-cream-dark">
            <Image
              src="/images/story_heritage.jpg"
              alt="Traditional Nepalese spices and grains"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>

        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="py-20 md:py-24 border-b border-neutral-warm/40 bg-cream-light">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <Badge variant="soft-red" className="mb-2">Our Journey</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Milestones of Taste</h2>
            <p className="font-sans text-sm text-muted-gray mt-2">
              Tracing our growth from a home kitchen in Nepal to SF's premier dining hall.
            </p>
          </div>

          {/* Timeline Grid */}
          <div className="relative max-w-3xl mx-auto text-left pl-6 md:pl-0">
            {/* Center line for desktop */}
            <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 bg-neutral-warm -translate-x-1/2" />

            <div className="space-y-12">
              {timelineEvents.map((evt, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={evt.year} className="relative flex flex-col md:flex-row items-start md:items-center">
                    
                    {/* Circle marker */}
                    <div className="absolute left-0 md:left-1/2 h-5 w-5 rounded-full bg-brand-red border-4 border-cream-light -translate-x-1/2 z-10" />

                    {/* Timeline box */}
                    <div className={`w-full md:w-1/2 pl-8 md:pl-0 ${
                      isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:ml-auto"
                    }`}>
                      <span className="font-serif text-2xl font-bold text-brand-red block mb-1">
                        {evt.year}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-charcoal mb-1">
                        {evt.title}
                      </h4>
                      <p className="font-sans text-xs md:text-sm text-muted-gray leading-relaxed">
                        {evt.desc}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* TEAM PROFILES */}
      <section className="py-20 md:py-24 border-b border-neutral-warm/40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <Badge variant="soft-red" className="mb-2">Our People</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">The Artisans Behind the Kitchen</h2>
            <p className="font-sans text-sm text-muted-gray mt-2">
              Meet our culinary leaders dedicated to preserving Nepalese flavor integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto text-left">
            {/* Chef 1 */}
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative h-32 w-32 rounded-full overflow-hidden shrink-0 border border-neutral-warm/60 bg-cream-dark">
                <Image src="/images/chef_tashi.jpg" alt="Chef Tashi Sherpa" fill className="object-cover" sizes="128px" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-xl font-bold text-charcoal">Tashi Sherpa</h4>
                <Badge variant="soft-red">Head Executive Chef</Badge>
                <p className="font-sans text-xs text-muted-gray leading-relaxed">
                  Tashi has spent over 15 years running professional kitchens in Kathmandu and SF, specializing in traditional high-altitude noodle soups and complex slow-cooked curry profiles.
                </p>
              </div>
            </div>

            {/* Chef 2 */}
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative h-32 w-32 rounded-full overflow-hidden shrink-0 border border-neutral-warm/60 bg-cream-dark">
                <Image src="/images/chef_mingma.jpg" alt="Chef Mingma Lama" fill className="object-cover" sizes="128px" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-xl font-bold text-charcoal">Mingma Lama</h4>
                <Badge variant="soft-red">Master Momo Artisan</Badge>
                <p className="font-sans text-xs text-muted-gray leading-relaxed">
                  Mingma directs our specialty dumpling wrapping station, overseeing the preparation of over 1,000 hand-folded momos daily. His folds are precise, traditional, and fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-24 text-center bg-cream-light">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 space-y-6">
          <Badge variant="soft-red">Join Us</Badge>
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-charcoal">
            Come Taste the Story
          </h2>
          <p className="font-sans text-sm md:text-base text-muted-gray max-w-lg mx-auto leading-relaxed">
            Ready to experience authentic Nepalese flavors for yourself? Order online for pickup or delivery, or reserve a table today.
          </p>
          <div className="flex justify-center space-x-4 pt-2">
            <Link href="/menu">
              <Button variant="primary" size="lg">
                Explore Menu
              </Button>
            </Link>
            <Link href="/reservations">
              <Button variant="secondary" size="lg">
                Reserve Table
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
