import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";
import { SettingsForm } from "../../../../components/dashboard/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true, school: true, district: true, email: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-16">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-2">Profile Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Update your personal information and contact details.</p>
        
        <SettingsForm user={user} />
      </div>
    </div>
  );
}
