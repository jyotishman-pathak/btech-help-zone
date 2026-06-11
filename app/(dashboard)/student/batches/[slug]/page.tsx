import { notFound } from "next/navigation";

import { CheckCircle2, Clock, FileText, Play, Users, BookOpen, Timer } from "lucide-react";
import { auth } from "../../../../../auth";
import { Badge } from "../../../../../components/ui/badge";
import { Card, CardContent } from "../../../../../components/ui/card";
import { EnrollButton } from "../../../../../components/batch/EnrollButton";


async function getBatch(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/batches/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function BatchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [batch, session] = await Promise.all([getBatch(slug), auth()]);

  if (!batch) notFound();

  const user = session?.user;

  // Group tests by folder
  const groupedTests: Record<string, { folderName: string, folderOrder: number, tests: any[] }> = {
    "unfolder": { folderName: "Other Tests", folderOrder: 9999, tests: [] }
  };

  if (batch?.tests) {
    batch.tests.forEach((bt: any) => {
      const folderId = bt.test.folderId || "unfolder";
      if (!groupedTests[folderId]) {
        groupedTests[folderId] = {
          folderName: bt.test.folder?.name || "Other Tests",
          folderOrder: bt.test.folder?.order ?? 9999,
          tests: []
        };
      }
      groupedTests[folderId].tests.push(bt);
    });
  }

  const sortedFolders = Object.values(groupedTests).filter(g => g.tests.length > 0).sort((a, b) => a.folderOrder - b.folderOrder);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Banner */}
      {batch.bannerUrl ? (
        <div className="h-56 md:h-72 overflow-hidden">
          <img src={batch.bannerUrl} alt={batch.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-56 md:h-72 bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center">
          <span className="text-8xl font-black text-white/20 dark:text-zinc-900/20">{batch.name.slice(0, 2)}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3 flex-wrap">
                  {batch.badge && (
                    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{batch.badge}</Badge>
                  )}
                  <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {batch.type.replace("_", " ")}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50">{batch.name}</h1>
                {batch.tagline && <p className="text-zinc-500 dark:text-zinc-400 text-lg">{batch.tagline}</p>}
                {batch.description && <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{batch.description}</p>}

                <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 pt-2">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {batch._count?.enrollments ?? 0} students</span>
                  <span className="flex items-center gap-1.5"><Timer className="w-4 h-4" /> {batch.validDays ? `${batch.validDays} days access` : "Lifetime access"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {batch.features.length > 0 && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardContent className="p-6">
                  <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4">What's included</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {batch.features.map((f: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {f.text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tests */}
            {batch.tests.length > 0 && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardContent className="p-6">
                  <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-zinc-500" /> Mock Tests ({batch.tests.length})
                  </h2>
                  <div className="space-y-6">
                    {sortedFolders.map((group, idx) => (
                      <div key={idx} className="space-y-3">
                        <h3 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{group.folderName}</h3>
                        <div className="space-y-2">
                          {group.tests.map((bt: any) => (
                            <div key={bt.id} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                              <Play className="w-4 h-4 text-zinc-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{bt.test.title}</p>
                                <p className="text-xs text-zinc-500">{bt.test.duration} mins · {bt.test.totalMarks} marks</p>
                              </div>
                              {!batch.isEnrolled && <span className="text-xs text-zinc-400">🔒</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {batch.notes.length > 0 && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardContent className="p-6">
                  <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-zinc-500" /> Study Materials ({batch.notes.length})
                  </h2>
                  <div className="space-y-2">
                    {batch.notes.map((bn: any) => (
                      <div key={bn.id} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{bn.note.title}</p>
                          <p className="text-xs text-zinc-500">{bn.note.type}</p>
                        </div>
                        {!batch.isEnrolled && <span className="text-xs text-zinc-400">🔒</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Enroll card */}
          <div className="sticky top-4">
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div>
                  {batch.isFree ? (
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">FREE</p>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      {batch.originalPrice && (
                        <span className="text-lg line-through text-zinc-400">
                          ₹{(batch.originalPrice / 100).toLocaleString("en-IN")}
                        </span>
                      )}
                      <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                        ₹{(batch.price / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {batch.originalPrice && !batch.isFree && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Save ₹{((batch.originalPrice - batch.price) / 100).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                <EnrollButton
                  batchId={batch.id}
                  batchSlug={batch.slug}
                  batchName={batch.name}
                  isFree={batch.isFree}
                  price={batch.price}
                  isEnrolled={batch.isEnrolled}
                  isLoggedIn={!!user}
                  leadFormFields={batch.leadForm?.fields ?? []}
                  userEmail={user?.email ?? ""}
                  userName={user?.name ?? ""}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}