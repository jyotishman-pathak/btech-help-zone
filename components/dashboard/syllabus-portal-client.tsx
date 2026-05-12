"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Atom, Microscope, Calculator, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { toggleTopicProgress } from "../../app/actions/syllabus";

interface Topic {
  id: string;
  name: string;
  order: number;
}

interface Subject {
  id: string;
  name: string;
  weightage: number;
  topics: Topic[];
}

interface UserProgress {
  topicId: string;
  completed: boolean;
}

interface SyllabusPortalClientProps {
  subjects: Subject[];
  initialProgress: UserProgress[];
}

const SUBJECT_META: Record<string, { icon: React.ElementType; color: string; light: string; gradient: string }> = {
  Physics: {
    icon: Atom,
    color: "text-indigo-600 dark:text-indigo-400",
    light: "bg-indigo-50 dark:bg-indigo-900/20",
    gradient: "from-indigo-600 to-violet-600"
  },
  Chemistry: {
    icon: Microscope,
    color: "text-emerald-600 dark:text-emerald-400",
    light: "bg-emerald-50 dark:bg-emerald-900/20",
    gradient: "from-emerald-600 to-teal-600"
  },
  Mathematics: {
    icon: Calculator,
    color: "text-orange-600 dark:text-orange-400",
    light: "bg-orange-50 dark:bg-orange-900/20",
    gradient: "from-orange-500 to-red-600"
  },
};

const FALLBACK_META = {
  icon: BookOpen,
  color: "text-slate-600 dark:text-slate-400",
  light: "bg-slate-100 dark:bg-slate-800",
  gradient: "from-slate-600 to-slate-800"
};

export function SyllabusPortalClient({ subjects, initialProgress }: SyllabusPortalClientProps) {
  const [progressState, setProgressState] = useState<Record<string, boolean>>(() => {
    const acc: Record<string, boolean> = {};
    initialProgress.forEach((p) => {
      acc[p.topicId] = p.completed;
    });
    return acc;
  });
  
  const [expandedSubject, setExpandedSubject] = useState<string | null>(subjects[0]?.id || null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (topicId: string, currentStatus: boolean, topicName: string) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setProgressState(prev => ({ ...prev, [topicId]: newStatus }));
    
    startTransition(async () => {
      const res = await toggleTopicProgress(topicId, newStatus);
      if (res.success) {
        if (newStatus) {
          toast.success("Topic Completed!", {
            description: `Great job finishing "${topicName}". Keep the momentum going!`,
          });
        }
      } else {
        // Revert on failure
        setProgressState(prev => ({ ...prev, [topicId]: currentStatus }));
        toast.error("Error updating progress", {
          description: "Please try again.",
        });
      }
    });
  };

  const totalTopics = subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
  const totalCompleted = subjects.reduce(
    (acc, sub) => acc + sub.topics.filter(t => progressState[t.id]).length,
    0
  );
  const overallProgress = totalTopics === 0 ? 0 : Math.round((totalCompleted / totalTopics) * 100);

  return (
    <div className="bg-[#F7F5FF] dark:bg-[#0D0B1A] min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 rounded-tl-3xl shadow-inner border-l border-slate-200/70 dark:border-slate-700/50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Syllabus Tracker
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              Track your preparation journey for CEE. Check off topics as you learn, practice, and master them.
            </p>
          </div>
          
          <Card className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-indigo-950 to-violet-950 text-white min-w-[240px] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
             <CardContent className="p-6 relative z-10">
               <div className="flex items-center justify-between mb-4">
                 <span className="text-sm font-semibold text-indigo-200">Overall Progress</span>
                 <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-none">
                   {totalCompleted} / {totalTopics}
                 </Badge>
               </div>
               <div className="flex items-end gap-3 mb-2">
                 <span className="text-4xl font-black">{overallProgress}%</span>
                 <span className="text-indigo-200 text-sm mb-1 font-medium">completed</span>
               </div>
               <Progress value={overallProgress} className="h-2 bg-indigo-900/50 [&>div]:bg-gradient-to-r [&>div]:from-indigo-400 [&>div]:to-violet-400" />
             </CardContent>
          </Card>
        </div>

        {/* Subjects List */}
        <div className="space-y-4">
          {subjects.length === 0 ? (
            <Card className="rounded-2xl border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-[#12101F] py-12 text-center shadow-sm">
               <CardContent>
                 <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No Syllabus Found</h3>
                 <p className="text-slate-500 mt-2">The administrators haven't added any subjects or topics yet.</p>
               </CardContent>
            </Card>
          ) : (
            subjects.map((sub) => {
              const meta = SUBJECT_META[sub.name] ?? FALLBACK_META;
              const Icon = meta.icon;
              const subCompleted = sub.topics.filter(t => progressState[t.id]).length;
              const subProgress = sub.topics.length === 0 ? 0 : Math.round((subCompleted / sub.topics.length) * 100);
              const isExpanded = expandedSubject === sub.id;

              return (
                <Card 
                  key={sub.id} 
                  className={`rounded-2xl border-slate-200/70 dark:border-slate-700/50 transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? "bg-white dark:bg-[#12101F] shadow-lg ring-1 ring-slate-200 dark:ring-slate-800" 
                      : "bg-white/60 dark:bg-[#12101F]/60 hover:bg-white dark:hover:bg-[#12101F] shadow-sm hover:shadow-md cursor-pointer"
                  }`}
                >
                  <CardHeader 
                    className={`pb-4 ${!isExpanded ? "cursor-pointer" : ""}`}
                    onClick={() => !isExpanded && setExpandedSubject(sub.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${meta.light}`}>
                          <Icon className={`w-6 h-6 ${meta.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {sub.name}
                            {subProgress === 100 && (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none ml-2 text-[10px] uppercase tracking-wider py-0 px-2 h-5">Mastered</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-slate-500 mt-1 font-medium">
                            {subCompleted} of {sub.topics.length} topics completed
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="hidden md:flex items-center gap-3 w-48">
                          <Progress value={subProgress} className={`h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:${meta.gradient}`} />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{subProgress}%</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedSubject(isExpanded ? null : sub.id);
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-auto md:ml-0"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </button>
                      </div>
                      
                      {/* Mobile Progress */}
                      <div className="md:hidden flex items-center gap-3 w-full">
                        <Progress value={subProgress} className={`h-2 flex-1 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:${meta.gradient}`} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{subProgress}%</span>
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <CardContent className="pt-0 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0D0B1A]/30">
                          {sub.topics.length === 0 ? (
                            <div className="py-8 text-center text-slate-500">
                              No topics have been added to this subject yet.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1 p-4">
                              {sub.topics.map((topic, index) => {
                                const isCompleted = progressState[topic.id] || false;
                                return (
                                  <div 
                                    key={topic.id}
                                    onClick={() => handleToggle(topic.id, isCompleted, topic.name)}
                                    className={`group flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer select-none border border-transparent ${
                                      isCompleted 
                                        ? "hover:bg-slate-100 dark:hover:bg-slate-800/50" 
                                        : "hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-700"
                                    }`}
                                  >
                                    <div className="relative flex items-center justify-center shrink-0 w-6 h-6">
                                      {isPending && isCompleted ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                      ) : isCompleted ? (
                                        <motion.div
                                          initial={{ scale: 0.5, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        </motion.div>
                                      ) : (
                                        <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-sm md:text-base font-medium truncate block transition-colors duration-200 ${
                                        isCompleted 
                                          ? "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600" 
                                          : "text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white"
                                      }`}>
                                        <span className="text-slate-400 mr-2 text-xs font-mono">{index + 1}.</span>
                                        {topic.name}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
