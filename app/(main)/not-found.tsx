import Link from "next/link";

import { FileQuestion } from "lucide-react";
import { Button } from "../../components/ui/button";


export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
          <FileQuestion className="w-10 h-10 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-6xl font-black text-zinc-900 dark:text-zinc-50">404</h1>
          <p className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mt-2">Page not found</p>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">This page doesn't exist. Maybe it was moved or the URL is wrong.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">Back to Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}