import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: "Explore",
      links: [
        { label: "Our Menu", href: "/menu" },
        { label: "Our Story", href: "/our-story" },
        { label: "Catering & Events", href: "/catering" },
        { label: "Upcoming Events", href: "/events" },
        { label: "Careers", href: "/careers" },
      ],
    },
    {
      title: "Visit",
      links: [
        { label: "Book a Table", href: "/reservations" },
        { label: "Contact Us", href: "/contact" },
        { label: "Location & Directions", href: "/contact#map" },
      ],
    },
    {
      title: "Programs",
      links: [
        { label: "Gift Cards", href: "/gift-cards" },
        { label: "Loyalty Rewards", href: "/rewards" },
        { label: "Catering Builder", href: "/catering/order" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Accessibility Statement", href: "/accessibility" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-cream-dark border-t border-neutral-warm pt-16 pb-12">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <Link href="/" className="relative h-12 w-48 hover:opacity-90 transition-opacity block">
              <Image src="/images/logo.png" alt="Himalayan Cuisine Co." fill className="object-contain object-left" />
            </Link>
            <p className="font-sans text-sm text-muted-gray max-w-sm leading-relaxed">
              Experience the true taste of Nepalese tradition. We offer handcrafted food, traditional recipes, and warm Himalayan hospitality.
            </p>
            <div className="flex flex-col space-y-3 font-sans text-sm text-charcoal">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-brand-red shrink-0" />
                <span>123 Himalayan Way, San Francisco, CA 94102</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-brand-red shrink-0" />
                <a href="tel:+14155550199" className="hover:text-brand-red transition-colors">
                  (415) 555-0199
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-brand-red shrink-0" />
                <a href="mailto:info@himalayancuisineco.com" className="hover:text-brand-red transition-colors">
                  info@himalayancuisineco.com
                </a>
              </div>
            </div>
            {/* Social Icons */}
            <div className="flex items-center space-x-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full p-2 text-muted-gray hover:bg-cream-light hover:text-brand-red transition-colors cursor-pointer"
                aria-label="Visit us on Facebook"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full p-2 text-muted-gray hover:bg-cream-light hover:text-brand-red transition-colors cursor-pointer"
                aria-label="Visit us on Instagram"
              >
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full p-2 text-muted-gray hover:bg-cream-light hover:text-brand-red transition-colors cursor-pointer"
                aria-label="Visit us on Twitter"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Cols */}
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col space-y-4">
              <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                {col.title}
              </h4>
              <ul className="flex flex-col space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-muted-gray hover:text-brand-red transition-colors cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Separator */}
        <div className="h-px bg-neutral-warm my-12" />

        {/* Bottom Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-sans text-xs text-muted-gray">
            &copy; {currentYear} Himalayan Cuisine Co. All rights reserved.
          </div>
          
          {/* Hours Info */}
          <div className="font-sans text-xs text-muted-gray text-center md:text-right leading-relaxed">
            Open Daily: Lunch: 11:30 AM – 2:30 PM &bull; Dinner: 5:00 PM – 10:00 PM
          </div>
        </div>
      </div>
    </footer>
  );
};
