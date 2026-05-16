import { Router, Request, Response } from "express";
import { SettingsService } from "../../application/services/Settings.service";
import { updateSettingsSchema } from "@workspace/api-zod";

export const createSettingsRouter = (settingsService: SettingsService) => {
  const router = Router();

  // GET /api/admin/settings
  router.get("/", async (_req: Request, res: Response) => {
    try {
      const settings = await settingsService.getAll();
      return res.json(settings);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  // PATCH /api/admin/settings
  router.patch("/", async (req: Request, res: Response) => {
    try {
      const body = updateSettingsSchema.parse(req.body);
      await settingsService.upsertMany(body.settings);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  return router;
};
