"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
  serviceType: "PREDICTOR" | "ANALYTICS" | "COUNSELLING";
  label: string;
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

export function ServicePaymentButton({ serviceType, label, className, userEmail, userName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment gateway");

      const orderRes = await fetch("/api/payment/create-service-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceType }),
      });
      
      const data = await orderRes.json();
      
      // If user is not logged in, redirect to login
      if (orderRes.status === 401) {
        router.push(`/login?callbackUrl=/pricing`);
        return;
      }
      
      if (!orderRes.ok) throw new Error(data.error || "Failed to create order");
      
      const { orderId, amount, currency, keyId, serviceType: resServiceType } = data;

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          order_id: orderId,
          name: "CEE HelpZone",
          description: `${resServiceType} Unlock`,
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
            const verifyRes = await fetch("/api/payment/verify-service", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              router.refresh();
              router.push("/student/settings"); // Or dashboard
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

  return (
    <div className="w-full mt-auto space-y-2">
      <Button
        onClick={handlePayment}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing…</>
        ) : (
          label
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-500 text-center font-medium px-2">
          {error}
        </p>
      )}
    </div>
  );
}
