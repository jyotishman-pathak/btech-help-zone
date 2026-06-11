import { AdminPageWrapper } from "../../../../components/dashboard/AdminPageWrapper";
import prisma from "../../../../lib/prisma.client";
import { Users, Trash2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";

export default async function AdminSquadsPage() {
  const squads = await prisma.squad.findMany({
    include: {
      _count: { select: { members: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminPageWrapper activeTab="squads">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Study Squads</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">View and manage all active study groups</p>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">{squads.length} Total Squads</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {squads.map(squad => (
            <Card key={squad.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-start">
                  <span className="truncate pr-2">{squad.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${squad.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {squad.isActive ? "Active" : "Inactive"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {squad._count.members}/4 Members</span>
                  <span className="flex items-center gap-1 font-mono text-xs"><span className="text-zinc-400">Code:</span> {squad.inviteCode}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-indigo-600 flex items-center gap-1"><Trophy className="w-3 h-3" /> {squad.currentScore}</span>
                    <span className="text-zinc-400">Goal: {squad.goalTarget}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500"
                      style={{ width: `${Math.min(100, (squad.currentScore / squad.goalTarget) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-xs text-zinc-400">
                  <span>Created {new Date(squad.createdAt).toLocaleDateString()}</span>
                  <button className="text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3 h-3" /> Disband
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {squads.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p className="font-medium">No squads created yet.</p>
              <p className="text-sm text-zinc-400">When students create squads, they will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </AdminPageWrapper>
  );
}
