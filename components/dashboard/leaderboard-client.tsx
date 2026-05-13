"use client";

import { Crown, Trophy, Medal, Search, Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { useState } from "react";
import { Badge } from "../ui/badge";

interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  image?: string | null;
  score: number;
  date: string;
}

interface LeaderboardClientProps {
  leaderboard: LeaderboardUser[];
  currentUser: { rank: number | null; score: number | null };
}

export function LeaderboardClient({ leaderboard, currentUser }: LeaderboardClientProps) {
  const [search, setSearch] = useState("");

  const filteredLeaderboard = leaderboard.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-500/20">
            <Medal className="w-5 h-5 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Medal className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">#{rank}</span>
          </div>
        );
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-yellow-200 dark:border-yellow-800/50";
      case 2:
        return "bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/40 dark:to-gray-900/40 border-slate-200 dark:border-slate-700/50";
      case 3:
        return "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800/50";
      default:
        return "bg-white/60 dark:bg-[#12101F]/60 border-slate-200/70 dark:border-slate-700/50 hover:bg-white dark:hover:bg-[#12101F]";
    }
  };

  return (
    <div className="bg-[#F7F5FF] dark:bg-[#0D0B1A] min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 rounded-tl-3xl shadow-inner border-l border-slate-200/70 dark:border-slate-700/50">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
              <Crown className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              Global Leaderboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              Compete with thousands of CEE aspirants. Rankings are based on your highest score across all full-length mock tests.
            </p>
          </div>
          
          {currentUser.rank && (
            <Card className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-indigo-950 to-violet-950 text-white min-w-[200px] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
               <CardContent className="p-5 relative z-10">
                 <div className="text-sm font-semibold text-indigo-200 mb-1">Your Rank</div>
                 <div className="flex items-end gap-2">
                   <span className="text-4xl font-black">#{currentUser.rank}</span>
                 </div>
                 <div className="text-indigo-300 text-sm mt-2 flex items-center gap-1">
                   <Star className="w-3 h-3" /> {currentUser.score} points
                 </div>
               </CardContent>
            </Card>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search for a student..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-white dark:bg-[#12101F] border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-base"
          />
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {filteredLeaderboard.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p>No students found. Keep preparing!</p>
            </div>
          ) : (
            filteredLeaderboard.map((user) => (
              <div 
                key={user.userId}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${getRankStyle(user.rank)}`}
              >
                <div className="flex-shrink-0">
                  {getRankBadge(user.rank)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </h3>
                    {user.rank === 1 && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none text-[10px] uppercase">Champion</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    Last active: {new Date(user.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {user.score}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Score
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
