"use client";

import * as React from "react";
import { Briefcase, MapPin, Clock, DollarSign, CheckCircle2, User } from "lucide-react";
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
  const [resumeUrl, setResumeUrl] = React.useState("mock-resume.pdf");

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

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please complete all required fields.", "error");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addToast(`Application for ${selectedJob?.title} submitted successfully!`, "success");
      setIsSubmitting(false);
      setSelectedJob(null);
      setName("");
      setEmail("");
      setPhone("");
      setAvailability("");
      setCoverLetter("");
    }, 1500);
  };

  const benefits = [
    { title: "Competitive Pay", desc: "Top wages, consistent shift scheduling, and kitchen tip-share splits." },
    { title: "Health & Care", desc: "Medical and dental insurance coverage allocations for full-time members." },
    { title: "Culinary Training", desc: "Learn traditional mountain spice roasting and artisanal folding techniques." },
    { title: "Dining Discounts", desc: "Generous meal allowances and off-duty discounts across food and catering." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      {/* HERO */}
      <section className="relative py-20 lg:py-24 border-b border-neutral-warm/40 bg-cream-light text-center">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <Badge variant="soft-red" className="mb-2">Careers</Badge>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            Join Our Culinary Team
          </h1>
          <p className="font-sans text-sm md:text-base text-muted-gray mt-4 max-w-2xl mx-auto leading-relaxed">
            Help us share the warm spirit of Himalayan hospitality and Nepalese heritage. Explore our open kitchen and service roles.
          </p>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-16 md:py-20 border-b border-neutral-warm/40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
              Why Work at Himalayan?
            </h2>
            <p className="font-sans text-xs md:text-sm text-muted-gray mt-2">
              We invest in our staff with benefits, training, and a respectful kitchen culture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {benefits.map((b) => (
              <div key={b.title} className="bg-cream-light p-6 border border-neutral-warm/30 rounded-sm">
                <h4 className="font-serif text-lg font-bold text-charcoal mb-2">{b.title}</h4>
                <p className="font-sans text-xs text-muted-gray leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPEN POSITIONS */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="text-center mb-16">
            <Badge variant="soft-red" className="mb-2">Current Openings</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Open Positions</h2>
            <p className="font-sans text-sm text-muted-gray mt-2">
              Select an opening below to submit your application details.
            </p>
          </div>

          <div className="space-y-6">
            {OPEN_JOBS.map((job) => (
              <Card key={job.id} hoverable padded={false} className="border border-neutral-warm text-left">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl font-bold text-charcoal">
                      {job.title}
                    </h3>
                    
                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-muted-gray">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5 text-brand-red" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-brand-red" />
                        <span>{job.type} ({job.schedule})</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center space-x-1 font-semibold text-charcoal">
                          <span>{job.salary}</span>
                        </div>
                      )}
                    </div>

                    <p className="font-sans text-xs md:text-sm text-muted-gray leading-relaxed max-w-2xl pt-1">
                      {job.description}
                    </p>
                  </div>

                  <Button
                    onClick={() => setSelectedJob(job)}
                    variant="primary"
                    size="sm"
                    className="shrink-0"
                  >
                    Apply Now
                  </Button>
                </div>
              </Card>
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

            <div className="flex flex-col space-y-1.5">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                Resume Submission
              </label>
              <div className="border border-dashed border-neutral-warm rounded-sm p-4 bg-cream-dark/20 text-center text-xs text-muted-gray">
                {resumeUrl ? (
                  <span className="text-brand-red-dark font-semibold">✓ {resumeUrl} (Pre-loaded Mock)</span>
                ) : (
                  <span>Click to select PDF resume file</span>
                )}
              </div>
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
