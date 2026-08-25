"use client";

import * as React from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";

export default function ContactPage() {
  const { addToast } = useUIStore();

  // Contact Form State
  const [category, setCategory] = React.useState("general"); // general, order, catering, reservation, feedback
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  
  // Conditional Fields State
  const [orderNumber, setOrderNumber] = React.useState("");
  const [partySize, setPartySize] = React.useState("2");
  const [eventDate, setEventDate] = React.useState("");
  
  const [message, setMessage] = React.useState("");
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = "Valid email is required";
    if (!message.trim()) errs.message = "Message is required";

    if (category === "order" && !orderNumber.trim()) {
      errs.orderNumber = "Order reference number is required for order support";
    }

    if (category === "catering" && !eventDate) {
      errs.eventDate = "Catering date is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please fill in the required fields.", "error");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addToast("Message sent successfully! A coordinator will reply within 4 hours.", "success");
      setIsSubmitting(false);
      setName("");
      setEmail("");
      setPhone("");
      setOrderNumber("");
      setEventDate("");
      setMessage("");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-[1100px] px-6">
          
          {/* Header Text */}
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge variant="soft-red" className="mb-2">Contact Us</Badge>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-charcoal">
              Get in Touch
            </h1>
            <p className="font-sans text-sm md:text-base text-muted-gray mt-3 leading-relaxed">
              Have questions about catering menus, private bookings, or an order? Send us a message and we'll reply shortly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* CONTACT DETAILS (Left) */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <h3 className="font-serif text-xl font-bold border-b border-neutral-warm/40 pb-3 mb-4">
                  Restaurant Information
                </h3>
                <div className="space-y-4 font-sans text-sm text-charcoal">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <strong>Address</strong>
                      <p className="text-muted-gray">123 Himalayan Way, San Francisco, CA 94102</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <strong>Phone</strong>
                      <a href="tel:+14155550199" className="text-muted-gray hover:text-brand-red transition-colors block">
                        (415) 555-0199
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <strong>General Email</strong>
                      <a href="mailto:info@himalayancuisineco.com" className="text-muted-gray hover:text-brand-red transition-colors block">
                        info@himalayancuisineco.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <strong>Kitchen Hours</strong>
                      <p className="text-muted-gray">Lunch: 11:30 AM – 2:30 PM</p>
                      <p className="text-muted-gray">Dinner: 5:00 PM – 10:00 PM</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="font-serif text-lg font-bold mb-2">Parking & Transit</h4>
                <p className="font-sans text-xs text-muted-gray leading-relaxed">
                  Valet parking is available for dinner guests. Public parking garages are located within 2 blocks at Civic Center Plaza. MUNI/BART stop is Civic Center station (4 mins walk).
                </p>
              </Card>
            </div>

            {/* CONDITIONAL CONTACT FORM (Right) */}
            <div className="lg:col-span-7">
              <Card>
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <h3 className="font-serif text-xl font-semibold border-b border-neutral-warm/40 pb-3">
                    Send Message
                  </h3>

                  <Select
                    label="What is your message about?"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[
                      { value: "general", label: "General Dining / Menu Questions" },
                      { value: "order", label: "Order Support (Pickup / Delivery query)" },
                      { value: "catering", label: "Catering & Banquet Event Details" },
                      { value: "reservation", label: "Table Reservation Adjustments" },
                      { value: "feedback", label: "Submit Restaurant Feedback" },
                    ]}
                  />

                  {/* CONDITIONAL FIELD: ORDER NUMBER */}
                  {category === "order" && (
                    <Input
                      label="Order Number / Ticket ID"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      error={errors.orderNumber}
                      placeholder="e.g. HC-100234"
                    />
                  )}

                  {/* CONDITIONAL FIELD: CATERING GUESTS / DATE */}
                  {category === "catering" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                      <Input
                        label="Catering Date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        error={errors.eventDate}
                      />
                      <Select
                        label="Approx. Guests Count"
                        value={partySize}
                        onChange={(e) => setPartySize(e.target.value)}
                        options={[
                          { value: "10", label: "10-20 guests" },
                          { value: "30", label: "20-50 guests" },
                          { value: "60", label: "50-100 guests" },
                          { value: "100", label: "100+ guests" },
                        ]}
                      />
                    </div>
                  )}

                  {/* CONDITIONAL FIELD: RESERVATION GUESTS / DATE */}
                  {category === "reservation" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                      <Input
                        label="Reservation Date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                      />
                      <Select
                        label="Guests"
                        value={partySize}
                        onChange={(e) => setPartySize(e.target.value)}
                        options={[
                          { value: "2", label: "2 Guests" },
                          { value: "4", label: "4 Guests" },
                          { value: "6", label: "6 Guests" },
                          { value: "8", label: "8+ Guests" },
                        ]}
                      />
                    </div>
                  )}

                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    placeholder="Enter your name"
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
                      label="Phone Number (Optional)"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                      Your Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message details here..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-sm border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    />
                    {errors.message && (
                      <p className="font-sans text-xs text-brand-red font-medium">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
