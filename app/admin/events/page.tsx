"use client";

import * as React from "react";
import Image from "next/image";
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Ticket,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useUIStore } from "@/stores/uiStore";

export default function AdminEventsPage() {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = React.useState<"events" | "bookings">("events");

  const [events, setEvents] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = React.useState<any | null>(null);

  // Form
  const [eventForm, setEventForm] = React.useState({
    title: "",
    tagline: "",
    type: "Festival Feast",
    schedule: "October 24, 2026 @ 6:30 PM",
    price: 45.0,
    capacity: 40,
    location: "115 6th St, Glenwood Springs, CO 81601",
    image: "/images/event_dashain.jpg",
    description: "",
    isPublished: true,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch events", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setEventForm({
      title: "",
      tagline: "",
      type: "Festival Feast",
      schedule: "October 24, 2026 @ 6:30 PM",
      price: 45.0,
      capacity: 40,
      location: "115 6th St, Glenwood Springs, CO 81601",
      image: "/images/event_dashain.jpg",
      description: "",
      isPublished: true,
    });
    setIsEventModalOpen(true);
  };

  const openEditModal = (evt: any) => {
    setEditingEvent(evt);
    setEventForm({
      title: evt.title,
      tagline: evt.tagline || "",
      type: evt.type || "Festival Feast",
      schedule: evt.schedule,
      price: evt.price || 45.0,
      capacity: evt.capacity || 40,
      location: evt.location,
      image: evt.image || "/images/event_dashain.jpg",
      description: evt.description,
      isPublished: evt.isPublished,
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.description.trim()) {
      addToast("Please provide event title and description", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEvent) {
        const res = await fetch("/api/admin/events", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingEvent.id, ...eventForm }),
        });
        if (!res.ok) throw new Error("Failed to update event");
        addToast("Event updated successfully!", "success");
      } else {
        const res = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventForm),
        });
        if (!res.ok) throw new Error("Failed to create event");
        addToast("New event published!", "success");
      }
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      addToast(err.message || "Operation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Event removed", "success");
        fetchEvents();
      }
    } catch (err) {
      addToast("Failed to delete event", "error");
    }
  };

  const handleTogglePublish = async (evt: any) => {
    try {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: evt.id, isPublished: !evt.isPublished }),
      });
      if (res.ok) {
        addToast(
          evt.isPublished ? "Event moved to Draft" : "Event published to customer site!",
          "success"
        );
        fetchEvents();
      }
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  // Flatten all bookings
  const allBookings = events.flatMap((e) =>
    (e.bookings || []).map((b: any) => ({ ...b, eventTitle: e.title, eventPrice: e.price }))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">
            Event Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Organize cultural banquets, masterclasses, and manage guest ticket reservations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            className="bg-white border-neutral-200 text-xs font-semibold shadow-2xs h-8.5"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="text-xs font-bold shadow-xs h-8.5"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Event
          </Button>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
            activeTab === "events"
              ? "border-[#B51C20] text-[#B51C20] bg-white shadow-2xs"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Events Catalog</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-100 text-neutral-600">
            {events.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
            activeTab === "bookings"
              ? "border-[#B51C20] text-[#B51C20] bg-white shadow-2xs"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Ticket className="h-4 w-4" />
          <span>Guest RSVPs &amp; Bookings</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-100 text-[#B51C20] font-bold">
            {allBookings.length}
          </span>
        </button>
      </div>

      {/* 3. TAB CONTENT: EVENTS CATALOG */}
      {activeTab === "events" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 rounded-2xl bg-white border border-neutral-200/80 text-center text-neutral-400">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B51C20] mb-2" />
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-neutral-200 text-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-neutral-800">No Events Scheduled</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Create your first cultural dinner or masterclass to allow diners to purchase tickets online.
                </p>
              </div>
              <Button onClick={openCreateModal} variant="primary" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Schedule First Event
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => {
                const bookedSeats = (evt.bookings || []).reduce(
                  (sum: number, b: any) => sum + (b.ticketsCount || 1),
                  0
                );
                const capacity = evt.capacity || 40;
                const percentFull = Math.min(100, Math.round((bookedSeats / capacity) * 100));

                return (
                  <div
                    key={evt.id}
                    className="flex flex-col justify-between rounded-2xl bg-white border border-neutral-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden text-left group"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative aspect-[16/9] w-full bg-neutral-100 overflow-hidden">
                        <Image
                          src={evt.image || "/images/event_dashain.jpg"}
                          alt={evt.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white">
                            {evt.type}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(evt)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-all cursor-pointer ${
                              evt.isPublished
                                ? "bg-emerald-500 text-white"
                                : "bg-neutral-800/80 text-neutral-300"
                            }`}
                          >
                            {evt.isPublished ? "Live" : "Draft"}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-[#141414] leading-snug">
                            {evt.title}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 text-xs text-neutral-600 font-sans border-t border-neutral-100">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-[#B51C20] shrink-0" />
                            <span className="font-semibold text-neutral-800">{evt.schedule}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="font-bold text-neutral-900">${evt.price.toFixed(2)} / ticket</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate text-neutral-400 text-[11px]">{evt.location}</span>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="pt-2">
                          <div className="flex justify-between text-[10px] font-bold text-neutral-500 mb-1">
                            <span>RSVPs: {bookedSeats} / {capacity} seats</span>
                            <span>{percentFull}% Full</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                            <div
                              className="h-full bg-[#B51C20] rounded-full transition-all duration-500"
                              style={{ width: `${percentFull}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-neutral-400 font-mono">
                        {(evt.bookings || []).length} booking{evt.bookings?.length === 1 ? "" : "s"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-white transition-colors cursor-pointer shadow-2xs"
                          title="Edit Event"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-[#B51C20] hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: GUEST RSVPS TABLE */}
      {activeTab === "bookings" && (
        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4 text-center">Tickets</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {allBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400 font-sans">
                      No event bookings or ticket purchases yet.
                    </td>
                  </tr>
                ) : (
                  allBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        {b.customerName}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-neutral-800">
                        {b.eventTitle}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#B51C20]">
                        {b.ticketsCount} seat{b.ticketsCount === 1 ? "" : "s"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-neutral-500">
                          <div>{b.customerEmail}</div>
                          <div>{b.customerPhone}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(b)}
                          className="bg-white text-xs h-7 px-3"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CREATE / EDIT EVENT MODAL */}
      <Dialog
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEvent ? "Edit Event" : "Create New Event"}
      >
        <form onSubmit={handleSaveEvent} className="space-y-4 pt-1 font-sans text-xs">
          <div>
            <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder="e.g. Dashain Harvest Feast, Himalayan Cooking Masterclass"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Event Type
              </label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20] cursor-pointer"
              >
                <option value="Festival Feast">Festival Feast</option>
                <option value="Culinary Class">Culinary Class</option>
                <option value="Tasting Dinner">Tasting Dinner</option>
                <option value="Community Banquet">Community Banquet</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Ticket Price ($)
              </label>
              <input
                type="number"
                step="0.5"
                value={eventForm.price}
                onChange={(e) => setEventForm({ ...eventForm, price: parseFloat(e.target.value) || 0 })}
                placeholder="45.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Schedule (Date &amp; Time) *
              </label>
              <input
                type="text"
                required
                value={eventForm.schedule}
                onChange={(e) => setEventForm({ ...eventForm, schedule: e.target.value })}
                placeholder="e.g. October 24, 2026 @ 6:30 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Max Capacity (Seats)
              </label>
              <input
                type="number"
                value={eventForm.capacity}
                onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value, 10) || 40 })}
                placeholder="40"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Location
              </label>
              <input
                type="text"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="Main Dining Hall, 115 6th St"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Cover Image Path / URL
              </label>
              <input
                type="text"
                value={eventForm.image}
                onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                placeholder="/images/event_dashain.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
              Description &amp; Menu Highlights *
            </label>
            <textarea
              required
              rows={4}
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="Describe the banquet courses, masterclass schedule, live music, and pairing details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20] transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="eventPublished"
              checked={eventForm.isPublished}
              onChange={(e) => setEventForm({ ...eventForm, isPublished: e.target.checked })}
              className="h-4 w-4 rounded text-[#B51C20] accent-[#B51C20] cursor-pointer"
            />
            <label htmlFor="eventPublished" className="text-xs font-semibold text-neutral-800 cursor-pointer">
              Publish immediately to public Events page
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEventModalOpen(false)}
              className="bg-white text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="text-xs font-bold h-9"
            >
              {editingEvent ? "Save Changes" : "Publish Event"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 6. BOOKING DETAILS MODAL */}
      <Dialog
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Guest RSVP &amp; Ticket Details"
      >
        {selectedBooking && (
          <div className="space-y-4 pt-1 font-sans text-xs">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-neutral-900">{selectedBooking.customerName}</h3>
                  <p className="text-neutral-500 font-medium">
                    Event: <span className="text-[#B51C20] font-bold">{selectedBooking.eventTitle}</span>
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedBooking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60 text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{selectedBooking.customerEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{selectedBooking.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Seats Reserved
                </span>
                <span className="text-base font-bold text-neutral-900 mt-0.5 block">
                  {selectedBooking.ticketsCount} ticket{selectedBooking.ticketsCount === 1 ? "" : "s"}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Total Paid / Due
                </span>
                <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                  ${(selectedBooking.ticketsCount * (selectedBooking.eventPrice || 45)).toFixed(2)}
                </span>
              </div>
            </div>

            {selectedBooking.notes && (
              <div>
                <label className="block font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">
                  Special Dietary or Seating Notes
                </label>
                <p className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-700">
                  {selectedBooking.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
