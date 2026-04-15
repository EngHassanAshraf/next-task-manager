import { z } from "zod";

export const siteCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export const siteUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export const roleCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
});

export const permissionCreateSchema = z.object({
  code: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).nullable().optional(),
});

export const permissionUpdateSchema = z.object({
  code: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).nullable().optional(),
});

export const userCreateSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
  name: z.string().trim().max(200).nullable().optional(),
  roleId: z.string().min(1),
});

export const rolePermissionCreateSchema = z.object({
  roleId: z.string().min(1),
  permissionId: z.string().min(1),
});

export const userStatusPatchSchema = z.object({
  active: z.boolean(),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().max(200).nullable().optional(),
  email: z.string().trim().email().optional(),
  roleId: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

export const roleUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  permissionIds: z.array(z.string()).optional(),
});
