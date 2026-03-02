export interface HistoryItem {
  id: number;
  date: string;
  programId: number | null;
  programTitle: string;
  trainerName: string;
  exercises: {
    exerciseId: number;
    name: string;
    sets: { setNumber: number; reps: number; weight: number }[];
  }[];
}