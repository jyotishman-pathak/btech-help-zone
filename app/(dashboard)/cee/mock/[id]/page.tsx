// app/(dashboard)/cee/mock/[id]/page.tsx

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "../../../../../auth";
import { CBTEngine } from "../../../../../components/dashboard/MocksShell";


export default async function MockTestPage({
  params,
}: {
  params: Promise<{ id: string }>;   // ← Promise in Next.js 16
}) {
  const { id } = await params;       // ← must await before use
  const session = await auth();

  if (!session?.user) redirect("/login?callbackUrl=/cee/mock");

  return (
    <Suspense fallback={<MockTestLoader />}>
      <CBTEngine
        testId={id}
        user={{
          id: session.user.id,
          name: session.user.name,
        }}
      />
    </Suspense>
  );
}

function MockTestLoader() {
  return (
    <div className="min-h-screen bg-[#F7F5FF] dark:bg-[#0D0B1A] flex flex-col items-center justify-center p-4 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center animate-pulse">
        <svg className="w-8 h-8 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Initializing Test Environment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Secure connection · Loading questions · Syncing timer</p>
      </div>
    </div>
  );
}