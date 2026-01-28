import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { TileType, GroupType } from 'common';
import type { PatternGroup, TilePattern } from 'common';
import type { Theme } from '../theme';

// Colors for super groups
const SUPER_GROUP_COLORS = [
  { bg: 'rgba(33, 150, 243, 0.15)', border: '#2196F3' },  // Blue
  { bg: 'rgba(76, 175, 80, 0.15)', border: '#4CAF50' },   // Green
  { bg: 'rgba(255, 152, 0, 0.15)', border: '#FF9800' },   // Orange
  { bg: 'rgba(156, 39, 176, 0.15)', border: '#9C27B0' },  // Purple
  { bg: 'rgba(0, 188, 212, 0.15)', border: '#00BCD4' },   // Cyan
];

const useStyles = createUseStyles((theme: Theme) => ({
  editor: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  groupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  groupCard: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: theme.borderRadius.sm,
    border: `1px solid rgba(139, 125, 107, 0.3)`,
  },
  groupIndex: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#6B5F52',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  groupFields: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    flex: 1,
    alignItems: 'center',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  fieldLabel: {
    fontSize: '10px',
    color: '#5C564E',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  select: {
    padding: '4px 8px',
    border: `1px solid rgba(139, 125, 107, 0.4)`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#2D2A26',
    fontSize: theme.fontSizes.sm,
    minWidth: '80px',
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
    },
  },
  input: {
    padding: '4px 8px',
    border: `1px solid rgba(139, 125, 107, 0.4)`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#2D2A26',
    fontSize: theme.fontSizes.sm,
    width: '50px',
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
    },
  },
  removeButton: {
    padding: '4px 8px',
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
    color: '#6B5F52',
    cursor: 'pointer',
    fontSize: '16px',
    '&:hover': {
      color: '#B84A4A',
      backgroundColor: 'rgba(184, 74, 74, 0.1)',
    },
  },
  addButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    border: `1px dashed rgba(139, 125, 107, 0.5)`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    color: '#5C564E',
    cursor: 'pointer',
    fontSize: theme.fontSizes.sm,
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: theme.colors.primary,
      color: theme.colors.primary,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: theme.fontSizes.sm,
    color: '#4A4540',
  },
  // Super group styles
  superGroupWrapper: {
    position: 'relative' as const,
    marginBottom: theme.spacing.sm,
  },
  superGroupContainer: {
    borderRadius: theme.borderRadius.sm,
    padding: '2px',
    marginLeft: '12px',
    position: 'relative' as const,
  },
  superGroupBracket: {
    position: 'absolute' as const,
    left: '-12px',
    top: '0',
    bottom: '0',
    width: '8px',
    borderLeft: '3px solid',
    borderTop: '3px solid',
    borderBottom: '3px solid',
    borderRadius: '4px 0 0 4px',
  },
  superGroupLabel: {
    position: 'absolute' as const,
    left: '-10px',
    top: '50%',
    transform: 'translateY(-50%) rotate(-90deg)',
    fontSize: '9px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
    letterSpacing: '0.5px',
  },
  groupCardSelected: {
    outline: '2px solid',
    outlineColor: theme.colors.primary,
    backgroundColor: 'rgba(184, 74, 74, 0.1)',
  },
  selectionCheckbox: {
    marginRight: theme.spacing.xs,
  },
  toolbar: {
    display: 'flex',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: theme.borderRadius.sm,
    border: `1px solid rgba(139, 125, 107, 0.3)`,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  toolbarButton: {
    padding: '4px 12px',
    border: `1px solid rgba(139, 125, 107, 0.4)`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: '#2D2A26',
    cursor: 'pointer',
    fontSize: theme.fontSizes.sm,
    '&:hover': {
      borderColor: theme.colors.primary,
      color: theme.colors.primary,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  toolbarDivider: {
    width: '1px',
    height: '20px',
    backgroundColor: 'rgba(139, 125, 107, 0.3)',
  },
  selectionCount: {
    fontSize: theme.fontSizes.sm,
    color: '#4A4540',
    fontWeight: 'bold',
  },
  ungroupButton: {
    padding: '2px 6px',
    border: 'none',
    borderRadius: '3px',
    backgroundColor: 'rgba(184, 74, 74, 0.15)',
    color: '#8B3A3A',
    cursor: 'pointer',
    fontSize: '10px',
    marginLeft: 'auto',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'rgba(184, 74, 74, 0.25)',
    },
  },
}));

// Group type options
const GROUP_TYPES = [
  { value: GroupType.SINGLE, label: 'Single (1)', count: 1 },
  { value: GroupType.PAIR, label: 'Pair (2)', count: 2 },
  { value: GroupType.PUNG, label: 'Pung (3)', count: 3 },
  { value: GroupType.KONG, label: 'Kong (4)', count: 4 },
  { value: GroupType.QUINT, label: 'Quint (5)', count: 5 },
  { value: GroupType.SEXTET, label: 'Sextet (6)', count: 6 },
];

// Tile type options for the tile pattern
const TILE_TYPES = [
  { value: 'suit_var', label: 'Suit Variable' },
  { value: 'fixed_suit', label: 'Fixed Suit Tile' },
  { value: 'flower', label: 'Any Flower' },
  { value: 'dragon', label: 'Any Dragon' },
  { value: 'wind', label: 'Any Wind' },
  { value: 'zero', label: 'Zero (White Dragon)' },
  { value: 'fixed_wind', label: 'Specific Wind' },
  { value: 'fixed_dragon', label: 'Specific Dragon' },
];

const SUITS = [
  { value: TileType.DOT, label: 'Dot' },
  { value: TileType.BAM, label: 'Bam' },
  { value: TileType.CRAK, label: 'Crak' },
];

const WINDS = [
  { value: 1, label: 'East' },
  { value: 2, label: 'South' },
  { value: 3, label: 'West' },
  { value: 4, label: 'North' },
];

const DRAGONS = [
  { value: 1, label: 'Red' },
  { value: 2, label: 'Green' },
  { value: 3, label: 'White' },
];

const SUIT_VARS = ['A', 'B', 'C'];
const NUMBER_VARS = ['X', 'Y', 'Z'];

// Number constraint options
const NUMBER_CONSTRAINTS = [
  { value: 'specific', label: 'Specific Number' },
  { value: 'even', label: 'Any Even (2,4,6,8)' },
  { value: 'odd', label: 'Any Odd (1,3,5,7,9)' },
  { value: '369', label: '3, 6, or 9' },
  { value: 'any', label: 'Any (1-9)' },
];

interface PatternGroupEditorProps {
  groups: PatternGroup[];
  onChange: (groups: PatternGroup[]) => void;
}

// Helper to determine tile type category from TilePattern
function getTileTypeCategory(tile: TilePattern): string {
  if (tile.isAnyFlower) return 'flower';
  if (tile.isAnyDragon) return 'dragon';
  if (tile.isAnyWind) return 'wind';
  if (tile.isZero) return 'zero';
  if (tile.fixed !== undefined) {
    const tileType = (tile.fixed >> 4) as TileType;
    if (tileType === TileType.WIND) return 'fixed_wind';
    if (tileType === TileType.DRAGON) return 'fixed_dragon';
    return 'fixed_suit';
  }
  // Dragon with suit variable - still show as "fixed_dragon" category, mode dropdown handles the difference
  if (tile.tileType === TileType.DRAGON && tile.suitVar) return 'fixed_dragon';
  if (tile.suitVar) return 'suit_var';
  return 'suit_var'; // default
}

// Helper to check if dragon is in variable mode (uses suitVar instead of fixed)
function isDragonVariableMode(tile: TilePattern): boolean {
  return tile.tileType === TileType.DRAGON && !!tile.suitVar;
}

// Helper to get dragon suit var
function getDragonSuitVar(tile: TilePattern): string {
  if (tile.tileType === TileType.DRAGON && tile.suitVar) {
    return tile.suitVar;
  }
  return 'A';
}

// Helper to get number from tile pattern
function getTileNumber(tile: TilePattern): number {
  if (tile.fixed !== undefined) {
    return tile.fixed & 0x0f;
  }
  if (tile.constraints?.specificValues?.[0]) {
    return tile.constraints.specificValues[0];
  }
  return 1;
}

// Helper to get the number constraint type
function getNumberConstraintType(tile: TilePattern): string {
  if (tile.constraints?.evenOnly) return 'even';
  if (tile.constraints?.oddOnly) return 'odd';
  // Check for 3,6,9 constraint (specificValues with exactly [3,6,9])
  if (tile.constraints?.specificValues?.length === 3 &&
      tile.constraints.specificValues.includes(3) &&
      tile.constraints.specificValues.includes(6) &&
      tile.constraints.specificValues.includes(9)) {
    return '369';
  }
  if (tile.constraints?.specificValues?.length) return 'specific';
  return 'any';
}

// Helper to get number variable from tile pattern
function getNumberVar(tile: TilePattern): string {
  return tile.numberVar || '';
}

// Helper to get number offset from tile pattern
function getNumberOffset(tile: TilePattern): number {
  return tile.numberOffset ?? 0;
}

// Helper to get numberMatchesSuperGroup from tile pattern
function getNumberMatchesSuperGroup(tile: TilePattern): string {
  return tile.numberMatchesSuperGroup || '';
}

// Helper to get suit from fixed tile
function getTileSuit(tile: TilePattern): TileType {
  if (tile.fixed !== undefined) {
    return (tile.fixed >> 4) as TileType;
  }
  return TileType.DOT;
}

// Helper to create tile pattern from UI selections
function createTilePattern(
  category: string,
  suitVar: string,
  number: number,
  suit: TileType,
  windValue: number,
  dragonValue: number,
  numberVar: string = '',
  numberConstraint: string = 'specific',
  numberOffset: number = 0,
  numberMatchesSuperGroup: string = ''
): TilePattern {
  switch (category) {
    case 'flower':
      return { isAnyFlower: true };
    case 'dragon':
      return { isAnyDragon: true };
    case 'wind':
      return { isAnyWind: true };
    case 'zero':
      return { isZero: true };
    case 'fixed_wind':
      return { fixed: (TileType.WIND << 4) | windValue };
    case 'dragon_var':
      return { tileType: TileType.DRAGON, suitVar };
    case 'fixed_dragon':
      return { fixed: (TileType.DRAGON << 4) | dragonValue };
    case 'fixed_suit':
      return { fixed: (suit << 4) | number };
    case 'suit_var':
    default: {
      const pattern: TilePattern = { suitVar };

      // Add number variable if set
      if (numberVar) {
        pattern.numberVar = numberVar;
        // Add offset if non-zero
        if (numberOffset !== 0) {
          pattern.numberOffset = numberOffset;
        }
      }

      // Add numberMatchesSuperGroup if set
      if (numberMatchesSuperGroup) {
        pattern.numberMatchesSuperGroup = numberMatchesSuperGroup;
      }

      // Add constraints based on type
      // Constraints can combine with numberVar (e.g., "any even number" + "all must match")
      switch (numberConstraint) {
        case 'even':
          pattern.constraints = { evenOnly: true };
          break;
        case 'odd':
          pattern.constraints = { oddOnly: true };
          break;
        case '369':
          pattern.constraints = { specificValues: [3, 6, 9] };
          break;
        case 'specific':
          // Only add specific value constraint if no numberVar
          // (numberVar controls the value, specific is redundant)
          if (!numberVar) {
            pattern.constraints = { specificValues: [number] };
          }
          break;
        case 'any':
          // No constraints needed for any
          break;
      }

      return pattern;
    }
  }
}

export function PatternGroupEditor({ groups, onChange }: PatternGroupEditorProps) {
  const classes = useStyles();
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Get unique super group IDs and assign colors
  const superGroupIds = [...new Set(groups.map(g => g.superGroupId).filter(Boolean))] as string[];
  const superGroupColorMap = new Map<string, typeof SUPER_GROUP_COLORS[0]>();
  superGroupIds.forEach((id, i) => {
    superGroupColorMap.set(id, SUPER_GROUP_COLORS[i % SUPER_GROUP_COLORS.length]);
  });

  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedIndices(newSelection);
  };

  const handleCreateSuperGroup = () => {
    if (selectedIndices.size < 2) return;
    const newSuperGroupId = `sg_${Date.now()}`;
    const newGroups = groups.map((g, i) =>
      selectedIndices.has(i) ? { ...g, superGroupId: newSuperGroupId } : g
    );
    onChange(newGroups);
    setSelectedIndices(new Set());
  };

  const handleUngroupSuperGroup = (superGroupId: string) => {
    const newGroups = groups.map(g =>
      g.superGroupId === superGroupId ? { ...g, superGroupId: undefined } : g
    );
    onChange(newGroups);
  };

  const handleGroupTypeChange = (index: number, newType: GroupType) => {
    const newGroups = [...groups];
    newGroups[index] = { ...newGroups[index], type: newType };
    onChange(newGroups);
  };

  const handleTileCategoryChange = (index: number, category: string) => {
    const newGroups = [...groups];
    const currentTile = newGroups[index].tile;
    const number = getTileNumber(currentTile);
    const suitVar = currentTile.suitVar || 'A';

    newGroups[index] = {
      ...newGroups[index],
      tile: createTilePattern(category, suitVar, number, TileType.DOT, 1, 1),
    };
    onChange(newGroups);
  };

  const handleSuitVarChange = (index: number, suitVar: string) => {
    const newGroups = [...groups];
    const currentTile = newGroups[index].tile;
    const number = getTileNumber(currentTile);
    const numberVar = getNumberVar(currentTile);
    const numberConstraint = getNumberConstraintType(currentTile);
    const numberOffset = getNumberOffset(currentTile);
    const matchSuperGroup = getNumberMatchesSuperGroup(currentTile);

    newGroups[index] = {
      ...newGroups[index],
      tile: createTilePattern('suit_var', suitVar, number, TileType.DOT, 1, 1, numberVar, numberConstraint, numberOffset, matchSuperGroup),
    };
    onChange(newGroups);
  };

  const handleNumberVarChange = (index: number, numberVar: string) => {
    const newGroups = [...groups];
    const currentTile = newGroups[index].tile;
    const suitVar = currentTile.suitVar || 'A';
    const number = getTileNumber(currentTile);
    const numberConstraint = getNumberConstraintType(currentTile);
    // Reset offset when changing numberVar
    const numberOffset = numberVar ? getNumberOffset(currentTile) : 0;
    const matchSuperGroup = getNumberMatchesSuperGroup(currentTile);

    newGroups[index] = {
      ...newGroups[index],
      tile: createTilePattern('suit_var', suitVar, number, TileType.DOT, 1, 1, numberVar, numberConstraint, numberOffset, matchSuperGroup),
    };
    onChange(newGroups);
  };

  const handleNumberOffsetChange = (index: number, offset: number) => {
    const newGroups = [...groups];
    const currentTile = newGroups[index].tile;
    const suitVar = currentTile.suitVar || 'A';
    const number = getTileNumber(currentTile);
    const numberVar = getNumberVar(currentTile);
    const numberConstraint = getNumberConstraintType(currentTile);
    const matchSuperGroup = getNumberMatchesSuperGroup(currentTile);

    newGroups[index] = {
      ...newGroups[index],
      tile: createTilePattern('suit_var', suitVar, number, TileType.DOT, 1, 1, numberVar, numberConstraint, offset, matchSuperGroup),
    };
    onChange(newGroups);
  };

  const handleNumberMatchesSuperGroupChange = (index: number, superGroupId: string) => {
    const newGroups = [...groups];
    const currentTile = newGroups[index].tile;
    const suitVar = currentTile.suitVar || 'A';
    const number = getTileNumber(currentTile);
    const numberVar = getNumberVar(currentTile);
    const numberConstraint = getNumberConstraintType(currentTile);
    const numberOffset = getNumberOffset(currentTile);

    newGroups[index] = {
      ...newGroups[index],
      tile: createTilePattern('suit_var', suitVar, number, TileType.DOT, 1, 1, numberVar, numberConstraint, numberOffset, superGroupId),
    };
    onChange(newGroups);
  };

  const handleNumberConstraintChange = (index: number, numberConstraint: string) => {
    const newGroups = [...groups];
    const currentTile = newGroups[index].tile;
    const suitVar = currentTile.suitVar || 'A';
    const number = getTileNumber(currentTile);
    const numberVar = getNumberVar(currentTile);
    const numberOffset = getNumberOffset(currentTile);
    const matchSuperGroup = getNumberMatchesSuperGroup(currentTile);

    newGroups[index] = {
      ...newGroups[index],
      tile: createTilePattern('suit_var', suitVar, number, TileType.DOT, 1, 1, numberVar, numberConstraint, numberOffset, matchSuperGroup),
    };
    onChange(newGroups);
  };

  const handleNumberChange = (index: number, number: number) => {
    const newGroups = [...groups];
    const currentTile = newGroups[index].tile;
    const category = getTileTypeCategory(currentTile);

    if (category === 'fixed_suit') {
      const suit = getTileSuit(currentTile);
      newGroups[index] = {
        ...newGroups[index],
        tile: { fixed: (suit << 4) | number },
      };
    } else if (category === 'suit_var') {
      const suitVar = currentTile.suitVar || 'A';
      const numberVar = getNumberVar(currentTile);
      const numberOffset = getNumberOffset(currentTile);
      const matchSuperGroup = getNumberMatchesSuperGroup(currentTile);
      // When changing specific number, set constraint to 'specific'
      newGroups[index] = {
        ...newGroups[index],
        tile: createTilePattern('suit_var', suitVar, number, TileType.DOT, 1, 1, numberVar, 'specific', numberOffset, matchSuperGroup),
      };
    }
    onChange(newGroups);
  };

  const handleSuitChange = (index: number, suit: TileType) => {
    const newGroups = [...groups];
    const currentTile = newGroups[index].tile;
    const number = getTileNumber(currentTile);

    newGroups[index] = {
      ...newGroups[index],
      tile: { fixed: (suit << 4) | number },
    };
    onChange(newGroups);
  };

  const handleWindChange = (index: number, windValue: number) => {
    const newGroups = [...groups];
    newGroups[index] = {
      ...newGroups[index],
      tile: { fixed: (TileType.WIND << 4) | windValue },
    };
    onChange(newGroups);
  };

  const handleDragonChange = (index: number, dragonValue: number) => {
    const newGroups = [...groups];
    newGroups[index] = {
      ...newGroups[index],
      tile: { fixed: (TileType.DRAGON << 4) | dragonValue },
    };
    onChange(newGroups);
  };

  const handleDragonModeChange = (index: number, mode: 'specific' | 'variable') => {
    const newGroups = [...groups];
    if (mode === 'specific') {
      // Switch to specific dragon (default to Red)
      newGroups[index] = {
        ...newGroups[index],
        tile: { fixed: (TileType.DRAGON << 4) | 1 },
      };
    } else {
      // Switch to variable dragon with suit var
      newGroups[index] = {
        ...newGroups[index],
        tile: { tileType: TileType.DRAGON, suitVar: 'A' },
      };
    }
    onChange(newGroups);
  };

  const handleDragonSuitVarChange = (index: number, suitVar: string) => {
    const newGroups = [...groups];
    newGroups[index] = {
      ...newGroups[index],
      tile: { tileType: TileType.DRAGON, suitVar },
    };
    onChange(newGroups);
  };

  const handleAddGroup = () => {
    const newGroup: PatternGroup = {
      type: GroupType.PUNG,
      tile: { suitVar: 'A', constraints: { specificValues: [1] } },
    };
    onChange([...groups, newGroup]);
  };

  const handleRemoveGroup = (index: number) => {
    const newGroups = groups.filter((_, i) => i !== index);
    onChange(newGroups);
  };

  // Group consecutive items by superGroupId for rendering
  const renderGroups = () => {
    const result: JSX.Element[] = [];
    let i = 0;

    while (i < groups.length) {
      const group = groups[i];
      const superGroupId = group.superGroupId;

      if (superGroupId) {
        // Collect all consecutive groups with the same superGroupId
        const superGroupStartIndex = i;
        const superGroupItems: { group: PatternGroup; index: number }[] = [];
        while (i < groups.length && groups[i].superGroupId === superGroupId) {
          superGroupItems.push({ group: groups[i], index: i });
          i++;
        }

        const color = superGroupColorMap.get(superGroupId) || SUPER_GROUP_COLORS[0];
        result.push(
          <div key={`super-${superGroupId}-${superGroupStartIndex}`} className={classes.superGroupWrapper}>
            <div
              className={classes.superGroupContainer}
              style={{ backgroundColor: color.bg }}
            >
              <div
                className={classes.superGroupBracket}
                style={{ borderColor: color.border }}
              />
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: color.border, fontWeight: 'bold' }}>
                  SUPER GROUP ({superGroupItems.length} tiles as 1 unit)
                </span>
                <button
                  className={classes.ungroupButton}
                  onClick={() => handleUngroupSuperGroup(superGroupId)}
                  title="Ungroup"
                >
                  Ungroup
                </button>
              </div>
              {superGroupItems.map(({ group: g, index: idx }) => renderGroupCard(g, idx, color.border))}
            </div>
          </div>
        );
      } else {
        result.push(renderGroupCard(group, i));
        i++;
      }
    }

    return result;
  };

  const renderGroupCard = (group: PatternGroup, index: number, superGroupColor?: string) => {
    const tileCategory = getTileTypeCategory(group.tile);
    const tileNumber = getTileNumber(group.tile);
    const suitVar = group.tile.suitVar || 'A';
    const suit = getTileSuit(group.tile);
    const windValue = tileCategory === 'fixed_wind' ? (group.tile.fixed! & 0x0f) : 1;
    const dragonValue = tileCategory === 'fixed_dragon' ? (group.tile.fixed! & 0x0f) : 1;
    const isSelected = selectedIndices.has(index);

    return (
      <div
        key={index}
        className={`${classes.groupCard} ${isSelected ? classes.groupCardSelected : ''}`}
        style={superGroupColor ? { borderColor: superGroupColor } : undefined}
      >
        <input
          type="checkbox"
          className={classes.selectionCheckbox}
          checked={isSelected}
          onChange={() => toggleSelection(index)}
          title="Select for grouping"
        />
        <span className={classes.groupIndex}>{index + 1}</span>

        <div className={classes.groupFields}>
                {/* Group Type */}
                <div className={classes.fieldGroup}>
                  <span className={classes.fieldLabel}>Count</span>
                  <select
                    className={classes.select}
                    value={group.type}
                    onChange={(e) => handleGroupTypeChange(index, parseInt(e.target.value) as GroupType)}
                  >
                    {GROUP_TYPES.map((gt) => (
                      <option key={gt.value} value={gt.value}>{gt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Tile Type */}
                <div className={classes.fieldGroup}>
                  <span className={classes.fieldLabel}>Tile Type</span>
                  <select
                    className={classes.select}
                    value={tileCategory}
                    onChange={(e) => handleTileCategoryChange(index, e.target.value)}
                  >
                    {TILE_TYPES.map((tt) => (
                      <option key={tt.value} value={tt.value}>{tt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Suit Variable selector */}
                {tileCategory === 'suit_var' && (
                  <>
                    <div className={classes.fieldGroup}>
                      <span className={classes.fieldLabel}>Suit Var</span>
                      <select
                        className={classes.select}
                        value={suitVar}
                        onChange={(e) => handleSuitVarChange(index, e.target.value)}
                      >
                        {SUIT_VARS.map((sv) => (
                          <option key={sv} value={sv}>Suit {sv}</option>
                        ))}
                      </select>
                    </div>
                    <div className={classes.fieldGroup}>
                      <span className={classes.fieldLabel}>Number</span>
                      <select
                        className={classes.select}
                        value={getNumberConstraintType(group.tile)}
                        onChange={(e) => handleNumberConstraintChange(index, e.target.value)}
                      >
                        {NUMBER_CONSTRAINTS.map((nc) => (
                          <option key={nc.value} value={nc.value}>{nc.label}</option>
                        ))}
                      </select>
                    </div>
                    {getNumberConstraintType(group.tile) === 'specific' && (
                      <div className={classes.fieldGroup}>
                        <span className={classes.fieldLabel}>Value</span>
                        <input
                          type="number"
                          className={classes.input}
                          min={1}
                          max={9}
                          value={tileNumber}
                          onChange={(e) => handleNumberChange(index, parseInt(e.target.value) || 1)}
                        />
                      </div>
                    )}
                    <div className={classes.fieldGroup}>
                      <span className={classes.fieldLabel}>Num Var</span>
                      <select
                        className={classes.select}
                        value={getNumberVar(group.tile)}
                        onChange={(e) => handleNumberVarChange(index, e.target.value)}
                      >
                        <option value="">None</option>
                        {NUMBER_VARS.map((nv) => (
                          <option key={nv} value={nv}>Match {nv}</option>
                        ))}
                      </select>
                    </div>
                    {getNumberVar(group.tile) && (
                      <div className={classes.fieldGroup}>
                        <span className={classes.fieldLabel}>Offset</span>
                        <input
                          type="number"
                          className={classes.input}
                          min={0}
                          max={8}
                          value={getNumberOffset(group.tile)}
                          onChange={(e) => handleNumberOffsetChange(index, parseInt(e.target.value) || 0)}
                          title="Offset from base (0 = X, 1 = X+1, 2 = X+2, etc.)"
                        />
                      </div>
                    )}
                    {superGroupIds.length > 0 && (
                      <div className={classes.fieldGroup}>
                        <span className={classes.fieldLabel}>Match SG#</span>
                        <select
                          className={classes.select}
                          value={getNumberMatchesSuperGroup(group.tile)}
                          onChange={(e) => handleNumberMatchesSuperGroupChange(index, e.target.value)}
                          title="Match any number from a super group"
                        >
                          <option value="">None</option>
                          {superGroupIds.map((sgId, sgIndex) => (
                            <option key={sgId} value={sgId}>Super Group {sgIndex + 1}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Fixed suit selector */}
                {tileCategory === 'fixed_suit' && (
                  <>
                    <div className={classes.fieldGroup}>
                      <span className={classes.fieldLabel}>Suit</span>
                      <select
                        className={classes.select}
                        value={suit}
                        onChange={(e) => handleSuitChange(index, parseInt(e.target.value) as TileType)}
                      >
                        {SUITS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={classes.fieldGroup}>
                      <span className={classes.fieldLabel}>Number</span>
                      <input
                        type="number"
                        className={classes.input}
                        min={1}
                        max={9}
                        value={tileNumber}
                        onChange={(e) => handleNumberChange(index, parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </>
                )}

                {/* Wind selector */}
                {tileCategory === 'fixed_wind' && (
                  <div className={classes.fieldGroup}>
                    <span className={classes.fieldLabel}>Wind</span>
                    <select
                      className={classes.select}
                      value={windValue}
                      onChange={(e) => handleWindChange(index, parseInt(e.target.value))}
                    >
                      {WINDS.map((w) => (
                        <option key={w.value} value={w.value}>{w.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Dragon selector */}
                {tileCategory === 'fixed_dragon' && (
                  <>
                    <div className={classes.fieldGroup}>
                      <span className={classes.fieldLabel}>Mode</span>
                      <select
                        className={classes.select}
                        value={isDragonVariableMode(group.tile) ? 'variable' : 'specific'}
                        onChange={(e) => handleDragonModeChange(index, e.target.value as 'specific' | 'variable')}
                      >
                        <option value="specific">Specific</option>
                        <option value="variable">Suit Variable</option>
                      </select>
                    </div>
                    {!isDragonVariableMode(group.tile) && (
                      <div className={classes.fieldGroup}>
                        <span className={classes.fieldLabel}>Dragon</span>
                        <select
                          className={classes.select}
                          value={dragonValue}
                          onChange={(e) => handleDragonChange(index, parseInt(e.target.value))}
                        >
                          {DRAGONS.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {isDragonVariableMode(group.tile) && (
                      <div className={classes.fieldGroup}>
                        <span className={classes.fieldLabel}>Suit Var</span>
                        <select
                          className={classes.select}
                          value={getDragonSuitVar(group.tile)}
                          onChange={(e) => handleDragonSuitVarChange(index, e.target.value)}
                        >
                          {SUIT_VARS.map((sv) => (
                            <option key={sv} value={sv}>Suit {sv}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>

        <button
          className={classes.removeButton}
          onClick={() => handleRemoveGroup(index)}
          title="Remove group"
        >
          &times;
        </button>
      </div>
    );
  };

  return (
    <div className={classes.editor}>
      {/* Toolbar for super group operations */}
      <div className={classes.toolbar}>
        <span className={classes.selectionCount}>
          {selectedIndices.size} selected
        </span>
        <button
          className={classes.toolbarButton}
          onClick={handleCreateSuperGroup}
          disabled={selectedIndices.size < 2}
          title="Create a super group from selected items"
        >
          Create Super Group
        </button>
        <div className={classes.toolbarDivider} />
        <button
          className={classes.toolbarButton}
          onClick={() => setSelectedIndices(new Set())}
          disabled={selectedIndices.size === 0}
        >
          Clear Selection
        </button>
      </div>

      <div className={classes.groupList}>
        {renderGroups()}
      </div>

      <button className={classes.addButton} onClick={handleAddGroup}>
        + Add Group
      </button>
    </div>
  );
}
