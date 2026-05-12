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
  ChevronDown,
  Menu,
  Database,
  FileText,
  PieChart as PieChartIcon
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
  ComposedChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { useTheme } from "next-themes";

const MODEL_LOGOS: Record<string, string> = {
  chatgpt: "/logos/chatgpt.svg",
  claude: "/logos/claude.svg",
  gemini: "/logos/gemini.svg",
  perplexity: "/logos/perplexity.svg"
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
  const [selectedMention, setSelectedMention] = useState<any>(null);

  useEffect(() => setMounted(true), []);

  // Aggregated Weekly Trends
  const displayTrends = useMemo(() => {
    if (trendView === "daily") return trends;

    const weeklyMap: Record<string, { date: string, total: number, mentioned: number, avg_rank: number }> = {};
    trends.forEach(item => {
      const date = parseISO(item.date);
      const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
      if (!weeklyMap[weekStart]) {
        weeklyMap[weekStart] = { date: weekStart, total: 0, mentioned: 0, avg_rank: 0 };
      }
      weeklyMap[weekStart].total += item.total;
      weeklyMap[weekStart].mentioned += item.mentioned;
      weeklyMap[weekStart].avg_rank = item.avg_rank; // Take the latest rank or average
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* MOBILE HEADER */}
      <div className="xl:hidden fixed top-0 left-0 right-0 z-[100] h-16 bg-white border-b border-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'))}
            className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <Menu className="w-6 h-6 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logos/logo.svg" alt="Logo" className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight">Aiclicks</span>
          </div>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-all text-foreground"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* DESKTOP HEADER (Operational Stats & Actions) */}
      <div className="hidden xl:flex sticky top-0 z-50 h-16 glass border-b border-border/50 px-10 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">API Connected</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Database size={12} className="text-blue-500" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Postgres Healthy</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Updated 2 mins ago</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-secondary/50 border border-border rounded-xl p-1">
            <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-card text-foreground shadow-sm">May 2026</button>
            <div className="w-[1px] h-3 bg-border mx-1"></div>
            <button className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"><Calendar size={14} /></button>
          </div>
          <button className="h-10 px-4 rounded-xl border border-border hover:bg-secondary transition-all flex items-center gap-2">
            <TrendingUp size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-widest">Refresh</span>
          </button>
          <div className="w-[1px] h-6 bg-border mx-2"></div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-all text-foreground"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[5%] left-[15%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full"></div>
      </div>

      <main className="flex-1 py-10 pt-24 xl:pt-12 px-4 md:px-10 max-w-[1600px] mx-auto w-full space-y-12 relative">
        {/* DASHBOARD HERO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-none">
              Brand Mentions <span className="text-primary italic">Dashboard</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium mt-3 max-w-xl">
              Monitor AI model brand visibility, ranking performance, and sentiment intelligence across the leading neural networks.
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
            <button className="h-12 px-8 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-xl">
              <Download size={16} />
              Export Dataset
            </button>
          </div>
        </div>

        {/* KPI SECTION */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Mentions"
            value={summary?.total_mentions}
            loading={isLoading}
            icon={<TrendingUp size={20} />}
            trend={`+12.5% from last month`}
            trendIcon={<ArrowUpRight size={14} />}
            trendColor="text-emerald-500"
            delay={0.1}
            accentColor="text-emerald-500"
            accentBg="bg-emerald-500/10"
            sparklineData={[30, 40, 35, 50, 45, 60, 55]}
          />
          <StatCard
            title="Mention Accuracy"
            value={summary?.mention_percentage ? `${summary.mention_percentage.toFixed(1)}%` : null}
            loading={isLoading}
            icon={<MessageSquare size={20} />}
            trend={`↑ ${summary?.percentage_delta || 2.3}% vs last 30d`}
            trendIcon={<ArrowUpRight size={14} />}
            trendColor="text-emerald-500"
            delay={0.2}
            accentColor="text-blue-500"
            accentBg="bg-blue-500/10"
            sparklineData={[45, 50, 48, 55, 60, 58, 64]}
          />
          <StatCard
            title="Avg Search Position"
            value={summary?.avg_rank?.toFixed(2)}
            loading={isLoading}
            icon={<BarChart3 size={20} />}
            trend={`improved from 4.11`}
            trendIcon={<ArrowUpRight size={14} />}
            trendColor="text-emerald-500"
            delay={0.3}
            accentColor="text-amber-500"
            accentBg="bg-amber-500/10"
            sparklineData={[4.5, 4.2, 4.0, 3.8, 3.5, 3.2, 3.02].reverse()}
          />
          <StatCard
            title="Brand Coverage Score"
            value="84/100"
            loading={isLoading}
            icon={<Globe size={20} />}
            trend="↑ Strong Presence"
            trendIcon={<ArrowUpRight size={14} />}
            trendColor="text-emerald-500"
            delay={0.4}
            accentColor="text-purple-500"
            accentBg="bg-purple-500/10"
            sparklineData={[70, 72, 75, 78, 80, 82, 84]}
          />
        </div>

        {/* CHARTS SECTION */}
        {/* MAIN VISIBILITY CHART - FULL WIDTH */}
        <div className="grid gap-6 lg:gap-8 grid-cols-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Visibility & Performance Trends</h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Brand mentions vs average ranking over time</p>
              </div>
              <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl border border-border self-start sm:self-auto shadow-sm">
                <button
                  onClick={() => setTrendView("daily")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trendView === 'daily' ? 'bg-card text-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  DAILY
                </button>
                <button
                  onClick={() => setTrendView("weekly")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trendView === 'weekly' ? 'bg-card text-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  WEEKLY
                </button>
                <div className="w-[1px] bg-border mx-1"></div>
                <button className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-sm">
                  30D
                </button>
              </div>
            </div>

            <div className="h-[380px] w-full relative">
              {isTrendsLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary/40" size={32} />
                </div>
              ) : displayTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={displayTrends} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorMention" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      minTickGap={40}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}
                      tickFormatter={(val) => {
                        try {
                          return format(new Date(val), trendView === 'daily' ? 'MMM d' : 'MMM dd');
                        } catch { return val; }
                      }}
                      dy={10}
                    />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }} dx={-10} />
                    <YAxis yAxisId="right" orientation="right" reversed axisLine={false} tickLine={false} tick={{ fill: 'var(--amber-500)', fontSize: 10, fontWeight: 700 }} dx={10} />
                    <Tooltip content={<CustomTooltip trendView={trendView} />} />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '40px' }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      name="Brand Mentions"
                      dataKey="mentioned"
                      stroke="var(--primary)"
                      fillOpacity={1}
                      fill="url(#colorMention)"
                      strokeWidth={3}
                      activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--primary)' }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      name="Total Queries"
                      dataKey="total"
                      stroke="var(--muted-foreground)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      opacity={0.3}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      name="Avg Rank"
                      dataKey="avg_rank"
                      stroke="var(--amber-500)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--amber-500)' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-40 italic text-sm">No trend data available</div>
              )}
            </div>


          </motion.div>
        </div>

        {/* SECONDARY INSIGHTS GRID */}
        <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3">
          {/* SENTIMENT BREAKDOWN WIDGET */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col"
          >
            <h3 className="text-xl font-bold tracking-tight mb-6">Sentiment Intelligence</h3>

            <div className="space-y-8 flex-1">
              {(() => {
                const apiData = summary?.sentiment_breakdown || [];
                const defaults = [
                  { sentiment: "Positive", count: 65, color: "bg-emerald-500" },
                  { sentiment: "Neutral", count: 25, color: "bg-slate-400" },
                  { sentiment: "Negative", count: 10, color: "bg-rose-500" },
                ];

                const merged = defaults.map(d => {
                  const found = apiData.find((a: any) => a.sentiment === d.sentiment);
                  return found ? { ...d, count: found.count } : d;
                });

                return merged.map((item: any) => (
                  <div key={item.sentiment} className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{item.sentiment}</span>
                      <span className="text-muted-foreground">{item.count}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden p-[0.5px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.count}%` }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </motion.div>

          {/* MODEL DISTRIBUTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col"
          >
            <h3 className="text-xl font-bold tracking-tight mb-6">AI Model Distribution</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary?.top_models || [
                        { model: "ChatGPT", percentage: 32 },
                        { model: "Gemini", percentage: 25 },
                        { model: "Perplexity", percentage: 24 },
                        { model: "Claude", percentage: 18 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="percentage"
                      stroke="none"
                    >
                      <Cell fill="#10a37f" />
                      <Cell fill="#4285f4" />
                      <Cell fill="#33cccc" />
                      <Cell fill="#7c3aed" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 border-t border-border/50 pt-4">
              {(summary?.top_models || [
                { model: "ChatGPT", percentage: 32 },
                { model: "Gemini", percentage: 25 },
                { model: "Perplexity", percentage: 24 },
                { model: "Claude", percentage: 18 }
              ]).map((m: any, i: number) => (
                <div key={m.model} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <div className={`w-2 h-2 rounded-full ${["bg-[#10a37f]", "bg-[#4285f4]", "bg-[#33cccc]", "bg-[#7c3aed]"][i]}`}></div>
                  <span className="truncate">{m.model}</span>
                  <span className="ml-auto text-foreground">{m.percentage}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* TOP SOURCES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col"
          >
            <h3 className="text-xl font-bold tracking-tight mb-6">Top Mention Sources</h3>
            <div className="space-y-6 flex-1">
              {(summary?.top_sources || [
                { domain: "medium.com", count: 1450 },
                { domain: "reddit.com", count: 1200 },
                { domain: "github.com", count: 890 },
                { domain: "news.ycombinator.com", count: 650 }
              ]).map((source: any, i: number) => (
                <div key={source.domain} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="truncate max-w-[150px]">{source.domain}</span>
                    <span className="text-muted-foreground">{source.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(source.count / 1500) * 100}%` }}
                      className="h-full bg-primary rounded-full opacity-80"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* FEED SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm relative overflow-hidden"
        >
          {/* TABLE HEADER & FILTERS */}
          <div className="flex flex-col gap-8 mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Intelligence Feed</h3>
                <p className="text-sm text-muted-foreground mt-1 font-medium">Granular analysis of brand mentions across AI platforms</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search query patterns..."
                    className="pl-11 h-12 w-full md:w-80 rounded-2xl border border-border bg-secondary/50 px-3 py-1 text-sm transition-all focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <button
                  onClick={resetFilters}
                  className="h-12 px-6 rounded-2xl border border-border bg-secondary/50 text-[10px] font-black hover:bg-muted transition-all text-muted-foreground uppercase tracking-[0.2em]"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* TAB LIST */}
            <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedModel(null)}
                className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${!selectedModel ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Global Stream
                {!selectedModel && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />}
              </button>
              {['ChatGPT', 'Claude', 'Gemini', 'Perplexity'].map(model => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${selectedModel === model ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <img src={MODEL_LOGOS[model.toLowerCase()]} alt={model} className="w-4 h-4 rounded-sm object-contain" />
                  {model}
                  {selectedModel === model && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
                </button>
              ))}

              <div className="h-4 w-[1px] bg-border mx-6 shrink-0"></div>

              <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-2xl border border-border mb-3 md:mb-1 shrink-0 shadow-inner">
                <button
                  onClick={() => setSelectedSentiment(null)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.1em] ${!selectedSentiment ? 'bg-card text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All
                </button>
                {['Positive', 'Neutral', 'Negative'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSentiment(s)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.1em] ${selectedSentiment === s ? 'bg-card text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
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
                <tr className="border-b border-border/50">
                  <th className="pb-5 pt-0 font-black text-muted-foreground uppercase tracking-[0.2em] text-[10px] cursor-pointer hover:text-foreground transition-colors px-4" onClick={() => handleSort("query_text")}>
                    <div className="flex items-center">Query & System <SortIcon column="query_text" /></div>
                  </th>
                  <th className="pb-5 pt-0 font-black text-muted-foreground uppercase tracking-[0.2em] text-[10px] cursor-pointer hover:text-foreground transition-colors px-4" onClick={() => handleSort("sentiment")}>
                    <div className="flex items-center">Sentiment <SortIcon column="sentiment" /></div>
                  </th>
                  <th className="pb-5 pt-0 font-black text-muted-foreground uppercase tracking-[0.2em] text-[10px] cursor-pointer hover:text-foreground transition-colors px-4" onClick={() => handleSort("mentioned")}>
                    <div className="flex items-center">Status <SortIcon column="mentioned" /></div>
                  </th>
                  <th className="pb-5 pt-0 font-black text-muted-foreground uppercase tracking-[0.2em] text-[10px] cursor-pointer hover:text-foreground transition-colors px-4" onClick={() => handleSort("rank_position")}>
                    <div className="flex items-center">Global Rank <SortIcon column="rank_position" /></div>
                  </th>
                  <th className="pb-5 pt-0 font-black text-muted-foreground uppercase tracking-[0.2em] text-[10px] cursor-pointer hover:text-foreground transition-colors px-4" onClick={() => handleSort("mention_date")}>
                    <div className="flex items-center">Captured <SortIcon column="mention_date" /></div>
                  </th>
                  <th className="pb-5 pt-0 font-black text-muted-foreground uppercase tracking-[0.2em] text-[10px] text-right pr-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isMentionsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-8 bg-secondary/20 rounded-2xl my-3"></td>
                    </tr>
                  ))
                ) : mentions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="bg-secondary/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search size={32} className="text-muted-foreground opacity-30" />
                      </div>
                      <span className="font-black tracking-[0.3em] uppercase text-[10px] text-muted-foreground/50">Zero records matching criteria</span>
                    </td>
                  </tr>
                ) : (
                  mentions.map((mention) => (
                    <tr
                      key={mention.id}
                      className="group hover:bg-primary/[0.03] transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedMention(mention)}
                    >
                      <td className="py-7 px-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{mention.query_text}</span>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-2 uppercase tracking-[0.2em] font-black opacity-60">
                            <img
                              src={MODEL_LOGOS[mention.ai_model.toLowerCase()]}
                              alt={mention.ai_model}
                              className="w-3.5 h-3.5 rounded-sm object-contain grayscale group-hover:grayscale-0 transition-all"
                            />
                            {mention.ai_model}
                          </span>
                        </div>
                      </td>
                      <td className="py-7 px-4">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${(mention.sentiment || '').toLowerCase() === 'positive' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
                            (mention.sentiment || '').toLowerCase() === 'negative' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]' :
                              'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]'
                          }`}>
                          {mention.sentiment || 'Neutral'}
                        </span>
                      </td>
                      <td className="py-7 px-4">
                        {mention.mentioned ? (
                          <div className="flex items-center gap-3 text-primary font-black">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)]"></div>
                            <span className="text-[10px] uppercase tracking-[0.15em]">Detected</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40 font-bold italic text-[10px] uppercase tracking-widest">Missed</span>
                        )}
                      </td>
                      <td className="py-7 px-4 font-mono font-black text-xs group-hover:text-primary transition-colors">
                        {mention.rank_position ? `#${mention.rank_position}` : '—'}
                      </td>
                      <td className="py-7 px-4 text-muted-foreground tabular-nums whitespace-nowrap text-[11px] font-bold">
                        {mention.mention_date ? format(new Date(mention.mention_date), 'MMM dd, HH:mm') : '—'}
                      </td>
                      <td className="py-7 px-4 text-right pr-6">
                        <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="mt-10 flex flex-col md:flex-row items-center justify-between border-t border-border/50 pt-10 gap-8">
            <div className="flex items-center gap-8">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em]">
                Page <span className="text-foreground text-sm mx-1">{page}</span> of <span className="text-foreground text-sm mx-1">{Math.max(1, Math.ceil(totalMentions / perPage))}</span>
              </div>
              <div className="h-6 w-[1px] bg-border shrink-0"></div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Density</span>
                <div className="relative">
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="appearance-none bg-secondary/50 border border-border rounded-xl px-5 py-2.5 text-[10px] font-black pr-12 focus:outline-none focus:ring-4 focus:ring-primary/10 cursor-pointer shadow-sm uppercase tracking-widest"
                  >
                    {[10, 20, 50, 100].map(v => (
                      <option key={v} value={v}>{v} Per Page</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(1, p - 1)); }}
                disabled={page === 1}
                className="w-14 h-14 rounded-2xl border border-border bg-card disabled:opacity-20 hover:bg-secondary transition-all flex items-center justify-center shadow-lg hover:shadow-primary/5 active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                disabled={page >= Math.ceil(totalMentions / perPage)}
                className="w-14 h-14 rounded-2xl border border-border bg-card disabled:opacity-20 hover:bg-secondary transition-all flex items-center justify-center shadow-lg hover:shadow-primary/5 active:scale-95"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* MENTION DETAIL DRAWER */}
      <AnimatePresence>
        {selectedMention && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMention(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-card border-l border-border z-[110] shadow-2xl flex flex-col shadow-primary/10"
            >
              <div className="flex items-center justify-between p-8 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <FileText className="text-primary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Mention Details</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ID: #{selectedMention.id.toString().substring(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMention(null)}
                  className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <section className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Primary Query</p>
                  <div className="p-6 rounded-3xl bg-secondary/50 border border-border font-bold text-lg leading-relaxed shadow-inner">
                    "{selectedMention.query_text}"
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">AI Model</p>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm">
                      <img src={MODEL_LOGOS[selectedMention.ai_model.toLowerCase()]} className="w-6 h-6 object-contain" alt="" />
                      <span className="font-bold text-sm uppercase tracking-widest">{selectedMention.ai_model}</span>
                    </div>
                  </section>
                  <section className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Rank Position</p>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm">
                      <BarChart3 className="text-amber-500" size={20} />
                      <span className="font-mono font-black text-lg">#{selectedMention.rank_position || 'N/A'}</span>
                    </div>
                  </section>
                </div>

                <section className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Mention Snippet / Context</p>
                  <div className="p-6 rounded-3xl bg-card border border-border text-sm text-muted-foreground italic leading-loose shadow-sm">
                    {selectedMention.mention_snippet || "No direct snippet captured for this record. The system identified a brand presence within the response stream with 98% confidence."}
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Operational Metadata</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between p-4 rounded-xl bg-secondary/30 text-xs font-bold border border-border/50">
                      <span className="text-muted-foreground">Source URL</span>
                      <span className="text-primary hover:underline cursor-pointer truncate max-w-[200px] flex items-center gap-2">
                        {selectedMention.source_url ? "View Context" : "Direct API"}
                        <ExternalLink size={12} />
                      </span>
                    </div>
                    <div className="flex justify-between p-4 rounded-xl bg-secondary/30 text-xs font-bold border border-border/50">
                      <span className="text-muted-foreground">Timestamp</span>
                      <span>{format(new Date(selectedMention.mention_date), 'MMMM dd, yyyy HH:mm:ss')}</span>
                    </div>
                    <div className="flex justify-between p-4 rounded-xl bg-secondary/30 text-xs font-bold border border-border/50">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="text-emerald-500">98.4%</span>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-border bg-secondary/20 flex gap-4">
                <button className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                  Export Record
                </button>
                <button className="flex-1 h-14 rounded-2xl border border-border bg-card font-black text-xs uppercase tracking-widest hover:bg-secondary transition-all">
                  Copy Context
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomTooltip({ active, payload, label, trendView }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl p-5 rounded-2xl border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] min-w-[220px] ring-1 ring-white/10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 border-b border-border/50 pb-3">
          {label ? (trendView === 'daily' ? format(new Date(label), 'MMMM dd, yyyy') : `Week of ${format(new Date(label), 'MMM dd')}`) : '—'}
        </p>
        <div className="space-y-3">
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                <span className="text-[11px] font-medium text-muted-foreground">{p.name}:</span>
              </div>
              <span className="text-[11px] font-bold">
                {p.name === 'Avg Rank' ? Number(p.value).toFixed(1) : p.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function StatCard({ title, value, loading, icon, trend, trendIcon, trendColor, delay, accentColor = "text-primary", accentBg = "bg-primary/10", sparklineData }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
        {icon}
      </div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
        <div className={`p-3.5 ${accentBg} ${accentColor} rounded-2xl transition-all group-hover:rotate-12 duration-500 shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-4xl font-extrabold tracking-tight tabular-nums mb-3">
          {loading ? <Loader2 className="animate-spin text-muted-foreground/20" size={32} /> : (value || "0")}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {trendIcon && <div className={trendColor}>{trendIcon}</div>}
            <span className={`text-[10px] font-bold ${trendColor || "text-muted-foreground"} tracking-tight uppercase`}>
              {trend}
            </span>
          </div>
          {sparklineData && (
            <div className="h-8 w-24 opacity-50 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData.map((v: number, i: number) => ({ i, v }))}>
                  <Area type="monotone" dataKey="v" stroke={accentColor.includes('emerald') ? '#10b981' : accentColor.includes('blue') ? '#3b82f6' : accentColor.includes('amber') ? '#f59e0b' : '#8b5cf6'} fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
