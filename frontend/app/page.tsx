"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { 
  Loader2, Search, ArrowUpDown, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, Filter 
} from "lucide-react";
import { clsx } from "clsx";
import {
  MentionFilters, Mention, TrendPoint, SummaryResponse
} from "@/lib/types";
import { getMentions, getTrends, getSummary } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useReactTable, getCoreRowModel, flexRender, ColumnDef, SortingState
} from "@tanstack/react-table";

// A simple debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#6366f1", "#f43f5e"];
const SENTIMENT_COLORS = { positive: "#10b981", neutral: "#94a3b8", negative: "#ef4444" };

export default function Dashboard() {
  const [filters, setFilters] = useState<MentionFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [totalMentions, setTotalMentions] = useState(0);
  
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [trendGroup, setTrendGroup] = useState<"day" | "week">("day");
  
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  const [loadingMentions, setLoadingMentions] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Sync debounced search to filters state
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch || undefined }));
    setPage(1);
  }, [debouncedSearch]);

  const fetchMentionsData = async () => {
    setLoadingMentions(true);
    try {
      const sortBy = sorting.length > 0 ? sorting[0].id : undefined;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;
      
      const data = await getMentions({ 
        page, 
        per_page: perPage, 
        filters,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setMentions(data.data);
      setTotalMentions(data.total);
    } catch (err) {
      console.error("Failed to load mentions");
    } finally {
      setLoadingMentions(false);
    }
  };

  const fetchTrendsData = async () => {
    setLoadingTrends(true);
    try {
      const data = await getTrends({
        date_from: filters.date_from,
        date_to: filters.date_to,
        group_by: trendGroup
      });
      setTrends(data.data);
    } catch (err) {
      console.error("Failed to load trends");
    } finally {
      setLoadingTrends(false);
    }
  };

  const fetchSummaryData = async () => {
    setLoadingSummary(true);
    try {
      const data = await getSummary({
        date_from: filters.date_from,
        date_to: filters.date_to
      });
      setSummary(data);
    } catch (err) {
      console.error("Failed to load summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchMentionsData();
  }, [page, perPage, filters, sorting]);

  useEffect(() => {
    fetchTrendsData();
    fetchSummaryData();
  }, [trendGroup, filters.date_from, filters.date_to]);

  const handleFilterChange = (key: keyof MentionFilters, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (value === "" || value === undefined) delete newFilters[key];
      return newFilters;
    });
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchInput("");
    setPage(1);
    setSorting([{ id: "created_at", desc: true }]);
  };

  // Table Setup
  const columns = useMemo<ColumnDef<Mention>[]>(() => [
    {
      accessorKey: "query_text",
      header: "Query Text",
      cell: ({ row }) => (
        <div className="max-w-[300px] lg:max-w-md">
          <p className="font-medium text-slate-800 line-clamp-2">{row.original.query_text}</p>
          {row.original.citation_url && (
            <a href={row.original.citation_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block truncate">
              {row.original.citation_url}
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => (
        <span className="px-2.5 py-1 bg-slate-100/80 text-slate-700 rounded-md text-xs font-semibold tracking-wide uppercase">
          {row.original.model}
        </span>
      ),
    },
    {
      accessorKey: "mentioned",
      header: "Mentioned",
      cell: ({ row }) => (
        row.original.mentioned ? 
          <span className="text-emerald-600 font-medium">Yes</span> : 
          <span className="text-slate-400">No</span>
      ),
    },
    {
      accessorKey: "sentiment",
      header: "Sentiment",
      cell: ({ row }) => {
        const sen = row.original.sentiment;
        if (!sen) return <span className="text-slate-400">-</span>;
        return (
          <span className={clsx(
            "px-2.5 py-1 rounded-full text-xs font-semibold capitalize tracking-wide",
            sen === "positive" ? "bg-emerald-100/50 text-emerald-700" :
            sen === "negative" ? "bg-rose-100/50 text-rose-700" :
            "bg-slate-100/50 text-slate-700"
          )}>
            {sen}
          </span>
        );
      },
    },
    {
      accessorKey: "position",
      header: "Rank",
      cell: ({ row }) => row.original.position !== null ? (
        <span className="font-mono text-slate-600">#{row.original.position}</span>
      ) : <span className="text-slate-400">-</span>,
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => <span className="text-slate-500 whitespace-nowrap">{format(new Date(row.original.created_at), "MMM d, yyyy")}</span>,
    },
  ], []);

  const table = useReactTable({
    data: mentions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Brand Mentions <span className="text-slate-400 font-medium text-sm">Dashboard</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium tracking-wide text-emerald-700 uppercase">Live Data</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Search & Filters Banner */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
          
          <div className="flex-1 w-full max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by keyword, product name, or competitor..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-none outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400 text-slate-900 shadow-sm transition-all"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="h-11 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm cursor-pointer appearance-none min-w-[140px]"
              value={filters.model || ""}
              onChange={(e) => handleFilterChange("model", e.target.value)}
            >
              <option value="">All Models</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="claude">Claude</option>
              <option value="gemini">Gemini</option>
              <option value="perplexity">Perplexity</option>
            </select>
            
            <select 
              className="h-11 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm cursor-pointer appearance-none min-w-[140px]"
              value={filters.sentiment || ""}
              onChange={(e) => handleFilterChange("sentiment", e.target.value)}
            >
              <option value="">All Sentiments</option>
              <option value="positive">✨ Positive</option>
              <option value="neutral">⚖️ Neutral</option>
              <option value="negative">🔻 Negative</option>
            </select>

            <select 
              className="h-11 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm cursor-pointer appearance-none min-w-[140px]"
              value={filters.mentioned?.toString() || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "true") handleFilterChange("mentioned", true);
                else if (val === "false") handleFilterChange("mentioned", false);
                else handleFilterChange("mentioned", undefined);
              }}
            >
              <option value="">Any Mention</option>
              <option value="true">Mentioned Only</option>
              <option value="false">Not Mentioned</option>
            </select>

            {(Object.keys(filters).filter(k => filters[k as keyof MentionFilters] !== undefined).length > 0 || searchInput) && (
              <button 
                onClick={resetFilters}
                className="h-11 px-4 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Insight Header Metrics (Summary) */}
        {!loadingSummary && summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 bg-white">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Queries</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900">{summary.total_mentions.toLocaleString()}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 bg-white">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-emerald-600 mb-1">Brand Appearances</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900">{summary.mentioned_count.toLocaleString()}</h3>
                  <span className="text-sm font-medium text-slate-400">({Math.round((summary.mentioned_count / summary.total_mentions) * 100 || 0)}%)</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 bg-white">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-slate-500 mb-1">Avg Search Position</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900">{summary.avg_position ? summary.avg_position.toFixed(1) : '-'}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 bg-white">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-slate-500 mb-1">Top Sentiment</p>
                <div className="flex items-baseline gap-2">
                  {summary.sentiments.length > 0 ? (
                    <h3 className="text-xl font-bold text-slate-900 capitalize">{summary.sentiments[0].sentiment} ({summary.sentiments[0].count})</h3>
                  ) : <h3 className="text-xl font-bold text-slate-900">-</h3>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trends Line Chart */}
          <Card className="lg:col-span-2 border-none shadow-md ring-1 ring-slate-200/50 bg-white rounded-2xl overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Visibility Trends</CardTitle>
                  <p className="mt-1 text-slate-500 text-sm">How often your brand surfaces over time.</p>
                </div>
                <div className="flex gap-1 p-1 bg-slate-200/70 rounded-lg">
                  <button 
                    onClick={() => setTrendGroup("day")} 
                    className={clsx("text-xs font-semibold px-3 py-1.5 rounded-md transition-all", trendGroup === "day" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                  >
                    Daily
                  </button>
                  <button 
                    onClick={() => setTrendGroup("week")} 
                    className={clsx("text-xs font-semibold px-3 py-1.5 rounded-md transition-all", trendGroup === "week" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                  >
                    Weekly
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-[350px]">
              {loadingTrends ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 12, fill: '#94a3b8'}} 
                      axisLine={false} 
                      tickLine={false}
                      tickMargin={12}
                    />
                    <YAxis 
                      tick={{fontSize: 12, fill: '#94a3b8'}} 
                      axisLine={false} 
                      tickLine={false} 
                      tickMargin={12}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line type="monotone" dataKey="total" name="Total Queries" stroke="#cbd5e1" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#cbd5e1', strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="mentioned" name="Mentions" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <LineChart className="w-12 h-12 mb-3 opacity-20" />
                  <p>No trends found for this period.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widgets Grid */}
          <div className="grid grid-rows-2 gap-6 h-full">
            {/* Model Distribution Donut */}
            <Card className="border-none shadow-md ring-1 ring-slate-200/50 bg-white rounded-2xl overflow-hidden flex flex-col min-h-[220px]">
              <CardHeader className="px-5 pt-5 pb-0 items-center justify-center text-center">
                <CardTitle className="text-[15px]">Model Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex items-center justify-center">
                {!loadingSummary && summary ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={summary.models}
                        cx="50%" cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="model"
                      >
                        {summary.models.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />}
              </CardContent>
            </Card>

            {/* Sentiment Breakdown Bar */}
            <Card className="border-none shadow-md ring-1 ring-slate-200/50 bg-white rounded-2xl overflow-hidden flex flex-col min-h-[220px]">
              <CardHeader className="px-5 pt-5 pb-0">
                <CardTitle className="text-[15px]">Sentiment Over AI Answers</CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-1 w-full flex flex-col justify-end">
                {!loadingSummary && summary ? (
                  <div className="w-full flex-1 mt-4">
                    {summary.sentiments.map((s) => {
                      const perc = summary.total_mentions > 0 ? (s.count / summary.total_mentions) * 100 : 0;
                      return (
                        <div key={s.sentiment} className="mb-3 last:mb-0">
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="capitalize text-slate-700">{s.sentiment}</span>
                            <span className="text-slate-500">{s.count} <span className="text-slate-400 font-normal">({perc.toFixed(1)}%)</span></span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000" 
                              style={{ 
                                width: `${perc}%`,
                                backgroundColor: SENTIMENT_COLORS[s.sentiment as keyof typeof SENTIMENT_COLORS] || '#cbd5e1'
                              }} 
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 text-slate-300 animate-spin" /></div>}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Global Table */}
        <Card className="border-none shadow-md ring-1 ring-slate-200/50 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between px-6 py-5 bg-slate-50/50">
            <div>
              <CardTitle className="text-lg">Recent Brand Queries</CardTitle>
              <p className="mt-1 text-slate-500 text-sm">Dive into the exact search prompts bringing up your company.</p>
            </div>
            
            <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm inline-flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              {totalMentions} records
            </div>
          </CardHeader>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-white border-b border-slate-100 text-slate-500 font-semibold tracking-wider">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th 
                        key={header.id} 
                        className={clsx(
                          "px-6 py-4 whitespace-nowrap",
                          header.column.getCanSort() ? "cursor-pointer select-none hover:bg-slate-50 transition-colors group" : ""
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-slate-300 group-hover:text-slate-400 transition-colors">
                              {{
                                asc: <ChevronUp className="w-3.5 h-3.5 text-blue-600" />,
                                desc: <ChevronDown className="w-3.5 h-3.5 text-blue-600" />,
                              }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingMentions ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {columns.map((_, colIdx) => (
                        <td key={colIdx} className="px-6 py-4">
                          <div className={clsx("h-4 bg-slate-100 rounded animate-pulse", colIdx === 0 ? "w-3/4" : "w-16")}></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : mentions.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 align-top">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900 mb-1">No mentions found</h3>
                      <p className="text-sm text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-slate-100 p-4 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">Rows per page:</span>
              <select 
                value={perPage} 
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="text-sm font-medium border-slate-200 rounded-md py-1 px-2 pr-8 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white select-none"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium">
                Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalMentions)} of {totalMentions}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * perPage >= totalMentions}
                  className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </main>
  );
}