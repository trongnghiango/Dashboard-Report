import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productionRouter from "./production";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productionRouter);
router.use("/auth", authRouter);

export default router;
