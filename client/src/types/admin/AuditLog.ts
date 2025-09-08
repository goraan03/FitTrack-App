export type AuditCategory = "Informacija" | "Upozorenje" | "Greška";

export type AuditLog = {
  id: number;
  category: AuditCategory;
  action: string;
  userId: number | null;
  username: string | null;
  details: any | null;
  createdAt: string;
};