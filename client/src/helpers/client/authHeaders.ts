import { getAuthToken } from "./getAuthToken";

export function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}`, "X-Auth-Token": token } : {};
}