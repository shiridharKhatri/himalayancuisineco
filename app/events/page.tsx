"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { useUIStore } from "@/stores/uiStore";
import { MOCK_EVENTS } from "@/lib/data";
import { HimalayanEvent } from "@/types";
import { Select } from "@/components/ui/Select";

export default function EventsPage() {
  const { addToast } = useUIStore();

  const [bookingEvent, setBookingEvent] = React.useState<HimalayanEvent | null>(null);
  const [ticketCount, setTicketCount] = React.useState(2);
  const [isBooking, setIsBooking] = React.useState(false);

  const handleBookTickets = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);

    setTimeout(() => {
      addToast(
        `Successfully booked ${ticketCount} seats for ${bookingEvent?.title}! Confirmation email sent.`,
        "success"
      );
      setIsBooking(false);
      setBookingEvent(null);
      setTicketCount(2);
    }, 1500);
  };

  const getEventCoverImage = (id: string) => {
    return id === "evt-dashain-feast"
      ? "/images/event_dashain.jpg"
      : "/images/event_masterclass.jpg";
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      {/* HERO SECTION */}
      <section className="relative py-16 lg:py-20 border-b border-neutral-warm/40 bg-cream-light text-center">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <Badge variant="soft-red" className="mb-2">Community &amp; Celebrations</Badge>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-charcoal max-w-4xl mx-auto leading-snug">
            Gathering Around the Table
          </h1>
          <p className="font-sans text-sm md:text-base text-muted-gray mt-3 max-w-2xl mx-auto leading-relaxed">
            Experience culinary masterclasses, traditional Nepalese festival banquets, and seasonal cultural celebrations at Himalayan Cuisine Co.
          </p>
        </div>
      </section>

      {/* EVENTS CATALOG LIST */}
      <section className="py-20 md:py-28 bg-cream-base">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {MOCK_EVENTS.map((evt) => (
              <div
                key={evt.id}
                className="group flex flex-col bg-cream-light border border-neutral-warm/40 rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(21,21,21,0.04)] hover:border-brand-red/30 transition-all duration-300 justify-between"
              >
                <div>
                  {/* Cover Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-dark border-b border-neutral-warm/20">
                    <Image
                      src={getEventCoverImage(evt.id)}
                      alt={evt.title}
                      fill
                      className="object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 550px"
                    />
                    {/* Floating Type Badge */}
                    <span className="absolute top-4 left-4 font-sans text-[10px] uppercase font-bold tracking-widest text-cream-light bg-brand-red px-3 py-1.5 rounded-full shadow-md z-10">
                      {evt.type}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="p-8">
                    <h3 className="font-serif text-2xl font-bold text-charcoal leading-tight mb-4 group-hover:text-brand-red transition-colors duration-300">
                      {evt.title}
                    </h3>
                    <p className="font-sans text-sm text-muted-gray leading-relaxed mb-6">
                      {evt.description}
                    </p>
                    
                    <div className="flex flex-col space-y-2.5 font-sans text-xs text-muted-gray pt-4 border-t border-neutral-warm/20">
                      <div className="flex items-center space-x-2.5">
                        <Calendar className="h-4.5 w-4.5 text-brand-red shrink-0" />
                        <span className="font-semibold">{evt.schedule}</span>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <MapPin className="h-4.5 w-4.5 text-brand-red shrink-0" />
                        <span className="font-semibold">{evt.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 pb-8 pt-4 border-t border-neutral-warm/20 flex justify-between items-center bg-cream-light/60">
                  <span className="font-sans text-[10px] text-brand-red font-bold uppercase tracking-wider">
                    Limited Seats Remaining
                  </span>
                  <Button
                    onClick={() => setBookingEvent(evt)}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1.5 cursor-pointer rounded-full"
                  >
                    <Ticket className="h-4 w-4" />
                    Book Seats
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVATE GATHERINGS CTA */}
      <section className="relative py-24 bg-charcoal text-cream-light overflow-hidden text-center border-t border-white/10">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/images/catering_private.jpg"
            alt="Private dining room background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <span className="font-sans text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-brand-red mb-3 block">
            Exclusive Gatherings
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Host Your Private Event With Us
          </h2>
          <p className="font-sans text-sm md:text-base text-neutral-300/90 leading-relaxed max-w-2xl mx-auto mb-10">
            From intimate corporate dinners and wedding rehearsals to birthday celebrations and private momo-making masterclasses. Let us create a custom menu that wows your guests.
          </p>
          <Link
            href="/catering"
            className="inline-flex items-center gap-2 border border-cream-light/35 hover:border-cream-light px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all text-cream-light pointer-events-auto cursor-pointer"
          >
            Inquire About Private Events
          </Link>
        </div>
      </section>

      {/* BOOK SEAT TICKETS DIALOG */}
      <Dialog
        isOpen={!!bookingEvent}
        onClose={() => setBookingEvent(null)}
        title={bookingEvent ? `Reserve Seats: ${bookingEvent.title}` : ""}
      >
        {bookingEvent && (
          <form onSubmit={handleBookTickets} className="space-y-5 text-left">
            <div className="bg-cream-dark/50 border border-neutral-warm rounded-sm px-4 py-3 text-xs text-muted-gray leading-normal mb-2">
              <strong>Event:</strong> {bookingEvent.title} <br />
              <strong>Schedule:</strong> {bookingEvent.schedule}
            </div>

            <Select
              label="Party Size / Seats"
              value={ticketCount.toString()}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTicketCount(parseInt(e.target.value) || 2)}
              options={[
                { value: "1", label: "1 Ticket" },
                { value: "2", label: "2 Tickets" },
                { value: "3", label: "3 Tickets" },
                { value: "4", label: "4 Tickets" },
                { value: "5", label: "5 Tickets" },
                { value: "6", label: "6 Tickets" },
              ]}
            />

            <div className="text-xs text-muted-gray leading-relaxed">
              Ticket reservation is complimentary. You will pay for the menu cost at the venue.
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isBooking}
            >
              Confirm Tickets Reservation
            </Button>
          </form>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}
