// app/admin/tests/new/page.tsx

import { AdminTestCreator } from "../../../../components/dashboard/AdminTestCreator";


export default function NewTestPage() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-black text-center mb-8">Create Mock Test</h1>
      <AdminTestCreator />
    </div>
  );
}