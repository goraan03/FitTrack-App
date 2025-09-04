import type { HistoryItem } from "./HistoryItem";
import type { HistoryStats } from "./HistoryStats";

export interface HistoryData {
  items: HistoryItem[];
  stats: HistoryStats;
}