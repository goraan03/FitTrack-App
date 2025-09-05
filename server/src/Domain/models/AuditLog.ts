export type AuditCategory = "Informacija" | "Upozorenje" | "Greška";

export type AuditLogItem = {
  id: number;
  category: AuditCategory;
  action: string;
  userId: number | null;
  username: string | null;
  details: any | null;
  createdAt: Date;
};