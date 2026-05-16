import { RoleTemplate } from "../entities/RoleTemplate.entity";

export const IRoleTemplateRepository = Symbol("IRoleTemplateRepository");

export interface IRoleTemplateRepository {
  findAll(): Promise<RoleTemplate[]>;
  findById(id: number): Promise<RoleTemplate | null>;
  save(template: RoleTemplate): Promise<RoleTemplate>;
  delete(id: number): Promise<void>;
}
