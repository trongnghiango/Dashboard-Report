import { Router, Response } from "express";
import { AdminUserService } from "../../application/services/AdminUser.service";
import { AuthenticatedRequest } from "../../../auth/infrastructure/middlewares/Auth.middleware";
import { createUserSchema, updateUserSchema } from "@workspace/api-zod";

export const createAdminUserRouter = (userService: AdminUserService) => {
  const router = Router();

  // GET /api/admin/users
  router.get("/", async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await userService.getAll();
      return res.json(users);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  // POST /api/admin/users
  router.post("/", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = createUserSchema.parse(req.body);
      const user = await userService.create(body);
      return res.status(201).json(user);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  // PATCH /api/admin/users/:id
  router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = updateUserSchema.parse(req.body);
      const user = await userService.update(req.params.id, body);
      return res.json(user);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  // PATCH /api/admin/users/:id/deactivate
  router.patch("/:id/deactivate", async (req: AuthenticatedRequest, res: Response) => {
    try {
      await userService.deactivate(req.params.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  return router;
};
