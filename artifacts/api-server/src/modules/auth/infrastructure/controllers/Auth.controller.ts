import { Router, Request, Response } from "express";
import { AuthService } from "../../application/services/Auth.service";
import { loginRequestSchema } from "@workspace/api-zod";
import { AuthenticatedRequest, authenticate } from "../middlewares/Auth.middleware";

const REFRESH_COOKIE_NAME = "refresh_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
};

export const createAuthRouter = (authService: AuthService, jwtSecret: string) => {
  const router = Router();

  // POST /login
  router.post("/login", async (req: Request, res: Response) => {
    try {
      const body = loginRequestSchema.parse(req.body);
      const { authResponse, refreshToken } = await authService.login(body, {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      });

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
      return res.json(authResponse);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  // POST /refresh — Cấp lại Access Token
  router.post("/refresh", async (req: Request, res: Response) => {
    try {
      const oldRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
      if (!oldRefreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await authService.refresh(oldRefreshToken);

      // Cập nhật Cookie với RT mới (Token Rotation)
      res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);
      return res.json({ accessToken });
    } catch (err: any) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
      return res.status(401).json({ message: err.message });
    }
  });

  // GET /me
  router.get("/me", authenticate(jwtSecret), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const result = await authService.getMe(req.user.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(401).json({ message: err.message });
    }
  });

  // POST /logout
  router.post("/logout", authenticate(jwtSecret), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  return router;
};
