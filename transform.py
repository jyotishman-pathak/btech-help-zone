import re

with open("components/dashboard/AdminShell.tsx", "r") as f:
    content = f.read()

# Replace the navigation block
old_nav = """            {([
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "content", label: "Content", icon: FileText },
              { id: "codes", label: "Mock Tests", icon: Code },
              { id: "analytics", label: "Analytics", icon: PieChart },
              { id: "settings", label: "Settings", icon: Settings },
            ] as const).map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}"""

new_nav = """            {([
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "content", label: "Content", icon: FileText },
              { id: "codes", label: "Mock Tests", icon: Code },
              { id: "analytics", label: "Analytics", icon: PieChart },
              { id: "pyq", label: "Upload PYQ", icon: Upload, href: "/admin/pyq" },
              { id: "settings", label: "Settings", icon: Settings },
            ] as const).map((item) => {
              if ('href' in item) {
                return (
                  <Link key={item.id} href={item.href}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                );
              }
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              );
            })}"""

content = content.replace(old_nav, new_nav)

# Fix background colors for SaaS look
content = content.replace('bg-zinc-50 dark:bg-zinc-950', 'bg-[#F7F5FF] dark:bg-[#0D0B1A]')
content = content.replace('bg-white dark:bg-zinc-900', 'bg-white dark:bg-[#12101F]')
content = content.replace('border-zinc-200 dark:border-zinc-800', 'border-slate-200/70 dark:border-slate-700/50')
content = content.replace('border-zinc-200 dark:border-zinc-700', 'border-slate-200 dark:border-slate-700')
content = content.replace('border-zinc-300 dark:border-zinc-600', 'border-slate-300 dark:border-slate-600')

# General zinc -> slate
content = content.replace('zinc-', 'slate-')

with open("components/dashboard/AdminShell.tsx", "w") as f:
    f.write(content)
