import {
  TileCode,
  TileType,
  PatternGroup,
  TilePattern,
  GroupType,
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
