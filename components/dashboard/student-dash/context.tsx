"use client";

import { createContext, useContext, ReactNode } from "react";

interface DashboardContextType {
  userName: string | null;
  userImage: string | null;
  userTier: "NORMAL" | "PREMIUM" | "SUPER_PREMIUM";
  streak: number;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({
  children,
  userName,
  userImage,
  userTier,
  streak,
}: DashboardContextType & { children: ReactNode }) {
  return (
    <DashboardContext.Provider value={{ userName, userImage, userTier, streak }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
}