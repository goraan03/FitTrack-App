import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token) as any;
    const currentTime = Date.now() / 1000;
    return decoded?.exp ? decoded.exp < currentTime : false;
  } catch {
    return true;
  }
};