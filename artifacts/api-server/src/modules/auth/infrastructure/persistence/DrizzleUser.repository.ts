import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { User } from "../../domain/entities/User.entity";
import { IUserRepository } from "../../domain/repositories/User.repository";

export class DrizzleUserRepository implements IUserRepository {
  async findByUsername(username: string): Promise<User | null> {
    const [record] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (!record) return null;

    return new User({
      id: record.id,
      username: record.username,
      passwordHash: record.passwordHash,
      fullName: record.fullName,
      isActive: record.isActive ?? 1,
    });
  }

  async findById(id: string): Promise<User | null> {
    const [record] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!record) return null;

    return new User({
      id: record.id,
      username: record.username,
      passwordHash: record.passwordHash,
      fullName: record.fullName,
      isActive: record.isActive ?? 1,
    });
  }
}
