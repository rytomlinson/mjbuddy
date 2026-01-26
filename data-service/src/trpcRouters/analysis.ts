import { z } from 'zod';
import { router, authedProcedure } from '../trpc.js';
import {
  TileArraySchema,
  TileCodeSchema,
  analyzeAllHands,
  analyzeCall,
  PlayerHandState,
  HandAnalysisResult,
  CallAdvice,
} from 'common';
import { getHandsByCardYear } from '../models/cardHand.js';
import { getActiveCardYear } from '../models/cardYear.js';

const ExposedMeldSchema = z.object({
  type: z.enum(['pung', 'kong', 'quint', 'sextet']),
  tiles: TileArraySchema,
  jokerCount: z.number().int().min(0),
});

const PlayerHandStateSchema = z.object({
  tiles: TileArraySchema,
  drawnTile: TileCodeSchema.optional(),
  exposedMelds: z.array(ExposedMeldSchema),
});

export const analysisRouter = router({
  /**
   * Analyze player's hand and return ranked viable hands
   */
  analyzeHand: authedProcedure
    .input(
      z.object({
        playerState: PlayerHandStateSchema,
        cardYearId: z.number().optional(),
        maxResults: z.number().int().min(1).max(50).optional(),
      })
    )
    .query(async ({ input }) => {
      // Get card year (use active if not specified)
      let cardYearId = input.cardYearId;
      if (!cardYearId) {
        const activeYear = await getActiveCardYear();
        if (!activeYear) {
          return { results: [], cardYear: null };
        }
        cardYearId = activeYear.id;
      }

      // Get all hands for this card year
      const hands = await getHandsByCardYear(cardYearId);

      // Run analysis
      const playerState: PlayerHandState = {
        tiles: input.playerState.tiles,
        drawnTile: input.playerState.drawnTile,
        exposedMelds: input.playerState.exposedMelds,
      };

      const results = analyzeAllHands(hands, playerState, input.maxResults ?? 10);

      // Map results to serializable format
      return {
        results: results.map((r) => ({
          handId: r.hand.id,
          handName: r.hand.displayName,
          displayPattern: r.hand.displayPattern,
          category: r.hand.categoryId,
          distance: r.distance,
          points: r.hand.points,
          isConcealed: r.hand.isConcealed,
          neededTiles: r.neededTiles,
          jokersUsable: r.jokersUsable,
          matchedGroups: r.matchedGroups,
          probability: r.probability,
          viabilityScore: r.viabilityScore,
        })),
        cardYearId,
      };
    }),

  /**
   * Check what calls are available for a discarded tile
   */
  analyzeCall: authedProcedure
    .input(
      z.object({
        discardedTile: TileCodeSchema,
        playerState: PlayerHandStateSchema,
        cardYearId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      // Get card year
      let cardYearId = input.cardYearId;
      if (!cardYearId) {
        const activeYear = await getActiveCardYear();
        if (!activeYear) {
          return { calls: [] };
        }
        cardYearId = activeYear.id;
      }

      // Get all hands
      const hands = await getHandsByCardYear(cardYearId);

      // First analyze hand to get viable hands
      const playerState: PlayerHandState = {
        tiles: input.playerState.tiles,
        drawnTile: input.playerState.drawnTile,
        exposedMelds: input.playerState.exposedMelds,
      };

      const viableHands = analyzeAllHands(hands, playerState, 20);

      // Then analyze what we can call
      const callAdvice = analyzeCall(input.discardedTile, viableHands, playerState);

      return {
        calls: callAdvice.map((c) => ({
          handId: c.hand.id,
          handName: c.hand.displayName,
          displayPattern: c.hand.displayPattern,
          canCall: c.canCall,
          callType: c.callType,
          newDistance: c.newDistance,
          points: c.hand.points,
        })),
      };
    }),
});
