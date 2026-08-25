"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CreditCard,
  Send,
  CheckCircle2,
  DollarSign,
  Gift,
  Printer,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";

export default function GiftCardsPage() {
  const { addToast } = useUIStore();

  // Gift Card Configuration Form State
  const [style, setStyle] = React.useState<"birthday" | "thank-you" | "holiday" | "classic" | "custom">("birthday");
  const [amount, setAmount] = React.useState<number>(50);
  const [customAmount, setCustomAmount] = React.useState("");
  const [deliveryMethod, setDeliveryMethod] = React.useState<"email" | "print">("email");

  // Customization info
  const [recipient, setRecipient] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [sender, setSender] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [deliveryDate, setDeliveryDate] = React.useState("");

  // Custom Image Upload State
  const [customImage, setCustomImage] = React.useState<string | null>(null);
  const [customImageName, setCustomImageName] = React.useState<string>("");
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Balance Check State
  const [balanceCode, setBalanceCode] = React.useState("");
  const [checkedBalance, setCheckedBalance] = React.useState<number | null>(null);
  const [balanceError, setBalanceError] = React.useState("");

  // Checkout flow state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPurchased, setIsPurchased] = React.useState(false);
  const [purchasedCode, setPurchasedCode] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleAmountClick = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleCustomImageUpload = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Please upload a valid image file (PNG, JPG, WEBP).", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size must be under 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomImage(e.target?.result as string);
      setCustomImageName(file.name);
      setStyle("custom");
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!recipient.trim()) errs.recipient = "Recipient name is required";
    if (deliveryMethod === "email") {
      if (!recipientEmail.trim() || !/\S+@\S+\.\S+/.test(recipientEmail)) {
        errs.recipientEmail = "Valid recipient email is required";
      }
    }
    if (!sender.trim()) errs.sender = "Sender name is required";
    if (amount <= 5) errs.amount = "Minimum gift card value is $10";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please fill in all required fields.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipient.trim(),
          recipientEmail: deliveryMethod === "email" ? recipientEmail.trim() : `print-${Date.now()}@himalayancuisineco.com`,
          senderName: sender.trim(),
          message: message.trim(),
          cardStyle: style,
          amount: amount,
          deliveryDate: deliveryMethod === "email" ? deliveryDate : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to purchase gift card");
      }

      const data = await response.json();
      setPurchasedCode(data.giftCard.code);
      setIsPurchased(true);
      addToast(
        deliveryMethod === "email"
          ? "Gift card purchased and scheduled for email delivery!"
          : "Gift card generated! You can now print your card.",
        "success"
      );
    } catch (err: any) {
      console.error(err);
      addToast("Error purchasing gift card. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setBalanceError("");
    setCheckedBalance(null);

    if (!balanceCode.trim()) {
      setBalanceError("Please enter a valid gift card code");
      return;
    }

    try {
      const response = await fetch(`/api/gift-cards/balance?code=${encodeURIComponent(balanceCode.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        setBalanceError(data.error || "Card not found or inactive");
        return;
      }

      setCheckedBalance(data.balance);
    } catch (err) {
      setBalanceError("Failed to check card balance. Please verify code.");
    }
  };

  const handleResetPurchase = () => {
    setIsPurchased(false);
    setPurchasedCode("");
    setRecipient("");
    setRecipientEmail("");
    setSender("");
    setMessage("");
    setDeliveryDate("");
    setCustomAmount("");
    setAmount(50);
  };

  const handlePrintCard = () => {
    window.print();
  };

  // Render bespoke vector SVG patterns according to the selected theme
  const renderCardPattern = () => {
    if (style === "custom" && customImage) {
      return (
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${customImage})` }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
      );
    }

    if (style === "birthday") {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#841920] via-[#A9262F] to-[#5C0D12] overflow-hidden z-0">
          {/* Radiating festive sparkles & party confetti pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="birthday-confetti" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2.5" fill="#FFE599" />
                <circle cx="45" cy="15" r="1.5" fill="#FFFFFF" />
                <circle cx="20" cy="45" r="3" fill="#F4D9D8" />
                <circle cx="50" cy="45" r="2" fill="#FFE599" />
                {/* 4-point sparkle star */}
                <path d="M30 20 L32 28 L40 30 L32 32 L30 40 L28 32 L20 30 L28 28 Z" fill="#FFE599" />
                <path d="M10 35 L11 38 L14 39 L11 40 L10 43 L9 40 L6 39 L9 38 Z" fill="#FFFFFF" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#birthday-confetti)" />
          </svg>
          {/* Radial ambient glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/20 rounded-full blur-2xl" />
        </div>
      );
    }

    if (style === "thank-you") {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#6E4208] via-[#975B0E] to-[#492B04] overflow-hidden z-0">
          {/* Sacred Lotus Petal and Golden Mandala Weave */}
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="thanks-lotus" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Interlocking lotus petals */}
                <path d="M40 0 C25 20 25 40 40 60 C55 40 55 20 40 0 Z" fill="none" stroke="#FDE68A" strokeWidth="1" />
                <path d="M0 40 C20 25 40 25 60 40 C40 55 20 55 0 40 Z" fill="none" stroke="#FDE68A" strokeWidth="1" />
                <circle cx="40" cy="40" r="16" fill="none" stroke="#FDE68A" strokeWidth="1" strokeDasharray="2,3" />
                <circle cx="40" cy="40" r="6" fill="#FDE68A" opacity="0.6" />
                <circle cx="0" cy="0" r="4" fill="#FDE68A" opacity="0.4" />
                <circle cx="80" cy="0" r="4" fill="#FDE68A" opacity="0.4" />
                <circle cx="0" cy="80" r="4" fill="#FDE68A" opacity="0.4" />
                <circle cx="80" cy="80" r="4" fill="#FDE68A" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#thanks-lotus)" />
          </svg>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-300/15 rounded-full blur-3xl" />
        </div>
      );
    }

    if (style === "holiday") {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#123C27] via-[#1E543A] to-[#0A2417] overflow-hidden z-0">
          {/* Himalayan Winter Snow & Geometric Pine Crystals */}
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="holiday-snow" width="70" height="70" patternUnits="userSpaceOnUse">
                {/* 6-point crystalline snowflake */}
                <path d="M35 15 L35 55 M15 35 L55 35 M21 21 L49 49 M21 49 L49 21" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="35" cy="35" r="3.5" fill="#E2E8F0" />
                <circle cx="10" cy="10" r="1.5" fill="#FFFFFF" />
                <circle cx="60" cy="10" r="2" fill="#FFFFFF" opacity="0.7" />
                <circle cx="10" cy="60" r="1.5" fill="#FFFFFF" />
                <circle cx="60" cy="60" r="2" fill="#FFFFFF" opacity="0.7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#holiday-snow)" />
          </svg>
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-300/15 rounded-full blur-2xl" />
        </div>
      );
    }

    // Classic Himalayan Heritage (Default)
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#181614] via-[#28231C] to-[#0F0E0C] overflow-hidden z-0">
        {/* Intricate Himalayan Brass Mandala Geometry */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="classic-mandala" width="90" height="90" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="90" height="90" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              <circle cx="45" cy="45" r="30" fill="none" stroke="#D4AF37" strokeWidth="0.75" />
              <circle cx="45" cy="45" r="20" fill="none" stroke="#D4AF37" strokeWidth="0.75" strokeDasharray="3,3" />
              <polygon points="45,15 71,60 19,60" fill="none" stroke="#D4AF37" strokeWidth="0.75" />
              <polygon points="45,75 71,30 19,30" fill="none" stroke="#D4AF37" strokeWidth="0.75" />
              <circle cx="45" cy="45" r="4" fill="#D4AF37" opacity="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#classic-mandala)" />
        </svg>
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
      </div>
    );
  };

  const getStyleHeading = () => {
    switch (style) {
      case "birthday":
        return "Happy Birthday";
      case "thank-you":
        return "With Warmest Thanks";
      case "holiday":
        return "Season's Greetings";
      case "custom":
        return "Special Himalayan Feast";
      default:
        return "Himalayan Heritage";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          {/* Header Text */}
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge variant="soft-red" className="mb-2">Digital &amp; Printable Gift Cards</Badge>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-charcoal">
              Himalayan Gift Cards
            </h1>
            <p className="font-sans text-sm md:text-base text-muted-gray mt-3 leading-relaxed">
              Share the warmth of authentic Nepalese dining. Send instantly via email or print at home.
            </p>
          </div>

          {!isPurchased ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
              {/* LEFT COLUMN: CUSTOMIZER FORM */}
              <div className="lg:col-span-7 space-y-8">
                <Card>
                  <form onSubmit={handlePurchase} className="space-y-6">
                    <h3 className="font-serif text-xl font-semibold border-b border-neutral-warm/40 pb-3">
                      1. Choose Card Design
                    </h3>

                    {/* 5 Distinct Themes: Birthday, Thanks, Holiday, Classic, Custom */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: "birthday", label: "Birthday" },
                        { id: "thank-you", label: "Thanks" },
                        { id: "holiday", label: "Holiday" },
                        { id: "classic", label: "Classic" },
                        { id: "custom", label: "Custom" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStyle(item.id as any)}
                          className={`py-3 px-2 border rounded-xl font-sans text-xs font-semibold tracking-wide text-center transition-all cursor-pointer ${
                            style === item.id
                              ? "border-[#B51C20] bg-[#B51C20]/10 text-[#B51C20] shadow-xs ring-1 ring-[#B51C20]"
                              : "border-neutral-warm/80 bg-cream-light text-charcoal hover:bg-cream-dark"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Image Uploader Section (when custom is selected) */}
                    {style === "custom" && (
                      <div className="p-4 rounded-xl border border-dashed border-neutral-warm bg-white space-y-3">
                        <span className="font-sans text-xs font-semibold text-charcoal block">
                          Upload Custom Photo for Gift Card:
                        </span>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleCustomImageUpload(e.target.files?.[0] || null)}
                          accept="image/*"
                          className="hidden"
                        />

                        {customImage ? (
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-cream-dark/50 border border-neutral-warm/40">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-warm/40">
                                <Image src={customImage} alt="Custom upload" fill className="object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-sans text-xs font-semibold text-charcoal truncate">
                                  {customImageName}
                                </p>
                                <span className="font-sans text-[10px] text-accent-green font-medium">
                                  ✓ Custom design active
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setCustomImage(null);
                                setCustomImageName("");
                              }}
                              className="p-1.5 text-muted-gray hover:text-brand-red rounded-lg transition-colors cursor-pointer"
                              title="Remove custom image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="py-6 px-4 border border-dashed border-neutral-warm/80 rounded-lg text-center cursor-pointer hover:bg-cream-light transition-colors"
                          >
                            <UploadCloud className="h-6 w-6 text-muted-gray mx-auto mb-1.5" />
                            <p className="font-sans text-xs font-semibold text-charcoal">
                              Click to select custom image
                            </p>
                            <p className="font-sans text-[10px] text-muted-gray mt-0.5">
                              PNG, JPG, or WEBP (up to 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <h3 className="font-serif text-xl font-semibold border-b border-neutral-warm/40 pt-2 pb-3">
                      2. Choose Card Amount
                    </h3>

                    {/* Pre-select amounts row */}
                    <div className="grid grid-cols-5 gap-2.5">
                      {[25, 50, 75, 100, 150].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAmountClick(val)}
                          className={`py-2.5 border rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${
                            amount === val && !customAmount
                              ? "bg-[#B51C20] text-white border-transparent shadow-xs"
                              : "bg-cream-light text-charcoal border-neutral-warm hover:bg-cream-dark"
                          }`}
                        >
                          ${val}
                        </button>
                      ))}
                    </div>

                    <Input
                      label="Or enter custom amount ($)"
                      type="number"
                      min={10}
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      error={errors.amount}
                      placeholder="Enter value (Min $10)"
                    />

                    <h3 className="font-serif text-xl font-semibold border-b border-neutral-warm/40 pt-2 pb-3">
                      3. Personalization &amp; Delivery Method
                    </h3>

                    <div className="space-y-4">
                      {/* Delivery Mode: Email vs Print */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("email")}
                          className={`py-3 border rounded-xl font-sans text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            deliveryMethod === "email"
                              ? "border-[#B51C20] bg-[#B51C20]/10 text-[#B51C20] ring-1 ring-[#B51C20]"
                              : "border-neutral-warm bg-cream-light text-charcoal hover:bg-cream-dark"
                          }`}
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Deliver via Email</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("print")}
                          className={`py-3 border rounded-xl font-sans text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            deliveryMethod === "print"
                              ? "border-[#B51C20] bg-[#B51C20]/10 text-[#B51C20] ring-1 ring-[#B51C20]"
                              : "border-neutral-warm bg-cream-light text-charcoal hover:bg-cream-dark"
                          }`}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Print at Home (PDF)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Recipient Name"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          error={errors.recipient}
                          placeholder="Recipient's Name"
                        />
                        {deliveryMethod === "email" && (
                          <Input
                            label="Recipient Email"
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            error={errors.recipientEmail}
                            placeholder="recipient@example.com"
                          />
                        )}
                      </div>

                      <Input
                        label="Your Name (Sender)"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        error={errors.sender}
                        placeholder="Your Name"
                      />

                      <div className="flex flex-col space-y-1.5">
                        <label className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
                          Custom Message
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Write a warm note to your recipient here..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                          maxLength={150}
                        />
                      </div>

                      {deliveryMethod === "email" && (
                        <Input
                          label="Delivery Date (Optional)"
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          helperText="Leave blank to deliver immediately upon purchase."
                        />
                      )}
                    </div>

                    {/* Points Earned Banner */}
                    <div className="bg-brand-red-soft/30 border border-brand-red/10 rounded-xl py-3 px-4 text-center font-sans text-xs text-brand-red-dark font-medium mt-4">
                      You&apos;ll earn <span className="font-bold text-brand-red">{Math.round(amount * 10)} points</span> with this purchase
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full mt-4"
                      isLoading={isSubmitting}
                    >
                      {deliveryMethod === "email" ? "Send Gift Card" : "Generate & Purchase Gift Card"} &bull; ${amount.toFixed(2)}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* RIGHT COLUMN: LIVE VECTOR CARD PREVIEW & BALANCE CHECKER */}
              <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8">
                {/* LIVE PREVIEW CONTAINER */}
                <div className="flex flex-col space-y-3">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-gray">
                    Live Gift Card Preview
                  </span>

                  {/* Visual Card Frame */}
                  <div className="aspect-[16/10] w-full rounded-[24px] p-3 flex flex-col justify-between relative overflow-hidden shadow-[0_12px_40px_rgba(21,21,21,0.18)] transition-all duration-500 hover:scale-[1.02] border border-white/20">
                    {/* Dynamic Vector Pattern Background */}
                    {renderCardPattern()}

                    {/* Gloss sheen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/25 pointer-events-none z-10" />

                    {/* Inner Frosted Glass Frame */}
                    <div className="w-full h-full rounded-[18px] p-5 flex flex-col justify-between border border-white/25 bg-black/25 backdrop-blur-[6px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] z-20 text-white">
                      {/* Logo and Theme label */}
                      <div className="flex justify-between items-center w-full">
                        <div className="relative h-6 w-24">
                          <Image
                            src="/images/logo.png"
                            alt="Himalayan Logo"
                            fill
                            className="object-contain object-left invert brightness-200"
                          />
                        </div>
                        <span className="font-serif text-xs md:text-sm font-bold italic tracking-wide text-amber-200/90 drop-shadow-xs">
                          {getStyleHeading()}
                        </span>
                      </div>

                      {/* Recipient Message Block */}
                      <div className="space-y-1 mt-2 text-left">
                        {recipient ? (
                          <p className="font-serif text-lg font-bold leading-tight text-white drop-shadow-xs">
                            For: {recipient}
                          </p>
                        ) : (
                          <p className="font-serif text-base font-bold opacity-80 text-white/90">
                            For: Recipient Name
                          </p>
                        )}
                        {message ? (
                          <p className="font-sans text-xs italic text-white/90 leading-relaxed line-clamp-3 max-w-[95%] drop-shadow-xs">
                            &ldquo;{message}&rdquo;
                          </p>
                        ) : (
                          <p className="font-sans text-xs italic text-white/70 leading-relaxed line-clamp-3 max-w-[95%]">
                            &ldquo;Enjoy handcrafted dumplings and authentic Himalayan curries!&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Footer block */}
                      <div className="flex justify-between items-end border-t border-white/15 pt-2.5 mt-1">
                        <div className="font-sans text-[10px] uppercase tracking-wider font-semibold text-white/80 text-left">
                          {sender ? <span>From: {sender}</span> : <span>Digital Gift Card</span>}
                          <span className="block mt-0.5 text-[8px] font-normal lowercase tracking-normal text-white/60">
                            {deliveryMethod === "email" ? "Instant email claim code" : "Print-at-home certificate"}
                          </span>
                        </div>
                        <span className="font-sans text-3xl font-extrabold tracking-tight text-amber-300 drop-shadow-xs">
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BALANCE CHECKER CARD */}
                <Card>
                  <h4 className="font-serif text-lg font-bold border-b border-neutral-warm/40 pb-2.5 mb-4 text-left">
                    Check Gift Card Balance
                  </h4>
                  <form onSubmit={handleCheckBalance} className="space-y-4">
                    <Input
                      label="Card Code"
                      value={balanceCode}
                      onChange={(e) => setBalanceCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HIMA-GIFT-XXXX"
                      error={balanceError}
                      helperText="Enter the 14-character alphanumeric code."
                    />
                    <Button type="submit" variant="outline" size="sm" className="w-full">
                      Check Balance
                    </Button>
                  </form>

                  {checkedBalance !== null && (
                    <div className="mt-4 p-4 bg-cream-dark/60 rounded-xl border border-neutral-warm/50 text-center animate-fade-in">
                      <span className="font-sans text-xs uppercase font-bold tracking-wider text-muted-gray block">
                        Available Balance
                      </span>
                      <span className="font-serif text-3xl font-bold text-brand-red block mt-1">
                        ${checkedBalance.toFixed(2)}
                      </span>
                      <span className="font-sans text-[11px] text-muted-gray mt-1 block">
                        Card is active and ready to redeem at checkout.
                      </span>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ) : (
            /* PURCHASE CONFIRMATION SCREEN & PRINTABLE CARD */
            <div className="max-w-xl mx-auto space-y-6">
              <Card className="border border-brand-red/20 bg-cream-light text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#B51C20]" />

                <div className="inline-flex items-center justify-center h-12 w-12 bg-brand-red-soft rounded-full text-brand-red mb-4 mt-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <Badge variant="success" className="mb-2">Payment Confirmed</Badge>
                <h3 className="font-serif text-2xl font-bold mb-1">Gift Card Ready!</h3>
                <span className="font-sans text-xs text-muted-gray block mb-6">
                  {deliveryMethod === "email"
                    ? `Claim code has been scheduled for delivery to ${recipientEmail}.`
                    : "Your printable gift card certificate has been generated."}
                </span>

                {/* Printable Gift Card Visual */}
                <div className="my-6 text-left">
                  <div className="aspect-[16/10] w-full rounded-[24px] p-3 flex flex-col justify-between relative overflow-hidden shadow-[0_8px_30px_rgba(21,21,21,0.1)] border border-white/20">
                    {renderCardPattern()}
                    <div className="w-full h-full rounded-[18px] p-5 flex flex-col justify-between border border-white/25 bg-black/30 backdrop-blur-[6px] z-20 text-white">
                      <div className="flex justify-between items-center">
                        <div className="relative h-6 w-24">
                          <Image src="/images/logo.png" alt="Logo" fill className="object-contain object-left invert brightness-200" />
                        </div>
                        <span className="font-serif text-xs font-bold italic text-amber-200">{getStyleHeading()}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-serif text-lg font-bold">For: {recipient}</p>
                        {message && <p className="font-sans text-xs italic text-white/90 line-clamp-2">&ldquo;{message}&rdquo;</p>}
                      </div>

                      <div className="flex justify-between items-end border-t border-white/15 pt-2">
                        <div>
                          <p className="font-mono font-bold text-sm tracking-widest text-amber-300">{purchasedCode}</p>
                          <span className="text-[9px] text-white/70">From: {sender}</span>
                        </div>
                        <span className="font-sans text-2xl font-extrabold text-amber-300">${amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-left font-sans text-sm text-charcoal mb-6 bg-white p-4 rounded-xl border border-neutral-warm/40">
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Recipient</span>
                    <span className="font-semibold">{recipient}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Claim Code</span>
                    <span className="font-mono font-bold text-[#B51C20]">{purchasedCode}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Card Value</span>
                    <span className="font-semibold text-charcoal font-sans">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Delivery Method</span>
                    <span className="font-semibold uppercase">{deliveryMethod}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2.5">
                  <button
                    type="button"
                    onClick={handlePrintCard}
                    className="w-full py-3 rounded-xl bg-charcoal hover:bg-black text-white font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Gift Card Certificate (PDF)</span>
                  </button>

                  <Button onClick={handleResetPurchase} variant="outline" size="sm" className="w-full">
                    Buy Another Gift Card
                  </Button>

                  <Link href="/menu">
                    <Button variant="ghost" size="sm" className="w-full text-muted-gray hover:text-charcoal">
                      Return to Menu
                    </Button>
                  </Link>
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
