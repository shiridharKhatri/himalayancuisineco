"use client";

import * as React from "react";
import { Wine, Calendar, Users, CheckCircle2, RefreshCw, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/stores/uiStore";

export default function AdminCateringPage() {
  const { addToast } = useUIStore();
  const [inquiries, setInquiries] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchCatering = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/catering");
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch catering inquiries", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCatering();
  }, []);

  const handleUpdateStatus = async (inquiryId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/catering", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status }),
      });
      if (res.ok) {
        addToast(`Catering request marked as ${status}`, "success");
        fetchCatering();
      }
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">Catering Inquiries</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Review event banquet requests, guest headcounts, package options, and booking quotes.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchCatering} className="bg-white">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Inquiries
        </Button>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Organizer</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Guest Count</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Estimated Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B51C20] mb-2" />
                    Loading catering requests...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-sans">
                    No catering inquiries found.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{inq.name}</span>
                      <span className="text-[10px] text-neutral-400 block">{inq.phone || inq.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{inq.eventDate}</td>
                    <td className="py-3.5 px-4 font-bold text-[#141414]">{inq.guestCount} Guests</td>
                    <td className="py-3.5 px-4 font-medium text-neutral-700">{inq.packageId || "Custom Banquet"}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#141414]">
                      ${Number(inq.estimatedTotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          inq.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : inq.status === "CONTACTED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inq.status !== "CONFIRMED" && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="text-[11px] py-1 px-2.5 h-7"
                            onClick={() => handleUpdateStatus(inq.id, "CONFIRMED")}
                          >
                            Confirm Booking
                          </Button>
                        )}
                        {inq.status === "INQUIRY" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(inq.id, "CONTACTED")}
                            className="px-2 py-1 rounded text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                          >
                            Mark Contacted
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
