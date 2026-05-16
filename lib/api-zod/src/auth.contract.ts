import { z } from "zod";

export const loginRequestSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().nullable(),
  isActive: z.number(),
});

export const abilitiesSchema = z.record(z.string(), z.array(z.string()));

export const authResponseSchema = z.object({
  user: userResponseSchema,
  abilities: abilitiesSchema,
  accessToken: z.string(),
});

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
export type Abilities = z.infer<typeof abilitiesSchema>;
