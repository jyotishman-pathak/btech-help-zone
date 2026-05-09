// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "../../auth";

export default async function DashboardRouter() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const role = (session.user as any).role;

  if (role === "STUDENT") redirect("/student");
  if (role === "ADMIN") redirect("/admin");
  if (role === "PARENT") redirect("/parent");

  // ✅ Role not assigned yet — never redirect back to /login
  redirect("/onboarding"); 
}