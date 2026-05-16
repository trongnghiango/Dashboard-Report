import { Router } from "express";
import { authenticate } from "../modules/auth/infrastructure/middlewares/Auth.middleware";
import { SettingsService } from "../modules/admin/application/services/Settings.service";
import { AdminUserService } from "../modules/admin/application/services/AdminUser.service";
import { RbacManagementService } from "../modules/admin/application/services/RbacManagement.service";
import { createSettingsRouter } from "../modules/admin/infrastructure/controllers/Settings.controller";
import { createAdminUserRouter } from "../modules/admin/infrastructure/controllers/AdminUser.controller";
import { createRbacRouter } from "../modules/admin/infrastructure/controllers/RbacManagement.controller";

export const createAdminRouter = (jwtSecret: string): Router => {
  const router = Router();

  // Tất cả admin routes đều yêu cầu đăng nhập
  router.use(authenticate(jwtSecret));

  const settingsService = new SettingsService();
  const userService = new AdminUserService();
  const rbacService = new RbacManagementService();

  router.use("/settings", createSettingsRouter(settingsService));
  router.use("/users", createAdminUserRouter(userService));
  router.use("/rbac", createRbacRouter(rbacService));

  return router;
};
