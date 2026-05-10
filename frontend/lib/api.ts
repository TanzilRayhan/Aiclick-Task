import axios from "axios";
import {
  MentionsRequest,
  MentionsResponse,
  SummaryRequest,
  SummaryResponse,
  TrendsRequest,
  TrendsResponse,
} from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

export const getMentions = async (
  data: MentionsRequest
): Promise<MentionsResponse> => {
  const response = await api.post<MentionsResponse>("/mentions", data);
  return response.data;
};

export const getTrends = async (
  data: TrendsRequest
): Promise<TrendsResponse> => {
  const response = await api.post<TrendsResponse>("/mentions/trends", data);
  return response.data;
};

export const getSummary = async (
  data: SummaryRequest
): Promise<SummaryResponse> => {
  const response = await api.post<SummaryResponse>("/mentions/summary", data);
  return response.data;
};
