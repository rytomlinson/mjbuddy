import {
  TileCode,
  TileType,
  PatternGroup,
  GroupType,
  CardHand,
  getTileType,
  getTileValue,
  isJoker,
  isFlower,
  encodeTile,
} from '../schemas/index.js';
import {
  ConcretePattern,
  ConcreteGroup,
  expandPatternGroups,
  getGroupCount,
} from './patternUtils.js';
import { countTiles, sortTiles } from './tileUtils.js';

/**
 * Result of analyzing a single hand against player's tiles
 */
export interface HandAnalysisResult {
  hand: CardHand;
  distance: number; // Tiles needed to complete (lower = better)
  bestVariation: ConcretePattern | null;
  matchedGroups: MatchedGroup[];
  neededTiles: TileCode[];
  jokersUsable: number; // How many jokers could help
  isViable: boolean;
}

export interface MatchedGroup {
  groupIndex: number;
  tilesMatched: number;
  tilesNeeded: number;
  canUseJoker: boolean;
}

/**
 * Exposed meld from the player
 */
export interface ExposedMeld {
  type: 'pung' | 'kong' | 'quint' | 'sextet';
  tiles: TileCode[];
  jokerCount: number;
}

/**
 * Player's current hand state for analysis
 */
export interface PlayerHandState {
  tiles: TileCode[];
  drawnTile?: TileCode;
  exposedMelds: ExposedMeld[];
}

/**
 * Normalize a tile code for comparison purposes
 * - All flowers are equivalent
 * - All jokers are equivalent
 */
function normalizeTile(tile: TileCode): TileCode {
  if (isFlower(tile)) {
    return encodeTile(TileType.FLOWER, 1);
  }
  if (isJoker(tile)) {
    return encodeTile(TileType.JOKER, 1);
  }
  return tile;
}

/**
 * Count tiles in hand, normalizing flowers and jokers
 */
function countNormalizedTiles(tiles: TileCode[]): Map<TileCode, number> {
  const counts = new Map<TileCode, number>();
  for (const tile of tiles) {
    const normalized = normalizeTile(tile);
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  return counts;
}

/**
 * Calculate how many tiles are needed to complete a group
 */
function calculateGroupDistance(
  group: ConcreteGroup,
  availableTiles: Map<TileCode, number>,
  jokerCount: number
): { distance: number; jokersUsed: number; tilesUsed: TileCode[] } {
  const normalizedTile = normalizeTile(group.tile);
  const available = availableTiles.get(normalizedTile) ?? 0;
  const needed = group.count;

  if (available >= needed) {
    // Have enough tiles
    return {
      distance: 0,
      jokersUsed: 0,
      tilesUsed: Array(needed).fill(normalizedTile),
    };
  }

  const shortfall = needed - available;

  // Can only use jokers for groups of 3 or more
  if (group.count >= 3 && jokerCount > 0) {
    const jokersToUse = Math.min(shortfall, jokerCount);
    return {
      distance: shortfall - jokersToUse,
      jokersUsed: jokersToUse,
      tilesUsed: Array(available).fill(normalizedTile),
    };
  }

  return {
    distance: shortfall,
    jokersUsed: 0,
    tilesUsed: Array(available).fill(normalizedTile),
  };
}

/**
 * Calculate distance from player's hand to a concrete pattern
 */
function calculatePatternDistance(
  pattern: ConcretePattern,
  playerTiles: TileCode[],
  exposedMelds: ExposedMeld[]
): { distance: number; matchedGroups: MatchedGroup[]; jokersUsable: number } {
  // Count available tiles (excluding those in exposed melds)
  const tileCounts = countNormalizedTiles(playerTiles);
  const jokerCount = tileCounts.get(encodeTile(TileType.JOKER, 1)) ?? 0;

  // Remove jokers from tile counts (we track them separately)
  tileCounts.delete(encodeTile(TileType.JOKER, 1));

  // Check if exposed melds are compatible with pattern
  // For now, simplified: just check if we can fit the melds somewhere
  // TODO: More sophisticated meld matching

  let totalDistance = 0;
  let totalJokersUsable = 0;
  const matchedGroups: MatchedGroup[] = [];
  let remainingJokers = jokerCount;

  // Create a working copy of tile counts
  const workingCounts = new Map(tileCounts);

  for (let i = 0; i < pattern.groups.length; i++) {
    const group = pattern.groups[i];
    const normalizedTile = normalizeTile(group.tile);
    const available = workingCounts.get(normalizedTile) ?? 0;
    const needed = group.count;

    const result = calculateGroupDistance(group, workingCounts, remainingJokers);

    // Deduct used tiles from working counts
    const tilesUsed = Math.min(available, needed);
    if (tilesUsed > 0) {
      workingCounts.set(normalizedTile, available - tilesUsed);
    }

    // Deduct used jokers
    remainingJokers -= result.jokersUsed;

    totalDistance += result.distance;

    if (group.count >= 3) {
      totalJokersUsable += Math.min(result.distance, jokerCount);
    }

    matchedGroups.push({
      groupIndex: i,
      tilesMatched: tilesUsed + result.jokersUsed,
      tilesNeeded: needed,
      canUseJoker: group.count >= 3,
    });
  }

  return {
    distance: totalDistance,
    matchedGroups,
    jokersUsable: Math.min(totalJokersUsable, jokerCount),
  };
}

/**
 * Get the tiles needed to complete a pattern
 */
function getNeededTiles(
  pattern: ConcretePattern,
  matchedGroups: MatchedGroup[]
): TileCode[] {
  const needed: TileCode[] = [];

  for (let i = 0; i < pattern.groups.length; i++) {
    const group = pattern.groups[i];
    const matched = matchedGroups[i];
    const shortfall = matched.tilesNeeded - matched.tilesMatched;

    for (let j = 0; j < shortfall; j++) {
      needed.push(group.tile);
    }
  }

  return needed;
}

/**
 * Analyze a single hand against the player's tiles
 */
export function analyzeHand(
  hand: CardHand,
  playerState: PlayerHandState
): HandAnalysisResult {
  // Combine hand tiles with drawn tile if present
  const allTiles = playerState.drawnTile
    ? [...playerState.tiles, playerState.drawnTile]
    : [...playerState.tiles];

  // Check concealed hand compatibility
  if (hand.isConcealed && playerState.exposedMelds.length > 0) {
    // Concealed hands can't have exposed melds (except when calling for win)
    return {
      hand,
      distance: Infinity,
      bestVariation: null,
      matchedGroups: [],
      neededTiles: [],
      jokersUsable: 0,
      isViable: false,
    };
  }

  // Expand pattern to all concrete variations
  const variations = expandPatternGroups(hand.patternGroups);

  if (variations.length === 0) {
    return {
      hand,
      distance: Infinity,
      bestVariation: null,
      matchedGroups: [],
      neededTiles: [],
      jokersUsable: 0,
      isViable: false,
    };
  }

  // Find the best (lowest distance) variation
  let bestResult: {
    distance: number;
    variation: ConcretePattern;
    matchedGroups: MatchedGroup[];
    jokersUsable: number;
  } | null = null;

  for (const variation of variations) {
    const result = calculatePatternDistance(variation, allTiles, playerState.exposedMelds);

    if (bestResult === null || result.distance < bestResult.distance) {
      bestResult = {
        distance: result.distance,
        variation,
        matchedGroups: result.matchedGroups,
        jokersUsable: result.jokersUsable,
      };
    }

    // Early exit if we found a perfect match
    if (result.distance === 0) {
      break;
    }
  }

  if (!bestResult) {
    return {
      hand,
      distance: Infinity,
      bestVariation: null,
      matchedGroups: [],
      neededTiles: [],
      jokersUsable: 0,
      isViable: false,
    };
  }

  const neededTiles = getNeededTiles(bestResult.variation, bestResult.matchedGroups);

  return {
    hand,
    distance: bestResult.distance,
    bestVariation: bestResult.variation,
    matchedGroups: bestResult.matchedGroups,
    neededTiles,
    jokersUsable: bestResult.jokersUsable,
    isViable: bestResult.distance <= 6, // Consider viable if within 6 tiles
  };
}

/**
 * Analyze all hands and return ranked results
 */
export function analyzeAllHands(
  hands: CardHand[],
  playerState: PlayerHandState,
  maxResults: number = 10
): HandAnalysisResult[] {
  const results: HandAnalysisResult[] = [];

  for (const hand of hands) {
    const result = analyzeHand(hand, playerState);
    if (result.isViable) {
      results.push(result);
    }
  }

  // Sort by distance (ascending), then by points (descending)
  results.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    return b.hand.points - a.hand.points;
  });

  return results.slice(0, maxResults);
}

/**
 * Quick check if a discarded tile could be called for any viable hand
 */
export interface CallAdvice {
  hand: CardHand;
  canCall: boolean;
  callType: 'pung' | 'kong' | 'quint' | 'win' | null;
  newDistance: number;
}

export function analyzeCall(
  discardedTile: TileCode,
  viableHands: HandAnalysisResult[],
  playerState: PlayerHandState
): CallAdvice[] {
  const advice: CallAdvice[] = [];
  const normalizedDiscard = normalizeTile(discardedTile);

  for (const result of viableHands) {
    // Check if discarded tile is in needed tiles
    const neededNormalized = result.neededTiles.map(normalizeTile);
    const matchIndex = neededNormalized.indexOf(normalizedDiscard);

    if (matchIndex === -1) {
      continue;
    }

    // For concealed hands, can only call for win
    if (result.hand.isConcealed) {
      if (result.distance === 1) {
        advice.push({
          hand: result.hand,
          canCall: true,
          callType: 'win',
          newDistance: 0,
        });
      }
      continue;
    }

    // For exposed hands, check what we can call for
    // Find the group that needs this tile
    if (result.bestVariation) {
      for (let i = 0; i < result.bestVariation.groups.length; i++) {
        const group = result.bestVariation.groups[i];
        const matched = result.matchedGroups[i];

        if (normalizeTile(group.tile) === normalizedDiscard && matched.tilesMatched < matched.tilesNeeded) {
          // Can potentially call for this group
          const groupSize = group.count;
          let callType: 'pung' | 'kong' | 'quint' | 'win' | null = null;

          if (result.distance === 1) {
            callType = 'win';
          } else if (groupSize === 3) {
            callType = 'pung';
          } else if (groupSize === 4) {
            callType = 'kong';
          } else if (groupSize === 5) {
            callType = 'quint';
          }

          if (callType) {
            advice.push({
              hand: result.hand,
              canCall: true,
              callType,
              newDistance: result.distance - 1,
            });
            break; // Only one call per hand
          }
        }
      }
    }
  }

  return advice;
}
