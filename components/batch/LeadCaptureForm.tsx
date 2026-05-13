"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Field {
  id: string;
  label: string;
  placeholder?: string | null;
  fieldType: string;
  required: boolean;
  options: string[];
}

interface LeadCaptureFormProps {
  open: boolean;
  onClose: () => void;
  batchSlug: string;
  batchName: string;
  fields: Field[];
}

export function LeadCaptureForm({ open, onClose, batchSlug, batchName, fields }: LeadCaptureFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    // Validate required fields
    for (const f of fields) {
      if (f.required && !values[f.label]?.trim()) {
        setError(`"${f.label}" is required`);
        return;
      }
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/batches/${batchSlug}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData: values }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Enrollment failed");
        return;
      }

      setDone(true);
      setTimeout(() => {
        router.push(`/batches/${batchSlug}`);
        router.refresh();
      }, 1500);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-50">
            {done ? "🎉 You're enrolled!" : `Register for ${batchName}`}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            {done ? "Redirecting you to the batch..." : "Fill in your details to get instant access."}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label className="text-zinc-700 dark:text-zinc-300">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.fieldType === "select" ? (
                  <Select value={values[field.label] ?? ""} onValueChange={(v) => setValues({ ...values, [field.label]: v })}>
                    <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.fieldType === "email" ? "email" : field.fieldType === "phone" ? "tel" : "text"}
                    placeholder={field.placeholder ?? `Enter ${field.label}`}
                    value={values[field.label] ?? ""}
                    onChange={(e) => setValues({ ...values, [field.label]: e.target.value })}
                  />
                )}
              </div>
            ))}

            {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

            <Button onClick={handleSubmit} disabled={loading} className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enrolling...</> : "Get Free Access →"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}