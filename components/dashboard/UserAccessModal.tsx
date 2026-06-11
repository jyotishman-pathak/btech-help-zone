"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

import { Loader2, Shield, Target, BookOpen, BarChart3, Building2, User } from "lucide-react";
import { Switch } from "../../@/components/ui/switch";

export function UserAccessModal({
  user,
  open,
  onOpenChange,
}: {
  user: any | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [features, setFeatures] = useState({
    hasPredictor: false,
    hasAnalytics: false,
    hasCounselling: false,
  });

  const [enrolledBatchIds, setEnrolledBatchIds] = useState<string[]>([]);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [batchSearch, setBatchSearch] = useState("");

  useEffect(() => {
    if (open && user) {
      fetchAccessData();
    }
  }, [open, user]);

  const fetchAccessData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/access`);
      if (res.ok) {
        const data = await res.json();
        setFeatures(data.features || { hasPredictor: false, hasAnalytics: false, hasCounselling: false });
        setEnrolledBatchIds(data.enrolledBatchIds || []);
        setAllBatches(data.allBatches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user?.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features,
          batchIds: enrolledBatchIds,
        }),
      });
      if (res.ok) {
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleBatch = (id: string) => {
    setEnrolledBatchIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Manage User Access
          </DialogTitle>
          <DialogDescription>
            Grant or revoke access to batches and premium features for {user?.name || user?.email}.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-6 py-4">

            {/* Premium Features */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-500" /> Premium Services
              </h3>
              <div className="space-y-3 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">College Predictor</p>
                      <p className="text-xs text-slate-500">Access to rank-based predictor</p>
                    </div>
                  </div>
                  <Switch
                    checked={features.hasPredictor}
                    onCheckedChange={(c) => setFeatures({ ...features, hasPredictor: c })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Deep Analytics</p>
                      <p className="text-xs text-slate-500">Advanced performance tracking</p>
                    </div>
                  </div>
                  <Switch
                    checked={features.hasAnalytics}
                    onCheckedChange={(c) => setFeatures({ ...features, hasAnalytics: c })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Counselling Assistance</p>
                      <p className="text-xs text-slate-500">1-on-1 expert guidance</p>
                    </div>
                  </div>
                  <Switch
                    checked={features.hasCounselling}
                    onCheckedChange={(c) => setFeatures({ ...features, hasCounselling: c })}
                  />
                </div>
              </div>
            </div>

            {/* Batches */}
            <div className="flex flex-col h-full overflow-hidden max-h-[300px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-500" /> Batch Enrollments
                </h3>
              </div>
              
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50">
                {allBatches.filter(b => b.name.toLowerCase().includes(batchSearch.toLowerCase()) || b.type?.toLowerCase().includes(batchSearch.toLowerCase())).length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No batches found matching "{batchSearch}"</p>
                ) : (
                  allBatches
                    .filter(b => b.name.toLowerCase().includes(batchSearch.toLowerCase()) || b.type?.toLowerCase().includes(batchSearch.toLowerCase()))
                    .map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{batch.name}</p>
                        <p className="text-xs text-slate-500">{batch.type}</p>
                      </div>
                      <Switch
                        checked={enrolledBatchIds.includes(batch.id)}
                        onCheckedChange={() => toggleBatch(batch.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200/70 dark:border-slate-700/50">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Access
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
