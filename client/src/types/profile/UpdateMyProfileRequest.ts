export type UpdateMyProfileRequest = {
  ime: string;
  prezime: string;
  pol: "musko" | "zensko";
  datumRodjenjaISO: string | null; // "YYYY-MM-DD" ili null
  // address?: string | null;
};