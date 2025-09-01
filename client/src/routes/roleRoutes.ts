export type AppRole = 'klijent' | 'trener' | 'admin';

export const getDashboardPathForRole = (role: AppRole): string | null => {
  switch (role) {
    case 'admin':
      return '/admin/users';
    case 'klijent':
      return '/app/dashboard';
    case 'trener':
      return null;
    default:
      return null;
  }
};