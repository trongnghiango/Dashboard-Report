import { eq, asc, count } from "drizzle-orm";
import { db, refreshTokensTable } from "@workspace/db";
import { IRefreshTokenRepository } from "../../domain/repositories/RefreshToken.repository";

const MAX_SESSIONS = 5;

export class DrizzleRefreshTokenRepository implements IRefreshTokenRepository {
  async create(data: {
    userId: string;
    token: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<void> {
    // Enforce session limit: evict oldest session if at capacity
    const sessionCount = await this.countByUserId(data.userId);
    if (sessionCount >= MAX_SESSIONS) {
      await this.deleteOldestByUserId(data.userId);
    }

    await db.insert(refreshTokensTable).values({
      userId: data.userId,
      token: data.token,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      expiresAt: data.expiresAt,
    });
  }

  async findByToken(token: string) {
    const result = await db
      .select({
        id: refreshTokensTable.id,
        userId: refreshTokensTable.userId,
        token: refreshTokensTable.token,
        expiresAt: refreshTokensTable.expiresAt,
      })
      .from(refreshTokensTable)
      .where(eq(refreshTokensTable.token, token))
      .limit(1);

    return result[0] ?? null;
  }

  async deleteByToken(token: string): Promise<void> {
    await db
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.token, token));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await db
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.userId, userId));
  }

  async countByUserId(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(refreshTokensTable)
      .where(eq(refreshTokensTable.userId, userId));
    return result[0]?.count ?? 0;
  }

  async deleteOldestByUserId(userId: string): Promise<void> {
    // Find oldest session id
    const oldest = await db
      .select({ id: refreshTokensTable.id })
      .from(refreshTokensTable)
      .where(eq(refreshTokensTable.userId, userId))
      .orderBy(asc(refreshTokensTable.createdAt))
      .limit(1);

    if (oldest[0]) {
      await db
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.id, oldest[0].id));
    }
  }

  async updateToken(oldToken: string, newToken: string, newExpiresAt: Date): Promise<void> {
    await db
      .update(refreshTokensTable)
      .set({ token: newToken, expiresAt: newExpiresAt })
      .where(eq(refreshTokensTable.token, oldToken));
  }
}
