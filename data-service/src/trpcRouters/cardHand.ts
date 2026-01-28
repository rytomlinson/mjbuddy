import { z } from 'zod';
import { router, authedProcedure } from '../trpc.js';
import { CreateCardHandSchema, UpdateCardHandSchema, CreateHandCategorySchema, clearExpansionCache } from 'common';
import {
  getHandsByCategory,
  getHandsByCardYear,
  getCardHandById,
  createCardHand,
  updateCardHand,
  deleteCardHand,
  reorderHands,
} from '../models/cardHand.js';
import {
  getCategoriesByCardYear,
  getHandCategoryById,
  createHandCategory,
  deleteHandCategory,
  reorderCategories,
} from '../models/handCategory.js';

export const cardHandRouter = router({
  // Category operations
  listCategories: authedProcedure
    .input(z.object({ cardYearId: z.number() }))
    .query(async ({ input }) => {
      return getCategoriesByCardYear(input.cardYearId);
    }),

  getCategoryById: authedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getHandCategoryById(input.id);
    }),

  createCategory: authedProcedure
    .input(CreateHandCategorySchema)
    .mutation(async ({ input }) => {
      return createHandCategory(input);
    }),

  deleteCategory: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteHandCategory(input.id);
    }),

  reorderCategories: authedProcedure
    .input(z.object({ categoryIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      await reorderCategories(input.categoryIds);
      return { success: true };
    }),

  // Hand operations
  listByCategory: authedProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      return getHandsByCategory(input.categoryId);
    }),

  listByCardYear: authedProcedure
    .input(z.object({ cardYearId: z.number() }))
    .query(async ({ input }) => {
      return getHandsByCardYear(input.cardYearId);
    }),

  getById: authedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getCardHandById(input.id);
    }),

  create: authedProcedure
    .input(CreateCardHandSchema)
    .mutation(async ({ input }) => {
      return createCardHand(input);
    }),

  update: authedProcedure
    .input(UpdateCardHandSchema)
    .mutation(async ({ input }) => {
      // Clear expansion cache for this hand since pattern may have changed
      clearExpansionCache(input.id);
      return updateCardHand(input);
    }),

  delete: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Clear expansion cache for this hand
      clearExpansionCache(input.id);
      return deleteCardHand(input.id);
    }),

  reorder: authedProcedure
    .input(z.object({ handIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      await reorderHands(input.handIds);
      return { success: true };
    }),
});
