import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

/* -------------------------------------------------------------------------- */
/* 1.  Augment Express.Request with a typed "user" field                      */
/* -------------------------------------------------------------------------- */
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      role: "user" | "admin";
    };
  }
}

/* -------------------------------------------------------------------------- */
/* 2.  Shape of what we expect inside our access token                        */
/* -------------------------------------------------------------------------- */
interface AccessTokenPayload extends JwtPayload {
  id: string;
  role: "user" | "admin";
}

/* -------------------------------------------------------------------------- */
/* 3.  protect — verifies JWT and attaches req.user                           */
/* -------------------------------------------------------------------------- */
export function protect(req: Request, res: Response, next: NextFunction) {
  try {
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

    const decoded = jwt.verify(
      rawToken,
      config.jwtSignInSecret
    ) as AccessTokenPayload;

    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ message: "Token invalid or expired" });
  }
}

export function authorize(...allowedRoles: ("user" | "admin")[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
