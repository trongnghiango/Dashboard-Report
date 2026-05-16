import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./Auth.middleware";
import { IRbacRepository } from "../../domain/repositories/Rbac.repository";

export const authorize = (rbacRepository: IRbacRepository, resource: string, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const abilities = await rbacRepository.getAbilitiesByUserId(req.user.id);
    const actions = abilities[resource];

    if (!actions || !actions.includes(action)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
};
