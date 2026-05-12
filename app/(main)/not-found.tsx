import Link from "next/link";

import { FileQuestion } from "lucide-react";
import { Button } from "../../components/ui/button";


export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
          <FileQuestion className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h1 className="text-6xl font-black text-slate-900 dark:text-slate-50">404</h1>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-2">Page not found</p>
          <p className="text-slate-500 dark:text-slate-400 mt-2">This page doesn't exist. Maybe it was moved or the URL is wrong.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">Back to Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-slate-200 dark:border-slate-800">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}