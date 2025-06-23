import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      role: "user" | "admin";
    };
  }
}

interface AccessTokenPayload extends JwtPayload {
  userId: string;
  role: "user" | "admin";
}

export function protect(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header or cookie
    const authHeader = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization
      : undefined;

    const rawToken =
      authHeader?.split(" ")[1] ??
      (req.cookies
        ? (req.cookies["access_token"] as string | undefined)
        : undefined);

    if (!rawToken) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    // Verify JWT and extract payload
    const decoded = jwt.verify(
      rawToken,
      config.jwtSignInSecret
    ) as AccessTokenPayload;

    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ message: "Token invalid or expired" });
  }
}

export const authorize =
  (...allowedRoles: ("user" | "admin")[]): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
