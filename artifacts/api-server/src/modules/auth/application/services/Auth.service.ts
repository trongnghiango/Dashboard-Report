import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { IUserRepository } from "../../domain/repositories/User.repository";
import { IRbacRepository } from "../../domain/repositories/Rbac.repository";
import { IRefreshTokenRepository } from "../../domain/repositories/RefreshToken.repository";
import { LoginRequest, AuthResponse, RefreshResponse } from "@workspace/api-zod";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly rbacRepository: IRbacRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtSecret: string,
  ) {}

  async login(
    dto: LoginRequest,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<{ authResponse: AuthResponse; refreshToken: string }> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) throw new Error("Invalid username or password");
    if (!user.isActive) throw new Error("User account is inactive");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new Error("Invalid username or password");

    const abilities = await this.rbacRepository.getAbilitiesByUserId(user.id);

    const accessToken = jwt.sign(
      { sub: user.id, username: user.username },
      this.jwtSecret,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      expiresAt,
    });

    return {
      authResponse: {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          isActive: user.isActive,
        },
        abilities,
        accessToken,
      },
      refreshToken,
    };
  }

  async refresh(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const record = await this.refreshTokenRepository.findByToken(oldRefreshToken);

    if (!record) throw new Error("Invalid refresh token");
    if (record.expiresAt < new Date()) {
      await this.refreshTokenRepository.deleteByToken(oldRefreshToken);
      throw new Error("Refresh token expired. Please login again.");
    }

    const user = await this.userRepository.findById(record.userId);
    if (!user || !user.isActive) throw new Error("User not found or inactive");

    const accessToken = jwt.sign(
      { sub: user.id, username: user.username },
      this.jwtSecret,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // Token Rotation: cấp RT mới, hủy RT cũ
    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.refreshTokenRepository.updateToken(
      oldRefreshToken,
      newRefreshToken,
      newExpiresAt,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }

  async getMe(userId: string): Promise<Pick<AuthResponse, "user" | "abilities">> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const abilities = await this.rbacRepository.getAbilitiesByUserId(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        isActive: user.isActive,
      },
      abilities,
    };
  }
}
