"use client";

import { motion } from "framer-motion";
import { Swords, AlertCircle, BarChart2 } from "lucide-react";

export default function CompetitorsPage() {
  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 text-primary text-sm font-bold mb-2">
          <Swords size={16} />
          <span className="uppercase tracking-widest text-[10px]">Market Positioning</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-gradient leading-tight">
          Competitor Analysis
        </h1>
      </motion.div>

      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-secondary/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        
        <div className="relative z-10 flex flex-col items-center max-w-lg">
          <div className="p-5 bg-rose-500/10 text-rose-500 rounded-3xl mb-6 shadow-inner">
            <BarChart2 size={40} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Benchmark against your industry</h2>
          <p className="text-muted-foreground mb-8">
            Compare your AI share of voice against up to 5 competitors. Identify which LLMs prefer your brand and where competitors hold an advantage.
          </p>
          
          <div className="flex items-center gap-4 w-full p-2 bg-secondary rounded-2xl border border-border">
            <input 
              type="text" 
              placeholder="Enter competitor domain..." 
              className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-medium"
              disabled
            />
            <button className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold opacity-50 cursor-not-allowed">
              Add Target
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 opacity-50">Feature in active development</p>
        </div>
      </div>
    </div>
  );
}
