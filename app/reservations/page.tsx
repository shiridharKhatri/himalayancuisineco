"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, Clock, Users, Sofa, CalendarCheck, HelpCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";
import { useSession } from "next-auth/react";

export default function ReservationsPage() {
  const { addToast } = useUIStore();
  const { data: session } = useSession();

  // Booking Form State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [guests, setGuests] = React.useState("2");
  const [seatingArea, setSeatingArea] = React.useState("INDOOR");
  const [occasion, setOccasion] = React.useState("NONE");
  const [notes, setNotes] = React.useState("");

  // Pre-fill user data if logged in
  React.useEffect(() => {
    if (session?.user) {
      if (session.user.name) setName(session.user.name);
      if (session.user.email) setEmail(session.user.email);
    }
  }, [session]);

  // UI Flow State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [confirmedReservation, setConfirmedReservation] = React.useState<any | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = "Valid email is required";
    if (!phone.trim() || phone.length < 10) errs.phone = "Valid phone is required";
    if (!date) errs.date = "Please select a date";
    if (!time) errs.time = "Please select a time slot";

    // Peak Hour Capacity mock checking (e.g. Saturdays at 7:00 PM are at capacity)
    if (date) {
      const selectedDay = new Date(date).getDay(); // 6 is Saturday
      if (selectedDay === 6 && time === "19:00") {
        errs.time = "That slot is currently at capacity. Try 6:30 PM or 8:00 PM.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please check booking details.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          date,
          time,
          guests,
          seatingArea,
          occasion,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reserve table");
      }

      const data = await response.json();
      setConfirmedReservation({
        code: data.reservation.id,
        name,
        email,
        phone,
        date,
        time,
        guests,
        seatingArea,
        occasion,
        notes,
      });
      addToast("Table reserved successfully!", "success");
    } catch (err: any) {
      console.error(err);
      addToast("Error reserving table. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmedReservation(null);
    setName("");
    setEmail("");
    setPhone("");
    setDate("");
    setTime("");
    setGuests("2");
    setSeatingArea("INDOOR");
    setOccasion("NONE");
    setNotes("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-[1000px] px-6">
          
          {/* Header Text */}
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge variant="soft-red" className="mb-2">Reservations</Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
              Book a Dining Table
            </h1>
            <p className="font-sans text-sm md:text-base text-muted-gray mt-3 leading-relaxed">
              Join us for authentic Himalayan flavors. We reserve a portion of our tables for walk-ins, but suggest booking ahead.
            </p>
          </div>

          {!confirmedReservation ? (
            <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Inputs (Left) */}
              <div className="lg:col-span-8">
                <Card>
                  <div className="space-y-6 text-left">
                    <h3 className="font-serif text-xl font-semibold border-b border-neutral-warm/40 pb-3">
                      Reservation Details
                    </h3>

                    {/* Guest, Date, Time Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        label="Number of Guests"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        options={[
                          { value: "1", label: "1 Guest" },
                          { value: "2", label: "2 Guests" },
                          { value: "3", label: "3 Guests" },
                          { value: "4", label: "4 Guests" },
                          { value: "5", label: "5 Guests" },
                          { value: "6", label: "6 Guests" },
                          { value: "7", label: "7 Guests" },
                          { value: "8", label: "8+ Guests (Call)" },
                        ]}
                      />
                      <Input
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        error={errors.date}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <Select
                        label="Time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        error={errors.time}
                        options={[
                          { value: "", label: "-- Select Time --" },
                          { value: "11:30", label: "11:30 AM (Lunch)" },
                          { value: "12:00", label: "12:00 PM (Lunch)" },
                          { value: "12:30", label: "12:30 PM (Lunch)" },
                          { value: "13:00", label: "01:00 PM (Lunch)" },
                          { value: "17:00", label: "05:00 PM (Dinner)" },
                          { value: "17:30", label: "05:30 PM (Dinner)" },
                          { value: "18:00", label: "06:00 PM (Dinner)" },
                          { value: "18:30", label: "06:30 PM (Dinner)" },
                          { value: "19:00", label: "07:00 PM (Dinner - Peak)" },
                          { value: "19:30", label: "07:30 PM (Dinner - Peak)" },
                          { value: "20:00", label: "08:00 PM (Dinner)" },
                          { value: "20:30", label: "08:30 PM (Dinner)" },
                          { value: "21:00", label: "09:00 PM (Dinner)" },
                        ]}
                      />
                    </div>

                    {/* Location Seating Area & Occasion */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Seating Preference"
                        value={seatingArea}
                        onChange={(e) => setSeatingArea(e.target.value)}
                        options={[
                          { value: "INDOOR", label: "Indoor Dining Hall (Traditional)" },
                          { value: "OUTDOOR", label: "Outdoor Heated Patio" },
                          { value: "PRIVATE", label: "Private Traditional Room (Floor seating available)" },
                        ]}
                      />
                      <Select
                        label="Special Occasion"
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        options={[
                          { value: "NONE", label: "No Special Occasion" },
                          { value: "BIRTHDAY", label: "Birthday Celebration" },
                          { value: "ANNIVERSARY", label: "Anniversary Dinner" },
                          { value: "BUSINESS", label: "Business Gathering" },
                          { value: "OTHER", label: "Other Celebration" },
                        ]}
                      />
                    </div>

                    <h3 className="font-serif text-xl font-semibold border-b border-neutral-warm/40 pt-4 pb-3">
                      Guest Contact Info
                    </h3>

                    {/* Contact Details */}
                    <div className="space-y-4">
                      <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        placeholder="John Doe"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          error={errors.email}
                          placeholder="email@example.com"
                        />
                        <Input
                          label="Phone Number"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          error={errors.phone}
                          placeholder="(555) 000-0000"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                          Dietary Preferences / Special Requests
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Please let us know if you have any severe allergies or specific seat requests."
                          rows={3}
                          className="w-full px-4 py-3 rounded-sm border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Capacity warning tip */}
                    <div className="bg-cream-dark/40 border border-neutral-warm rounded-sm px-4 py-3 flex items-start space-x-2.5 text-xs text-muted-gray">
                      <HelpCircle className="h-4.5 w-4.5 text-brand-red shrink-0 mt-0.5" />
                      <div>
                        <strong>Peak hours booking policy:</strong> Saturday 7:00 PM is typically booked solid. Try selecting other times or calling us directly for parties larger than 6.
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isSubmitting}
                    >
                      Book Reservation
                    </Button>

                  </div>
                </Card>
              </div>

              {/* Reservation Policies (Right) */}
              <div className="lg:col-span-4 space-y-6 text-left">
                <Card>
                  <h3 className="font-serif text-lg font-bold border-b border-neutral-warm/40 pb-2.5 mb-3">
                    Dining Policies
                  </h3>
                  <ul className="font-sans text-xs text-muted-gray space-y-3 leading-relaxed">
                    <li>
                      <strong>Grace Period:</strong> We hold reservations for 15 minutes past your booked time. After 15 minutes, your table may be released.
                    </li>
                    <li>
                      <strong>Large Groups:</strong> For parties larger than 8, please submit a query through our contact page or call us directly.
                    </li>
                    <li>
                      <strong>Seating Areas:</strong> Seating preference is honored whenever possible, but seating assignment is subject to change based on kitchen flow.
                    </li>
                  </ul>
                </Card>
              </div>

            </form>
          ) : (
            // CONFIRMATION VIEW
            <div className="max-w-md mx-auto">
              <Card className="border border-brand-red/20 bg-cream-light text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />
                
                <div className="inline-flex items-center justify-center h-12 w-12 bg-brand-red-soft rounded-full text-brand-red mb-4 mt-2">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                
                <Badge variant="success" className="mb-2">Confirmed</Badge>
                <h3 className="font-serif text-2xl font-bold mb-1">Reservation Booked!</h3>
                <span className="font-sans text-xs text-muted-gray block mb-6">Reservation Code: <strong>{confirmedReservation.code}</strong></span>

                <div className="h-px bg-neutral-warm/40 my-4" />

                {/* Details list */}
                <div className="space-y-3 text-left font-sans text-sm text-charcoal mb-6">
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Guest Name</span>
                    <span className="font-semibold">{confirmedReservation.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Guests Count</span>
                    <span className="font-semibold">{confirmedReservation.guests} Dining Guests</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Date / Time</span>
                    <span className="font-semibold">{confirmedReservation.date} @ {confirmedReservation.time}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Seating Area</span>
                    <span className="font-semibold uppercase">{confirmedReservation.seatingArea}</span>
                  </div>
                  {confirmedReservation.occasion !== "NONE" && (
                    <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                      <span className="text-muted-gray">Occasion</span>
                      <span className="font-semibold uppercase">{confirmedReservation.occasion}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2.5">
                  <Button
                    onClick={() => {
                      addToast("Add to Calendar mock triggered.", "info");
                    }}
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Add to Calendar (iCal/GCal)
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="sm" className="w-full">
                    Book Another Table
                  </Button>
                </div>
              </Card>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
