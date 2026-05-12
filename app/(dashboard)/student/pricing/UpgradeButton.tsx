// app/(dashboard)/student/pricing/UpgradeButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, CheckCircle2 } from "lucide-react";

interface Props {
  tier: "PREMIUM" | "SUPER_PREMIUM";
  label?: string;
  className?: string;
  userEmail?: string;
  userName?: string;
}

declare global {
  interface Window { Razorpay: any; }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function UpgradeButton({ tier, label, className, userEmail, userName }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment gateway");

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const { orderId, amount, currency, keyId } = await orderRes.json();

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          order_id: orderId,
          name: "CEE HelpZone",
          description: `${tier === "PREMIUM" ? "Premium" : "Elite"} Subscription — 1 Month`,
          image: "/logo.png",
          prefill: { email: userEmail ?? "", name: userName ?? "" },
          theme: { color: "#4f46e5" },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                tier,
              }),
            });

            if (verifyRes.ok) {
              setSuccess(true);
              setTimeout(() => {
                router.refresh();
                router.push("/dashboard");
              }, 2000);
              resolve();
            } else {
              reject(new Error("Payment verification failed"));
            }
          },
        });
        rzp.open();
      });
    } catch (err: any) {
      if (err.message !== "Payment cancelled") {
        setError(err.message ?? "Payment failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <button
        disabled
        className={`${className} flex items-center justify-center gap-2 opacity-90`}
      >
        <CheckCircle2 className="w-4 h-4" />
        Upgraded! Redirecting…
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`${className} flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
        ) : (
          <><Zap className="w-4 h-4" /> {label ?? "Upgrade Now"}</>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}
    </div>
  );
}