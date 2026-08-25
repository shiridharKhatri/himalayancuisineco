"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { CreditCard, Send, CheckCircle2, DollarSign, Gift } from "lucide-react";
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
  const [style, setStyle] = React.useState("birthday"); // birthday, thank-you, holiday, classic
  const [amount, setAmount] = React.useState<number>(50);
  const [customAmount, setCustomAmount] = React.useState("");
  const [deliveryMethod, setDeliveryMethod] = React.useState("email"); // email, print
  
  // Customization info
  const [recipient, setRecipient] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [sender, setSender] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [deliveryDate, setDeliveryDate] = React.useState("");

  // Balance Check State
  const [balanceCode, setBalanceCode] = React.useState("");
  const [checkedBalance, setCheckedBalance] = React.useState<number | null>(null);
  const [balanceError, setBalanceError] = React.useState("");

  // Checkout flow state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPurchased, setIsPurchased] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const cardStyleColors: Record<string, { bgImage: string; text: string; border: string; overlayBg: string; label: string }> = {
    birthday: {
      bgImage: "/images/happy_birthday.svg",
      text: "text-brand-red-dark",
      border: "border-brand-red/15",
      overlayBg: "bg-cream-light/80 backdrop-blur-[6px]",
      label: "Happy Birthday",
    },
    "thank-you": {
      bgImage: "/images/thank_you.svg",
      text: "text-charcoal",
      border: "border-amber-500/20",
      overlayBg: "bg-cream-light/80 backdrop-blur-[6px]",
      label: "Thank You",
    },
    holiday: {
      bgImage: "/images/happy_holidays.svg",
      text: "text-[#2C4A3E]",
      border: "border-emerald-800/15",
      overlayBg: "bg-cream-light/80 backdrop-blur-[6px]",
      label: "Season's Greetings",
    },
    classic: {
      bgImage: "/images/gift_card.svg",
      text: "text-cream-light",
      border: "border-white/15",
      overlayBg: "bg-charcoal/65 backdrop-blur-[6px]",
      label: "Himalayan Classic",
    },
  };

  const currentTheme = cardStyleColors[style] || cardStyleColors.classic;

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

  const [purchasedCode, setPurchasedCode] = React.useState("");

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
          recipientEmail: recipientEmail.trim(),
          senderName: sender.trim(),
          message: message.trim(),
          cardStyle: style,
          amount: amount,
          deliveryDate: deliveryDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to purchase gift card");
      }

      const data = await response.json();
      setPurchasedCode(data.giftCard.code);
      setIsPurchased(true);
      addToast("Gift card purchased successfully!", "success");
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
      setBalanceError("Please enter a card code");
      return;
    }

    try {
      const response = await fetch(`/api/gift-cards?code=${encodeURIComponent(balanceCode.trim())}`);
      if (!response.ok) {
        if (response.status === 404) {
          setBalanceError("Gift card code not found or inactive.");
          return;
        }
        throw new Error("Failed to check balance");
      }

      const data = await response.json();
      setCheckedBalance(data.balance);
      addToast("Gift card balance retrieved.", "success");
    } catch (err: any) {
      console.error(err);
      setBalanceError("Error verifying balance. Please try again.");
    }
  };

  const handleResetPurchase = () => {
    setIsPurchased(false);
    setRecipient("");
    setRecipientEmail("");
    setSender("");
    setMessage("");
    setDeliveryDate("");
    setCustomAmount("");
    setAmount(50);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-base text-charcoal">
      <Header />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-[1100px] px-6">
          
          {/* Header Text */}
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge variant="soft-red" className="mb-2">Digital Gift Cards</Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
              Himalayan Gift Cards
            </h1>
            <p className="font-sans text-sm md:text-base text-muted-gray mt-3 leading-relaxed">
              Share the experience of fine Nepalese dining. Send a digital gift card instantly via email, or schedule it for a special day.
            </p>
          </div>

          {!isPurchased ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
              
              {/* LEFT COLUMN: CUSTOMIZER FORM */}
              <div className="lg:col-span-7 space-y-8">
                <Card>
                  <form onSubmit={handlePurchase} className="space-y-6">
                    <h3 className="font-serif text-xl font-semibold border-b border-neutral-warm/40 pb-3">
                      1. Choose Card Style
                    </h3>

                    {/* Themes selectors */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: "birthday", label: "Birthday" },
                        { id: "thank-you", label: "Thanks" },
                        { id: "holiday", label: "Holiday" },
                        { id: "classic", label: "Classic" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStyle(item.id)}
                          className={`py-2 border rounded-sm font-sans text-xs font-medium tracking-wide text-center transition-all cursor-pointer ${
                            style === item.id
                              ? "border-brand-red bg-brand-red-soft/20 text-brand-red-dark"
                              : "border-neutral-warm bg-cream-light text-charcoal hover:bg-cream-dark"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <h3 className="font-serif text-xl font-semibold border-b border-neutral-warm/40 pt-4 pb-3">
                      2. Choose Card Amount
                    </h3>

                    {/* Pre-select amounts row */}
                    <div className="grid grid-cols-5 gap-2.5">
                      {[25, 50, 75, 100, 150].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAmountClick(val)}
                          className={`py-2.5 border rounded-sm font-sans text-sm font-semibold transition-all cursor-pointer ${
                            amount === val && !customAmount
                              ? "bg-brand-red text-cream-light border-transparent"
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

                    <h3 className="font-serif text-xl font-semibold border-b border-neutral-warm/40 pt-4 pb-3">
                      3. Personalization & Delivery
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("email")}
                          className={`py-3 border rounded-sm font-sans text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer ${
                            deliveryMethod === "email"
                              ? "border-brand-red bg-brand-red-soft/20 text-brand-red-dark"
                              : "border-neutral-warm bg-cream-light text-charcoal"
                          }`}
                        >
                          Deliver via Email
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("print")}
                          className={`py-3 border rounded-sm font-sans text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer ${
                            deliveryMethod === "print"
                              ? "border-brand-red bg-brand-red-soft/20 text-brand-red-dark"
                              : "border-neutral-warm bg-cream-light text-charcoal"
                          }`}
                        >
                          Print at Home
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
                          className="w-full px-4 py-3 rounded-sm border border-neutral-warm bg-cream-light font-sans text-sm text-charcoal placeholder:text-muted-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
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
                      Purchase Gift Card &bull; ${amount.toFixed(2)}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* RIGHT COLUMN: LIVE PREVIEW & BALANCE CHECKER */}
              <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-[160px]">
                
                {/* LIVE PREVIEW CONTAINER */}
                <div className="flex flex-col space-y-3">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-gray">
                    Live Gift Card Preview
                  </span>
                  
                  {/* Visual Card Frame */}
                  <div 
                    style={{ 
                      backgroundImage: `url(${currentTheme.bgImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    className={`aspect-[16/10] w-full rounded-[24px] p-3 flex flex-col justify-between border relative overflow-hidden shadow-[0_12px_40px_rgba(206,166,112,0.12)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(206,166,112,0.22)] hover:-translate-y-1 ${currentTheme.border}`}
                  >
                    {/* Gloss sheen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/15 pointer-events-none z-0" />
                    
                    {/* Inner Glass Container */}
                    <div className={`w-full h-full rounded-[18px] p-5 flex flex-col justify-between border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] z-10 ${currentTheme.overlayBg}`}>
                      
                      {/* Logo and Theme label */}
                      <div className="flex justify-between items-center w-full">
                        <div className="relative h-6 w-24">
                          <Image 
                            src="/images/logo.png" 
                            alt="Himalayan Logo" 
                            fill 
                            className={`object-contain object-left ${style === 'classic' ? 'invert brightness-200' : ''}`} 
                          />
                        </div>
                        <span className={`font-serif text-sm font-bold italic leading-none ${currentTheme.text}`}>
                          {currentTheme.label}
                        </span>
                      </div>

                      {/* Recipient Message Block */}
                      <div className="space-y-1.5 mt-3 text-left">
                        {recipient && (
                          <p className={`font-serif text-base font-bold leading-none ${currentTheme.text}`}>
                            For: {recipient}
                          </p>
                        )}
                        {message ? (
                          <p className={`font-sans text-xs italic opacity-90 leading-relaxed line-clamp-3 max-w-[90%] ${currentTheme.text}`}>
                            "{message}"
                          </p>
                        ) : (
                          <p className={`font-sans text-xs italic opacity-60 leading-relaxed line-clamp-3 max-w-[90%] ${currentTheme.text}`}>
                            "Enjoy some authentic Jhol Momos and mountain curries on me!"
                          </p>
                        )}
                      </div>

                      {/* Footer block */}
                      <div className="flex justify-between items-end border-t border-black/5 pt-3 mt-1.5">
                        <div className={`font-sans text-[9px] uppercase tracking-wider font-semibold opacity-75 text-left ${currentTheme.text}`}>
                          {sender ? <span>From: {sender}</span> : <span>Digital Gift Card</span>}
                          <span className="block mt-0.5 opacity-60 text-[8px] font-normal lowercase tracking-normal">digital code generated upon checkout</span>
                        </div>
                        <span className={`font-sans text-3xl font-extrabold tracking-tight ${currentTheme.text}`}>
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
                      label="Gift Card Code"
                      value={balanceCode}
                      onChange={(e) => setBalanceCode(e.target.value)}
                      error={balanceError}
                      placeholder="e.g. HIM-100234"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="w-full">
                      Verify Balance
                    </Button>

                    {checkedBalance !== null && (
                      <div className="bg-brand-red-soft/20 border border-brand-red/10 rounded-sm p-4 text-center mt-3 animate-fade-in">
                        <span className="font-sans text-xs text-muted-gray block uppercase tracking-wider mb-1">
                          Current Card Balance
                        </span>
                        <span className="font-sans text-3xl font-extrabold text-brand-red-dark">
                          ${checkedBalance.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </form>
                </Card>

              </div>

            </div>
          ) : (
            // PURCHASE CONFIRMED
            <div className="max-w-md mx-auto">
              <Card className="border border-brand-red/20 bg-cream-light text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />
                
                <div className="inline-flex items-center justify-center h-12 w-12 bg-brand-red-soft rounded-full text-brand-red mb-4 mt-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                
                <Badge variant="success" className="mb-2">Payment Confirmed</Badge>
                <h3 className="font-serif text-2xl font-bold mb-1">Gift Card Purchased!</h3>
                <span className="font-sans text-xs text-muted-gray block mb-6">A verification receipt has been emailed to you.</span>

                <div className="h-px bg-neutral-warm/40 my-4" />

                 <div className="space-y-3 text-left font-sans text-sm text-charcoal mb-6">
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Recipient</span>
                    <span className="font-semibold">{recipient}</span>
                  </div>
                  {recipientEmail && (
                    <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                      <span className="text-muted-gray">Recipient Email</span>
                      <span className="font-semibold">{recipientEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Gift Card Code</span>
                    <span className="font-mono font-bold text-brand-red">{purchasedCode}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Card Value</span>
                    <span className="font-semibold font-sans text-brand-red-dark">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-warm/20 pb-2">
                    <span className="text-muted-gray">Delivery Method</span>
                    <span className="font-semibold uppercase">{deliveryMethod}</span>
                  </div>
                  {purchasedCode && (
                    <div className="flex justify-between border-b border-neutral-warm/20 pb-2 text-accent-green">
                      <span>Points Earned</span>
                      <span className="font-bold">+{Math.round(amount * 10)} pts</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Button onClick={handleResetPurchase} variant="primary" size="sm" className="w-full">
                    Buy Another Gift Card
                  </Button>
                  <Link href="/menu">
                    <Button variant="outline" size="sm" className="w-full">
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
