import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, UtensilsCrossed, Home, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow flex items-center justify-center py-20 px-6">
        <div className="max-w-xl w-full text-center space-y-6">
          {/* Badge */}
          <Badge variant="soft-red" className="mb-1">
            404 &bull; Page Not Found
          </Badge>

          {/* 404 Large Numeric Indicator */}
          <div>
            <span className="font-serif text-8xl md:text-9xl font-extrabold tracking-tight text-neutral-300/80 select-none block leading-none">
              404
            </span>
          </div>

          {/* Heading and Description */}
          <div className="space-y-2.5">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-charcoal">
              Lost in the Mountain Mist?
            </h1>
            <p className="font-sans text-sm md:text-base text-muted-gray max-w-md mx-auto leading-relaxed">
              The page you are looking for might have been moved, renamed, or is temporarily unavailable. Let us guide you back to our authentic flavors.
            </p>
          </div>

          {/* Navigation CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Return to Homepage
              </Button>
            </Link>

            <Link href="/menu" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white border-neutral-warm">
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Explore Menu
              </Button>
            </Link>
          </div>

          {/* Helpful Navigation Links */}
          <div className="pt-8 border-t border-neutral-warm/40 mt-8">
            <p className="font-sans text-xs uppercase font-bold tracking-wider text-muted-gray mb-3">
              Popular Destinations
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-charcoal">
              <Link href="/menu" className="hover:text-brand-red transition-colors flex items-center gap-1">
                <span>Authentic Menu</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <span className="text-neutral-300">&bull;</span>
              <Link href="/reservations" className="hover:text-brand-red transition-colors flex items-center gap-1">
                <span>Book Table</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <span className="text-neutral-300">&bull;</span>
              <Link href="/our-story" className="hover:text-brand-red transition-colors flex items-center gap-1">
                <span>Our Heritage</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <span className="text-neutral-300">&bull;</span>
              <Link href="/gift-cards" className="hover:text-brand-red transition-colors flex items-center gap-1">
                <span>Gift Cards</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
