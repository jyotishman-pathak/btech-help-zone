"use client";

import { useState } from "react";
import { Upload, Download, Loader2, CheckCircle2, AlertCircle, Database } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { AdminPageWrapper } from "../../../../components/dashboard/AdminPageWrapper";

export default function AdminPredictorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/predictor/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setFile(null);
        // Reset file input visually
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "CollegeName",
      "CollegeShortName",
      "CollegeType",
      "CollegeState",
      "BranchName",
      "Category",
      "Year",
      "Round",
      "ClosingRank",
      "OpeningRank"
    ];
    const sampleRow = [
      "Assam Engineering College",
      "AEC",
      "Govt",
      "Assam",
      "Computer Science and Engineering",
      "General",
      "2023",
      "1",
      "1500",
      "500"
    ];
    
    const csv = [headers, sampleRow].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "predictor_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminPageWrapper activeTab="predictor">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">Predictor Database</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage past cutoffs to power the student predictor tool.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="border-slate-200/70 dark:border-slate-700/50"
            >
              <Download className="w-4 h-4 mr-2" /> Download Template
            </Button>
          </div>
        </div>

        {/* Upload Card */}
        <Card className="border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F]">
          <CardContent className="p-6 md:p-8">
            <div className="max-w-xl">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-500" /> Upload Cutoff Data (CSV)
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Upload a CSV file with the required headers. The system will automatically update existing colleges and append new cutoff records.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  <Upload className="w-8 h-8 text-slate-400 mb-3" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    Click to browse
                  </label>
                  <p className="text-xs text-slate-500 mt-1">CSV files only</p>
                  
                  {file && (
                    <div className="mt-4 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md inline-flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      {file.name}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <p>{success}</p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Data...
                    </>
                  ) : (
                    "Upload to Database"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
}
