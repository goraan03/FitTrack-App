import { PročitajVrednostPoKljuču } from "../localStorage/local_storage";

export function getAuthToken(): string | null {
  try {
    return (
      PročitajVrednostPoKljuču("authToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      sessionStorage.getItem("authToken") ||
      null
    );
  } catch {
    return null;
  }
}