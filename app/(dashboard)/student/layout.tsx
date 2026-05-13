import { auth } from "../../../auth";
import DashboardLayout from "../../../components/dashboard/student-dash/dummy-layout";


export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const tier =
    ((session?.user as any)?.tier as
      | "NORMAL"
      | "PREMIUM"
      | "SUPER_PREMIUM") ?? "NORMAL";

  return (
    <DashboardLayout
      userName={session?.user?.name ?? null}
      userImage={session?.user?.image ?? null}
      userTier={tier}
      streak={0}
    >
      {children}
    </DashboardLayout>
  );
}