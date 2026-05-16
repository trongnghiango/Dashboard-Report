export interface IRefreshTokenRepository {
  create(data: {
    userId: string;
    token: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<void>;

  findByToken(token: string): Promise<{
    id: number;
    userId: string;
    token: string;
    expiresAt: Date;
  } | null>;

  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
  deleteOldestByUserId(userId: string): Promise<void>;
  updateToken(oldToken: string, newToken: string, newExpiresAt: Date): Promise<void>;
}
