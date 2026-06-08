"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "../../app/actions/user";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";

type UserData = {
  name: string | null;
  email: string | null;
  phone: string | null;
  school: string | null;
  district: string | null;
  emailVerified: Date | null;
};

export function SettingsForm({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    school: user.school || "",
    district: user.district || "",
    otp: "",
  });

  const isEmailChanged = formData.email !== user.email;
  const needsVerification = !user.emailVerified || isEmailChanged;
  const shouldShowVerify = needsVerification && formData.email;

  const handleSendOtp = async () => {
    if (!formData.email) return toast.error("Please enter an email address");
    setIsSendingOtp(true);
    const toastId = toast.loading("Sending OTP...");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        toast.success("OTP sent to new email! 📩", { id: toastId });
        setOtpSent(true);
      } else {
        toast.error("Failed to send OTP", { id: toastId, description: data.error });
      }
    } catch (err) {
      toast.error("Error", { id: toastId, description: "Something went wrong." });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (needsVerification && !otpSent) {
      toast.error("Please verify your email first by sending an OTP.");
      return;
    }
    
    if (needsVerification && !formData.otp) {
      toast.error("Please enter the OTP sent to your email.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateProfile(formData);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Profile updated successfully!");
          if (isEmailChanged) setOtpSent(false); // Reset OTP state if successful
        }
      } catch (error) {
        toast.error("Failed to update profile.");
      }
    });
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email Address</Label>
            <div className="flex gap-2">
              <Input 
                id="email" 
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value, otp: "" })} 
                className="bg-white dark:bg-zinc-950 flex-1" 
              />
              {shouldShowVerify && !otpSent && (
                <Button type="button" onClick={handleSendOtp} disabled={isSendingOtp} variant="secondary">
                  {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
                </Button>
              )}
            </div>
            {otpSent && shouldShowVerify && (
              <div className="mt-3 space-y-2">
                <Label htmlFor="otp" className="text-zinc-700 dark:text-zinc-300 text-sm">Enter OTP sent to {formData.email}</Label>
                <Input 
                  id="otp" 
                  value={formData.otp} 
                  onChange={e => setFormData({ ...formData, otp: e.target.value })} 
                  placeholder="6-digit code"
                  maxLength={6}
                  className="bg-white dark:bg-zinc-950" 
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Full Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="e.g. Rahul Das"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel"
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              placeholder="e.g. 9876543210"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="school" className="text-zinc-700 dark:text-zinc-300">School / College Name</Label>
              <Input 
                id="school" 
                value={formData.school} 
                onChange={e => setFormData({ ...formData, school: e.target.value })} 
                placeholder="Your School"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district" className="text-zinc-700 dark:text-zinc-300">District</Label>
              <Input 
                id="district" 
                value={formData.district} 
                onChange={e => setFormData({ ...formData, district: e.target.value })} 
                placeholder="e.g. Kamrup"
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending || (needsVerification && !otpSent)} className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 transition-colors">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
