import { z } from "zod";

export const profilePatchSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export const passwordPatchSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
});

export const revokeSessionSchema = z.object({
  id: z.string().min(1),
});

