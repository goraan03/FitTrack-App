export interface AuthContextType {
  user: {
    id: number;
    korisnickoIme: string;
    uloga: 'klijent' | 'trener' | 'admin';
  } | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
