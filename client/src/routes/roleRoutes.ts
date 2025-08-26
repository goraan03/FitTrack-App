export type AppRole = 'klijent' | 'trener' | 'admin';

export const roleRouteMap: Record<AppRole, string> = {
  klijent: '/user-dashboard',
  trener: '/trener-dashboard',
  admin: '/admin-dashboard',
};

export const getDashboardPathForRole = (role?: string) => {
  if (!role) return undefined;
  const r = role as AppRole;
  return roleRouteMap[r];
};