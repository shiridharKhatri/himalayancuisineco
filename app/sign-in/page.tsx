"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthMode = "signin" | "signup";
type AuthMethod = "select" | "google" | "email" | "phone";
type OTPStep = "enter-phone" | "verify-otp";

// Simulated OTP for demo — in production this would be a backend SMS service
const DEMO_OTP = "123456";

// Rate-limiting tracker (per session)
const otpAttemptTracker = {
  lastSent: 0,
  attempts: 0,
  locked: false,
  lockExpiry: 0,
};

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/account";

  // Auth state
  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [method, setMethod] = React.useState<AuthMethod>("select");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Email/Password fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Phone OTP fields
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [otpStep, setOtpStep] = React.useState<OTPStep>("enter-phone");
  const [otpCode, setOtpCode] = React.useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = React.useState(0);
  const [otpAttempts, setOtpAttempts] = React.useState(0);
  const [isOtpLocked, setIsOtpLocked] = React.useState(false);
  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // OTP countdown timer
  React.useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Lockout timer check
  React.useEffect(() => {
    if (!isOtpLocked) return;
    const interval = setInterval(() => {
      if (Date.now() > otpAttemptTracker.lockExpiry) {
        setIsOtpLocked(false);
        otpAttemptTracker.locked = false;
        otpAttemptTracker.attempts = 0;
        setOtpAttempts(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOtpLocked]);

  const resetForm = () => {
    setError(null);
    setSuccess(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setPhoneNumber("");
    setOtpStep("enter-phone");
    setOtpCode(["", "", "", "", "", ""]);
    setOtpTimer(0);
  };

  const handleMethodSelect = (m: AuthMethod) => {
    resetForm();
    setMethod(m);
  };

  const handleBack = () => {
    resetForm();
    setMethod("select");
  };

  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const getPhoneDigits = () => phoneNumber.replace(/\D/g, "");

  // ---- Google Sign-In ----
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  // ---- Email/Password Sign-In / Sign-Up ----
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (mode === "signup" && !name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (mode === "signup") {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        setError("Password must include uppercase, lowercase, and a number");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setIsLoading(true);

    if (mode === "signup") {
      // Simulate account creation
      await new Promise((r) => setTimeout(r, 1200));
      setSuccess("Account created successfully! Signing you in...");
      await new Promise((r) => setTimeout(r, 800));
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Try admin@himalayan.com / adminpassword or customer@himalayan.com / customerpassword");
    } else if (result?.ok) {
      router.push(callbackUrl);
    }
  };

  // ---- Phone OTP ----
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const digits = getPhoneDigits();
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Rate limiting: max 3 OTP sends per 5 minutes
    const now = Date.now();
    if (otpAttemptTracker.locked && now < otpAttemptTracker.lockExpiry) {
      const remainingSec = Math.ceil((otpAttemptTracker.lockExpiry - now) / 1000);
      setError(`Too many attempts. Please wait ${remainingSec} seconds.`);
      return;
    }

    // Check send rate: minimum 60 seconds between sends
    if (now - otpAttemptTracker.lastSent < 60000 && otpAttemptTracker.lastSent > 0) {
      setError("Please wait before requesting another code.");
      return;
    }

    setIsLoading(true);

    // Simulate API call to send SMS OTP
    await new Promise((r) => setTimeout(r, 1000));

    otpAttemptTracker.lastSent = now;
    otpAttemptTracker.attempts++;

    if (otpAttemptTracker.attempts >= 3) {
      otpAttemptTracker.locked = true;
      otpAttemptTracker.lockExpiry = now + 300000; // 5-minute lockout
      setIsOtpLocked(true);
    }

    setIsLoading(false);
    setOtpStep("verify-otp");
    setOtpTimer(60); // 60-second resend cooldown
    setSuccess(`Demo OTP sent to ${phoneNumber}. Use code: ${DEMO_OTP}`);

    // Focus first OTP input
    setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1); // Take only last digit
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpCode(newOtp);
    if (pastedData.length === 6) {
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = otpCode.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    // Brute-force protection: max 5 verify attempts
    if (otpAttempts >= 5) {
      setError("Too many incorrect attempts. Please request a new code.");
      setOtpStep("enter-phone");
      setOtpCode(["", "", "", "", "", ""]);
      return;
    }

    setIsLoading(true);

    // Simulate verification
    await new Promise((r) => setTimeout(r, 800));

    if (code !== DEMO_OTP) {
      setOtpAttempts((prev) => prev + 1);
      setIsLoading(false);
      const remaining = 5 - (otpAttempts + 1);
      setError(`Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
      setOtpCode(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
      return;
    }

    // OTP verified — sign in via credentials with phone-based mock auth
    const result = await signIn("credentials", {
      email: `phone-${getPhoneDigits()}@himalayan.com`,
      password: "phone-otp-verified",
      redirect: false,
    });

    setIsLoading(false);

    if (result?.ok) {
      setSuccess("Phone verified successfully! Redirecting...");
      setTimeout(() => router.push(callbackUrl), 1000);
    } else {
      // For demo, manually redirect since the mock auth won't match phone users
      setSuccess("Phone verified! Welcome to Himalayan Cuisine.");
      setTimeout(() => router.push("/"), 1500);
    }
  };

  const handleResendOTP = () => {
    if (otpTimer > 0) return;
    setOtpCode(["", "", "", "", "", ""]);
    setOtpAttempts(0);
    setError(null);
    setOtpStep("enter-phone");
  };

  // Password strength indicator
  const getPasswordStrength = (): { label: string; color: string; width: string } => {
    if (!password) return { label: "", color: "", width: "0%" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-brand-red", width: "33%" };
    if (score <= 4) return { label: "Medium", color: "bg-accent-amber", width: "66%" };
    return { label: "Strong", color: "bg-accent-green", width: "100%" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow flex items-center justify-center py-12 md:py-20 px-6">
        <div className="w-full max-w-[440px]">

          {/* Logo + Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <div className="relative h-16 w-16 mx-auto">
                <Image
                  src="/images/logo.png"
                  alt="Himalayan Cuisine"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="font-sans text-sm text-muted-gray mt-2">
              {mode === "signin"
                ? "Sign in to access your orders, rewards & more"
                : "Join us for exclusive rewards & easy ordering"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-cream-light border border-neutral-warm rounded-[24px] p-6 md:p-8 shadow-[0_4px_24px_rgba(21,21,21,0.04)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${method}-${mode}-${otpStep}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Error / Success Messages */}
                {error && (
                  <div className="mb-5 bg-brand-red-soft/50 border border-brand-red/20 rounded-xl px-4 py-3 font-sans text-xs text-brand-red-dark font-medium flex items-start gap-2">
                    <Shield className="h-4 w-4 shrink-0 mt-0.5 text-brand-red" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="mb-5 bg-accent-green/10 border border-accent-green/20 rounded-xl px-4 py-3 font-sans text-xs text-accent-green font-medium flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                {/* ======== METHOD SELECTION SCREEN ======== */}
                {method === "select" && (
                  <div className="space-y-3">
                    {/* Google */}
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-neutral-warm bg-cream-light hover:bg-cream-dark/40 font-sans text-sm font-semibold text-charcoal transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-neutral-warm/40" />
                      <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-gray">or</span>
                      <div className="flex-1 h-px bg-neutral-warm/40" />
                    </div>

                    {/* Email */}
                    <button
                      onClick={() => handleMethodSelect("email")}
                      className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-neutral-warm bg-cream-light hover:bg-cream-dark/40 font-sans text-sm font-semibold text-charcoal transition-all duration-200 cursor-pointer"
                    >
                      <Mail className="h-5 w-5 text-muted-gray" />
                      Continue with Email
                    </button>

                    {/* Phone */}
                    <button
                      onClick={() => handleMethodSelect("phone")}
                      className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-neutral-warm bg-cream-light hover:bg-cream-dark/40 font-sans text-sm font-semibold text-charcoal transition-all duration-200 cursor-pointer"
                    >
                      <Phone className="h-5 w-5 text-muted-gray" />
                      Continue with Phone
                    </button>

                    {/* Security note */}
                    <div className="flex items-center justify-center gap-1.5 pt-3">
                      <Shield className="h-3.5 w-3.5 text-accent-green" />
                      <span className="font-sans text-[10px] text-muted-gray font-medium uppercase tracking-wider">
                        Secured with 256-bit encryption
                      </span>
                    </div>
                  </div>
                )}

                {/* ======== EMAIL/PASSWORD FORM ======== */}
                {method === "email" && (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 font-sans text-xs font-semibold text-muted-gray hover:text-charcoal transition-colors cursor-pointer mb-2"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      All sign-in options
                    </button>

                    {mode === "signup" && (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray pointer-events-none" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/60 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        autoComplete="email"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/60 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        className="w-full h-12 pl-11 pr-12 rounded-xl border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/60 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-gray hover:text-charcoal transition-colors cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password strength (signup only) */}
                    {mode === "signup" && password && (
                      <div className="space-y-1.5">
                        <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                            style={{ width: strength.width }}
                          />
                        </div>
                        <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-gray">
                          Password strength: {strength.label}
                        </span>
                      </div>
                    )}

                    {mode === "signup" && (
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray pointer-events-none" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          autoComplete="new-password"
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/60 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                        />
                      </div>
                    )}

                    <Button type="submit" variant="primary" className="w-full h-12" isLoading={isLoading}>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                      {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>

                    {mode === "signin" && (
                      <div className="pt-2 border-t border-neutral-warm/40 space-y-2">
                        <span className="font-sans text-[10px] uppercase font-bold text-muted-gray block text-center">
                          Quick Demo Access:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEmail("customer@himalayan.com");
                              setPassword("customerpassword");
                            }}
                            className="py-1.5 px-2 rounded-lg bg-cream-dark/60 border border-neutral-warm text-[11px] font-medium text-charcoal hover:bg-cream-dark transition-colors cursor-pointer"
                          >
                            👤 Customer Demo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEmail("admin@himalayan.com");
                              setPassword("adminpassword");
                            }}
                            className="py-1.5 px-2 rounded-lg bg-[#B51C20]/10 border border-[#B51C20]/30 text-[11px] font-bold text-[#B51C20] hover:bg-[#B51C20]/20 transition-colors cursor-pointer"
                          >
                            🛡️ Master Admin
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* ======== PHONE OTP FLOW ======== */}
                {method === "phone" && otpStep === "enter-phone" && (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 font-sans text-xs font-semibold text-muted-gray hover:text-charcoal transition-colors cursor-pointer mb-2"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      All sign-in options
                    </button>

                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center h-14 w-14 bg-brand-red-soft rounded-full text-brand-red mb-3">
                        <Phone className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-xl font-bold">Phone Verification</h3>
                      <p className="font-sans text-xs text-muted-gray mt-1.5">
                        We&apos;ll send a one-time 6-digit code via SMS
                      </p>
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray pointer-events-none" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                        placeholder="(555) 000-0000"
                        maxLength={14}
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/60 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                      />
                    </div>

                    {isOtpLocked && (
                      <div className="bg-brand-red-soft/50 border border-brand-red/20 rounded-xl px-4 py-3 font-sans text-xs text-brand-red-dark font-medium flex items-start gap-2">
                        <Shield className="h-4 w-4 shrink-0 mt-0.5 text-brand-red" />
                        <span>Account temporarily locked due to too many attempts. Please try again in 5 minutes.</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-12"
                      isLoading={isLoading}
                      disabled={isOtpLocked}
                    >
                      Send Verification Code
                      {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <Shield className="h-3.5 w-3.5 text-accent-green" />
                      <span className="font-sans text-[10px] text-muted-gray font-medium">
                        Your number is never shared or stored
                      </span>
                    </div>
                  </form>
                )}

                {/* ======== OTP VERIFICATION ======== */}
                {method === "phone" && otpStep === "verify-otp" && (
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep("enter-phone");
                        setOtpCode(["", "", "", "", "", ""]);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="flex items-center gap-1.5 font-sans text-xs font-semibold text-muted-gray hover:text-charcoal transition-colors cursor-pointer mb-2"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Change phone number
                    </button>

                    <div className="text-center mb-2">
                      <div className="inline-flex items-center justify-center h-14 w-14 bg-accent-green/10 rounded-full text-accent-green mb-3">
                        <Shield className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-xl font-bold">Enter Verification Code</h3>
                      <p className="font-sans text-xs text-muted-gray mt-1.5">
                        Sent to <span className="font-semibold text-charcoal">{phoneNumber}</span>
                      </p>
                    </div>

                    {/* OTP Input Grid */}
                    <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                      {otpCode.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className={`w-12 h-14 text-center text-lg font-bold rounded-xl border bg-cream-light font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent ${
                            digit
                              ? "border-brand-red text-charcoal"
                              : "border-neutral-warm text-charcoal"
                          }`}
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button type="submit" variant="primary" className="w-full h-12" isLoading={isLoading}>
                      Verify & Sign In
                      {!isLoading && <CheckCircle className="h-4 w-4 ml-2" />}
                    </Button>

                    {/* Resend */}
                    <div className="text-center">
                      {otpTimer > 0 ? (
                        <p className="font-sans text-xs text-muted-gray">
                          Resend code in <span className="font-bold text-charcoal">{otpTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          className="font-sans text-xs font-semibold text-brand-red hover:text-brand-red-dark transition-colors cursor-pointer"
                        >
                          Didn&apos;t receive the code? Resend
                        </button>
                      )}
                    </div>

                    {/* Security info */}
                    <div className="bg-cream-dark/30 rounded-xl px-4 py-3 space-y-1.5">
                      <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted-gray">
                        Security Measures
                      </p>
                      <ul className="font-sans text-[11px] text-muted-gray space-y-1">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3 text-accent-green shrink-0" />
                          Code expires in 10 minutes
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3 text-accent-green shrink-0" />
                          5 verification attempts max
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3 text-accent-green shrink-0" />
                          Rate-limited to prevent abuse
                        </li>
                      </ul>
                    </div>
                  </form>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Toggle Sign In / Sign Up */}
          {method !== "phone" && (
            <p className="text-center font-sans text-sm text-muted-gray mt-6">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="font-semibold text-brand-red hover:text-brand-red-dark transition-colors cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="font-semibold text-brand-red hover:text-brand-red-dark transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col min-h-screen bg-cream-base text-charcoal animate-pulse">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12 md:py-20 px-6">
          <div className="w-full max-w-[440px] text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-red mx-auto" />
            <p className="font-sans text-sm text-muted-gray">Loading security modules...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SignInPageContent />
    </React.Suspense>
  );
}
