import {
  TileCode,
  TileType,
  CardHand,
  getTileType,
  isJoker,
  isFlower,
  encodeTile,
} from '../schemas/index.js';
import {
  ConcretePattern,
  ConcreteGroup,
  expandPatternGroups,
} from './patternUtils.js';
import {
  calculateDrawProbability,
  calculateViabilityScore,
} from './tileUtils.js';

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
  probability: number; // Probability of completing (0-1)
  viabilityScore: number; // Combined score (0-100)
  meldToGroupMap: Map<number, number>; // Maps meld index to group index in pattern
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
 * Check if exposed melds are compatible with a pattern
 * Returns a map of meld index to group index, or null if incompatible
 */
function checkExposedMeldCompatibility(
  pattern: ConcretePattern,
  exposedMelds: ExposedMeld[]
): { satisfiedGroups: number[]; meldToGroupMap: Map<number, number> } | null {
  if (exposedMelds.length === 0) {
    return { satisfiedGroups: [], meldToGroupMap: new Map() };
  }

  const usedGroupIndices: number[] = [];
  const meldToGroupMap = new Map<number, number>();

  for (let meldIndex = 0; meldIndex < exposedMelds.length; meldIndex++) {
    const meld = exposedMelds[meldIndex];
    // Find the natural (non-joker) tile in the meld to determine what it represents
    const naturalTile = meld.tiles.find(t => !isJoker(t));
    if (naturalTile === undefined) {
      // Meld is all jokers - this shouldn't happen in practice
      continue;
    }

    const normalizedMeldTile = normalizeTile(naturalTile);
    const meldSize = meld.tiles.length;

    // Find a matching group in the pattern that hasn't been used yet
    let foundMatch = false;
    for (let i = 0; i < pattern.groups.length; i++) {
      if (usedGroupIndices.includes(i)) {
        continue; // Already matched to another meld
      }

      const group = pattern.groups[i];
      const normalizedGroupTile = normalizeTile(group.tile);

      // Check if this group matches the meld
      if (normalizedGroupTile === normalizedMeldTile && group.count === meldSize) {
        usedGroupIndices.push(i);
        meldToGroupMap.set(meldIndex, i);
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      // This meld doesn't match any group in the pattern
      return null;
    }
  }

  return { satisfiedGroups: usedGroupIndices, meldToGroupMap };
}

/**
 * Calculate distance from player's hand to a concrete pattern
 */
function calculatePatternDistance(
  pattern: ConcretePattern,
  playerTiles: TileCode[],
  exposedMelds: ExposedMeld[]
): { distance: number; matchedGroups: MatchedGroup[]; jokersUsable: number; isCompatible: boolean; meldToGroupMap: Map<number, number> } {
  // First check if exposed melds are compatible with this pattern
  const compatResult = checkExposedMeldCompatibility(pattern, exposedMelds);
  if (compatResult === null) {
    // Incompatible - return high distance
    return {
      distance: Infinity,
      matchedGroups: [],
      jokersUsable: 0,
      isCompatible: false,
      meldToGroupMap: new Map(),
    };
  }

  const { satisfiedGroups, meldToGroupMap } = compatResult;

  // Count available tiles (excluding those in exposed melds)
  const tileCounts = countNormalizedTiles(playerTiles);
  const jokerCount = tileCounts.get(encodeTile(TileType.JOKER, 1)) ?? 0;

  // Remove jokers from tile counts (we track them separately)
  tileCounts.delete(encodeTile(TileType.JOKER, 1));

  let totalDistance = 0;
  let totalJokersUsable = 0;
  const matchedGroups: MatchedGroup[] = [];
  let remainingJokers = jokerCount;

  // Create a working copy of tile counts
  const workingCounts = new Map(tileCounts);

  for (let i = 0; i < pattern.groups.length; i++) {
    const group = pattern.groups[i];
    const needed = group.count;

    // Check if this group is already satisfied by an exposed meld
    if (satisfiedGroups.includes(i)) {
      // Group is fully satisfied by exposed meld - no distance, fully matched
      matchedGroups.push({
        groupIndex: i,
        tilesMatched: needed,
        tilesNeeded: needed,
        canUseJoker: group.count >= 3,
      });
      continue;
    }

    const normalizedTile = normalizeTile(group.tile);
    const available = workingCounts.get(normalizedTile) ?? 0;

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
    isCompatible: true,
    meldToGroupMap,
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
      probability: 0,
      viabilityScore: 0,
      meldToGroupMap: new Map(),
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
      probability: 0,
      viabilityScore: 0,
      meldToGroupMap: new Map(),
    };
  }

  // Find the best (lowest distance) variation
  let bestResult: {
    distance: number;
    variation: ConcretePattern;
    matchedGroups: MatchedGroup[];
    jokersUsable: number;
    meldToGroupMap: Map<number, number>;
  } | null = null;

  for (const variation of variations) {
    const result = calculatePatternDistance(variation, allTiles, playerState.exposedMelds);

    // Skip incompatible variations (exposed melds don't match pattern)
    if (!result.isCompatible) {
      continue;
    }

    if (bestResult === null || result.distance < bestResult.distance) {
      bestResult = {
        distance: result.distance,
        variation,
        matchedGroups: result.matchedGroups,
        jokersUsable: result.jokersUsable,
        meldToGroupMap: result.meldToGroupMap,
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
      probability: 0,
      viabilityScore: 0,
      meldToGroupMap: new Map(),
    };
  }

  const neededTiles = getNeededTiles(bestResult.variation, bestResult.matchedGroups);

  // Calculate probability and viability score
  const probability = calculateDrawProbability(neededTiles, allTiles);
  const viabilityScore = calculateViabilityScore(
    bestResult.distance,
    probability,
    hand.points
  );

  return {
    hand,
    distance: bestResult.distance,
    bestVariation: bestResult.variation,
    matchedGroups: bestResult.matchedGroups,
    neededTiles,
    jokersUsable: bestResult.jokersUsable,
    isViable: bestResult.distance <= 6, // Consider viable if within 6 tiles
    probability,
    viabilityScore,
    meldToGroupMap: bestResult.meldToGroupMap,
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

          // Can only call for melds of 3+ tiles (pung, kong, quint, sextet)
          if (groupSize < 3) {
            continue;
          }

          // Check if player has enough tiles (matching + jokers) to complete the call
          // Need (groupSize - 1) tiles from hand to expose with the called tile
          const tilesNeededFromHand = groupSize - 1;
          const matchingInHand = playerState.tiles.filter(t => normalizeTile(t) === normalizedDiscard).length;
          const jokersInHand = playerState.tiles.filter(t => getTileType(t) === TileType.JOKER).length;

          if (matchingInHand + jokersInHand < tilesNeededFromHand) {
            continue; // Not enough tiles to complete the call
          }

          let callType: 'pung' | 'kong' | 'quint' | 'win' | null = null;

          if (result.distance === 1) {
            callType = 'win';
          } else if (groupSize === 3) {
            callType = 'pung';
          } else if (groupSize === 4) {
            callType = 'kong';
          } else if (groupSize === 5) {
            callType = 'quint';
          } else if (groupSize === 6) {
            callType = 'quint'; // sextet uses quint call type
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
