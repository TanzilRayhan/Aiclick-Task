"use client";

import { useEffect, useState, useMemo } from "react";
import { MentionsService } from "@/services/api";
import {
  BarChart3,
  Search,
  TrendingUp,
  MessageSquare,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Zap,
  Globe,
  ShieldCheck,
  ExternalLink,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { useTheme } from "next-themes";

const MODEL_LOGOS: Record<string, string> = {
  chatgpt: "/logos/chatgpt.svg",
  claude: "/logos/claude.svg",
  gemini: "/logos/gemini.svg",
  perplexity: "/logos/perplexity.svg"
};

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity"
};

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [mentions, setMentions] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [totalMentions, setTotalMentions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMentionsLoading, setIsMentionsLoading] = useState(true);
  const [isTrendsLoading, setIsTrendsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // State for Filters & Sorting
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("mention_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [trendView, setTrendView] = useState<"daily" | "weekly">("daily");
  const [trendRange, setTrendRange] = useState(30);

  useEffect(() => setMounted(true), []);

  // Aggregated Weekly Trends
  const displayTrends = useMemo(() => {
    if (trendView === "daily") return trends;

    const weeklyMap: Record<string, { date: string, total: number, mentioned: number }> = {};
    trends.forEach(item => {
      const date = parseISO(item.date);
      const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
      if (!weeklyMap[weekStart]) {
        weeklyMap[weekStart] = { date: weekStart, total: 0, mentioned: 0 };
      }
      weeklyMap[weekStart].total += item.total;
      weeklyMap[weekStart].mentioned += item.mentioned;
    });
    return Object.values(weeklyMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [trends, trendView]);

  // Fetch Summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await MentionsService.getSummary();
        setSummary(data);
      } catch (err) {
        console.error("Summary API Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch summary");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // Fetch Trends
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsTrendsLoading(true);
        const response = await MentionsService.getTrends(trendRange);
        setTrends(response.data);
      } catch (err) {
        console.error("Trends API Error:", err);
      } finally {
        setIsTrendsLoading(false);
      }
    };
    fetchTrends();
  }, [trendRange]);

  // Fetch Mentions with Filters & Sorting
  useEffect(() => {
    const fetchMentions = async () => {
      try {
        setIsMentionsLoading(true);
        const response = await MentionsService.getMentions({
          page,
          per_page: perPage,
          sort_by: sortBy,
          sort_order: sortOrder,
          filters: {
            model: selectedModel?.toLowerCase(),
            sentiment: selectedSentiment?.toLowerCase(),
            search: searchQuery || undefined
          }
        });
        setMentions(response.data);
        setTotalMentions(response.total);
      } catch (err) {
        console.error("Mentions API Error:", err);
      } finally {
        setIsMentionsLoading(false);
      }
    };

    const timer = setTimeout(fetchMentions, searchQuery ? 500 : 0);
    return () => clearTimeout(timer);
  }, [page, perPage, selectedModel, selectedSentiment, searchQuery, sortBy, sortOrder]);

  const resetFilters = () => {
    setSelectedModel(null);
    setSelectedSentiment(null);
    setSearchQuery("");
    setPage(1);
    setSortBy("mention_date");
    setSortOrder("desc");
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
    return sortOrder === "asc" ? <ArrowUp size={12} className="ml-1 text-primary" /> : <ArrowDown size={12} className="ml-1 text-primary" />;
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col p-10 min-h-screen bg-background selection:bg-primary selection:text-primary-foreground transition-colors duration-500">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full"></div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 glass border-b border-border max-w-7xl mx-auto w-full rounded-md">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gradient">Aiclicks Intelligence</span>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            {/* THEME TOGGLE */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-all active:scale-95 text-foreground shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 lg:py-10 max-w-7xl mx-auto w-full space-y-12 relative">
        {/* TITLE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 text-primary text-sm font-bold mb-2">
              <ShieldCheck size={16} />
              <span className="uppercase tracking-widest text-[10px]">Real-time Monitoring Active</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-gradient leading-tight">
              Analytics Overview
            </h1>
          </motion.div>
        </div>

        {/* ERROR STATE */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-destructive flex items-center gap-4">
                <div className="bg-destructive/10 p-2 rounded-lg">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="font-bold">Connection Issue Detected</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS GRID */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Total Queries"
            value={summary?.total_queries}
            loading={isLoading}
            icon={<Search size={22} />}
            trend="+20.1% increase"
            trendIcon={<ArrowUpRight size={16} />}
            trendColor="text-emerald-500"
            delay={0.1}
          />
          <StatCard
            title="Mention Rate"
            value={summary?.mention_percentage ? `${summary.mention_percentage.toFixed(1)}%` : null}
            loading={isLoading}
            icon={<MessageSquare size={22} />}
            trend="Global Avg"
            delay={0.2}
            accentColor="text-blue-500"
            accentBg="bg-blue-500/10"
          />
          <StatCard
            title="Avg Rank Position"
            value={summary?.avg_rank?.toFixed(2)}
            loading={isLoading}
            icon={<BarChart3 size={22} />}
            trend="Lower is better"
            trendIcon={<ArrowDownRight size={16} />}
            trendColor="text-emerald-500"
            delay={0.3}
            accentColor="text-amber-500"
            accentBg="bg-amber-500/10"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid gap-8 lg:grid-cols-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-4 rounded-3xl border border-border bg-card p-8 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tight">Visibility Trends</h3>
              <div className="flex gap-1 bg-secondary p-1 rounded-xl border border-border">
                <button
                  onClick={() => setTrendView("daily")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${trendView === 'daily' ? 'bg-card text-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  DAILY
                </button>
                <button
                  onClick={() => setTrendView("weekly")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${trendView === 'weekly' ? 'bg-card text-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  WEEKLY
                </button>
                <div className="w-[1px] bg-border mx-1"></div>
                <button
                  className="px-4 py-1.5 rounded-lg text-[10px] font-bold bg-primary text-primary-foreground shadow-sm"
                >
                  30D
                </button>
              </div>
            </div>
            <div className="h-[300px] w-full relative">
              {isTrendsLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary/40" size={32} />
                </div>
              ) : displayTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMention" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                      tickFormatter={(val) => {
                        try {
                          return format(new Date(val), trendView === 'daily' ? 'MMM d' : 'MMM dd');
                        } catch { return val; }
                      }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip trendView={trendView} />} />
                    <Area type="monotone" dataKey="mentioned" stroke="var(--primary)" fillOpacity={1} fill="url(#colorMention)" strokeWidth={3} />
                    <Area type="monotone" dataKey="total" stroke="var(--muted-foreground)" fill="transparent" strokeWidth={1} strokeDasharray="5 5" opacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-40 italic text-sm">No trend data available</div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col"
          >
            <h3 className="text-xl font-bold tracking-tight mb-8">Sentiment Breakdown</h3>
            <div className="space-y-8 flex-1">
              {[
                { label: "Positive", value: 65, color: "bg-emerald-500" },
                { label: "Neutral", value: 25, color: "bg-slate-400" },
                { label: "Negative", value: 10, color: "bg-rose-500" },
              ].map((item) => (
                <div key={item.label} className="space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden p-[1px] border border-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-secondary border border-border text-[11px] text-muted-foreground italic text-center">
              "AI resonance is increasing in tech-focused sectors based on 10k analyzed responses."
            </div>
          </motion.div>
        </div>

        {/* TAB-BASED FILTERS & TABLE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl border border-border bg-card p-8 shadow-sm relative"
        >
          {/* TAB FILTERS */}
          <div className="flex flex-col gap-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Intelligence Feed</h3>
                <p className="text-sm text-muted-foreground mt-1">Detailed brand appearance analysis across AI models</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search queries..."
                    className="pl-10 h-10 w-64 rounded-xl border border-border bg-secondary px-3 py-1 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  onClick={resetFilters}
                  className="h-10 px-4 rounded-xl border border-border bg-secondary text-[10px] font-bold hover:bg-muted transition-all text-muted-foreground uppercase tracking-widest"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* TAB LIST */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-1">
              <button
                onClick={() => setSelectedModel(null)}
                className={`pb-3 px-4 text-sm font-bold transition-all relative ${!selectedModel ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                All Models
                {!selectedModel && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
              </button>
              {['ChatGPT', 'Claude', 'Gemini', 'Perplexity'].map(model => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center gap-2 ${selectedModel === model ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <img src={MODEL_LOGOS[model.toLowerCase()]} alt={model} className="w-4 h-4 rounded-sm object-contain" />
                  {model}
                  {selectedModel === model && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
                </button>
              ))}

              <div className="h-4 w-[1px] bg-border mx-4 hidden md:block"></div>

              {/* SENTIMENT MINI-TABS */}
              <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl border border-border mb-3 md:mb-1">
                <button
                  onClick={() => setSelectedSentiment(null)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-tighter ${!selectedSentiment ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All
                </button>
                {['Positive', 'Neutral', 'Negative'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSentiment(s)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-tighter ${selectedSentiment === s ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 pt-0 font-bold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:text-foreground" onClick={() => handleSort("query_text")}>
                    <div className="flex items-center">Query & Model <SortIcon column="query_text" /></div>
                  </th>
                  <th className="pb-4 pt-0 font-bold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:text-foreground" onClick={() => handleSort("sentiment")}>
                    <div className="flex items-center">Sentiment <SortIcon column="sentiment" /></div>
                  </th>
                  <th className="pb-4 pt-0 font-bold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:text-foreground" onClick={() => handleSort("mentioned")}>
                    <div className="flex items-center">Status <SortIcon column="mentioned" /></div>
                  </th>
                  <th className="pb-4 pt-0 font-bold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:text-foreground" onClick={() => handleSort("rank_position")}>
                    <div className="flex items-center">Rank <SortIcon column="rank_position" /></div>
                  </th>
                  <th className="pb-4 pt-0 font-bold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer hover:text-foreground" onClick={() => handleSort("mention_date")}>
                    <div className="flex items-center">Date <SortIcon column="mention_date" /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isMentionsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-8 bg-secondary rounded-xl my-2"></td>
                    </tr>
                  ))
                ) : mentions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center opacity-30">
                      <Search size={40} className="mx-auto mb-4" />
                      <span className="font-bold tracking-widest uppercase text-xs">No records found</span>
                    </td>
                  </tr>
                ) : (
                  mentions.map((mention) => (
                    <tr key={mention.id} className="group hover:bg-secondary/50 transition-colors">
                      <td className="py-5 pr-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{mention.query_text}</span>
                          <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5 uppercase tracking-widest font-extrabold opacity-70">
                            <img
                              src={MODEL_LOGOS[mention.ai_model.toLowerCase()]}
                              alt={mention.ai_model}
                              className="w-3.5 h-3.5 rounded-sm object-contain"
                            />
                            {mention.ai_model}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 pr-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${mention.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                          mention.sentiment === 'Negative' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                            'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                          }`}>
                          {mention.sentiment || 'Neutral'}
                        </span>
                      </td>
                      <td className="py-5 pr-4">
                        {mention.mentioned ? (
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"></div>
                            <span className="text-[11px] uppercase tracking-tight">Mentioned</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground opacity-50 italic text-[11px]">No Mention</span>
                        )}
                      </td>
                      <td className="py-5 pr-4 font-mono font-bold text-xs">
                        {mention.rank_position ? `#${mention.rank_position}` : '—'}
                      </td>
                      <td className="py-5 pr-4 text-muted-foreground tabular-nums whitespace-nowrap text-xs">
                        {mention.mention_date ? format(new Date(mention.mention_date), 'MMM dd, yyyy') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION & ROWS PER PAGE */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between border-t border-border pt-8 gap-6">
            <div className="flex items-center gap-6">
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                Page <span className="text-foreground">{page}</span> / <span className="text-foreground">{Math.max(1, Math.ceil(totalMentions / perPage))}</span>
              </div>
              <div className="h-4 w-[1px] bg-border"></div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rows per page</span>
                <div className="relative">
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="appearance-none bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs font-bold pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    {[10, 20, 50, 100].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-secondary disabled:opacity-30 hover:bg-muted transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(totalMentions / perPage)}
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-secondary disabled:opacity-30 hover:bg-muted transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function CustomTooltip({ active, payload, label, trendView }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 rounded-2xl border border-border shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          {label ? (trendView === 'daily' ? format(new Date(label), 'MMMM dd, yyyy') : `Week of ${format(new Date(label), 'MMM dd')}`) : '—'}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-medium text-muted-foreground">Mentions:</span>
            <span className="text-xs font-bold text-primary">{payload[0].value}</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-medium text-muted-foreground">Total Queries:</span>
            <span className="text-xs font-bold">{payload[1].value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function StatCard({ title, value, loading, icon, trend, trendIcon, trendColor, delay, accentColor = "text-primary", accentBg = "bg-primary/10" }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
        <div className={`p-3 ${accentBg} ${accentColor} rounded-2xl transition-transform group-hover:rotate-12 duration-300 shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-4xl font-extrabold tracking-tighter tabular-nums">
          {loading ? <Loader2 className="animate-spin text-muted-foreground/30" size={32} /> : (value || "0")}
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          {trendIcon && <div className={trendColor}>{trendIcon}</div>}
          <span className={`text-xs font-bold ${trendColor || "text-muted-foreground"} tracking-tight`}>
            {trend}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
