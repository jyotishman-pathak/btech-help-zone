// app/(dashboard)/admin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { AdminShell } from "../../../components/dashboard/AdminShell";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;

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
      initialTab={resolvedSearchParams.tab}
    />
  );
}