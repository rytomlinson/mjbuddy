import {
  TileCode,
  TileType,
  Wind,
  Dragon,
  getTileType,
  getTileValue,
  encodeTile,
  isSuit,
  isJoker,
  isFlower,
} from '../schemas/tile.js';

/**
 * Display names for tile types
 */
const TILE_TYPE_NAMES: Record<TileType, string> = {
  [TileType.DOT]: 'Dot',
  [TileType.BAM]: 'Bam',
  [TileType.CRAK]: 'Crak',
  [TileType.WIND]: 'Wind',
  [TileType.DRAGON]: 'Dragon',
  [TileType.FLOWER]: 'Flower',
  [TileType.JOKER]: 'Joker',
};

/**
 * Display names for winds
 */
const WIND_NAMES: Record<Wind, string> = {
  [Wind.EAST]: 'East',
  [Wind.SOUTH]: 'South',
  [Wind.WEST]: 'West',
  [Wind.NORTH]: 'North',
};

/**
 * Display names for dragons
 */
const DRAGON_NAMES: Record<Dragon, string> = {
  [Dragon.RED]: 'Red',
  [Dragon.GREEN]: 'Green',
  [Dragon.WHITE]: 'White',
};

/**
 * Short codes for tile types (for compact display)
 */
const TILE_TYPE_SHORT: Record<TileType, string> = {
  [TileType.DOT]: 'D',
  [TileType.BAM]: 'B',
  [TileType.CRAK]: 'C',
  [TileType.WIND]: 'W',
  [TileType.DRAGON]: 'Dr',
  [TileType.FLOWER]: 'F',
  [TileType.JOKER]: 'J',
};

/**
 * Get full display name for a tile
 * e.g., "5 Dot", "Red Dragon", "East Wind", "Flower", "Joker"
 */
export function getTileDisplayName(code: TileCode): string {
  const type = getTileType(code);
  const value = getTileValue(code);

  switch (type) {
    case TileType.DOT:
    case TileType.BAM:
    case TileType.CRAK:
      return `${value} ${TILE_TYPE_NAMES[type]}`;
    case TileType.WIND:
      return `${WIND_NAMES[value as Wind]} Wind`;
    case TileType.DRAGON:
      return `${DRAGON_NAMES[value as Dragon]} Dragon`;
    case TileType.FLOWER:
      return 'Flower';
    case TileType.JOKER:
      return 'Joker';
    default:
      return 'Unknown';
  }
}

/**
 * Get short display code for a tile
 * e.g., "5D", "RDr", "EW", "F", "J"
 */
export function getTileShortCode(code: TileCode): string {
  const type = getTileType(code);
  const value = getTileValue(code);

  switch (type) {
    case TileType.DOT:
    case TileType.BAM:
    case TileType.CRAK:
      return `${value}${TILE_TYPE_SHORT[type]}`;
    case TileType.WIND:
      return `${WIND_NAMES[value as Wind][0]}W`;
    case TileType.DRAGON:
      return `${DRAGON_NAMES[value as Dragon][0]}Dr`;
    case TileType.FLOWER:
      return 'F';
    case TileType.JOKER:
      return 'J';
    default:
      return '?';
  }
}

/**
 * Compare two tiles for sorting
 * Order: Dots < Bams < Craks < Winds < Dragons < Flowers < Jokers
 * Within type: by value
 */
export function compareTiles(a: TileCode, b: TileCode): number {
  const typeA = getTileType(a);
  const typeB = getTileType(b);

  if (typeA !== typeB) {
    return typeA - typeB;
  }

  return getTileValue(a) - getTileValue(b);
}

/**
 * Sort an array of tiles
 */
export function sortTiles(tiles: TileCode[]): TileCode[] {
  return [...tiles].sort(compareTiles);
}

/**
 * Check if two tiles are equivalent (same type and value, or both jokers, or both flowers)
 */
export function tilesMatch(a: TileCode, b: TileCode): boolean {
  // Jokers are all equivalent to each other
  if (isJoker(a) && isJoker(b)) {
    return true;
  }
  // Flowers are all equivalent to each other
  if (isFlower(a) && isFlower(b)) {
    return true;
  }
  // Otherwise must match exactly
  return a === b;
}

/**
 * Check if a tile can substitute for another (joker for anything in 3+ groups)
 * Note: This is a simple check; actual substitution rules depend on group size
 */
export function canSubstitute(joker: TileCode, target: TileCode): boolean {
  return isJoker(joker) && !isJoker(target);
}

/**
 * Count occurrences of each tile in an array
 * Returns a Map of TileCode -> count
 */
export function countTiles(tiles: TileCode[]): Map<TileCode, number> {
  const counts = new Map<TileCode, number>();
  for (const tile of tiles) {
    counts.set(tile, (counts.get(tile) ?? 0) + 1);
  }
  return counts;
}

/**
 * Count total jokers in an array
 */
export function countJokers(tiles: TileCode[]): number {
  return tiles.filter(isJoker).length;
}

/**
 * Count total flowers in an array
 */
export function countFlowers(tiles: TileCode[]): number {
  return tiles.filter(isFlower).length;
}

/**
 * Get all tiles of a specific suit
 */
export function getTilesOfSuit(tiles: TileCode[], suitType: TileType): TileCode[] {
  return tiles.filter((t) => getTileType(t) === suitType);
}

/**
 * Parse a short code string to tile code
 * e.g., "5D" -> DOT_5, "RDr" -> RED_DRAGON
 */
export function parseTileCode(shortCode: string): TileCode | null {
  const normalized = shortCode.trim().toUpperCase();

  // Handle joker
  if (normalized === 'J' || normalized === 'JOKER') {
    return encodeTile(TileType.JOKER, 1);
  }

  // Handle flower
  if (normalized === 'F' || normalized === 'FLOWER') {
    return encodeTile(TileType.FLOWER, 1);
  }

  // Handle dragons: RDr, GDr, WDr or Red, Green, White
  if (normalized.endsWith('DR') || normalized.includes('DRAGON')) {
    const dragonChar = normalized[0];
    if (dragonChar === 'R') return encodeTile(TileType.DRAGON, Dragon.RED);
    if (dragonChar === 'G') return encodeTile(TileType.DRAGON, Dragon.GREEN);
    if (dragonChar === 'W') return encodeTile(TileType.DRAGON, Dragon.WHITE);
    return null;
  }

  // Handle winds: EW, SW, WW, NW or East, South, West, North
  if (normalized.endsWith('W') && normalized.length === 2) {
    const windChar = normalized[0];
    if (windChar === 'E') return encodeTile(TileType.WIND, Wind.EAST);
    if (windChar === 'S') return encodeTile(TileType.WIND, Wind.SOUTH);
    if (windChar === 'W') return encodeTile(TileType.WIND, Wind.WEST);
    if (windChar === 'N') return encodeTile(TileType.WIND, Wind.NORTH);
    return null;
  }

  // Handle suits: 1D, 5B, 9C, etc.
  const suitMatch = normalized.match(/^(\d)([DBC])$/);
  if (suitMatch) {
    const value = parseInt(suitMatch[1], 10);
    const suit = suitMatch[2];
    if (value >= 1 && value <= 9) {
      if (suit === 'D') return encodeTile(TileType.DOT, value);
      if (suit === 'B') return encodeTile(TileType.BAM, value);
      if (suit === 'C') return encodeTile(TileType.CRAK, value);
    }
  }

  return null;
}

/**
 * Generate all 152 tiles in a standard American Mah Jongg set
 */
export function generateFullTileSet(): TileCode[] {
  const tiles: TileCode[] = [];

  // Suits: 4 of each 1-9 for Dot, Bam, Crak (108 tiles)
  for (const type of [TileType.DOT, TileType.BAM, TileType.CRAK]) {
    for (let value = 1; value <= 9; value++) {
      for (let i = 0; i < 4; i++) {
        tiles.push(encodeTile(type, value));
      }
    }
  }

  // Winds: 4 of each (16 tiles)
  for (const wind of [Wind.EAST, Wind.SOUTH, Wind.WEST, Wind.NORTH]) {
    for (let i = 0; i < 4; i++) {
      tiles.push(encodeTile(TileType.WIND, wind));
    }
  }

  // Dragons: 4 of each (12 tiles)
  for (const dragon of [Dragon.RED, Dragon.GREEN, Dragon.WHITE]) {
    for (let i = 0; i < 4; i++) {
      tiles.push(encodeTile(TileType.DRAGON, dragon));
    }
  }

  // Flowers: 8 tiles
  for (let i = 1; i <= 8; i++) {
    tiles.push(encodeTile(TileType.FLOWER, i));
  }

  // Jokers: 8 tiles
  for (let i = 1; i <= 8; i++) {
    tiles.push(encodeTile(TileType.JOKER, i));
  }

  return tiles; // 152 tiles total
}

/**
 * American Mah Jongg tile counts
 * Total: 152 tiles
 */
export const TILE_COUNTS = {
  // Suits: 4 copies of each number (1-9) per suit
  SUIT_COPIES: 4,
  SUIT_VALUES: 9,
  SUITS_TOTAL: 108, // 3 suits * 9 values * 4 copies

  // Winds: 4 copies of each wind
  WIND_COPIES: 4,
  WINDS_TOTAL: 16, // 4 winds * 4 copies

  // Dragons: 4 copies of each dragon
  DRAGON_COPIES: 4,
  DRAGONS_TOTAL: 12, // 3 dragons * 4 copies

  // Flowers: 8 total (all interchangeable)
  FLOWERS_TOTAL: 8,

  // Jokers: 8 total (all interchangeable)
  JOKERS_TOTAL: 8,

  // Grand total
  TOTAL: 152,
} as const;

/**
 * Get the maximum count of a specific tile that exists in the game
 */
export function getMaxTileCount(code: TileCode): number {
  const type = getTileType(code);

  switch (type) {
    case TileType.DOT:
    case TileType.BAM:
    case TileType.CRAK:
      return TILE_COUNTS.SUIT_COPIES; // 4
    case TileType.WIND:
      return TILE_COUNTS.WIND_COPIES; // 4
    case TileType.DRAGON:
      return TILE_COUNTS.DRAGON_COPIES; // 4
    case TileType.FLOWER:
      return TILE_COUNTS.FLOWERS_TOTAL; // 8 (all equivalent)
    case TileType.JOKER:
      return TILE_COUNTS.JOKERS_TOTAL; // 8 (all equivalent)
    default:
      return 0;
  }
}

/**
 * Normalize a tile for counting purposes
 * All flowers are equivalent, all jokers are equivalent
 */
export function normalizeTileForCounting(code: TileCode): TileCode {
  if (isFlower(code)) {
    return encodeTile(TileType.FLOWER, 1);
  }
  if (isJoker(code)) {
    return encodeTile(TileType.JOKER, 1);
  }
  return code;
}

/**
 * Calculate remaining tiles of a specific type given seen tiles
 */
export function getRemainingCount(
  targetTile: TileCode,
  seenTiles: TileCode[]
): number {
  const normalizedTarget = normalizeTileForCounting(targetTile);
  const maxCount = getMaxTileCount(targetTile);

  // Count how many of the target tile have been seen
  let seenCount = 0;
  for (const seen of seenTiles) {
    const normalizedSeen = normalizeTileForCounting(seen);
    if (normalizedSeen === normalizedTarget) {
      seenCount++;
    }
  }

  return Math.max(0, maxCount - seenCount);
}

/**
 * Calculate probability of drawing at least one of the needed tiles
 * Uses hypergeometric distribution approximation
 *
 * @param neededTiles - Tiles needed (with duplicates for multiple copies needed)
 * @param seenTiles - All tiles that have been seen (in hand, discarded, exposed)
 * @param remainingDraws - Number of draws remaining (estimated wall size)
 * @returns Probability between 0 and 1
 */
export function calculateDrawProbability(
  neededTiles: TileCode[],
  seenTiles: TileCode[],
  remainingDraws: number = 50
): number {
  if (neededTiles.length === 0) {
    return 1; // Already complete
  }

  // Group needed tiles by normalized code
  const neededCounts = new Map<TileCode, number>();
  for (const tile of neededTiles) {
    const normalized = normalizeTileForCounting(tile);
    neededCounts.set(normalized, (neededCounts.get(normalized) ?? 0) + 1);
  }

  // Calculate remaining in wall for each needed tile
  const remainingInWall = new Map<TileCode, number>();
  for (const [tile] of neededCounts) {
    remainingInWall.set(tile, getRemainingCount(tile, seenTiles));
  }

  // Total unseen tiles (wall + other players' hands)
  const totalSeen = seenTiles.length;
  const totalUnseen = Math.max(1, TILE_COUNTS.TOTAL - totalSeen);

  // Calculate combined probability using independence assumption
  // P(getting all needed) = product of P(getting each type)
  let probability = 1;

  for (const [tile, countNeeded] of neededCounts) {
    const available = remainingInWall.get(tile) ?? 0;

    if (available < countNeeded) {
      // Not enough tiles exist - impossible
      return 0;
    }

    // Simplified probability: chance of drawing at least countNeeded copies
    // from available copies in totalUnseen cards over remainingDraws
    // Using rough approximation: 1 - (1 - available/totalUnseen)^remainingDraws for each needed

    // For multiple copies needed, multiply probabilities
    for (let i = 0; i < countNeeded; i++) {
      const adjustedAvailable = Math.max(0, available - i);
      const adjustedUnseen = Math.max(1, totalUnseen - i);

      // Probability of NOT drawing this tile in all remaining draws
      const pNotDraw = Math.pow(
        1 - adjustedAvailable / adjustedUnseen,
        remainingDraws / (countNeeded - i)
      );
      probability *= 1 - pNotDraw;
    }
  }

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate a "viability score" combining distance and probability
 * Higher score = more achievable hand
 *
 * @param distance - Tiles away from completion
 * @param probability - Probability of completion (0-1)
 * @param points - Point value of hand
 * @returns Score between 0-100
 */
export function calculateViabilityScore(
  distance: number,
  probability: number,
  points: number
): number {
  if (distance === 0) {
    return 100; // Already complete
  }

  // Distance factor: closer hands score higher (exponential decay)
  const distanceFactor = Math.exp(-distance * 0.3);

  // Probability factor: higher probability scores higher
  const probabilityFactor = probability;

  // Points factor: higher point hands get slight bonus (logarithmic)
  const pointsFactor = 1 + Math.log10(Math.max(25, points)) / 10;

  // Combined score (0-100 scale)
  const score = distanceFactor * probabilityFactor * pointsFactor * 100;

  return Math.min(100, Math.max(0, score));
}
