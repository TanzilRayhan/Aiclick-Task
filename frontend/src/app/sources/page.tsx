"use client";

import { motion } from "framer-motion";
import { Network, Globe, ShieldAlert, Award } from "lucide-react";

export default function SourcesPage() {
  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 text-primary text-sm font-bold mb-2">
          <Network size={16} />
          <span className="uppercase tracking-widest text-[10px]">Citation Engine</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-gradient leading-tight">
          Source Authority
        </h1>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Top Referring Domains", icon: <Globe size={20} />, value: "Evaluating..." },
          { title: "Avg Domain Authority", icon: <Award size={20} />, value: "TBD" },
          { title: "Negative Citations", icon: <ShieldAlert size={20} />, value: "Scanning..." }
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm opacity-50"
          >
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              {item.icon}
              <h3 className="text-sm font-bold">{item.title}</h3>
            </div>
            <p className="text-2xl font-extrabold">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl border border-border bg-card p-12 shadow-sm text-center flex flex-col items-center"
      >
        <Network size={48} className="text-primary/20 mb-6" />
        <h2 className="text-2xl font-bold mb-4">Discover the root of AI knowledge</h2>
        <p className="text-muted-foreground max-w-lg mb-8">
          The Source Authority module maps the exact websites and citations that LLMs are using to construct answers about your brand. Identify which PR articles and reviews carry the most weight.
        </p>
        <div className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-secondary text-muted-foreground">
          Pending Data Pipeline Integration
        </div>
      </motion.div>
    </div>
  );
}
