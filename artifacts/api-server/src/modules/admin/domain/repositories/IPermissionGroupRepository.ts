import { PermissionGroup } from "../entities/PermissionGroup.entity";

export const IPermissionGroupRepository = Symbol("IPermissionGroupRepository");

export interface IPermissionGroupRepository {
  findAll(): Promise<PermissionGroup[]>;
  findById(id: number): Promise<PermissionGroup | null>;
  save(group: PermissionGroup): Promise<PermissionGroup>;
  delete(id: number): Promise<void>;
}
