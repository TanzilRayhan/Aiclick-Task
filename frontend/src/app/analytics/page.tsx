"use client";

import { motion } from "framer-motion";
import { LineChart, BarChart3, TrendingUp, AlertCircle, Zap } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 text-primary text-sm font-bold mb-2">
          <TrendingUp size={16} />
          <span className="uppercase tracking-widest text-[10px]">Deep Insights</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-gradient leading-tight">
          Advanced Analytics
        </h1>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center"
        >
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <Zap size={32} />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">AI Visibility Scoring</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Our proprietary algorithm calculating your overall brand presence across LLM outputs, weighted by rank and sentiment.
          </p>
          <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all border border-border bg-secondary text-foreground h-11 px-6 shadow-sm opacity-50 cursor-not-allowed">
            Processing Data Model...
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center"
        >
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-4">
            <LineChart size={32} />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">Sentiment Trend Forecasting</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Predictive modeling to anticipate how your brand sentiment might shift based on recent trajectory.
          </p>
          <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all border border-border bg-secondary text-foreground h-11 px-6 shadow-sm opacity-50 cursor-not-allowed">
            Training Forecast...
          </div>
        </motion.div>
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 text-blue-600 dark:text-blue-400 flex items-center gap-4">
        <AlertCircle size={24} />
        <p className="text-sm font-medium">Advanced analytics modules require the Pro Tier subscription. Contact sales to enable historical data processing.</p>
      </div>
    </div>
  );
}
