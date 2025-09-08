import { Request, Response, NextFunction } from "express";

export const authorize = (...dozvoljeneUloge: string[]) => {
  const allowed = dozvoljeneUloge.map(r => r.toLowerCase().trim());

  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: "Nedostaje token" });
      return;
    }

    const role = String(user.uloga || "").toLowerCase().trim();

    if (!allowed.includes(role)) {
      console.warn(`[AUTHZ] deny path=${req.originalUrl} role=${role} needed=${allowed.join(",")}`);
      res.status(403).json({ success: false, message: "Zabranjen pristup" });
      return;
    }

    next();
  };
};