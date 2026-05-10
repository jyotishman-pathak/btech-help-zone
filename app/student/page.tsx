

import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { DashboardShell } from "../../components/dashboard/dashboard-shell";


export default async function StudentDashboard() {
   const session = await auth();
  
  if (!session?.user) redirect("/login");
  
  const role = (session.user as any).role;
  if (role !== "STUDENT") redirect("/dashboard"); // wrong role → router fixes it

  return <DashboardShell user={session?.user} />;
}