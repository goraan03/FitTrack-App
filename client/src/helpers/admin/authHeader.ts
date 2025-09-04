import { PročitajVrednostPoKljuču } from "../localStorage/local_storage";

export const authHeader = () => {
  const token = PročitajVrednostPoKljuču("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};