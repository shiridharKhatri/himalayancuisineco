"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";

export default function AdminReservationsPage() {
  const { addToast } = useUIStore();
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [activeStatus, setActiveStatus] = React.useState("ALL");
  const [dateFilter, setDateFilter] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations?status=${activeStatus}&date=${dateFilter}`);
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch reservations", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReservations();
  }, [activeStatus, dateFilter]);

  const handleUpdateStatus = async (reservationId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId, status }),
      });
      if (res.ok) {
        addToast(`Reservation marked as ${status}`, "success");
        fetchReservations();
      }
    } catch (err) {
      addToast("Failed to update reservation", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">Table Reservations</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Manage guest seating, dining party schedules, and table reservations.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchReservations} className="bg-white">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Bookings
        </Button>
      </div>

      {/* FILTER ROW */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "CONFIRMED", "SEATED", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeStatus === st
                  ? "bg-[#B51C20] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-semibold uppercase">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter("")}
              className="text-xs text-[#B51C20] font-semibold hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* RESERVATIONS TABLE */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Party Size</th>
                <th className="py-3 px-4">Seating Area</th>
                <th className="py-3 px-4">Occasion / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Seating Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B51C20] mb-2" />
                    Loading reservations...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-sans">
                    No table reservations found.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{r.name}</span>
                      <span className="text-[10px] text-neutral-400 block">{r.phone || r.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      <span className="text-neutral-900 block">{r.date}</span>
                      <span className="text-neutral-500 text-[10px]">{r.time}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#141414]">
                      {r.guests} Guests
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 capitalize">
                      {r.seatingArea || "Main Dining Hall"}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      {r.occasion && (
                        <span className="font-semibold text-[#B51C20] block">{r.occasion}</span>
                      )}
                      <span className="text-neutral-500 truncate block text-[11px]">
                        {r.notes || "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          r.status === "SEATED"
                            ? "bg-blue-100 text-blue-800"
                            : r.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="text-[11px] py-1 px-2.5 h-7"
                            onClick={() => handleUpdateStatus(r.id, "SEATED")}
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                            Seat Party
                          </Button>
                        )}
                        {r.status !== "CANCELLED" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(r.id, "CANCELLED")}
                            className="px-2 py-1 rounded text-[10px] text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
