import { z } from 'zod';
import { router, authedProcedure } from '../trpc.js';
import {
  TileArraySchema,
  TileCodeSchema,
  analyzeAllHands,
  analyzeCall,
  PlayerHandState,
  generateDisplaySegments,
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
          // Also track where each group's tiles start in the array
          const fullHandTiles: number[] = [];
          const groupStartIndices: number[] = [];
          if (r.bestVariation) {
            for (const group of r.bestVariation.groups) {
              groupStartIndices.push(fullHandTiles.length);
              for (let i = 0; i < group.count; i++) {
                fullHandTiles.push(group.tile);
              }
            }
          }

          // Convert meldToGroupMap (Map) to array of [meldIndex, groupIndex] pairs for JSON
          const meldToGroupMap: [number, number][] = [];
          for (const [meldIndex, groupIndex] of r.meldToGroupMap.entries()) {
            meldToGroupMap.push([meldIndex, groupIndex]);
          }

          return {
            handId: r.hand.id,
            handName: r.hand.displayName,
            displayPattern: generateDisplaySegments(r.hand.patternGroups),
            category: r.hand.categoryId,
            distance: r.distance,
            points: r.hand.points,
            isConcealed: r.hand.isConcealed,
            neededTiles: r.neededTiles,
            fullHandTiles,
            groupStartIndices,
            meldToGroupMap,
            jokersUsable: r.jokersUsable,
            matchedGroups: r.matchedGroups,
            probability: r.probability,
            viabilityScore: r.viabilityScore,
            notes: r.hand.notes,
            examples: r.hand.examples,
          };
        }),
        cardYearId,
      };
    }),

  /**
   * Get all callable tiles and what hands they apply to
   */
  getCallableTiles: authedProcedure
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
          return { callableTiles: [] };
        }
        cardYearId = activeYear.id;
      }

      // Get all hands
      const hands = await getHandsByCardYear(cardYearId);

      // Analyze hand to get viable hands
      const playerState: PlayerHandState = {
        tiles: input.playerState.tiles,
        drawnTile: input.playerState.drawnTile,
        exposedMelds: input.playerState.exposedMelds,
      };

      const viableHands = analyzeAllHands(hands, playerState, 20);

      // Collect all unique needed tiles across viable hands
      const neededTilesSet = new Set<number>();
      for (const result of viableHands) {
        for (const tile of result.neededTiles) {
          neededTilesSet.add(tile);
        }
      }

      // For each needed tile, check if it's callable
      const callableTiles: Array<{
        tile: number;
        calls: Array<{
          handId: number;
          handName: string;
          callType: 'pung' | 'kong' | 'quint' | 'win';
          exposedTiles: number[];
          newDistance: number;
          points: number;
        }>;
      }> = [];

      for (const tile of neededTilesSet) {
        const callAdvice = analyzeCall(tile, viableHands, playerState);

        if (callAdvice.length > 0) {
          const calls = callAdvice
            .filter(c => c.canCall && c.callType)
            .map(c => {
              // Figure out which tiles would be exposed
              // For a call, you expose the called tile plus tiles from your hand
              const exposedTiles: number[] = [tile];

              // Find how many of this tile the player has
              const playerTileCount = playerState.tiles.filter(t => t === tile).length;

              // Add player's matching tiles to exposed
              for (let i = 0; i < playerTileCount; i++) {
                exposedTiles.push(tile);
              }

              return {
                handId: c.hand.id,
                handName: c.hand.displayName,
                callType: c.callType as 'pung' | 'kong' | 'quint' | 'win',
                exposedTiles,
                newDistance: c.newDistance,
                points: c.hand.points,
              };
            });

          if (calls.length > 0) {
            callableTiles.push({ tile, calls });
          }
        }
      }

      return { callableTiles };
    }),

  /**
   * Analyze call options for a specific discarded tile
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

      // Analyze hand to get viable hands
      const playerState: PlayerHandState = {
        tiles: input.playerState.tiles,
        drawnTile: input.playerState.drawnTile,
        exposedMelds: input.playerState.exposedMelds,
      };

      const viableHands = analyzeAllHands(hands, playerState, 20);

      // Analyze call options for this specific tile
      const callAdvice = analyzeCall(input.discardedTile, viableHands, playerState);

      // Map to response format
      const calls = callAdvice
        .filter((c) => c.canCall && c.callType)
        .map((c) => ({
          handId: c.hand.id,
          handName: c.hand.displayName,
          displayPattern: generateDisplaySegments(c.hand.patternGroups),
          canCall: c.canCall,
          callType: c.callType as 'pung' | 'kong' | 'quint' | 'win',
          newDistance: c.newDistance,
          points: c.hand.points,
        }));

      return { calls };
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
