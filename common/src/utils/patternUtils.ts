import {
  TileCode,
  TileType,
  PatternGroup,
  TilePattern,
  GroupType,
  DisplaySegment,
  encodeTile,
  getTileType,
  getTileValue,
  Wind,
  Dragon,
} from '../schemas/index.js';

/**
 * A concrete pattern is a fully expanded pattern with specific tiles
 * (no variables or placeholders)
 */
export interface ConcreteGroup {
  type: GroupType;
  tile: TileCode;
  count: number;
}

export interface ConcretePattern {
  groups: ConcreteGroup[];
  totalTiles: number;
}

/**
 * Expand a single tile pattern to all possible concrete tiles
 */
export function expandTilePattern(pattern: TilePattern): TileCode[] {
  // Fixed tile - return as-is
  if (pattern.fixed !== undefined) {
    return [pattern.fixed];
  }

  // Any flower
  if (pattern.isAnyFlower) {
    return [encodeTile(TileType.FLOWER, 1)];
  }

  // Any dragon
  if (pattern.isAnyDragon) {
    return [
      encodeTile(TileType.DRAGON, Dragon.RED),
      encodeTile(TileType.DRAGON, Dragon.GREEN),
      encodeTile(TileType.DRAGON, Dragon.WHITE),
    ];
  }

  // Any wind
  if (pattern.isAnyWind) {
    return [
      encodeTile(TileType.WIND, Wind.EAST),
      encodeTile(TileType.WIND, Wind.SOUTH),
      encodeTile(TileType.WIND, Wind.WEST),
      encodeTile(TileType.WIND, Wind.NORTH),
    ];
  }

  // Zero (white dragon in year hands)
  if (pattern.isZero) {
    return [encodeTile(TileType.DRAGON, Dragon.WHITE)];
  }

  // For patterns with constraints but no suit/number vars, we need the tile type
  const tileType = pattern.tileType;
  if (!tileType) {
    return [];
  }

  // Get valid numbers based on constraints
  let validNumbers: number[] = [];

  if (tileType === TileType.DOT || tileType === TileType.BAM || tileType === TileType.CRAK) {
    validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  } else if (tileType === TileType.WIND) {
    validNumbers = [Wind.EAST, Wind.SOUTH, Wind.WEST, Wind.NORTH];
  } else if (tileType === TileType.DRAGON) {
    validNumbers = [Dragon.RED, Dragon.GREEN, Dragon.WHITE];
  }

  // Apply constraints
  if (pattern.constraints) {
    const c = pattern.constraints;

    if (c.specificValues) {
      validNumbers = validNumbers.filter((n) => c.specificValues!.includes(n));
    }
    if (c.evenOnly) {
      validNumbers = validNumbers.filter((n) => n % 2 === 0);
    }
    if (c.oddOnly) {
      validNumbers = validNumbers.filter((n) => n % 2 === 1);
    }
    if (c.range) {
      validNumbers = validNumbers.filter((n) => n >= c.range![0] && n <= c.range![1]);
    }
    if (c.excludeNumbers) {
      validNumbers = validNumbers.filter((n) => !c.excludeNumbers!.includes(n));
    }
  }

  return validNumbers.map((n) => encodeTile(tileType, n));
}

/**
 * Get the count for a group type
 */
export function getGroupCount(type: GroupType): number {
  return type; // GroupType values match counts (PAIR=2, PUNG=3, etc.)
}

/**
 * Context for expanding patterns with variables
 */
interface ExpansionContext {
  suitBindings: Map<string, TileType>;
  numberBindings: Map<string, number>;
}

/**
 * Expand a pattern group given a context of variable bindings
 */
function expandGroupWithContext(
  group: PatternGroup,
  ctx: ExpansionContext
): TileCode | null {
  const pattern = group.tile;

  // Fixed tile
  if (pattern.fixed !== undefined) {
    return pattern.fixed;
  }

  // Special patterns
  if (pattern.isAnyFlower) return encodeTile(TileType.FLOWER, 1);
  if (pattern.isZero) return encodeTile(TileType.DRAGON, Dragon.WHITE);

  // Resolve suit
  let tileType = pattern.tileType;
  if (pattern.suitVar && ctx.suitBindings.has(pattern.suitVar)) {
    tileType = ctx.suitBindings.get(pattern.suitVar);
  }
  if (!tileType) return null;

  // Resolve number
  let value: number | undefined;

  if (pattern.numberVar && ctx.numberBindings.has(pattern.numberVar)) {
    value = ctx.numberBindings.get(pattern.numberVar)! + (pattern.numberOffset ?? 0);
  } else if (pattern.constraints?.specificValues?.length === 1) {
    value = pattern.constraints.specificValues[0];
  }

  // For winds/dragons with isAnyWind/isAnyDragon, we need specific bindings
  if (pattern.isAnyWind && ctx.numberBindings.has('wind')) {
    value = ctx.numberBindings.get('wind');
  }
  if (pattern.isAnyDragon && ctx.numberBindings.has('dragon')) {
    value = ctx.numberBindings.get('dragon');
  }

  if (value === undefined) return null;

  // Validate value is in range
  if (tileType <= TileType.CRAK && (value < 1 || value > 9)) return null;
  if (tileType === TileType.WIND && (value < 1 || value > 4)) return null;
  if (tileType === TileType.DRAGON && (value < 1 || value > 3)) return null;

  return encodeTile(tileType, value);
}

/**
 * Get all suit types for expansion
 */
const SUIT_TYPES = [TileType.DOT, TileType.BAM, TileType.CRAK];

/**
 * Collect all unique variables from pattern groups
 */
function collectVariables(groups: PatternGroup[]): {
  suitVars: Set<string>;
  numberVars: Set<string>;
  constraints: Map<string, TilePattern['constraints']>;
} {
  const suitVars = new Set<string>();
  const numberVars = new Set<string>();
  const constraints = new Map<string, TilePattern['constraints']>();

  for (const group of groups) {
    if (group.tile.suitVar) {
      suitVars.add(group.tile.suitVar);
    }
    if (group.tile.numberVar) {
      numberVars.add(group.tile.numberVar);
      if (group.tile.constraints) {
        // Merge constraints for the same variable
        const existing = constraints.get(group.tile.numberVar);
        if (!existing) {
          constraints.set(group.tile.numberVar, group.tile.constraints);
        }
      }
    }
  }

  return { suitVars, numberVars, constraints };
}

/**
 * Generate all valid number values for a variable given constraints
 */
function getValidNumbers(constraints?: TilePattern['constraints']): number[] {
  let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  if (!constraints) return numbers;

  if (constraints.specificValues) {
    numbers = numbers.filter((n) => constraints.specificValues!.includes(n));
  }
  if (constraints.evenOnly) {
    numbers = numbers.filter((n) => n % 2 === 0);
  }
  if (constraints.oddOnly) {
    numbers = numbers.filter((n) => n % 2 === 1);
  }
  if (constraints.range) {
    numbers = numbers.filter((n) => n >= constraints.range![0] && n <= constraints.range![1]);
  }
  if (constraints.excludeNumbers) {
    numbers = numbers.filter((n) => !constraints.excludeNumbers!.includes(n));
  }

  return numbers;
}

/**
 * Check if a number assignment is valid for consecutive patterns
 * (ensures X+1, X+2 etc. don't exceed 9)
 */
function isValidConsecutive(groups: PatternGroup[], numberBindings: Map<string, number>): boolean {
  for (const group of groups) {
    const pattern = group.tile;
    if (pattern.numberVar && pattern.numberOffset) {
      const baseValue = numberBindings.get(pattern.numberVar);
      if (baseValue !== undefined) {
        const actualValue = baseValue + pattern.numberOffset;
        if (actualValue < 1 || actualValue > 9) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Expand pattern groups to all concrete patterns
 */
export function expandPatternGroups(groups: PatternGroup[]): ConcretePattern[] {
  const { suitVars, numberVars, constraints } = collectVariables(groups);
  const results: ConcretePattern[] = [];

  // Generate all suit combinations
  const suitVarList = Array.from(suitVars);
  const suitCombinations: Map<string, TileType>[] = [];

  if (suitVarList.length === 0) {
    suitCombinations.push(new Map());
  } else {
    // Generate permutations (different suits for different variables)
    const generateSuitCombos = (
      index: number,
      current: Map<string, TileType>,
      usedSuits: Set<TileType>
    ) => {
      if (index === suitVarList.length) {
        suitCombinations.push(new Map(current));
        return;
      }

      for (const suit of SUIT_TYPES) {
        // Check if this variable requires a different suit than others
        // For now, allow same suit for different variables (some hands use same suit)
        current.set(suitVarList[index], suit);
        generateSuitCombos(index + 1, current, usedSuits);
      }
    };

    generateSuitCombos(0, new Map(), new Set());
  }

  // Generate all number combinations
  const numberVarList = Array.from(numberVars);
  const numberCombinations: Map<string, number>[] = [];

  if (numberVarList.length === 0) {
    numberCombinations.push(new Map());
  } else {
    const generateNumberCombos = (index: number, current: Map<string, number>) => {
      if (index === numberVarList.length) {
        // Validate consecutive patterns
        if (isValidConsecutive(groups, current)) {
          numberCombinations.push(new Map(current));
        }
        return;
      }

      const varName = numberVarList[index];
      const varConstraints = constraints.get(varName);
      const validNumbers = getValidNumbers(varConstraints);

      for (const num of validNumbers) {
        current.set(varName, num);
        generateNumberCombos(index + 1, current);
      }
    };

    generateNumberCombos(0, new Map());
  }

  // Combine suit and number combinations
  for (const suitBinding of suitCombinations) {
    for (const numberBinding of numberCombinations) {
      const ctx: ExpansionContext = {
        suitBindings: suitBinding,
        numberBindings: numberBinding,
      };

      const concreteGroups: ConcreteGroup[] = [];
      let valid = true;
      let totalTiles = 0;

      for (const group of groups) {
        const tile = expandGroupWithContext(group, ctx);
        if (tile === null) {
          valid = false;
          break;
        }

        const count = getGroupCount(group.type);
        concreteGroups.push({
          type: group.type,
          tile,
          count,
        });
        totalTiles += count;
      }

      if (valid) {
        results.push({
          groups: concreteGroups,
          totalTiles,
        });
      }
    }
  }

  return results;
}

/**
 * Check if a tile matches a pattern (for analysis)
 */
export function tileMatchesPattern(tile: TileCode, pattern: TilePattern): boolean {
  // Fixed tile must match exactly
  if (pattern.fixed !== undefined) {
    return tile === pattern.fixed;
  }

  const tileType = getTileType(tile);
  const tileValue = getTileValue(tile);

  // Special patterns
  if (pattern.isAnyFlower) {
    return tileType === TileType.FLOWER;
  }
  if (pattern.isAnyDragon) {
    return tileType === TileType.DRAGON;
  }
  if (pattern.isAnyWind) {
    return tileType === TileType.WIND;
  }
  if (pattern.isZero) {
    return tileType === TileType.DRAGON && tileValue === Dragon.WHITE;
  }

  // Check tile type constraint
  if (pattern.tileType && tileType !== pattern.tileType) {
    return false;
  }

  // Check number constraints
  if (pattern.constraints) {
    const c = pattern.constraints;

    if (c.specificValues && !c.specificValues.includes(tileValue)) {
      return false;
    }
    if (c.evenOnly && tileValue % 2 !== 0) {
      return false;
    }
    if (c.oddOnly && tileValue % 2 !== 1) {
      return false;
    }
    if (c.range && (tileValue < c.range[0] || tileValue > c.range[1])) {
      return false;
    }
    if (c.excludeNumbers && c.excludeNumbers.includes(tileValue)) {
      return false;
    }
  }

  return true;
}

/**
 * Get display string for a concrete pattern
 */
export function concretePatternToString(pattern: ConcretePattern): string {
  return pattern.groups
    .map((g) => {
      const tileType = getTileType(g.tile);
      const tileValue = getTileValue(g.tile);
      let char = '';

      switch (tileType) {
        case TileType.DOT:
          char = `${tileValue}`;
          break;
        case TileType.BAM:
          char = `${tileValue}`;
          break;
        case TileType.CRAK:
          char = `${tileValue}`;
          break;
        case TileType.WIND:
          char = ['E', 'S', 'W', 'N'][tileValue - 1];
          break;
        case TileType.DRAGON:
          char = ['R', 'G', '0'][tileValue - 1];
          break;
        case TileType.FLOWER:
          char = 'F';
          break;
        case TileType.JOKER:
          char = 'J';
          break;
      }

      return char.repeat(g.count);
    })
    .join(' ');
}

/**
 * Helper to get the number value from a tile pattern (for display purposes)
 * Returns a representative value when constraints are used (2 for even, 1 for odd, 3 for 369)
 * Accounts for numberOffset when using number variables
 */
function getPatternNumber(pattern: TilePattern): number {
  if (pattern.fixed !== undefined) {
    return pattern.fixed & 0x0f;
  }
  if (pattern.constraints?.specificValues?.length === 1) {
    return pattern.constraints.specificValues[0];
  }

  const offset = pattern.numberOffset ?? 0;

  // Return representative values for even/odd constraints
  // Base even is 2, base odd is 1, then add offset
  if (pattern.constraints?.evenOnly) {
    return 2 + offset; // Base even (2) plus offset
  }
  if (pattern.constraints?.oddOnly) {
    return 1 + offset; // Base odd (1) plus offset
  }

  // Check for 3,6,9 constraint
  if (pattern.constraints?.specificValues?.length === 3 &&
      pattern.constraints.specificValues.includes(3) &&
      pattern.constraints.specificValues.includes(6) &&
      pattern.constraints.specificValues.includes(9)) {
    return 3 + offset; // Base 369 (3) plus offset
  }

  // For numberVar with offset (no constraint), base is 1
  return 1 + offset;
}

/**
 * Helper to check if a pattern represents a specific number
 */
function patternHasNumber(pattern: TilePattern, num: number): boolean {
  const patternNum = getPatternNumber(pattern);
  return patternNum === num;
}

/**
 * Generate display pattern string from pattern groups
 *
 * Rules:
 * - Flowers: "F"
 * - Dragons: "D" (but white dragon shown as "0" when between 2's)
 * - Winds: first letter of direction ("N", "E", "S", "W")
 * - Suit tiles: their number (1-9)
 * - Groups separated by spaces
 * - Character repeated based on group count
 */
export function generateDisplayPattern(groups: PatternGroup[]): string {
  const parts: string[] = [];
  let currentSuperGroupId: string | undefined = undefined;
  let superGroupChars: string[] = [];

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const pattern = group.tile;
    const count = group.type; // GroupType value equals count
    let char = '?';

    // Check for special patterns first
    if (pattern.isAnyFlower) {
      char = 'F';
    } else if (pattern.isAnyWind) {
      // Generic wind - show as "N" for any wind (North is conventional)
      char = 'N';
    } else if (pattern.isAnyDragon) {
      char = 'D';
    } else if (pattern.tileType === TileType.DRAGON && pattern.suitVar) {
      // Dragon with suit variable - show as "D"
      char = 'D';
    } else if (pattern.isZero) {
      // White dragon as zero - check if between 2's
      const prevGroup = i > 0 ? groups[i - 1] : null;
      const nextGroup = i < groups.length - 1 ? groups[i + 1] : null;
      const prevIs2 = prevGroup && patternHasNumber(prevGroup.tile, 2);
      const nextIs2 = nextGroup && patternHasNumber(nextGroup.tile, 2);
      char = (prevIs2 || nextIs2) ? '0' : 'D';
    } else if (pattern.fixed !== undefined) {
      // Fixed tile - decode it
      const tileType = (pattern.fixed >> 4) as TileType;
      const tileValue = pattern.fixed & 0x0f;

      switch (tileType) {
        case TileType.DOT:
        case TileType.BAM:
        case TileType.CRAK:
          char = `${tileValue}`;
          break;
        case TileType.WIND:
          char = ['E', 'S', 'W', 'N'][tileValue - 1] || 'W';
          break;
        case TileType.DRAGON:
          // Check if white dragon between 2's
          if (tileValue === Dragon.WHITE) {
            const prevGroup = i > 0 ? groups[i - 1] : null;
            const nextGroup = i < groups.length - 1 ? groups[i + 1] : null;
            const prevIs2 = prevGroup && patternHasNumber(prevGroup.tile, 2);
            const nextIs2 = nextGroup && patternHasNumber(nextGroup.tile, 2);
            char = (prevIs2 || nextIs2) ? '0' : 'D';
          } else {
            char = 'D';
          }
          break;
        case TileType.FLOWER:
          char = 'F';
          break;
        case TileType.JOKER:
          char = 'J';
          break;
      }
    } else if (pattern.suitVar || pattern.constraints || pattern.numberVar) {
      // Suit variable or has constraints - show the number
      char = `${getPatternNumber(pattern)}`;
    }

    const text = char.repeat(count);

    // Handle super groups - concatenate without spaces, no brackets
    if (group.superGroupId) {
      if (group.superGroupId !== currentSuperGroupId) {
        // Starting new super group - flush any previous one first
        if (currentSuperGroupId && superGroupChars.length > 0) {
          parts.push(superGroupChars.join(''));
          superGroupChars = [];
        }
        currentSuperGroupId = group.superGroupId;
      }
      superGroupChars.push(text);

      // Check if this is the last item in the super group
      const nextGroup = i < groups.length - 1 ? groups[i + 1] : null;
      if (!nextGroup || nextGroup.superGroupId !== currentSuperGroupId) {
        // End of super group - join without spaces, no brackets
        parts.push(superGroupChars.join(''));
        superGroupChars = [];
        currentSuperGroupId = undefined;
      }
    } else {
      // Not in a super group - flush any pending super group
      if (currentSuperGroupId && superGroupChars.length > 0) {
        parts.push(superGroupChars.join(''));
        superGroupChars = [];
        currentSuperGroupId = undefined;
      }
      parts.push(text);
    }
  }

  // Flush any remaining super group
  if (superGroupChars.length > 0) {
    parts.push(superGroupChars.join(''));
  }

  return parts.join(' ');
}

/**
 * Get color for a suit variable
 * Suit A = blue (dot), Suit B = green (bam), Suit C = red (crak)
 */
function getSuitVarColor(suitVar: string): DisplaySegment['color'] {
  switch (suitVar.toUpperCase()) {
    case 'A': return 'dot';    // Blue
    case 'B': return 'bam';    // Green
    case 'C': return 'crak';   // Red
    default: return 'neutral';
  }
}

/**
 * Generate display pattern as colored segments from pattern groups
 *
 * Color rules:
 * - Suit Variable A: Blue
 * - Suit Variable B: Green
 * - Suit Variable C: Red
 * - Flowers: Blue (same as Suit A)
 * - Winds: Blue (same as Suit A)
 * - Dragons: Orange
 */
export function generateDisplaySegments(groups: PatternGroup[]): DisplaySegment[] {
  const segments: DisplaySegment[] = [];
  let currentSuperGroupId: string | undefined = undefined;

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const pattern = group.tile;
    const count = group.type;
    let char = '?';
    let color: DisplaySegment['color'] = 'neutral';

    // Track super group membership (no brackets, just controls spacing)
    if (group.superGroupId && group.superGroupId !== currentSuperGroupId) {
      // Entering a new super group
      currentSuperGroupId = group.superGroupId;
    } else if (!group.superGroupId && currentSuperGroupId) {
      // Exiting super group
      currentSuperGroupId = undefined;
    }

    // Check for special patterns first
    if (pattern.isAnyFlower) {
      char = 'F';
      color = 'dot'; // Flowers are blue (Suit A)
    } else if (pattern.isAnyWind) {
      char = 'N';
      color = 'dot'; // Winds are blue (Suit A)
    } else if (pattern.isAnyDragon) {
      char = 'D';
      color = 'dragon';
    } else if (pattern.tileType === TileType.DRAGON && pattern.suitVar) {
      // Dragon with suit variable - color based on suit var
      char = 'D';
      color = getSuitVarColor(pattern.suitVar);
    } else if (pattern.isZero) {
      // White dragon as zero
      const prevGroup = i > 0 ? groups[i - 1] : null;
      const nextGroup = i < groups.length - 1 ? groups[i + 1] : null;
      const prevIs2 = prevGroup && patternHasNumber(prevGroup.tile, 2);
      const nextIs2 = nextGroup && patternHasNumber(nextGroup.tile, 2);
      char = (prevIs2 || nextIs2) ? '0' : 'D';
      color = 'dragon';
    } else if (pattern.fixed !== undefined) {
      const tileType = (pattern.fixed >> 4) as TileType;
      const tileValue = pattern.fixed & 0x0f;

      switch (tileType) {
        case TileType.DOT:
          char = `${tileValue}`;
          color = 'dot';
          break;
        case TileType.BAM:
          char = `${tileValue}`;
          color = 'bam';
          break;
        case TileType.CRAK:
          char = `${tileValue}`;
          color = 'crak';
          break;
        case TileType.WIND:
          char = ['E', 'S', 'W', 'N'][tileValue - 1] || 'W';
          color = 'dot'; // Winds are blue (Suit A)
          break;
        case TileType.DRAGON:
          if (tileValue === Dragon.WHITE) {
            const prevGroup = i > 0 ? groups[i - 1] : null;
            const nextGroup = i < groups.length - 1 ? groups[i + 1] : null;
            const prevIs2 = prevGroup && patternHasNumber(prevGroup.tile, 2);
            const nextIs2 = nextGroup && patternHasNumber(nextGroup.tile, 2);
            char = (prevIs2 || nextIs2) ? '0' : 'D';
          } else {
            char = 'D';
          }
          color = 'dragon';
          break;
        case TileType.FLOWER:
          char = 'F';
          color = 'dot'; // Flowers are blue (Suit A)
          break;
        case TileType.JOKER:
          char = 'J';
          color = 'joker';
          break;
      }
    } else if (pattern.suitVar || pattern.constraints || pattern.numberVar) {
      // Suit variable or has constraints - color based on variable letter (A=blue, B=green, C=red)
      char = `${getPatternNumber(pattern)}`;
      color = pattern.suitVar ? getSuitVarColor(pattern.suitVar) : 'neutral';
    }

    const text = char.repeat(count);

    // Check for 3,6,9 constraint
    const is369 = pattern.constraints?.specificValues?.length === 3 &&
      pattern.constraints.specificValues.includes(3) &&
      pattern.constraints.specificValues.includes(6) &&
      pattern.constraints.specificValues.includes(9);

    // Check if this is a variable number (has numberVar, evenOnly/oddOnly, or 369 constraint)
    const isVariable = !!(
      pattern.numberVar ||
      pattern.constraints?.evenOnly ||
      pattern.constraints?.oddOnly ||
      is369
    );

    const segment: DisplaySegment = { text, color };
    if (isVariable) {
      segment.isVariable = true;
    }
    if (pattern.numberVar) {
      segment.numberVar = pattern.numberVar;
    }
    segments.push(segment);

    // Check if this is the last item in a super group
    const nextGroup = i < groups.length - 1 ? groups[i + 1] : null;
    const isEndOfSuperGroup = currentSuperGroupId && (!nextGroup || nextGroup.superGroupId !== currentSuperGroupId);

    if (isEndOfSuperGroup) {
      // End of super group - just clear tracking (no brackets)
      currentSuperGroupId = undefined;
    }

    // Add space between groups (except after last)
    if (i < groups.length - 1) {
      // Don't add space within super groups (no space between tiles in super group)
      const isInSameSuperGroup = group.superGroupId && nextGroup?.superGroupId === group.superGroupId;
      if (!isInSameSuperGroup) {
        segments.push({ text: ' ' });
      }
    }
  }

  return segments;
}

/**
 * Generate a valid example hand from pattern groups.
 * This creates one concrete example by assigning specific suits and numbers to variables.
 */
export function generateValidExample(groups: PatternGroup[]): TileCode[] {
  const tiles: TileCode[] = [];

  // Assign suits to suit variables (A=DOT, B=BAM, C=CRAK)
  const suitMap: Record<string, TileType> = {
    'A': TileType.DOT,
    'B': TileType.BAM,
    'C': TileType.CRAK,
  };

  // Assign numbers to number variables (start from 1, respecting constraints)
  const numberMap: Record<string, number> = {};

  // First pass: determine number variable values
  for (const group of groups) {
    const pattern = group.tile;
    if (pattern.numberVar && !numberMap[pattern.numberVar]) {
      // Find a valid starting number for this variable
      let baseNumber = 1;

      if (pattern.constraints?.evenOnly) {
        baseNumber = 2;
      } else if (pattern.constraints?.oddOnly) {
        baseNumber = 1;
      } else if (pattern.constraints?.specificValues?.length) {
        baseNumber = pattern.constraints.specificValues[0];
      }

      // Check if we need to adjust for offsets (to avoid going > 9)
      const maxOffset = groups
        .filter(g => g.tile.numberVar === pattern.numberVar && g.tile.numberOffset)
        .reduce((max, g) => Math.max(max, g.tile.numberOffset ?? 0), 0);

      if (baseNumber + maxOffset > 9) {
        baseNumber = 9 - maxOffset;
        // Adjust for even/odd if needed
        if (pattern.constraints?.evenOnly && baseNumber % 2 !== 0) {
          baseNumber -= 1;
        } else if (pattern.constraints?.oddOnly && baseNumber % 2 === 0) {
          baseNumber -= 1;
        }
      }

      numberMap[pattern.numberVar] = baseNumber;
    }
  }

  // Second pass: generate tiles
  for (const group of groups) {
    const pattern = group.tile;
    const count = group.type; // GroupType value equals count
    let tile: TileCode;

    if (pattern.fixed !== undefined) {
      tile = pattern.fixed;
    } else if (pattern.isAnyFlower) {
      tile = encodeTile(TileType.FLOWER, 1);
    } else if (pattern.isAnyDragon) {
      tile = encodeTile(TileType.DRAGON, Dragon.RED);
    } else if (pattern.isAnyWind) {
      tile = encodeTile(TileType.WIND, Wind.NORTH);
    } else if (pattern.isZero) {
      tile = encodeTile(TileType.DRAGON, Dragon.WHITE);
    } else if (pattern.tileType === TileType.DRAGON && pattern.suitVar) {
      // Dragon with suit variable - map suit var to dragon color
      const dragonMap: Record<string, number> = {
        'A': Dragon.RED,
        'B': Dragon.GREEN,
        'C': Dragon.WHITE,
      };
      tile = encodeTile(TileType.DRAGON, dragonMap[pattern.suitVar] ?? Dragon.RED);
    } else if (pattern.suitVar) {
      // Suit variable tile
      const suit = suitMap[pattern.suitVar] ?? TileType.DOT;
      let number = 1;

      if (pattern.numberVar) {
        number = (numberMap[pattern.numberVar] ?? 1) + (pattern.numberOffset ?? 0);
      } else if (pattern.constraints?.specificValues?.length) {
        number = pattern.constraints.specificValues[0];
      } else if (pattern.constraints?.evenOnly) {
        number = 2;
      } else if (pattern.constraints?.oddOnly) {
        number = 1;
      }

      tile = encodeTile(suit, number);
    } else {
      // Fallback
      tile = encodeTile(TileType.DOT, 1);
    }

    // Add the tile 'count' times
    for (let i = 0; i < count; i++) {
      tiles.push(tile);
    }
  }

  return tiles;
}
