"use client";

import * as React from "react";
import { Briefcase, FileText, Phone, Mail, Clock, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useUIStore } from "@/stores/uiStore";

export default function AdminCareersPage() {
  const { addToast } = useUIStore();
  const [applications, setApplications] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedApplicant, setSelectedApplicant] = React.useState<any | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch applications", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      if (res.ok) {
        addToast(`Applicant status updated to ${status}`, "success");
        if (selectedApplicant && selectedApplicant.id === applicationId) {
          setSelectedApplicant((prev: any) => ({ ...prev, status }));
        }
        fetchApplications();
      }
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">Job Applications</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Review candidate resumes, shift availability, and advance hiring decisions.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchApplications} className="bg-white">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Candidates
        </Button>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Position Applied</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Resume</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review Candidate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B51C20] mb-2" />
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 font-sans">
                    No candidate applications submitted yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{app.name}</span>
                      <span className="text-[10px] text-neutral-400 block">{app.phone || app.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-800">
                      {app.job?.title || "Culinary Specialist"}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 max-w-[200px] truncate">
                      {app.availability}
                    </td>
                    <td className="py-3.5 px-4">
                      {app.resumeUrl && app.resumeUrl !== "No file attached" ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#B51C20] hover:underline font-semibold"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Resume</span>
                        </a>
                      ) : (
                        <span className="text-neutral-400 italic">No File</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          app.status === "HIRED"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "INTERVIEWED"
                            ? "bg-blue-100 text-blue-800"
                            : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 py-1 px-3 bg-white"
                        onClick={() => setSelectedApplicant(app)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICANT REVIEW DIALOG */}
      <Dialog
        isOpen={Boolean(selectedApplicant)}
        onClose={() => setSelectedApplicant(null)}
        title={selectedApplicant ? `Application: ${selectedApplicant.name}` : "Application Review"}
      >
        {selectedApplicant && (
          <div className="space-y-5 text-left text-xs font-sans">
            {/* Status Workflow Action Bar */}
            <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Stage:</span>
                <span className="font-semibold text-neutral-800">{selectedApplicant.status}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["NEW", "REVIEWED", "INTERVIEWED", "HIRED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedApplicant.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      selectedApplicant.status === st
                        ? "bg-[#B51C20] text-white shadow-xs"
                        : "bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Details */}
            <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Candidate Contact</span>
                <p className="font-bold text-neutral-900 text-sm">{selectedApplicant.name}</p>
                <div className="flex flex-wrap gap-4 mt-1">
                  <span className="text-neutral-600 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-neutral-400" />
                    {selectedApplicant.phone}
                  </span>
                  <span className="text-neutral-600 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-neutral-400" />
                    {selectedApplicant.email}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Shift Availability</span>
                <p className="text-neutral-800 font-medium">{selectedApplicant.availability}</p>
              </div>

              {selectedApplicant.coverLetter && (
                <div className="pt-2 border-t border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Cover Letter</span>
                  <p className="text-neutral-700 italic bg-neutral-50 p-3 rounded-lg border border-neutral-200 whitespace-pre-wrap">
                    &ldquo;{selectedApplicant.coverLetter}&rdquo;
                  </p>
                </div>
              )}

              {selectedApplicant.resumeUrl && selectedApplicant.resumeUrl !== "No file attached" && (
                <div className="pt-2 border-t border-neutral-100">
                  <a
                    href={selectedApplicant.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#B51C20]/10 text-[#B51C20] font-semibold hover:bg-[#B51C20]/20 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download Candidate Resume ({selectedApplicant.resumeUrl.split("/").pop()})</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
