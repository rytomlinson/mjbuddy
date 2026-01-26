import { z } from 'zod';

/**
 * Card year schema (for database storage)
 */
export const CardYearSchema = z.object({
  id: z.number(),
  year: z.number().int().min(2000).max(2100),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type CardYear = z.infer<typeof CardYearSchema>;

/**
 * Schema for creating a new card year
 */
export const CreateCardYearSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  name: z.string().min(1).max(100),
  isActive: z.boolean().optional(),
});

export type CreateCardYear = z.infer<typeof CreateCardYearSchema>;

/**
 * Schema for updating a card year
 */
export const UpdateCardYearSchema = z.object({
  id: z.number(),
  year: z.number().int().min(2000).max(2100).optional(),
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCardYear = z.infer<typeof UpdateCardYearSchema>;
