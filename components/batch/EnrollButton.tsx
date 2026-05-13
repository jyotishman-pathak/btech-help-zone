"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Lock } from "lucide-react";

import { LeadCaptureForm } from "./LeadCaptureForm";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface EnrollButtonProps {
  batchId: string;
  batchSlug: string;
  batchName: string;
  isFree: boolean;
  price: number;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  leadFormFields?: Array<{ id: string; label: string; placeholder?: string | null; fieldType: string; required: boolean; options: string[] }>;
  userEmail?: string;
  userName?: string;
}

declare global { interface Window { Razorpay: any; } }

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function EnrollButton({
  batchId, batchSlug, batchName, isFree, price,
  isEnrolled, isLoggedIn, leadFormFields = [],
  userEmail = "", userName = "",
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ discount: number; code: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const router = useRouter();

  if (isEnrolled) {
    return (
      <Button className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => router.push(`/batches/${batchSlug}`)}>
        ✓ Continue Learning
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button className="w-full h-12 text-base bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900" onClick={() => router.push(`/login?callbackUrl=/batches/${batchSlug}`)}>
        <Lock className="w-4 h-4 mr-2" /> Login to Enroll
      </Button>
    );
  }

  const validateCoupon = async () => {
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, batchId }),
    });
    const data = await res.json();
    if (data.valid) setCouponApplied(data);
    else setCouponError(data.error ?? "Invalid coupon");
  };

  const handleFreeEnroll = () => setShowLeadForm(true);

  const handlePaidEnroll = async () => {
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, couponCode: couponApplied?.code }),
      });
      const { orderId, amount, currency, keyId, batchName: bn } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          order_id: orderId,
          name: "B Tech HelpZone",
          description: bn,
          prefill: { email: userEmail, name: userName },
          theme: { color: "#18181b" },
          modal: { ondismiss: () => reject(new Error("Cancelled")) },
          handler: async (resp: any) => {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resp),
            });
            if (verifyRes.ok) {
              router.push(`/batches/${batchSlug}?success=1`);
              router.refresh();
              resolve();
            } else {
              reject(new Error("Verification failed"));
            }
          },
        });
        rzp.open();
      });
    } catch (e: any) {
      if (e.message !== "Cancelled") console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const discountedPrice = couponApplied
    ? price - Math.round((price * couponApplied.discount) / 100)
    : price;

  return (
    <>
      <div className="space-y-3">
        {/* Price display */}
        {!isFree && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Total</span>
            <div className="flex items-baseline gap-2">
              {couponApplied && (
                <span className="text-sm line-through text-zinc-400">₹{(price / 100).toLocaleString("en-IN")}</span>
              )}
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                ₹{(discountedPrice / 100).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        {/* Coupon field (paid only) */}
        {!isFree && (
          <div>
            {showCoupon ? (
              <div className="flex gap-2">
                <Input
                  placeholder="COUPON CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={validateCoupon} className="shrink-0 border-zinc-200 dark:border-zinc-700">
                  Apply
                </Button>
              </div>
            ) : (
              <button onClick={() => setShowCoupon(true)} className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-2">
                Have a coupon code?
              </button>
            )}
            {couponApplied && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                ✓ {couponApplied.discount}% off applied!
              </p>
            )}
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          </div>
        )}

        <Button
          onClick={isFree ? handleFreeEnroll : handlePaidEnroll}
          disabled={loading}
          className="w-full h-12 text-base bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
          ) : isFree ? (
            "Enroll for Free →"
          ) : (
            <><Zap className="w-4 h-4 mr-2" /> Enroll Now</>
          )}
        </Button>

        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-600">
          {isFree ? "Instant access. No credit card needed." : "Secure payment via Razorpay · 7-day refund policy"}
        </p>
      </div>

      {isFree && leadFormFields.length > 0 && (
        <LeadCaptureForm
          open={showLeadForm}
          onClose={() => setShowLeadForm(false)}
          batchSlug={batchSlug}
          batchName={batchName}
          fields={leadFormFields}
        />
      )}
    </>
  );
}