import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthContextType } from '../../types/auth/AuthContext';
import type { AuthUser } from '../../types/auth/AuthUser';
import { ObrišiVrednostPoKljuču, PročitajVrednostPoKljuču, SačuvajVrednostPoKljuču } from '../../helpers/local_storage';
import type { JwtTokenClaims } from '../../types/auth/JwtTokenClaims';
import { authApi } from '../../api_services/auth/AuthAPIService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = "authToken";
const AUTH_BOOT_KEY = "authBootId";

const decodeJWT = (token: string): JwtTokenClaims | null => {
  try {
    const decoded = jwtDecode<JwtTokenClaims>(token);
    if (decoded.id && decoded.korisnickoIme && decoded.uloga) {
      return {
        id: decoded.id,
        korisnickoIme: decoded.korisnickoIme,
        uloga: decoded.uloga
      };
    }
    return null;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token) as any;
    const currentTime = Date.now() / 1000;
    return decoded?.exp ? decoded.exp < currentTime : false;
  } catch {
    return true;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Uvek prvo dohvati BOOT ID servera
        const bootRes = await authApi.getBoot();
        const serverBootId = bootRes?.data?.bootId;

        const savedToken = PročitajVrednostPoKljuču(AUTH_TOKEN_KEY);
        const savedBootId = PročitajVrednostPoKljuču(AUTH_BOOT_KEY);

        // Ako nema tokena, ili se BOOT ID razlikuje -> odjavi
        if (!savedToken || !serverBootId || savedBootId !== serverBootId) {
          ObrišiVrednostPoKljuču(AUTH_TOKEN_KEY);
          ObrišiVrednostPoKljuču(AUTH_BOOT_KEY);
          setIsLoading(false);
          return;
        }

        if (isTokenExpired(savedToken)) {
          ObrišiVrednostPoKljuču(AUTH_TOKEN_KEY);
          ObrišiVrednostPoKljuču(AUTH_BOOT_KEY);
          setIsLoading(false);
          return;
        }

        const claims = decodeJWT(savedToken);
        if (claims) {
          setToken(savedToken);
          setUser({ id: claims.id, korisnickoIme: claims.korisnickoIme, uloga: claims.uloga });
        } else {
          ObrišiVrednostPoKljuču(AUTH_TOKEN_KEY);
          ObrišiVrednostPoKljuču(AUTH_BOOT_KEY);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (newToken: string) => {
    const claims = decodeJWT(newToken);
    if (claims && !isTokenExpired(newToken)) {
      // Dohvati trenutni BOOT ID i sačuvaj
      const bootRes = await authApi.getBoot();
      const bootId = bootRes?.data?.bootId || '';

      setToken(newToken);
      setUser({ id: claims.id, korisnickoIme: claims.korisnickoIme, uloga: claims.uloga });

      SačuvajVrednostPoKljuču(AUTH_TOKEN_KEY, newToken);
      if (bootId) SačuvajVrednostPoKljuču(AUTH_BOOT_KEY, bootId);
    } else {
      console.error('Nevazeci ili istekao token');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    ObrišiVrednostPoKljuču(AUTH_TOKEN_KEY);
    ObrišiVrednostPoKljuču(AUTH_BOOT_KEY);
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;