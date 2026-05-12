"use client";

import { useEffect } from "react";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">Something went wrong</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            An unexpected error occurred. It's been noted and we'll look into it.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 text-left text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg overflow-auto max-h-32">
              {error.message}
            </pre>
          )}
        </div>
        <Button onClick={reset} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
          <RefreshCw className="w-4 h-4 mr-2" /> Try again
        </Button>
      </div>
    </div>
  );
}