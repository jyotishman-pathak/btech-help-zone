
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { AdminShell } from "../../components/dashboard/AdminShell";

export default async function AdminDashboard() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard");

  return (
    <AdminShell/>
  );
}