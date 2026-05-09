
import { redirect } from "next/navigation";
import { auth } from "../../auth";

export default async function AdminDashboard() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">Upload PYQs</div>
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">Upload Notes</div>
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">Create Mock Test</div>
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">Manage Users</div>
      </div>
    </div>
  );
}