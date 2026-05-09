  // ← replaces getServerSession(authOptions)
import { redirect } from "next/navigation";
import { auth } from "../../auth";

export default async function DashboardPage() {
  const session = await auth();   // ← replaces getServerSession(authOptions)
  if (!session) redirect("/login");

  const role = (session.user as any)?.role;

  if (role === "ADMIN") redirect("/admin");
  if (role === "PARENT") redirect("/parent");
  redirect("/student");
}