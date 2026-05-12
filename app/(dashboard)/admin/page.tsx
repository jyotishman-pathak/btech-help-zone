// app/(dashboard)/admin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { AdminShell } from "../../../components/dashboard/AdminShell";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/dashboard");
  }

  if ((session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <AdminShell
      admin={{
        name: session.user.name ?? "Admin",
        email: session.user.email ?? "",
        image: session.user.image ?? undefined,
      }}
    />
  );
}