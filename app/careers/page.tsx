"use client";

import * as React from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  User,
  TrendingUp,
  HeartPulse,
  Flame,
  UtensilsCrossed,
  Sparkles,
  UploadCloud,
  FileText,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { useUIStore } from "@/stores/uiStore";
import { OPEN_JOBS } from "@/lib/data";
import { Job } from "@/types";

export default function CareersPage() {
  const { addToast } = useUIStore();

  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);

  // Application Form State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [availability, setAvailability] = React.useState("");
  const [coverLetter, setCoverLetter] = React.useState("");
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // UI Flow State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = "Valid email is required";
    if (!phone.trim() || phone.length < 10) errs.phone = "Valid phone number is required";
    if (!availability.trim()) errs.availability = "Please specify your shift availability";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      addToast("Resume file size must be less than 10MB.", "error");
      return;
    }
    setResumeFile(file);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedJob) {
      addToast("Please complete all required fields.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("jobId", selectedJob.id);
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("availability", availability.trim());
      formData.append("coverLetter", coverLetter.trim());
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      addToast(`Application for ${selectedJob.title} submitted successfully!`, "success");
      setSelectedJob(null);
      setName("");
      setEmail("");
      setPhone("");
      setAvailability("");
      setCoverLetter("");
      setResumeFile(null);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to submit application. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-[#B51C20]" />,
      tag: "Top Industry Wages",
      title: "Competitive Pay & Tips",
      desc: "High baseline wages, reliable scheduling, and transparent kitchen tip-pool sharing on every shift.",
    },
    {
      icon: <HeartPulse className="h-6 w-6 text-[#B51C20]" />,
      tag: "Full-Time Coverage",
      title: "Comprehensive Health",
      desc: "Medical, vision, and dental insurance package options for all full-time culinary and service team members.",
    },
    {
      icon: <Flame className="h-6 w-6 text-[#B51C20]" />,
      tag: "Mastery & Growth",
      title: "Culinary Mentorship",
      desc: "Hands-on training in Himalayan wood-fired cooking, mountain spice blending, and traditional momo craftsmanship.",
    },
    {
      icon: <UtensilsCrossed className="h-6 w-6 text-[#B51C20]" />,
      tag: "Daily Staff Dining",
      title: "Meals & Generous Discounts",
      desc: "Free authentic shift meals, unlimited chai, and 50% family dining discounts across dine-in, takeout, and catering.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      {/* HERO & PERKS SECTION */}
      <section className="relative py-16 lg:py-20 border-b border-neutral-warm/40 bg-cream-light text-center">
        <div className="mx-auto max-w-[1320px] px-6 md:px-12">
          <Badge variant="soft-red" className="mb-2">Careers &amp; Culture</Badge>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-charcoal max-w-4xl mx-auto leading-snug">
            Join Our Culinary Team
          </h1>
          <p className="font-sans text-sm md:text-base text-muted-gray mt-3 max-w-2xl mx-auto leading-relaxed mb-12">
            Help us share the warm spirit of Himalayan hospitality and Nepalese heritage. We invest deeply in our team with top wages, culinary mastery, and comprehensive benefits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-neutral-warm/70 shadow-xs hover:border-charcoal/30 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Icon Container */}
                  <div className="w-12 h-12 rounded-xl bg-[#B51C20]/10 flex items-center justify-center mb-5">
                    {b.icon}
                  </div>

                  {/* Benefit Tag */}
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FCFBF8] border border-neutral-warm/60 font-sans text-[10px] font-bold uppercase tracking-wider text-charcoal/80 mb-2.5">
                    {b.tag}
                  </span>

                  <h3 className="font-serif text-lg font-bold text-charcoal leading-snug mb-2">
                    {b.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-muted-gray leading-relaxed">
                    {b.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-warm/30 flex items-center text-[11px] font-sans font-semibold text-[#B51C20]">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                  <span>Guaranteed perk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPEN POSITIONS */}
      {/* OPEN POSITIONS GRID */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="text-center mb-14">
            <Badge variant="soft-red" className="mb-2">Current Openings</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Open Positions</h2>
            <p className="font-sans text-sm text-muted-gray mt-2">
              Select an opening below to submit your application details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPEN_JOBS.map((job) => (
              <div
                key={job.id}
                className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-neutral-warm/70 shadow-xs hover:border-charcoal/30 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-xl font-bold text-charcoal leading-tight">
                      {job.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-red/10 text-brand-red text-[11px] font-bold uppercase tracking-wider shrink-0">
                      {job.type}
                    </span>
                  </div>

                  {/* Metadata tags */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-sans text-muted-gray pt-0.5">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-red shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand-red shrink-0" />
                      <span>{job.schedule}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center space-x-1 font-bold text-charcoal">
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-muted-gray leading-relaxed pt-2">
                    {job.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-neutral-warm/30 flex items-center justify-between">
                  <span className="font-sans text-xs text-muted-gray/80">
                    Posted recently
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="px-5 py-2.5 rounded-xl bg-[#B51C20] hover:bg-[#9B181B] active:scale-95 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOB APPLY DIALOG MODAL */}
      <Dialog
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? `Apply: ${selectedJob.title}` : ""}
      >
        {selectedJob && (
          <form onSubmit={handleApply} className="space-y-5 text-left">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="Your full name"
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

            <Input
              label="Weekly Shift Availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              error={errors.availability}
              placeholder="e.g. Wednesday to Sunday dinner shifts, full weekends"
            />

            {/* Real Resume Uploader */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                Resume Submission <span className="text-muted-gray font-normal lowercase">(optional)</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              {resumeFile ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-brand-red/30 bg-brand-red/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#B51C20]/10 text-[#B51C20] flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-semibold text-charcoal truncate">
                        {resumeFile.name}
                      </p>
                      <p className="font-sans text-[10px] text-muted-gray">
                        {(resumeFile.size / 1024).toFixed(1)} KB • Ready to submit
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setResumeFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1.5 text-muted-gray hover:text-brand-red rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileChange(e.dataTransfer.files?.[0] || null);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${isDragging
                      ? "border-brand-red bg-brand-red/5"
                      : "border-neutral-warm/80 hover:border-charcoal/40 bg-cream-light/60 hover:bg-cream-light"
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-muted-gray">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-semibold text-charcoal">
                        Click to upload or drag &amp; drop
                      </p>
                      <p className="font-sans text-[11px] text-muted-gray mt-0.5">
                        PDF, DOC, or DOCX (max 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Briefly tell us why you are a good fit for this role..."
                rows={3}
                className="w-full px-4 py-3 rounded-sm border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isSubmitting}
            >
              Submit Application
            </Button>
          </form>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}
