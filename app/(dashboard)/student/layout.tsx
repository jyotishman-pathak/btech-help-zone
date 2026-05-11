"use client";

import { useState } from "react";
import { DashboardSidebar } from "../../../components/dashboard/student-dash/dashboard-sidebar";
import { DashboardHeader } from "../../../components/dashboard/student-dash/dashboard-header";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.01]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(128 128 128) 1px, transparent 1px)`,
          backgroundSize: "32px 32px"
        }}
      />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          // These props will be passed from your page via context or props
          userName={null}
          userImage={null}
          userTier="NORMAL"
          streak={0}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          {/* Header */}
          <DashboardHeader
            onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            userName={null}
            userImage={null}
            userTier="NORMAL"
          />

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}