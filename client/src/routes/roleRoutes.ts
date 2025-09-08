export type AppRole = 'klijent' | 'trener' | 'admin';

export const getDashboardPathForRole = (role: AppRole): string | null => {
  switch (role) {
    case 'admin':
      return '/admin/users';
    case 'klijent':
      return '/app/dashboard';
    case 'trener':
      return '/trainer/dashboard';
    default:
      return null;
  }
};

export const isPathAllowedForRole = (path: string, role: AppRole): boolean => {
  switch (role) {
    case 'admin':
      return /^\/admin(\/|$)/.test(path);
    case 'klijent':
      return /^\/app(\/|$)/.test(path);
    case 'trener':
      return /^\/trainer(\/|$)/.test(path);
    default:
      return false;
  }
};