"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { cn } from "../../lib/utils";


interface EnrollButtonProps {
  batchId: string;
  batchSlug: string;
  batchName: string;
  isFree: boolean;
  price: number;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  leadFormFields?: Array<{
    id: string; label: string; placeholder?: string | null;
    fieldType: string; required: boolean; options: string[];
  }>;
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
  const [error, setError] = useState("");
  const router = useRouter();

  // ── Already enrolled ─────────────────────────────────────────────────────
  if (isEnrolled) {
    return (
      <Button
        className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        onClick={() => router.push(`/student/my-batches`)}
      >
        <CheckCircle2 className="w-4 h-4 mr-2" /> Continue Learning
      </Button>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <Button
        className="w-full h-12 text-base bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 font-bold"
        onClick={() => router.push(`/login?callbackUrl=/batches/${batchSlug}`)}
      >
        <Lock className="w-4 h-4 mr-2" /> Login to Enroll
      </Button>
    );
  }

  // ── Direct free enrollment (no lead form) ─────────────────────────────────
  const enrollDirectly = async (leadData: Record<string, string> = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/batches/${batchSlug}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Already enrolled is fine — just redirect
        if (data.error === "Already enrolled" || res.status === 409) {
          router.push("/my-batches");
          router.refresh();
          return;
        }
        setError(data.error ?? "Enrollment failed. Try again.");
        return;
      }
      router.push("student/my-batches?enrolled=1");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Free batch click handler ──────────────────────────────────────────────
  const handleFreeEnroll = () => {
    // Always show lead form for free batches — never skip
    setShowLeadForm(true);
  };

  // ── Coupon validation ─────────────────────────────────────────────────────
  const validateCoupon = async () => {
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, batchId }),
      });
      const data = await res.json();
      if (data.valid) setCouponApplied(data);
      else setCouponError(data.error ?? "Invalid coupon");
    } catch {
      setCouponError("Could not validate coupon");
    }
  };

  // ── Paid enrollment via Razorpay ─────────────────────────────────────────
  const handlePaidEnroll = async () => {
    setLoading(true);
    setError("");
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, couponCode: couponApplied?.code }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to create order");
        return;
      }
      const { orderId, amount, currency, keyId } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          order_id: orderId,
          name: "CEE HelpZone",
          description: batchName,
          prefill: { email: userEmail, name: userName },
          theme: { color: "#7c3aed" },
          modal: { ondismiss: () => reject(new Error("Cancelled")) },
          handler: async (resp: any) => {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resp),
            });
            if (verifyRes.ok) {
              router.push(`/student/my-batches?enrolled=1`);
              router.refresh();
              resolve();
            } else {
              reject(new Error("Payment verification failed"));
            }
          },
        });
        rzp.open();
      });
    } catch (e: any) {
      if (e.message !== "Cancelled") setError(e.message ?? "Payment failed");
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
        {/* Price display for paid */}
        {!isFree && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Total</span>
            <div className="flex items-baseline gap-2">
              {couponApplied && (
                <span className="text-sm line-through text-zinc-400">
                  ₹{(price / 100).toLocaleString("en-IN")}
                </span>
              )}
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                ₹{(discountedPrice / 100).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        {/* Coupon (paid only) */}
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
              <button
                onClick={() => setShowCoupon(true)}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-2"
              >
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

        {/* Main CTA button */}
        <Button
          onClick={isFree ? handleFreeEnroll : handlePaidEnroll}
          disabled={loading}
          className={cn(
            "w-full h-12 text-base font-bold",
            isFree
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_30px_rgba(124,58,237,0.3)]"
          )}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isFree ? "Enrolling..." : "Processing..."}</>
          ) : isFree ? (
            <>Enroll for Free <ArrowRight className="w-4 h-4 ml-1" /></>
          ) : (
            <><Zap className="w-4 h-4 mr-2" /> Enroll Now</>
          )}
        </Button>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-center">
            {error}
          </p>
        )}

        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-600">
          {isFree
            ? "Instant access · No credit card needed"
            : "Secure payment via Razorpay · 7-day refund policy"}
        </p>
      </div>

      {/* Lead form — shown for ALL free batches */}
      {isFree && (
        <LeadCaptureForm
          open={showLeadForm}
          onClose={() => setShowLeadForm(false)}
          batchSlug={batchSlug}
          batchName={batchName}
          fields={leadFormFields}  // empty = LeadCaptureForm uses defaults
        />
      )}
    </>
  );
}