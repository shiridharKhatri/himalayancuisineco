"use client";

import * as React from "react";
import {
  Briefcase,
  FileText,
  Phone,
  Mail,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  DollarSign,
  Eye,
  EyeOff,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useUIStore } from "@/stores/uiStore";

export default function AdminCareersPage() {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = React.useState<"jobs" | "applicants">("jobs");

  // State
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = React.useState(true);
  const [isLoadingApps, setIsLoadingApps] = React.useState(true);

  // Modals
  const [isJobModalOpen, setIsJobModalOpen] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<any | null>(null);
  const [isDeletingJobId, setIsDeletingJobId] = React.useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = React.useState<any | null>(null);

  // Job Form Data
  const [jobForm, setJobForm] = React.useState({
    title: "",
    location: "115 6th St, Glenwood Springs, CO 81601",
    type: "Full-time",
    schedule: "Evenings & Weekends",
    salary: "$20 - $26/hr + Tips",
    description: "",
    isPublished: true,
  });
  const [isSubmittingJob, setIsSubmittingJob] = React.useState(false);

  // Fetch Jobs
  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch jobs", "error");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Fetch Applications
  const fetchApplications = async () => {
    setIsLoadingApps(true);
    try {
      const res = await fetch("/api/admin/applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch applications", "error");
    } finally {
      setIsLoadingApps(false);
    }
  };

  React.useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const openCreateJobModal = () => {
    setEditingJob(null);
    setJobForm({
      title: "",
      location: "115 6th St, Glenwood Springs, CO 81601",
      type: "Full-time",
      schedule: "Evenings & Weekends",
      salary: "$20 - $26/hr + Tips",
      description: "",
      isPublished: true,
    });
    setIsJobModalOpen(true);
  };

  const openEditJobModal = (job: any) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      location: job.location,
      type: job.type,
      schedule: job.schedule,
      salary: job.salary || "",
      description: job.description,
      isPublished: job.isPublished,
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      addToast("Please provide job title and description", "error");
      return;
    }

    setIsSubmittingJob(true);
    try {
      if (editingJob) {
        const res = await fetch("/api/admin/jobs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingJob.id, ...jobForm }),
        });
        if (!res.ok) throw new Error("Failed to update job");
        addToast("Job opening updated successfully!", "success");
      } else {
        const res = await fetch("/api/admin/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobForm),
        });
        if (!res.ok) throw new Error("Failed to create job");
        addToast("New job opening published!", "success");
      }
      setIsJobModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      addToast(err.message || "Operation failed", "error");
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/jobs?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast("Job position removed", "success");
        fetchJobs();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      addToast("Error deleting job", "error");
    } finally {
      setIsDeletingJobId(null);
    }
  };

  const handleTogglePublish = async (job: any) => {
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, isPublished: !job.isPublished }),
      });
      if (res.ok) {
        addToast(
          job.isPublished ? "Job moved to Draft" : "Job published to careers page!",
          "success"
        );
        fetchJobs();
      }
    } catch (err) {
      addToast("Failed to toggle status", "error");
    }
  };

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
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & MAIN ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">
            Careers &amp; Job Openings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Post and manage restaurant job openings, review candidate resumes, and track hiring decisions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchJobs();
              fetchApplications();
            }}
            className="bg-white border-neutral-200 text-xs font-semibold shadow-2xs h-8.5"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={openCreateJobModal}
            className="text-xs font-bold shadow-xs h-8.5"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* 2. TAB TOGGLES */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
            activeTab === "jobs"
              ? "border-[#B51C20] text-[#B51C20] bg-white shadow-2xs"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Job Openings</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-100 text-neutral-600">
            {jobs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("applicants")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
            activeTab === "applicants"
              ? "border-[#B51C20] text-[#B51C20] bg-white shadow-2xs"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Candidate Applications</span>
          {applications.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-100 text-[#B51C20] font-bold">
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. TAB CONTENT: JOB OPENINGS LIST */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Active Restaurant Postings ({jobs.length})
            </span>
          </div>

          {isLoadingJobs ? (
            <div className="p-12 rounded-2xl bg-white border border-neutral-200/80 text-center text-neutral-400">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B51C20] mb-2" />
              Loading open positions...
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-neutral-200 text-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-neutral-800">No Job Openings Posted</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Create your first job opening to start receiving candidate applications online.
                </p>
              </div>
              <Button onClick={openCreateJobModal} variant="primary" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add First Job Opening
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 mb-1.5">
                          {job.type}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#141414] leading-snug">
                          {job.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTogglePublish(job)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                          job.isPublished
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                        }`}
                        title="Click to toggle published / draft status"
                      >
                        {job.isPublished ? "Live" : "Draft"}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="space-y-1.5 pt-1 text-xs text-neutral-600 font-sans">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{job.schedule}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-neutral-800">{job.salary}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate text-neutral-400 text-[11px]">{job.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Applicant count */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-neutral-500 font-mono">
                      {job._count?.applications || 0} candidate{job._count?.applications === 1 ? "" : "s"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditJobModal(job)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Edit Job Opening"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-[#B51C20] hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: CANDIDATE APPLICATIONS TABLE */}
      {activeTab === "applicants" && (
        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Position Applied</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Review Candidate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {isLoadingApps ? (
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
                      <td className="py-3.5 px-4 font-medium text-neutral-800">
                        {app.job?.title || "General Application"}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500">
                        {app.availability}
                      </td>
                      <td className="py-3.5 px-4">
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#B51C20] hover:underline font-semibold"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Resume
                          </a>
                        ) : (
                          <span className="text-neutral-400 italic">None attached</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.status === "HIRED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : app.status === "INTERVIEWED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : app.status === "REJECTED"
                              ? "bg-neutral-100 text-neutral-500"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplicant(app)}
                          className="bg-white text-xs h-7 px-3"
                        >
                          Details &amp; Action
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

      {/* 5. CREATE / EDIT JOB MODAL */}
      <Dialog
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        title={editingJob ? "Edit Job Opening" : "Post New Job Opening"}
      >
        <form onSubmit={handleSaveJob} className="space-y-4 pt-1 font-sans text-xs">
          <div>
            <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              placeholder="e.g. Line Cook & Prep Chef, Dining Server, Kitchen Lead"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Employment Type
              </label>
              <select
                value={jobForm.type}
                onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20] cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Seasonal">Seasonal</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Compensation / Salary
              </label>
              <input
                type="text"
                value={jobForm.salary}
                onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                placeholder="e.g. $22 - $28/hr + Tips"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Shift Schedule
              </label>
              <input
                type="text"
                value={jobForm.schedule}
                onChange={(e) => setJobForm({ ...jobForm, schedule: e.target.value })}
                placeholder="e.g. Evenings & Weekends (30-40 hrs)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Work Location
              </label>
              <input
                type="text"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                placeholder="115 6th St, Glenwood Springs, CO"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
              Job Description &amp; Responsibilities *
            </label>
            <textarea
              required
              rows={4}
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              placeholder="Describe the role responsibilities, experience requirements, and perks..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20] transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPublished"
              checked={jobForm.isPublished}
              onChange={(e) => setJobForm({ ...jobForm, isPublished: e.target.checked })}
              className="h-4 w-4 rounded text-[#B51C20] accent-[#B51C20] cursor-pointer"
            />
            <label htmlFor="isPublished" className="text-xs font-semibold text-neutral-800 cursor-pointer">
              Publish immediately to public Careers page
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsJobModalOpen(false)}
              className="bg-white text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingJob}
              className="text-xs font-bold h-9"
            >
              {editingJob ? "Save Changes" : "Publish Job Opening"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 6. APPLICANT REVIEW MODAL */}
      <Dialog
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        title="Candidate Application Review"
      >
        {selectedApplicant && (
          <div className="space-y-4 pt-1 font-sans text-xs">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-neutral-900">{selectedApplicant.name}</h3>
                  <p className="text-neutral-500 font-medium">
                    Applied for: <span className="text-[#B51C20] font-bold">{selectedApplicant.job?.title || "General Role"}</span>
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B51C20] text-white">
                  {selectedApplicant.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60 text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-neutral-400" />
                  <a href={`mailto:${selectedApplicant.email}`} className="text-[#B51C20] hover:underline">
                    {selectedApplicant.email}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-neutral-400" />
                  <a href={`tel:${selectedApplicant.phone}`} className="hover:underline">
                    {selectedApplicant.phone}
                  </a>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">
                Shift Availability
              </label>
              <p className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-800 font-medium">
                {selectedApplicant.availability}
              </p>
            </div>

            {selectedApplicant.coverLetter && (
              <div>
                <label className="block font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">
                  Candidate Note / Cover Letter
                </label>
                <p className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-700 leading-relaxed">
                  {selectedApplicant.coverLetter}
                </p>
              </div>
            )}

            <div>
              <label className="block font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">
                Resume Document
              </label>
              {selectedApplicant.resumeUrl ? (
                <a
                  href={selectedApplicant.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-red-50/50 hover:bg-red-50 border border-red-200/60 rounded-xl text-[#B51C20] font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Download / View Resume</span>
                  </span>
                  <span className="text-[10px] underline">Open file &rarr;</span>
                </a>
              ) : (
                <p className="text-neutral-400 italic">No resume file attached.</p>
              )}
            </div>

            {/* Status Workflow Action Buttons */}
            <div className="pt-4 border-t border-neutral-200">
              <label className="block font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-2">
                Advance Hiring Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApplicant.id, "REVIEWED")}
                  className="py-2 px-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 font-bold text-[11px] text-neutral-700 transition-colors"
                >
                  Mark Reviewed
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApplicant.id, "INTERVIEWED")}
                  className="py-2 px-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 font-bold text-[11px] text-blue-700 transition-colors"
                >
                  Interview
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApplicant.id, "HIRED")}
                  className="py-2 px-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 font-bold text-[11px] text-emerald-700 transition-colors"
                >
                  Hire
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApplicant.id, "REJECTED")}
                  className="py-2 px-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 font-bold text-[11px] text-neutral-500 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
