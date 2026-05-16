import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productionRouter from "./production";
import authRouter from "./auth";
import { createAdminRouter } from "./admin";

const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "dev-secret";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productionRouter);
router.use("/auth", authRouter);
router.use("/admin", createAdminRouter(jwtSecret));

export default router;
