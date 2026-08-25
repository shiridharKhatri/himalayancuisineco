"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Clock, Star, Phone, ShoppingBag, CalendarDays, ChefHat, Gift } from "lucide-react";
import { MENU_ITEMS, CATEGORIES, MOCK_REVIEWS } from "@/lib/data";
import { MenuItem } from "@/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Carousel } from "@/components/ui/Carousel";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { CustomizationModal } from "@/components/ordering/CustomizationModal";
import { CartDrawer } from "@/components/ordering/CartDrawer";
import { VideoHero } from "@/components/home/VideoHero";
import { Testimonials } from "@/components/ui/Testimonials";

export default function HomePage() {
  const [customizingItem, setCustomizingItem] = React.useState<MenuItem | null>(null);

  // Filter featured items for the carousel
  const featuredDishes = MENU_ITEMS.filter((item) => item.isFeatured);

  const quickActions = [
    {
      title: "Order Online",
      description: "Get fresh hot Himalayan dishes delivered or ready for pickup.",
      cta: "Order Now",
      href: "/menu",
      icon: ShoppingBag,
    },
    {
      title: "Reserve a Table",
      description: "Book your dining experience in our warm, traditional dining room.",
      cta: "Book Reservation",
      href: "/reservations",
      icon: CalendarDays,
    },
    {
      title: "Custom Catering",
      description: "Bring authentic mountain flavors and momo platters to your event.",
      cta: "Request Quote",
      href: "/catering",
      icon: ChefHat,
    },
    {
      title: "Gift Cards",
      description: "Give the gift of Himalayan hospitality to friends and family.",
      cta: "Buy Gift Card",
      href: "/gift-cards",
      icon: Gift,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream-base">
      <Header />

      {/* HERO SECTION */}
      <VideoHero />

      {/* QUICK ACTIONS SECTION */}
      <section className="py-16 md:py-20 border-b border-neutral-warm/40 bg-cream-light">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative flex flex-col justify-between p-8 rounded-[16px] bg-cream-light border border-neutral-warm/40 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(21,21,21,0.04)] hover:border-brand-red/35 transition-all duration-300 cursor-pointer h-full text-left"
                >
                  <div className="flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-brand-red/5 flex items-center justify-center text-brand-red mb-6 group-hover:bg-brand-red group-hover:text-cream-light transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-charcoal mb-3 group-hover:text-brand-red transition-colors">
                      {action.title}
                    </h3>
                    <p className="font-sans text-sm text-muted-gray/95 leading-relaxed mb-6">
                      {action.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-brand-red transition-colors group-hover:text-brand-red-dark">
                    <span>{action.cta}</span>
                    <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED DISHES SECTION */}
      <section className="py-20 md:py-24 border-b border-neutral-warm/40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <Badge variant="soft-red" className="mb-3">
              House Specialties
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
              Featured Himalayan Flavors
            </h2>
            <p className="font-sans text-sm md:text-base text-muted-gray mt-4 leading-relaxed">
              Explore our chef's signature dishes, showcasing authentic spices, textures, and mountain heritage.
            </p>
          </div>

          {/* Desktop featured grid */}
          <div className="hidden lg:grid grid-cols-3 gap-8">
            {featuredDishes.slice(0, 3).map((item) => (
              <MenuItemCard key={item.id} item={item} onCustomize={setCustomizingItem} />
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="block lg:hidden max-w-md mx-auto">
            <Carousel>
              {featuredDishes.map((item) => (
                <div key={item.id} className="py-2 text-left">
                  <MenuItemCard item={item} onCustomize={setCustomizingItem} />
                </div>
              ))}
            </Carousel>
          </div>
          
          <div className="mt-12">
            <Link href="/menu">
              <Button variant="outline">
                View Complete Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* OUR STORY PREVIEW SECTION */}
      <section className="py-20 md:py-24 border-b border-neutral-warm/40 bg-cream-light">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Story Split Image */}
            <div className="lg:col-span-6 relative aspect-[4/3] rounded-[24px] overflow-hidden border border-neutral-warm/60 bg-cream-dark">
              <Image
                src="/images/dal_bhat.jpg"
                alt="Nepalese Traditional Dal Bhat Thali set platter"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>

            {/* Story Content */}
            <div className="lg:col-span-6 flex flex-col space-y-6 text-left">
              <Badge variant="neutral" className="w-fit">
                Our Heritage
              </Badge>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
                A Taste of the Himalayas
              </h2>
              <p className="font-sans text-sm md:text-base text-muted-gray leading-relaxed">
                Himalayan Cuisine Co. was founded to preserve and share the deep, rich culinary traditions of Nepal. Our recipes are rooted in ancient home kitchens, using fresh organic herbs and hand-milled spices imported directly from small Himalayan farmers.
              </p>
              
              {/* Values List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-neutral-warm/30">
                <div>
                  <h4 className="font-serif text-lg font-semibold text-charcoal">Traditional Recipes</h4>
                  <p className="font-sans text-xs text-muted-gray mt-1 leading-normal">Unchanged seasonings from mountain communities.</p>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-charcoal">Fresh Ingredients</h4>
                  <p className="font-sans text-xs text-muted-gray mt-1 leading-normal">Sourced locally and freshly ground daily in house.</p>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-charcoal">Warm Hospitality</h4>
                  <p className="font-sans text-xs text-muted-gray mt-1 leading-normal">Welcome as family, echoing the true spirit of Nepal.</p>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/our-story">
                  <Button variant="secondary">
                    Read Our Full Story
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CUISINE EXPLORER CATEGORIES */}
      <section className="py-20 md:py-24 border-b border-neutral-warm/40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <Badge variant="soft-red" className="mb-3">
              Cuisine Explorer
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
              Explore Our Culinary Categories
            </h2>
            <p className="font-sans text-sm md:text-base text-muted-gray mt-4 leading-relaxed">
              From steamed dumplings to fiery charcoal-grilled starters, navigate our culinary specialties.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {CATEGORIES.map((cat) => {
              // Map categories to visual covers
              const categoryImages: Record<string, string> = {
                "cat-popular": "/images/item-chicken-haandi-biryani.jpg",
                "cat-starters": "/images/item-samosa.jpg",
                "cat-soups-salads": "/images/item-himalayan-soup.jpg",
                "cat-main-course-veg": "/images/item-daal-makhani.jpg",
                "cat-sides-desserts": "/images/item-carrot-halwa.jpg",
              };
              
              return (
                <Link
                  key={cat.id}
                  href={`/menu?category=${cat.slug}`}
                  className="group relative aspect-[4/3] rounded-[14px] overflow-hidden border border-neutral-warm/60 bg-cream-dark transition-all duration-300 hover:border-brand-red cursor-pointer"
                >
                  <Image
                    src={categoryImages[cat.id] || "/images/momo.jpg"}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, 250px"
                  />
                  {/* Dark solid overlay */}
                  <div className="absolute inset-0 bg-charcoal/30 group-hover:bg-charcoal/40 transition-colors" />
                  
                  {/* Category Title */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-cream-light tracking-wide text-center">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* REVIEWS TESTIMONIALS */}
      <section className="py-20 md:py-24 border-b border-neutral-warm/40 bg-cream-light">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 text-center">
          <Badge variant="soft-red" className="mb-3">
            Guest Testimonials
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-10 tracking-tight">
            Loved by Our Guests
          </h2>

          <div className="max-w-4xl mx-auto">
            <Testimonials />
          </div>
        </div>
      </section>

      {/* LOCATION & HOURS SECTION */}
      <section id="location" className="py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Details Info */}
          <div className="lg:col-span-5 flex flex-col space-y-6 text-left">
            <Badge variant="neutral" className="w-fit">
              Visit Us
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
              Location & Hours
            </h2>
            <p className="font-sans text-sm md:text-base text-muted-gray leading-relaxed">
              We are located in the heart of San Francisco. Drop by for lunch, dinner, or contact us to coordinate your reservations.
            </p>

            <div className="space-y-4 pt-4 border-t border-neutral-warm/40 font-sans text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal mb-0.5">Address</strong>
                  <span className="text-muted-gray">123 Himalayan Way, San Francisco, CA 94102</span>
                  <span className="block text-xs text-muted-gray/70 mt-1">Valet and nearby street parking available.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal mb-0.5">Kitchen Hours</strong>
                  <div className="text-muted-gray flex flex-col space-y-1">
                    <span>Lunch Daily: 11:30 AM – 2:30 PM</span>
                    <span>Dinner Daily: 5:00 PM – 10:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-charcoal mb-0.5">Reservation & Support</strong>
                  <a href="tel:+14155550199" className="text-muted-gray hover:text-brand-red transition-colors font-medium">
                    (415) 555-0199
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder Block */}
          <div className="lg:col-span-7 aspect-[16/10] w-full rounded-[20px] overflow-hidden border border-neutral-warm/60 relative bg-cream-dark shadow-[0_4px_20px_rgba(21,21,21,0.02)]">
            {/* Visual editorial map layout styling */}
            <div className="absolute inset-0 bg-cream-light/35 flex flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full bg-cream-dark p-3 border border-neutral-warm/50 text-brand-red mb-3">
                <MapPin className="h-6 w-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-charcoal mb-1">
                Himalayan Cuisine SF
              </h4>
              <p className="font-sans text-xs text-muted-gray max-w-sm mb-4 leading-normal">
                123 Himalayan Way, San Francisco, CA 94102. Centered near Civic Center.
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <Button variant="outline" size="sm" className="text-xs">
                  Get Directions
                </Button>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Cart Drawer & Item customizing modal */}
      <CartDrawer />
      <CustomizationModal
        menuItem={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
      />

      <Footer />
    </div>
  );
}
