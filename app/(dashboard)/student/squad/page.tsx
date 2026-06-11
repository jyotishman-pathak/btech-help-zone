import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma.client";
import { SquadClient } from "./SquadClient";

export default async function SquadPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      squad: {
        include: {
          members: {
            select: { id: true, name: true, image: true, email: true },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-16">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-2">Study Squads</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Collaborate with friends and achieve your study goals together.</p>
        
        <SquadClient initialSquad={user.squad} userId={user.id} userName={user.name || "Student"} />
      </div>
    </div>
  );
}
