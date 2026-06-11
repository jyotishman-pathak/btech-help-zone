"use client";

import { useState } from "react";
import { Users, Copy, Check, Target, Trophy, LogOut, Loader2, Sparkles, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function SquadClient({ initialSquad, userId, userName }: { initialSquad: any, userId: string, userName: string }) {
  const router = useRouter();
  const [squad, setSquad] = useState(initialSquad);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [createName, setCreateName] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!createName.trim()) return setError("Please enter a squad name");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/squad/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Refresh page to load new squad
      router.refresh();
      // Optimistically update
      setSquad({
        ...data.squad,
        members: [{ id: userId, name: userName, image: null }],
        currentScore: 0,
        goalTarget: 500
      });
    } catch (err: any) {
      setError(err.message || "Failed to create squad");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return setError("Please enter an invite code");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/squad/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      router.refresh();
      // Normally we'd fetch the whole squad or rely on router.refresh
      // For simplicity, we just reload window if optimism fails
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to join squad");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this squad?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/squad/leave", { method: "POST" });
      if (!res.ok) throw new Error("Failed to leave");
      setSquad(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = () => {
    if (!squad?.inviteCode) return;
    navigator.clipboard.writeText(squad.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!squad) {
    return (
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        {/* Create Squad Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Create a Squad</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">Form a new study squad and invite up to 3 friends to join you.</p>
          
          <input
            type="text"
            placeholder="Enter Squad Name (e.g. Physics Pro Max)"
            className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
            Create Squad
          </button>
        </div>

        {/* Join Squad Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Join a Squad</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">Have an invite code? Enter it below to join your friends.</p>
          
          <input
            type="text"
            placeholder="Enter 8-character Invite Code"
            className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 mb-4 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join Squad"}
          </button>
        </div>

        {error && (
          <div className="col-span-1 md:col-span-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  const progressPercentage = Math.min(100, Math.round((squad.currentScore / squad.goalTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Squad Header & Progress */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{squad.name}</h2>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full">
                {squad.members.length}/4 Members
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">Weekly Goal: Solve {squad.goalTarget} questions together</p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-2 pl-4 pr-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-sm font-medium text-zinc-500">Invite Code:</div>
            <div className="font-mono font-bold text-zinc-900 dark:text-white tracking-widest">{squad.inviteCode}</div>
            <button 
              onClick={copyInvite}
              className="p-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 relative z-10">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Target className="w-4 h-4" /> {squad.currentScore} solved
            </span>
            <span className="text-zinc-400">{squad.goalTarget} goal</span>
          </div>
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-center text-sm font-medium text-zinc-500 mt-3">
            {progressPercentage >= 100 ? "Goal Crushed! 🎉" : `${squad.goalTarget - squad.currentScore} questions left to hit the goal!`}
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" />
            Squad Members
          </h3>
          <div className="space-y-4">
            {squad.members.map((member: any) => (
              <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {member.name || "Student"} {member.id === userId && "(You)"}
                  </div>
                  <div className="text-sm text-zinc-500 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-500" /> Active Player
                  </div>
                </div>
              </div>
            ))}
            {squad.members.length < 4 && (
              <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 opacity-60">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="font-medium text-zinc-500 dark:text-zinc-400">
                  Waiting for more members...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-2">Leave Squad</h3>
            <p className="text-sm text-zinc-500 mb-4">
              If you leave, your points won't count towards the squad's weekly goal anymore.
            </p>
            <button
              onClick={handleLeave}
              disabled={loading}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Leave Squad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
