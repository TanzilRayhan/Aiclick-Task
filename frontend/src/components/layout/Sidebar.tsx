"use client";

import { useState, useEffect } from "react";
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
  User,
  MessageSquare,
  TrendingUp,
  Globe,
  Database,
  BarChart3,
  FileText,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  X
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const NAV_GROUPS = [
  {
    title: "Dashboard",
    items: [
      { name: "Overview", href: "/", icon: LayoutDashboard },
      { name: "Mentions Explorer", href: "#", icon: MessageSquare },
      { name: "Trend Analytics", href: "#", icon: TrendingUp },
      { name: "Sentiment Intelligence", href: "#", icon: ShieldCheck },
    ]
  },
  {
    title: "Analytics",
    items: [
      { name: "Model Comparison", href: "#", icon: BarChart3 },
      { name: "Source Monitoring", href: "#", icon: Globe },
      { name: "Competitor Tracking", href: "#", icon: Swords },
      { name: "Reports", href: "#", icon: FileText },
    ]
  },
  {
    title: "Workspace",
    items: [
      { name: "Saved Filters", href: "#", icon: Network },
      { name: "Exports", href: "#", icon: Database },
      { name: "Alerts", href: "#", icon: Zap },
    ]
  },
  {
    title: "System",
    items: [
      { name: "API Docs", href: "#", icon: FileText },
      { name: "Settings", href: "#", icon: Settings },
      { name: "Help Center", href: "#", icon: HelpCircle },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);
    
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    window.addEventListener('close-mobile-sidebar', handleClose);
    
    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('close-mobile-sidebar', handleClose);
    };
  }, []);

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-border bg-card/30 glass hidden xl:flex flex-col">
        <div className="flex h-20 items-center px-8 border-b border-border/50">
          <div className="flex items-center gap-3 opacity-20">
            <div className="w-9 h-9 rounded-xl bg-primary/10" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-20 bg-foreground/20 rounded" />
              <div className="h-2 w-12 bg-primary/20 rounded" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-2 w-12 bg-muted rounded ml-3" />
              <div className="space-y-2">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-10 w-full bg-muted/50 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[150] xl:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 z-[160] h-screen w-72 border-r border-border bg-card/30 glass flex flex-col transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0`}>
        <div className="flex h-20 items-center px-8 border-b border-border/50 justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-primary/10 p-1.5 shadow-inner">
              <img src="/logos/logo.svg" alt="Aiclicks Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter text-foreground leading-none">AICLICKS</span>
              <span className="text-[10px] font-bold text-primary tracking-[0.2em] mt-1 opacity-80 uppercase">Intelligence</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="xl:hidden w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-10 custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 mb-4">{group.title}</p>
              <nav className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : false;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group relative ${
                        isActive 
                          ? "text-primary bg-primary/10 shadow-sm" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={isActive ? "text-primary" : "group-hover:text-primary transition-colors"} />
                        <span>{item.name}</span>
                      </div>
                      {isActive ? (
                        <motion.div 
                          layoutId="sidebar-active"
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      ) : (
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-border/50 bg-secondary/20 space-y-4">
          {/* THEME TOGGLE INTEGRATED */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-card/50 border border-border/50">
            <button 
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all ${theme === 'light' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Sun size={14} className="mr-2" />
              <span className="text-[10px] font-bold uppercase">Light</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Moon size={14} className="mr-2" />
              <span className="text-[10px] font-bold uppercase">Dark</span>
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-foreground truncate">Admin User</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider truncate">Pro Plan</p>
            </div>
            <LogOut size={16} className="text-muted-foreground group-hover:text-destructive transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
}
