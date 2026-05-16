import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const authenticate = (jwtSecret: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, jwtSecret) as { sub: string; username: string };
      req.user = {
        id: decoded.sub,
        username: decoded.username,
      };
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
