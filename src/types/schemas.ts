import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type User = z.infer<typeof userSchema>;

export const accountSchema = z.object({
  id: z.uuid(),
  userId: z.string().nonempty(),
  accountId: z.string().nonempty(),
  providerId: z.string().nonempty(),
  accessToken: z.string().nullish(),
  refreshToken: z.string().nullish(),
  idToken: z.string().nullish(),
  accessTokenExpiresAt: z.iso.datetime().nullish(),
  refreshTokenExpiresAt: z.iso.datetime().nullish(),
  scope: z.string().nullish(),
  password: z.string().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Account = z.infer<typeof accountSchema>;

export const sessionSchema = z.object({
  id: z.uuid(),
  userId: z.string().nonempty(),
  token: z.string().nonempty(),
  expiresAt: z.iso.datetime(),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Session = z.infer<typeof sessionSchema>;

export const verificationTypeSchema = z.enum([
  "email_verification",
  "password_reset_request",
  "email_reset_request",
]);
export type VerificationType = z.infer<typeof verificationTypeSchema>;

export const verificationSchema = z.object({
  id: z.uuid(),
  userId: z.string().nullish(),
  identifier: z.string().nonempty(),
  token: z.string().nonempty(),
  type: verificationTypeSchema,
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Verification = z.infer<typeof verificationSchema>;
