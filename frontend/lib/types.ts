// Types matching the backend API contract

export interface MentionFilters {
  model?: "chatgpt" | "claude" | "gemini" | "perplexity" | string;
  sentiment?: "positive" | "neutral" | "negative" | string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  search?: string;
  mentioned?: boolean;
}

export interface MentionsRequest {
  page: number;
  per_page: number;
  filters?: MentionFilters;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Mention {
  id: string;
  query_text: string;
  model: string;
  mentioned: boolean;
  position: number | null;
  sentiment: string | null;
  citation_url: string | null;
  created_at: string;
}

export interface MentionsResponse {
  data: Mention[];
  total: number;
  page: number;
  per_page: number;
}

export interface TrendsRequest {
  date_from?: string;
  date_to?: string;
  group_by: "day" | "week";
}

export interface TrendPoint {
  date: string;
  total: number;
  mentioned: number;
}

export interface TrendsResponse {
  data: TrendPoint[];
}

export interface ModelDistribution {
  model: string;
  count: number;
}

export interface SentimentDistribution {
  sentiment: string;
  count: number;
}

export interface SourceDistribution {
  source: string;
  count: number;
}

export interface SummaryRequest {
  date_from?: string;
  date_to?: string;
}

export interface SummaryResponse {
  total_mentions: number;
  mentioned_count: number;
  avg_position: number | null;
  models: ModelDistribution[];
  sentiments: SentimentDistribution[];
  sources: SourceDistribution[];
}
