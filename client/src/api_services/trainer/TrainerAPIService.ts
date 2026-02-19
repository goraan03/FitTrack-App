import axios from "axios";
import type { ITrainerAPIService } from "./ITrainerAPIService";
import type { TrainerDashboardResponse, UnratedParticipantsResponse, BasicResponse } from "../../types/trainer/TrainerDashboard";
import { authHeaders } from "../../helpers/client/authHeaders";
import { joinURL } from "../../helpers/programs/joinURL";
import type { MyProfileResponse } from "../../types/trainer/MyProfileResponse";
import type { Exercise, UpsertExercise } from "../../types/trainer/Exercise";
import type { ProgramListItem, ProgramDetails, UpsertProgram, ProgramExerciseItem } from "../../types/trainer/Program";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { TrainerTerm, CreateTermDto } from "../../types/trainer/Term";

const baseURL = joinURL(import.meta.env.VITE_API_URL || '', 'trainer');

export const trainerApi: ITrainerAPIService = {
  async getDashboard(weekStartISO) {
    const res = await axios.get<TrainerDashboardResponse>(`${baseURL}/dashboard`, {
      params: { weekStart: weekStartISO },
      headers: authHeaders(),
    });
    return res.data;
  },

  async getUnrated(termId: number) {
    const res = await axios.get<UnratedParticipantsResponse>(`${baseURL}/terms/${termId}/unrated`, { headers: authHeaders() });
    return res.data;
  },

  async rateParticipant(termId: number, userId: number, rating: number) {
    const res = await axios.post<BasicResponse>(`${baseURL}/terms/${termId}/rate`, { userId, rating }, { headers: authHeaders() });
    return res.data;
  },

  async getMyProfile() {
    const res = await axios.get<MyProfileResponse>(`${baseURL}/me/profile`, { headers: authHeaders() });
    return res.data;
  },

  async cancelTerm(termId: number) {
    const res = await axios.post<BasicResponse>(`${baseURL}/terms/${termId}/cancel`, {}, { headers: authHeaders() });
    return res.data;
  },

  async listExercises() {
    const res = await axios.get<{ success: boolean; message: string; data: Exercise[] }>(`${baseURL}/exercises`, { headers: authHeaders() });
    return res.data;
  },

  async createExercise(payload: UpsertExercise) {
    const res = await axios.post<BasicResponse>(`${baseURL}/exercises`, payload, { headers: authHeaders() });
    return res.data;
  },

  async updateExercise(id: number, payload: UpsertExercise) {
    const res = await axios.put<BasicResponse>(`${baseURL}/exercises/${id}`, payload, { headers: authHeaders() });
    return res.data;
  },

  async deleteExercise(id: number) {
    const res = await axios.delete<BasicResponse>(`${baseURL}/exercises/${id}`, { headers: authHeaders() });
    return res.data;
  },

  async listPrograms() {
    const res = await axios.get<{ success: boolean; message: string; data: ProgramListItem[] }>(`${baseURL}/programs`, { headers: authHeaders() });
    return res.data;
  },

  async createProgram(p: UpsertProgram) {
    const res = await axios.post<{ success: boolean; message: string; data: { id: number } }>(`${baseURL}/programs`, p, { headers: authHeaders() });
    return res.data;
  },

  async updateProgram(id: number, p: UpsertProgram) {
    const res = await axios.put<BasicResponse>(`${baseURL}/programs/${id}`, p, { headers: authHeaders() });
    return res.data;
  },

  async getProgramDetails(id: number) {
    const res = await axios.get<{ success: boolean; message: string; data: ProgramDetails }>(`${baseURL}/programs/${id}`, { headers: authHeaders() });
    return res.data;
  },

  async setProgramExercises(programId: number, items: Omit<ProgramExerciseItem, 'name'>[]) {
    const res = await axios.post<BasicResponse>(`${baseURL}/programs/${programId}/exercises`, { items }, { headers: authHeaders() });
    return res.data;
  },

  async assignProgramToClient(programId: number, clientId: number) {
    const res = await axios.post<BasicResponse>(`${baseURL}/programs/${programId}/assign`, { clientId }, { headers: authHeaders() });
    return res.data;
  },

  async listMyClients() {
    const res = await axios.get<{ success: boolean; message: string; data: TrainerClient[] }>(`${baseURL}/clients`, { headers: authHeaders() });
    return res.data;
  },

  async listTerms(fromISO?: string, toISO?: string) {
    const res = await axios.get<{ success: boolean; message: string; data: TrainerTerm[] }>(`${baseURL}/terms`, {
      headers: authHeaders(),
      params: { from: fromISO, to: toISO },
    });
    return res.data;
  },

  async createTerm(dto: CreateTermDto) {
    const res = await axios.post<{ success: boolean; message: string; data: { id: number } }>(`${baseURL}/terms`, dto, { headers: authHeaders() });
    return res.data;
  },

  async finishWorkout(payload: {
    termId: number;
    clientId: number;
    startTime: string;
    endTime: string;
    notes?: string;
    logs: {
      exerciseId: number;
      setNumber: number;
      plannedReps?: string;
      actualReps: number;
      plannedWeight?: number;
      actualWeight: number;
    }[];
  }) {
    const res = await axios.post<BasicResponse>(`${baseURL}/workout/finish`, payload, { 
      headers: authHeaders() 
    });
    return res.data;
  },

  deleteTerm(termId: number) {
    return axios.delete<BasicResponse>(`${baseURL}/terms/${termId}`, { headers: authHeaders() })
      .then(res => res.data);
  },

  async getTermParticipants(termId: number) {
    const res = await axios.get<{ success: boolean; data: Array<{userId: number; userName: string}> }>(
      `${baseURL}/terms/${termId}/participants`,
      { headers: authHeaders() }
    );
    return res.data;
  },
};