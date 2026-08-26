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

  const [events, setEvents] = React.useState<any[]>(MOCK_EVENTS);
  const [bookingEvent, setBookingEvent] = React.useState<any | null>(null);
  const [ticketCount, setTicketCount] = React.useState(2);
  const [guestName, setGuestName] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isBooking, setIsBooking] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
        }
      })
      .catch((err) => console.error("Failed to fetch events", err));
  }, []);

  const handleBookTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingEvent) return;
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      addToast("Please provide your name, email, and phone number", "error");
      return;
    }

    setIsBooking(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: bookingEvent.id,
          customerName: guestName,
          customerEmail: guestEmail,
          customerPhone: guestPhone,
          ticketsCount: ticketCount,
          totalPaid: (bookingEvent.price || 45.0) * ticketCount,
          notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to book tickets");

      addToast(
        `Successfully booked ${ticketCount} seat${ticketCount === 1 ? "" : "s"} for ${bookingEvent.title}! Confirmation sent to ${guestEmail}.`,
        "success"
      );
      setBookingEvent(null);
      setTicketCount(2);
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setNotes("");
    } catch (err: any) {
      addToast(err.message || "Failed to book tickets", "error");
    } finally {
      setIsBooking(false);
    }
  };

  const getEventCoverImage = (evt: any) => {
    if (evt.image && evt.image.startsWith("/")) return evt.image;
    return evt.id === "evt-dashain-feast"
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
            {events.map((evt) => (
              <div
                key={evt.id}
                className="group flex flex-col bg-cream-light border border-neutral-warm/40 rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(21,21,21,0.04)] hover:border-brand-red/30 transition-all duration-300 justify-between"
              >
                <div>
                  {/* Cover Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-dark border-b border-neutral-warm/20">
                    <Image
                      src={getEventCoverImage(evt)}
                      alt={evt.title}
                      fill
                      className="object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 550px"
                    />
                    {/* Floating Type Badge */}
                    <span className="absolute top-4 left-4 font-sans text-[10px] uppercase font-bold tracking-widest text-cream-light bg-brand-red px-3 py-1.5 rounded-full shadow-md z-10">
                      {evt.type || "Special Event"}
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
                  <span className="font-sans text-xs text-charcoal font-bold">
                    ${(evt.price || 45).toFixed(2)} / seat
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
          <form onSubmit={handleBookTickets} className="space-y-4 text-left font-sans text-xs">
            <div className="bg-cream-dark/50 border border-neutral-warm rounded-2xl p-4 text-xs text-muted-gray leading-normal space-y-1">
              <p className="font-bold text-charcoal text-sm">{bookingEvent.title}</p>
              <p><strong>Date &amp; Time:</strong> {bookingEvent.schedule}</p>
              <p><strong>Price:</strong> ${(bookingEvent.price || 45).toFixed(2)} per ticket</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-charcoal uppercase tracking-wider text-[10px] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-warm bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal uppercase tracking-wider text-[10px] mb-1">
                  Party Size / Seats
                </label>
                <select
                  value={ticketCount}
                  onChange={(e) => setTicketCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-warm bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-red cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Ticket" : "Tickets"} (${((bookingEvent.price || 45) * num).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-charcoal uppercase tracking-wider text-[10px] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-warm bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal uppercase tracking-wider text-[10px] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="(970) 555-0199"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-warm bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-charcoal uppercase tracking-wider text-[10px] mb-1">
                Dietary Requests or Special Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Vegetarian, gluten-free, celebrating an anniversary..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-warm bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3 rounded-full text-xs font-bold uppercase tracking-wider"
              isLoading={isBooking}
            >
              Confirm RSVP &bull; ${((bookingEvent.price || 45) * ticketCount).toFixed(2)}
            </Button>
          </form>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}
