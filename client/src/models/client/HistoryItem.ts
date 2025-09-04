export interface HistoryItem {
  id: number;
  date: string;                // ISO
  programTitle: string;
  trainerName: string;
  status: string;
  rating: number | null;
  feedback: string | null;
}