"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Avatar from "boring-avatars";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingBag, Menu, User, X, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isPastHero, setIsPastHero] = React.useState(false);

  const isHomePage = pathname === "/";
  
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const { isMobileMenuOpen, setMobileMenuOpen, setCartOpen } = useUIStore();

  React.useEffect(() => {
    const handleScroll = () => {
      // Reveal navbar ONLY after 420vh video hero scrolling sequence concludes
      const heroThreshold = window.innerHeight * 3.15;
      setIsPastHero(window.scrollY >= heroThreshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Menu", href: "/menu" },
    { label: "Our Story", href: "/our-story" },
    { label: "Catering", href: "/catering" },
    { label: "Events", href: "/events" },
    { label: "Reservations", href: "/reservations" },
    { label: "Careers", href: "/careers" },
  ];

  const secondaryNavLinks = [
    { label: "Gift Cards", href: "/gift-cards" },
    { label: "Rewards", href: "/rewards" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`z-50 w-full transition-all duration-500 ease-out ${
          isHomePage
            ? `fixed top-0 left-0 right-0 py-2.5 bg-white/95 backdrop-blur-md text-charcoal shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-b border-neutral-200/80 ${
                isPastHero
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-full pointer-events-none"
              }`
            : "sticky top-0 py-2.5 bg-white/95 backdrop-blur-md text-charcoal shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-b border-neutral-200/80 opacity-100 translate-y-0 pointer-events-auto"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14 flex items-center justify-between">
          
          {/* MOBILE NAVIGATION BAR */}
          <div className="flex md:hidden items-center justify-between w-full">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 transition-colors duration-200 focus-ring cursor-pointer hover:text-brand-red text-charcoal"
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            </button>

            <Link href="/" className="relative h-11 w-11 hover:opacity-90 transition-opacity">
              <Image
                src="/images/logo.png"
                alt="Himalayan Cuisine Co."
                fill
                className="object-contain object-center"
                priority
              />
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="p-2 -mr-2 transition-colors duration-200 focus-ring cursor-pointer hover:text-brand-red text-charcoal"
              aria-label={`Open shopping cart, ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-[18px] min-w-[18px] px-1 text-[10px] font-bold leading-none text-cream-light bg-brand-red rounded-full ring-2 ring-cream-light">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* DESKTOP NAVIGATION BAR */}
          <div className="hidden md:flex items-center w-full">
            {/* Logo */}
            <Link
              href="/"
              className="relative h-[52px] w-[52px] hover:scale-[1.03] transition-transform duration-300 mr-10 shrink-0"
            >
              <Image
                src="/images/logo.png"
                alt="Himalayan Cuisine Co."
                fill
                className="object-contain object-center"
                priority
              />
            </Link>

            {/* Central Navigation Links */}
            <nav className="flex items-center gap-1 lg:gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative font-sans text-[13px] font-semibold tracking-[0.06em] uppercase px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "text-brand-red bg-brand-red-soft/50"
                        : "text-charcoal/80 hover:text-charcoal hover:bg-cream-dark/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right Action Elements */}
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/gift-cards"
                className={`font-sans text-[13px] font-semibold tracking-[0.06em] uppercase px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${
                  pathname === "/gift-cards"
                    ? "text-brand-red bg-brand-red-soft/50"
                    : "text-charcoal/80 hover:text-charcoal hover:bg-cream-dark/60"
                }`}
              >
                Gift Cards
              </Link>

              {/* Subtle divider */}
              <div className="w-px h-5 mx-1.5 bg-neutral-warm/40" />

              {session ? (
                <div className="flex items-center gap-1.5">
                  {(session.user as any)?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#B51C20] text-white hover:bg-[#991519] transition-colors"
                    >
                      ADMIN
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="flex items-center p-1 rounded-full transition-all duration-200 cursor-pointer hover:bg-cream-dark/60"
                    aria-label="Manage customer account"
                  >
                    <div className="rounded-full overflow-hidden shrink-0 border border-neutral-warm/30 flex items-center justify-center">
                      <Avatar
                        size={28}
                        name={session.user?.name || session.user?.email || "Member"}
                        variant="beam"
                        colors={["#C9252D", "#991D24", "#F4D9D8", "#ECE7DF", "#151515"]}
                      />
                    </div>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className={`font-sans text-[13px] font-semibold tracking-[0.06em] uppercase px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${
                    pathname === "/sign-in"
                      ? "text-brand-red bg-brand-red-soft/50"
                      : "text-charcoal/80 hover:text-charcoal hover:bg-cream-dark/60"
                  }`}
                >
                  Sign In
                </Link>
              )}
              {/* Subtle divider separating Account from Cart */}
              <div className="w-px h-5 mx-1 bg-neutral-warm/40" />

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center p-2 rounded-full transition-all duration-200 focus-ring cursor-pointer text-charcoal hover:bg-cream-dark/60"
                aria-label={`Open shopping cart, ${cartCount} items`}
              >
                <div className="relative">
                  <ShoppingBag className="h-[20px] w-[20px]" strokeWidth={1.75} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center h-[18px] min-w-[18px] px-1 text-[10px] font-bold leading-none rounded-full ring-2 transition-colors duration-200 text-cream-light bg-brand-red ring-cream-light">
                      {cartCount}
                    </span>
                  )}
                </div>
              </button>

              {/* Subtle divider */}
              <div className="w-px h-5 mx-1 bg-neutral-warm/40" />

              {/* Order Online CTA */}
              <Link href="/menu" className="ml-1">
                <button className="group inline-flex items-center gap-2 font-sans text-[13px] font-bold tracking-[0.06em] uppercase rounded-full px-5 py-2.5 transition-all duration-300 cursor-pointer bg-brand-red text-cream-light hover:bg-brand-red-dark shadow-sm hover:shadow-md hover:shadow-brand-red/20">
                  Order Online
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      <Drawer isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} side="left" title="Navigation">
        <div className="flex flex-col h-full justify-between pb-8">
          <nav className="flex flex-col space-y-1 mt-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-serif text-2xl font-medium px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-brand-red bg-brand-red-soft/40"
                      : "text-charcoal hover:text-brand-red hover:bg-cream-dark/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="h-px bg-neutral-warm/30 my-3" />

            {secondaryNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-sm font-medium uppercase tracking-wider text-muted-gray hover:text-brand-red px-3 py-2.5 rounded-lg hover:bg-cream-dark/50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-neutral-warm/30 my-3" />

            {session ? (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 font-sans text-base font-semibold text-charcoal hover:text-brand-red px-3 py-2.5 rounded-lg hover:bg-cream-dark/50 transition-all duration-200"
              >
                <div className="rounded-full overflow-hidden shrink-0 border border-neutral-warm/30 flex items-center justify-center">
                  <Avatar
                    size={24}
                    name={session.user?.name || session.user?.email || "Member"}
                    variant="beam"
                    colors={["#C9252D", "#991D24", "#F4D9D8", "#ECE7DF", "#151515"]}
                  />
                </div>
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-base font-semibold text-charcoal hover:text-brand-red px-3 py-2.5 rounded-lg hover:bg-cream-dark/50 transition-all duration-200"
              >
                Sign In / Sign Up
              </Link>
            )}
          </nav>

          <div className="mt-8 flex flex-col space-y-3 px-3">
            <Link href="/menu" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                Order Online
              </Button>
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  );
};
