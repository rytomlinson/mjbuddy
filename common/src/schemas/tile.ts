import { z } from 'zod';

/**
 * Tile Types for American Mah Jongg
 * Upper 4 bits of TileCode
 */
export enum TileType {
  // Suits (numbered 1-9)
  DOT = 1,
  BAM = 2,
  CRAK = 3,
  // Honors
  WIND = 4,    // EAST=1, SOUTH=2, WEST=3, NORTH=4
  DRAGON = 5,  // RED=1, GREEN=2, WHITE=3
  // Special
  FLOWER = 6,  // 1-8 (all interchangeable)
  JOKER = 7,   // 1-8 (all interchangeable)
}

/**
 * Wind values
 */
export enum Wind {
  EAST = 1,
  SOUTH = 2,
  WEST = 3,
  NORTH = 4,
}

/**
 * Dragon values
 */
export enum Dragon {
  RED = 1,    // Associated with Craks
  GREEN = 2,  // Associated with Bams
  WHITE = 3,  // "Soap" - Associated with Dots
}

/**
 * TileCode is a compact 8-bit encoding:
 * - Upper 4 bits: TileType
 * - Lower 4 bits: Value (1-9 for suits, 1-4 for winds, 1-3 for dragons, 1-8 for flowers/jokers)
 */
export type TileCode = number;

/**
 * Create a tile code from type and value
 */
export function encodeTile(type: TileType, value: number): TileCode {
  return (type << 4) | value;
}

/**
 * Extract tile type from code
 */
export function getTileType(code: TileCode): TileType {
  return (code >> 4) as TileType;
}

/**
 * Extract tile value from code
 */
export function getTileValue(code: TileCode): number {
  return code & 0x0f;
}

/**
 * Check if tile is a suit (Dot, Bam, Crak)
 */
export function isSuit(code: TileCode): boolean {
  const type = getTileType(code);
  return type >= TileType.DOT && type <= TileType.CRAK;
}

/**
 * Check if tile is an honor (Wind or Dragon)
 */
export function isHonor(code: TileCode): boolean {
  const type = getTileType(code);
  return type === TileType.WIND || type === TileType.DRAGON;
}

/**
 * Check if tile is a joker
 */
export function isJoker(code: TileCode): boolean {
  return getTileType(code) === TileType.JOKER;
}

/**
 * Check if tile is a flower
 */
export function isFlower(code: TileCode): boolean {
  return getTileType(code) === TileType.FLOWER;
}

/**
 * Pre-computed tile codes for convenience
 */
export const TILES = {
  // Dots 1-9
  DOT_1: encodeTile(TileType.DOT, 1),
  DOT_2: encodeTile(TileType.DOT, 2),
  DOT_3: encodeTile(TileType.DOT, 3),
  DOT_4: encodeTile(TileType.DOT, 4),
  DOT_5: encodeTile(TileType.DOT, 5),
  DOT_6: encodeTile(TileType.DOT, 6),
  DOT_7: encodeTile(TileType.DOT, 7),
  DOT_8: encodeTile(TileType.DOT, 8),
  DOT_9: encodeTile(TileType.DOT, 9),
  // Bams 1-9
  BAM_1: encodeTile(TileType.BAM, 1),
  BAM_2: encodeTile(TileType.BAM, 2),
  BAM_3: encodeTile(TileType.BAM, 3),
  BAM_4: encodeTile(TileType.BAM, 4),
  BAM_5: encodeTile(TileType.BAM, 5),
  BAM_6: encodeTile(TileType.BAM, 6),
  BAM_7: encodeTile(TileType.BAM, 7),
  BAM_8: encodeTile(TileType.BAM, 8),
  BAM_9: encodeTile(TileType.BAM, 9),
  // Craks 1-9
  CRAK_1: encodeTile(TileType.CRAK, 1),
  CRAK_2: encodeTile(TileType.CRAK, 2),
  CRAK_3: encodeTile(TileType.CRAK, 3),
  CRAK_4: encodeTile(TileType.CRAK, 4),
  CRAK_5: encodeTile(TileType.CRAK, 5),
  CRAK_6: encodeTile(TileType.CRAK, 6),
  CRAK_7: encodeTile(TileType.CRAK, 7),
  CRAK_8: encodeTile(TileType.CRAK, 8),
  CRAK_9: encodeTile(TileType.CRAK, 9),
  // Winds
  EAST: encodeTile(TileType.WIND, Wind.EAST),
  SOUTH: encodeTile(TileType.WIND, Wind.SOUTH),
  WEST: encodeTile(TileType.WIND, Wind.WEST),
  NORTH: encodeTile(TileType.WIND, Wind.NORTH),
  // Dragons
  RED_DRAGON: encodeTile(TileType.DRAGON, Dragon.RED),
  GREEN_DRAGON: encodeTile(TileType.DRAGON, Dragon.GREEN),
  WHITE_DRAGON: encodeTile(TileType.DRAGON, Dragon.WHITE),
  // Flowers (all equivalent, but distinct for counting)
  FLOWER_1: encodeTile(TileType.FLOWER, 1),
  FLOWER_2: encodeTile(TileType.FLOWER, 2),
  FLOWER_3: encodeTile(TileType.FLOWER, 3),
  FLOWER_4: encodeTile(TileType.FLOWER, 4),
  FLOWER_5: encodeTile(TileType.FLOWER, 5),
  FLOWER_6: encodeTile(TileType.FLOWER, 6),
  FLOWER_7: encodeTile(TileType.FLOWER, 7),
  FLOWER_8: encodeTile(TileType.FLOWER, 8),
  // Jokers (all equivalent, but distinct for counting)
  JOKER_1: encodeTile(TileType.JOKER, 1),
  JOKER_2: encodeTile(TileType.JOKER, 2),
  JOKER_3: encodeTile(TileType.JOKER, 3),
  JOKER_4: encodeTile(TileType.JOKER, 4),
  JOKER_5: encodeTile(TileType.JOKER, 5),
  JOKER_6: encodeTile(TileType.JOKER, 6),
  JOKER_7: encodeTile(TileType.JOKER, 7),
  JOKER_8: encodeTile(TileType.JOKER, 8),
} as const;

/**
 * Zod schema for TileCode validation
 */
export const TileCodeSchema = z.number().int().min(0).max(255);

/**
 * Zod schema for TileType validation
 */
export const TileTypeSchema = z.nativeEnum(TileType);

/**
 * Array of tile codes schema
 */
export const TileArraySchema = z.array(TileCodeSchema);
