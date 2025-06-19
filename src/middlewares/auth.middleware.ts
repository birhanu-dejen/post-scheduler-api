import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

/* ---- Extend Express request so TypeScript knows about req.auth ---- */
declare module "express-serve-static-core" {
  interface Request {
    auth?: { id: string; role?: string };
  }
}

interface AccessTokenPayload extends JwtPayload {
  id: string;
  role?: string;
}

/* ---------------------- Access‑token protector --------------------- */
export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization; // "Bearer <token>"
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret) as AccessTokenPayload;

    req.auth = { id: decoded.id, role: decoded.role }; // attach minimal info
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

/* -------------------- Role‑based authorization -------------------- */
export const authorize =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.role || !allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
