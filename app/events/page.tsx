"use client";

import * as React from "react";
import Image from "next/image";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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

      {/* HERO */}
      <section className="relative py-20 lg:py-24 border-b border-neutral-warm/40 bg-cream-light text-center">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <Badge variant="soft-red" className="mb-2">Community Events</Badge>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            Upcoming Himalayan Events
          </h1>
          <p className="font-sans text-sm md:text-base text-muted-gray mt-4 max-w-2xl mx-auto leading-relaxed">
            Join our festival banquets, cooking masterclasses, and cultural celebrations celebrating Nepalese culinary traditions.
          </p>
        </div>
      </section>

      {/* EVENTS CATALOG LIST */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="space-y-12">
            {MOCK_EVENTS.map((evt) => (
              <Card key={evt.id} padded={false} className="border border-neutral-warm overflow-hidden text-left flex flex-col md:flex-row items-stretch">
                
                {/* Visual Image cover */}
                <div className="relative aspect-[4/3] md:aspect-auto md:w-1/3 min-h-[220px] bg-cream-dark">
                  <Image
                    src={getEventCoverImage(evt.id)}
                    alt={evt.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>

                {/* Event Info Details */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-brand-red bg-brand-red-soft/30 px-2 py-0.5 rounded-sm">
                      {evt.type}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-charcoal leading-tight">
                      {evt.title}
                    </h3>

                    <div className="flex flex-col space-y-1.5 font-sans text-xs text-muted-gray pt-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-brand-red shrink-0" />
                        <span>{evt.schedule}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-brand-red shrink-0" />
                        <span>{evt.location}</span>
                      </div>
                    </div>

                    <p className="font-sans text-xs md:text-sm text-muted-gray leading-relaxed pt-2">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-neutral-warm/30 mt-6 flex justify-between items-center">
                    <span className="font-sans text-xs text-brand-red font-bold">
                      Limited seats available
                    </span>
                    <Button
                      onClick={() => setBookingEvent(evt)}
                      variant="primary"
                      size="sm"
                      className="flex items-center"
                    >
                      <Ticket className="mr-1.5 h-4 w-4" />
                      Book Seats
                    </Button>
                  </div>
                </div>

              </Card>
            ))}
          </div>
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
