
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../../../components/ui/button";
import { AdminTestCreator } from "../../../../../components/dashboard/AdminTestCreator";

import { AdminPageWrapper } from "../../../../../components/dashboard/AdminPageWrapper";

export default function NewTestPage() {
  return (
    <AdminPageWrapper activeTab="tests" backHref="/admin/tests">
      <div className="pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Create Test</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">New mock test with questions</p>
          </div>
        </div>
        <AdminTestCreator />
      </div>
    </AdminPageWrapper>
  );
}