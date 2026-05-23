"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, User, Phone, School, Calendar, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";

export interface LeadField {
  id: string;
  label: string;
  placeholder?: string | null;
  fieldType: string;
  required: boolean;
  options: string[];
}

// Default fields shown for ALL free batches when admin hasn't configured custom ones
export const DEFAULT_LEAD_FIELDS: LeadField[] = [
  {
    id: "full-name",
    label: "Full Name",
    placeholder: "Enter your full name",
    fieldType: "text",
    required: true,
    options: [],
  },
  {
    id: "phone",
    label: "Phone Number",
    placeholder: "10-digit mobile number",
    fieldType: "phone",
    required: true,
    options: [],
  },
  {
    id: "school-college",
    label: "School / College",
    placeholder: "Your current institution",
    fieldType: "text",
    required: true,
    options: [],
  },
  {
    id: "class-year",
    label: "Class / Pass Year",
    placeholder: "",
    fieldType: "select",
    required: true,
    options: [
      "Class 11 (2026 aspirant)",
      "Class 12 (2026 aspirant)",
      "12th Pass 2025",
      "12th Pass 2024",
      "12th Pass 2023",
      "12th Pass 2022 or earlier",
    ],
  },
  {
    id: "district",
    label: "District",
    placeholder: "Your district in Assam",
    fieldType: "text",
    required: false,
    options: [],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  batchSlug: string;
  batchName: string;
  fields: LeadField[];  // empty = use defaults
}

const FIELD_ICONS: Record<string, React.ElementType> = {
  "Full Name": User,
  "Phone Number": Phone,
  "School / College": School,
  "Class / Pass Year": Calendar,
  "District": MapPin,
};

export function LeadCaptureForm({ open, onClose, batchSlug, batchName, fields }: Props) {
  const activeFields = fields.length > 0 ? fields : DEFAULT_LEAD_FIELDS;

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    activeFields.forEach((f) => {
      if (f.required && !values[f.label]?.trim()) {
        newErrors[f.label] = `${f.label} is required`;
      }
      if (f.fieldType === "phone" && values[f.label] && !/^\d{10}$/.test(values[f.label].replace(/\s/g, ""))) {
        newErrors[f.label] = "Enter a valid 10-digit number";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setApiError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/batches/${batchSlug}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData: values }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Already enrolled — just redirect
          router.push(`/my-batches`);
          router.refresh();
          return;
        }
        setApiError(data.error ?? "Enrollment failed. Please try again.");
        return;
      }

      setDone(true);
      setTimeout(() => {
        router.push("/my-batches?enrolled=1");
        router.refresh();
      }, 1800);
    } catch {
      setApiError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !loading) onClose(); }}>
      <DialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sm:max-w-lg">
        <DialogHeader>
          {done ? (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <DialogTitle className="text-center text-zinc-900 dark:text-zinc-50">
                You're enrolled! 🎉
              </DialogTitle>
              <DialogDescription className="text-center text-zinc-500">
                Redirecting to your batches...
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className="text-zinc-900 dark:text-zinc-50">
                Register for Free Access
              </DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                Complete your details to unlock <strong className="text-zinc-700 dark:text-zinc-300">{batchName}</strong>.
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {!done && (
          <div className="space-y-3 py-1">
            {activeFields.map((field) => {
              const Icon = FIELD_ICONS[field.label];
              return (
                <div key={field.id} className="space-y-1.5">
                  <Label className="text-sm text-zinc-700 dark:text-zinc-300">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </Label>

                  {field.fieldType === "select" ? (
                    <Select
                      value={values[field.label] ?? ""}
                      onValueChange={(v) => {
                        setValues({ ...values, [field.label]: v });
                        setErrors({ ...errors, [field.label]: "" });
                      }}
                    >
                      <SelectTrigger className={errors[field.label] ? "border-red-400" : ""}>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.fieldType === "textarea" ? (
                    <Textarea
                      value={values[field.label] ?? ""}
                      onChange={(e) => {
                        setValues({ ...values, [field.label]: e.target.value });
                        setErrors({ ...errors, [field.label]: "" });
                      }}
                      placeholder={field.placeholder ?? ""}
                      rows={3}
                      className={`resize-none ${errors[field.label] ? "border-red-400" : ""}`}
                    />
                  ) : (
                    <div className="relative">
                      {Icon && (
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      )}
                      <Input
                        type={field.fieldType === "phone" ? "tel" : field.fieldType === "email" ? "email" : "text"}
                        value={values[field.label] ?? ""}
                        onChange={(e) => {
                          setValues({ ...values, [field.label]: e.target.value });
                          setErrors({ ...errors, [field.label]: "" });
                        }}
                        placeholder={field.placeholder ?? ""}
                        className={`${Icon ? "pl-9" : ""} ${errors[field.label] ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                      />
                    </div>
                  )}

                  {errors[field.label] && (
                    <p className="text-xs text-red-500">{errors[field.label]}</p>
                  )}
                </div>
              );
            })}

            {apiError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {apiError}
              </p>
            )}

            <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
              Your details are used only for course updates and never shared with third parties.
            </p>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1 border-zinc-200 dark:border-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enrolling...</> : "Get Free Access →"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}