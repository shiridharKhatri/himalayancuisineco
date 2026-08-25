"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingBag, Menu, User, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = React.useState(false);
  
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const { isMobileMenuOpen, setMobileMenuOpen, setCartOpen } = useUIStore();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Menu", href: "/menu" },
    { label: "Our Story", href: "/our-story" },
    { label: "Catering", href: "/catering" },
    { label: "Events", href: "/events" },
    { label: "Reservations", href: "/reservations" },
  ];

  const secondaryNavLinks = [
    { label: "Gift Cards", href: "/gift-cards" },
    { label: "Rewards", href: "/rewards" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-cream-light transition-all duration-300 border-b border-neutral-warm/40 ${
          isScrolled ? "py-3.5 shadow-[0_4px_16px_rgba(21,21,21,0.02)]" : "py-3.5"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 flex items-center justify-between">
          
          {/* MOBILE NAVIGATION BAR */}
          <div className="flex md:hidden items-center justify-between w-full">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-charcoal hover:text-brand-red transition-colors focus-ring cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="relative h-10 w-44 hover:opacity-90 transition-opacity">
              <Image src="/images/logo.png" alt="Himalayan Cuisine Co." fill className="object-contain object-center" priority />
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="p-2 -mr-2 text-charcoal hover:text-brand-red transition-colors relative focus-ring cursor-pointer"
              aria-label={`Open shopping cart, ${cartCount} items`}
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-cream-light bg-brand-red rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* DESKTOP NAVIGATION BAR */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/" className="relative h-12 w-48 hover:opacity-90 transition-opacity mr-8 shrink-0">
              <Image src="/images/logo.png" alt="Himalayan Cuisine Co." fill className="object-contain object-left" priority />
            </Link>

            {/* Central Navigation Links */}
            <nav className="flex items-center space-x-8 lg:space-x-10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`font-sans text-sm font-medium tracking-wide uppercase transition-colors hover:text-brand-red cursor-pointer ${
                      isActive ? "text-brand-red font-semibold" : "text-charcoal"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Elements */}
            <div className="flex items-center space-x-6 shrink-0">
              <Link
                href="/gift-cards"
                className={`font-sans text-sm font-medium tracking-wide uppercase transition-colors hover:text-brand-red cursor-pointer ${
                  pathname === "/gift-cards" ? "text-brand-red font-semibold" : "text-charcoal"
                }`}
              >
                Gift Cards
              </Link>

              {session ? (
                <Link
                  href="/account"
                  className="flex items-center space-x-1.5 font-sans text-sm font-medium tracking-wide uppercase transition-colors text-charcoal hover:text-brand-red cursor-pointer"
                  aria-label="Manage customer account"
                >
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className={`font-sans text-sm font-medium tracking-wide uppercase transition-colors hover:text-brand-red cursor-pointer ${
                    pathname === "/sign-in" ? "text-brand-red font-semibold" : "text-charcoal"
                  }`}
                >
                  Sign In
                </Link>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center space-x-1.5 p-2 text-charcoal hover:text-brand-red transition-colors relative focus-ring cursor-pointer"
                aria-label={`Open shopping cart, ${cartCount} items`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="font-sans text-sm font-semibold">{cartCount}</span>
              </button>

              <Link href="/menu">
                <Button variant="primary" size="sm">
                  Order Online
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      <Drawer isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} side="left" title="Navigation">
        <div className="flex flex-col h-full justify-between pb-8">
          <nav className="flex flex-col space-y-6 mt-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl font-medium text-charcoal hover:text-brand-red transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-neutral-warm/40 my-2" />

            {secondaryNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-sm font-medium uppercase tracking-wider text-muted-gray hover:text-brand-red transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-neutral-warm/40 my-2" />

            {session ? (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 font-sans text-base font-semibold text-charcoal hover:text-brand-red transition-colors"
              >
                <User className="h-5 w-5" />
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-base font-semibold text-charcoal hover:text-brand-red transition-colors"
              >
                Sign In / Sign Up
              </Link>
            )}
          </nav>

          <div className="mt-8 flex flex-col space-y-3">
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
