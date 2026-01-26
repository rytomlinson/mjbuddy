import { z } from 'zod';
import { router, authedProcedure } from '../trpc.js';
import {
  TileArraySchema,
  TileCodeSchema,
  analyzeAllHands,
  analyzeCall,
  PlayerHandState,
} from 'common';
import { getHandsByCardYear } from '../models/cardHand.js';
import { getActiveCardYear } from '../models/cardYear.js';
import { generateStrategyAdvice } from '../llm.js';

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
        results: results.map((r) => {
          // Build full hand tiles from best variation
          const fullHandTiles: number[] = [];
          if (r.bestVariation) {
            for (const group of r.bestVariation.groups) {
              for (let i = 0; i < group.count; i++) {
                fullHandTiles.push(group.tile);
              }
            }
          }

          return {
            handId: r.hand.id,
            handName: r.hand.displayName,
            displayPattern: r.hand.displayPattern,
            category: r.hand.categoryId,
            distance: r.distance,
            points: r.hand.points,
            isConcealed: r.hand.isConcealed,
            neededTiles: r.neededTiles,
            fullHandTiles,
            jokersUsable: r.jokersUsable,
            matchedGroups: r.matchedGroups,
            probability: r.probability,
            viabilityScore: r.viabilityScore,
          };
        }),
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

  /**
   * Get strategic advice from LLM based on current hand analysis
   */
  getAdvice: authedProcedure
    .input(
      z.object({
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
          return { advice: "Select a card year to get advice." };
        }
        cardYearId = activeYear.id;
      }

      // Get hands and analyze
      const hands = await getHandsByCardYear(cardYearId);
      const playerState: PlayerHandState = {
        tiles: input.playerState.tiles,
        drawnTile: input.playerState.drawnTile,
        exposedMelds: input.playerState.exposedMelds,
      };

      const results = analyzeAllHands(hands, playerState, 10);

      // Generate advice
      const advice = await generateStrategyAdvice({
        tileCount: input.playerState.tiles.length,
        hasDrawnTile: !!input.playerState.drawnTile,
        hasExposedMelds: input.playerState.exposedMelds.length > 0,
        topHands: results.map((r) => ({
          handName: r.hand.displayName,
          distance: r.distance,
          points: r.hand.points,
          isConcealed: r.hand.isConcealed,
          neededTilesCount: r.neededTiles.length,
        })),
      });

      return { advice };
    }),
});
