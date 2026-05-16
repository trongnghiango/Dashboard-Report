import { Router, Request, Response } from "express";
import { RbacManagementService } from "../../application/services/RbacManagement.service";
import { createRoleSchema, updateRolePermissionsSchema } from "@workspace/api-zod";

export const createRbacRouter = (rbacService: RbacManagementService) => {
  const router = Router();

  // GET /api/admin/rbac/resources
  router.get("/resources", async (_req: Request, res: Response) => {
    try {
      const resources = await rbacService.getResources();
      return res.json(resources);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  // GET /api/admin/rbac/roles
  router.get("/roles", async (_req: Request, res: Response) => {
    try {
      const roles = await rbacService.getRoles();
      return res.json(roles);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  // POST /api/admin/rbac/roles
  router.post("/roles", async (req: Request, res: Response) => {
    try {
      const body = createRoleSchema.parse(req.body);
      const role = await rbacService.createRole(body);
      return res.status(201).json(role);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  // GET /api/admin/rbac/matrix/:roleId
  router.get("/matrix/:roleId", async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.roleId, 10);
      if (isNaN(roleId)) return res.status(400).json({ message: "roleId không hợp lệ" });
      const matrix = await rbacService.getMatrix(roleId);
      return res.json(matrix);
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  });

  // PATCH /api/admin/rbac/matrix/:roleId
  router.patch("/matrix/:roleId", async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.roleId, 10);
      if (isNaN(roleId)) return res.status(400).json({ message: "roleId không hợp lệ" });
      const body = updateRolePermissionsSchema.parse(req.body);
      await rbacService.updateMatrix(roleId, body.permissions);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  return router;
};
