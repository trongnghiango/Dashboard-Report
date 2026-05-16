import {
  db,
  usersTable,
  rolesTable,
  userRolesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { CreateUserInput, UpdateUserInput, AdminUserResponse } from "@workspace/api-zod";

export class AdminUserService {
  async getAll(): Promise<AdminUserResponse[]> {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    const result: AdminUserResponse[] = [];

    for (const user of users) {
      // Lấy roles của từng user
      const userRoles = await db
        .select({ id: rolesTable.id, name: rolesTable.name, code: rolesTable.code })
        .from(userRolesTable)
        .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
        .where(eq(userRolesTable.userId, user.id));

      result.push({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        isActive: user.isActive ?? 1,
        roles: userRoles,
        createdAt: user.createdAt.toISOString(),
        _actions: {
          edit: { allowed: true },
          deactivate: { allowed: user.isActive === 1 },
          delete: { allowed: false }, // Không cho xóa cứng
        },
      });
    }
    return result;
  }

  async create(dto: CreateUserInput): Promise<AdminUserResponse> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const id = crypto.randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id,
        username: dto.username,
        passwordHash,
        fullName: dto.fullName ?? null,
        isActive: 1,
      });

      if (dto.roleCode) {
        const [role] = await tx
          .select()
          .from(rolesTable)
          .where(eq(rolesTable.code, dto.roleCode));
        if (role) {
          await tx.insert(userRolesTable).values({ userId: id, roleId: role.id });
        }
      }
    });

    const [created] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    const roles = await db
      .select({ id: rolesTable.id, name: rolesTable.name, code: rolesTable.code })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(eq(userRolesTable.userId, id));

    return {
      id: created.id,
      username: created.username,
      fullName: created.fullName,
      isActive: created.isActive ?? 1,
      roles,
      _actions: { edit: { allowed: true }, deactivate: { allowed: true }, delete: { allowed: false } },
    };
  }

  async update(id: string, dto: UpdateUserInput): Promise<AdminUserResponse> {
    await db.transaction(async (tx) => {
      // Cập nhật thông tin user
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
      await tx.update(usersTable).set(updateData).where(eq(usersTable.id, id));

      // Cập nhật role nếu có
      if (dto.roleCode !== undefined) {
        await tx.delete(userRolesTable).where(eq(userRolesTable.userId, id));
        if (dto.roleCode) {
          const [role] = await tx.select().from(rolesTable).where(eq(rolesTable.code, dto.roleCode));
          if (role) {
            await tx.insert(userRolesTable).values({ userId: id, roleId: role.id });
          }
        }
      }
    });

    const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    const roles = await db
      .select({ id: rolesTable.id, name: rolesTable.name, code: rolesTable.code })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(eq(userRolesTable.userId, id));

    return {
      id: updated.id,
      username: updated.username,
      fullName: updated.fullName,
      isActive: updated.isActive ?? 1,
      roles,
      _actions: {
        edit: { allowed: true },
        deactivate: { allowed: updated.isActive === 1 },
        delete: { allowed: false },
      },
    };
  }

  async deactivate(id: string): Promise<void> {
    await db.update(usersTable).set({ isActive: 0, updatedAt: new Date() }).where(eq(usersTable.id, id));
  }
}
