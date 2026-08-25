"use client";

import * as React from "react";
import { Gift, Plus, Search, RefreshCw, CheckCircle2, DollarSign, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { useUIStore } from "@/stores/uiStore";

export default function AdminGiftCardsPage() {
  const { addToast } = useUIStore();
  const [giftCards, setGiftCards] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isIssuing, setIsIssuing] = React.useState(false);

  // Issue card form state
  const [recipientName, setRecipientName] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [amount, setAmount] = React.useState("50");
  const [message, setMessage] = React.useState("Complimentary VIP dining card");
  const [cardStyle, setCardStyle] = React.useState("classic");

  const fetchGiftCards = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/gift-cards");
      const data = await res.json();
      setGiftCards(data.giftCards || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch gift cards", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGiftCards();
  }, []);

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !recipientEmail || !amount) {
      addToast("Please fill in recipient name, email, and amount.", "error");
      return;
    }

    setIsIssuing(true);
    try {
      const res = await fetch("/api/admin/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          senderName: "Himalayan Management",
          amount: parseFloat(amount),
          message,
          cardStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue card");

      addToast(`Issued gift card ${data.giftCard.code} ($${amount}) successfully!`, "success");
      setIsModalOpen(false);
      setRecipientName("");
      setRecipientEmail("");
      fetchGiftCards();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsIssuing(false);
    }
  };

  const totalOutstandingBalance = giftCards.reduce(
    (sum, c) => sum + (c.balance || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* TITLE & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">Gift Cards Management</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Audit outstanding gift card liabilities, search claim codes, and issue VIP complementary cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchGiftCards} className="bg-white">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Issue VIP Card
          </Button>
        </div>
      </div>

      {/* KPI METRIC BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-neutral-400 font-sans">Total Cards Issued</span>
          <h3 className="font-serif text-2xl font-bold text-[#141414] mt-1">{giftCards.length}</h3>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-neutral-400 font-sans">Outstanding Liability</span>
          <h3 className="font-serif text-2xl font-bold text-emerald-700 mt-1">
            ${totalOutstandingBalance.toFixed(2)}
          </h3>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-neutral-400 font-sans">Active Status</span>
          <h3 className="font-serif text-2xl font-bold text-blue-700 mt-1">
            {giftCards.filter((g) => g.isActive && g.balance > 0).length} Redeemable
          </h3>
        </div>
      </div>

      {/* GIFT CARDS TABLE */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Claim Code</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Initial Value</th>
                <th className="py-3 px-4">Current Balance</th>
                <th className="py-3 px-4">Design Style</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B51C20] mb-2" />
                    Loading gift cards...
                  </td>
                </tr>
              ) : giftCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-sans">
                    No gift cards issued yet.
                  </td>
                </tr>
              ) : (
                giftCards.map((g) => (
                  <tr key={g.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#B51C20] tracking-wider">
                      {g.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{g.recipientName}</span>
                      <span className="text-[10px] text-neutral-400 block">{g.recipientEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 font-medium">{g.senderName}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-500">
                      ${Number(g.initialBalance).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#141414]">
                      ${Number(g.balance).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-semibold text-neutral-600">
                      {g.cardStyle}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          g.isActive && g.balance > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {g.isActive && g.balance > 0 ? "Active" : "Redeemed / Void"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ISSUE CARD DIALOG */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue VIP / Complementary Gift Card"
      >
        <form onSubmit={handleIssueCard} className="space-y-4 text-left">
          <Input
            label="Recipient Full Name"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g. Maya Thapa"
            required
          />

          <Input
            label="Recipient Email"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="maya@example.com"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Card Amount ($ USD)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50"
              required
            />

            <div className="flex flex-col space-y-1.5">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Design Theme
              </label>
              <select
                value={cardStyle}
                onChange={(e) => setCardStyle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white font-sans text-sm text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              >
                <option value="classic">Classic</option>
                <option value="birthday">Birthday</option>
                <option value="thank-you">Thanks</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
          </div>

          <Input
            label="Personal Message Note"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="With compliments from Himalayan Cuisine Co."
          />

          <Button type="submit" variant="primary" size="lg" className="w-full mt-4" isLoading={isIssuing}>
            Generate &amp; Issue Card
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
