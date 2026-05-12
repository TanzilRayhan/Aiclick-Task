"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  LineChart, 
  Swords, 
  Network,
  Settings,
  HelpCircle,
  Zap,
  LogOut,
  User
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Competitors", href: "/competitors", icon: Swords },
  { name: "Sources", href: "/sources", icon: Network },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/50 glass hidden md:flex flex-col">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gradient">Aiclicks</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div>
          <p className="px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Menu</p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Support</p>
          <nav className="space-y-1">
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <Settings size={18} />
              Settings
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <HelpCircle size={18} />
              Help Center
            </Link>
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary border border-border cursor-pointer hover:bg-muted transition-all">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">Admin User</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">admin@aiclicks.com</p>
          </div>
          <LogOut size={16} className="text-muted-foreground hover:text-destructive transition-colors" />
        </div>
      </div>
    </aside>
  );
}
