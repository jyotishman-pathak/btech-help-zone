import { auth } from "../../../auth";
import DashboardLayout from "../../../components/dashboard/student-dash/dummy-layout";
import prisma from "../../../lib/prisma.client";

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

  const userRecord = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { hasPredictor: true, hasAnalytics: true, hasCounselling: true }
  }) : null;

  return (
    <DashboardLayout
      userName={session?.user?.name ?? null}
      userImage={session?.user?.image ?? null}
      userTier={tier}
      streak={0}
      userFeatures={userRecord}
    >
      {children}
    </DashboardLayout>
  );
}