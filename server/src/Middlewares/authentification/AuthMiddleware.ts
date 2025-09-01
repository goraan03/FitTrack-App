import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  korisnickoIme: string;
  uloga: string;
  blokiran?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  // Authorization (preferirano)
  const rawAuth =
    (req.headers.authorization as string | undefined) ||
    (req.headers as any)?.Authorization;

  if (rawAuth && typeof rawAuth === "string") {
    const trimmed = rawAuth.trim();
    if (trimmed.toLowerCase().startsWith("bearer ")) {
      return trimmed.slice(7).trim();
    }
    if (trimmed) return trimmed; // podrži i slučaj bez "Bearer"
  }

  // X-Auth-Token (fallback)
  const x = req.headers["x-auth-token"];
  if (typeof x === "string" && x.trim()) return x.trim();
  if (Array.isArray(x) && x.length > 0) return String(x[0]).trim();

  return null;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ success: false, message: "Nedostaje token" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? ""
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Nevažeći token" });
  }
};