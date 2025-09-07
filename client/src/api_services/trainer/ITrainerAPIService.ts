import type { MyProfileResponse } from "../../types/trainer/MyProfileResponse";
import type { TrainerDashboardResponse, UnratedParticipantsResponse, BasicResponse } from "../../types/trainer/TrainerDashboard";
import type { Exercise, UpsertExercise } from "../../types/trainer/Exercise";
import type { ProgramListItem, UpsertProgram, ProgramDetails, ProgramExerciseItem } from "../../types/trainer/Program";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { TrainerTerm, CreateTermDto } from "../../types/trainer/Term";

export interface ITrainerAPIService {
  getDashboard(weekStartISO?: string): Promise<TrainerDashboardResponse>;
  getUnrated(termId: number): Promise<UnratedParticipantsResponse>;
  rateParticipant(termId: number, userId: number, rating: number): Promise<BasicResponse>;
  getMyProfile(): Promise<MyProfileResponse>;
  cancelTerm(termId: number): Promise<BasicResponse>;

  listExercises(): Promise<{ success: boolean; message: string; data: Exercise[] }>;
  createExercise(payload: UpsertExercise): Promise<BasicResponse>;
  updateExercise(id: number, payload: UpsertExercise): Promise<BasicResponse>;
  deleteExercise(id: number): Promise<BasicResponse>;

  listPrograms(): Promise<{ success: boolean; message: string; data: ProgramListItem[] }>;
  createProgram(p: UpsertProgram): Promise<{ success: boolean; message: string; data: { id: number } }>;
  updateProgram(id: number, p: UpsertProgram): Promise<BasicResponse>;
  getProgramDetails(id: number): Promise<{ success: boolean; message: string; data: ProgramDetails }>;
  setProgramExercises(programId: number, items: Omit<ProgramExerciseItem, 'name'>[]): Promise<BasicResponse>;
  assignProgramToClient(programId: number, clientId: number): Promise<BasicResponse>;

  listMyClients(): Promise<{ success: boolean; message: string; data: TrainerClient[] }>;

  listTerms(fromISO?: string, toISO?: string): Promise<{ success: boolean; message: string; data: TrainerTerm[] }>;
  createTerm(dto: CreateTermDto): Promise<{ success: boolean; message: string; data: { id: number } }>;
}