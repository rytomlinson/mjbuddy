import { z } from 'zod';
import { TileCodeSchema, TileTypeSchema } from './tile.js';

/**
 * Group types in a Mah Jongg hand
 */
export enum GroupType {
  SINGLE = 1,
  PAIR = 2,
  PUNG = 3,
  KONG = 4,
  QUINT = 5,
  SEXTET = 6,
}

export const GroupTypeSchema = z.nativeEnum(GroupType);

/**
 * Constraints for number values in patterns
 */
export const NumberConstraintsSchema = z.object({
  evenOnly: z.boolean().optional(),
  oddOnly: z.boolean().optional(),
  range: z.tuple([z.number(), z.number()]).optional(),
  excludeNumbers: z.array(z.number()).optional(),
  specificValues: z.array(z.number()).optional(),
});

export type NumberConstraints = z.infer<typeof NumberConstraintsSchema>;

/**
 * Tile pattern - can be a fixed tile or a placeholder with constraints
 */
export const TilePatternSchema = z.object({
  // Fixed tile (specific TileCode)
  fixed: TileCodeSchema.optional(),

  // OR placeholder references for flexible patterns
  // Same letter = same suit (e.g., "A", "B" for two different suits)
  suitVar: z.string().max(2).optional(),

  // Number variable (e.g., "X", "Y" for number relationships)
  numberVar: z.string().max(2).optional(),

  // Offset from base number (for consecutive runs: X, X+1, X+2)
  numberOffset: z.number().int().optional(),

  // Number must match one of the numbers used in the specified super group
  numberMatchesSuperGroup: z.string().optional(),

  // Tile type constraint (when using variables)
  tileType: TileTypeSchema.optional(),

  // Number constraints
  constraints: NumberConstraintsSchema.optional(),

  // Special markers
  isAnyFlower: z.boolean().optional(),
  isAnyDragon: z.boolean().optional(),
  isAnyWind: z.boolean().optional(),
  isZero: z.boolean().optional(), // White dragon as "0" in year hands
});

export type TilePattern = z.infer<typeof TilePatternSchema>;

/**
 * A group within a pattern (e.g., a pung, kong, pair)
 */
export const PatternGroupSchema = z.object({
  type: GroupTypeSchema,
  tile: TilePatternSchema,
  // If this specific group must remain concealed (even in exposed hands)
  mustBeConcealed: z.boolean().optional(),
  // Super group ID - groups with the same superGroupId form an "exposure unit"
  // that must be exposed together (e.g., "2025" = four singles that form one callable unit)
  superGroupId: z.string().optional(),
});

export type PatternGroup = z.infer<typeof PatternGroupSchema>;

/**
 * Hand categories on the NMJL card
 */
export enum HandCategory {
  YEAR = 'YEAR',
  TWOS_FOURS_SIXES_EIGHTS = '2468',
  ONES_THREES_FIVES_SEVENS_NINES = '13579',
  THREE_SIX_NINE = '369',
  ANY_LIKE_NUMBERS = 'ANY_LIKE',
  CONSECUTIVE_RUN = 'CONSEC',
  QUINTS = 'QUINTS',
  WINDS_DRAGONS = 'WINDS_DRAGONS',
  SINGLES_PAIRS = 'SINGLES_PAIRS',
}

export const HandCategorySchema = z.nativeEnum(HandCategory);

/**
 * A segment of display text with optional color
 * Colors correspond to tile types or special markers
 */
export const DisplaySegmentSchema = z.object({
  text: z.string(),
  color: z.enum(['dot', 'bam', 'crak', 'wind', 'dragon', 'flower', 'joker', 'neutral']).optional(),
  // Number variable - groups with same numberVar must have same number
  numberVar: z.string().optional(),
  // Indicates this is a variable number (evenOnly, oddOnly, or has numberVar)
  isVariable: z.boolean().optional(),
});

export type DisplaySegment = z.infer<typeof DisplaySegmentSchema>;

/**
 * Full card hand schema (for database storage)
 */
export const CardHandSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  displayName: z.string(),
  displayPattern: z.union([
    z.string(), // Legacy: plain string
    z.array(DisplaySegmentSchema), // New: colored segments
  ]),
  patternGroups: z.array(PatternGroupSchema),
  isConcealed: z.boolean(),
  points: z.number(),
  notes: z.string().nullable(),
  displayOrder: z.number(),
  createdAt: z.date(),
});

export type CardHand = z.infer<typeof CardHandSchema>;

/**
 * Schema for creating a new card hand
 */
export const CreateCardHandSchema = z.object({
  categoryId: z.number(),
  displayName: z.string().min(1),
  displayPattern: z.union([
    z.string().min(1),
    z.array(DisplaySegmentSchema).min(1),
  ]),
  patternGroups: z.array(PatternGroupSchema).min(1),
  isConcealed: z.boolean(),
  points: z.number().int().min(0),
  notes: z.string().nullable().optional(),
  displayOrder: z.number().int(),
});

export type CreateCardHand = z.infer<typeof CreateCardHandSchema>;

/**
 * Schema for updating a card hand
 */
export const UpdateCardHandSchema = z.object({
  id: z.number(),
  categoryId: z.number().optional(),
  displayName: z.string().min(1).optional(),
  displayPattern: z.union([
    z.string().min(1),
    z.array(DisplaySegmentSchema).min(1),
  ]).optional(),
  patternGroups: z.array(PatternGroupSchema).min(1).optional(),
  isConcealed: z.boolean().optional(),
  points: z.number().int().min(0).optional(),
  notes: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
});

export type UpdateCardHand = z.infer<typeof UpdateCardHandSchema>;

/**
 * Hand category schema (for database)
 */
export const HandCategoryRecordSchema = z.object({
  id: z.number(),
  cardYearId: z.number(),
  name: z.string(),
  displayOrder: z.number(),
  createdAt: z.date(),
});

export type HandCategoryRecord = z.infer<typeof HandCategoryRecordSchema>;

/**
 * Create hand category schema
 */
export const CreateHandCategorySchema = z.object({
  cardYearId: z.number(),
  name: z.string().min(1),
  displayOrder: z.number().int(),
});

export type CreateHandCategory = z.infer<typeof CreateHandCategorySchema>;
