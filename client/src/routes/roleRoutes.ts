export type AppRole = 'klijent' | 'trener' | 'admin';

// Vraćamo samo postojeće rute.
// Za klijenta i trenera trenutno nemamo dashboard -> vrati null (ostaje na /login).
export const getDashboardPathForRole = (role: AppRole): string | null => {
  switch (role) {
    case 'admin':
      return '/admin/users';
    case 'trener':
    case 'klijent':
    default:
      return null;
  }
};