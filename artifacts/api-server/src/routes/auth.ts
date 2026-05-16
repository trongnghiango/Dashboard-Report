import { Router } from "express";
import { DrizzleUserRepository } from "../modules/auth/infrastructure/persistence/DrizzleUser.repository";
import { DrizzleRbacRepository } from "../modules/auth/infrastructure/persistence/DrizzleRbac.repository";
import { DrizzleRefreshTokenRepository } from "../modules/auth/infrastructure/persistence/DrizzleRefreshToken.repository";
import { AuthService } from "../modules/auth/application/services/Auth.service";
import { createAuthRouter } from "../modules/auth/infrastructure/controllers/Auth.controller";

const jwtSecret = process.env.SESSION_SECRET || "default_secret";

const userRepository = new DrizzleUserRepository();
const rbacRepository = new DrizzleRbacRepository();
const refreshTokenRepository = new DrizzleRefreshTokenRepository();

const authService = new AuthService(
  userRepository,
  rbacRepository,
  refreshTokenRepository,
  jwtSecret,
);

const authRouter = createAuthRouter(authService, jwtSecret);

export default authRouter;
