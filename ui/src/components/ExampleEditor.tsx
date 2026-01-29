import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { TileCode, TileType, encodeTile, Wind, Dragon, GroupType } from 'common';
import type { HandExample, PatternGroup, ExampleValidationResult } from 'common';
import { Tile } from './Tile';
import type { Theme } from '../theme';

// Group type labels for display
const GROUP_TYPE_LABELS: Record<number, string> = {
  [GroupType.SINGLE]: 'Single',
  [GroupType.PAIR]: 'Pair',
  [GroupType.PUNG]: 'Pung',
  [GroupType.KONG]: 'Kong',
  [GroupType.QUINT]: 'Quint',
  [GroupType.SEXTET]: 'Sextet',
};

// Helper to get tile type and value from TileCode
const decodeTile = (code: TileCode): { type: TileType; value: number } => ({
  type: (code >> 4) as TileType,
  value: code & 0x0f,
});

// Check if a tile type is a numbered suit (can be incremented/decremented)
const isNumberedSuit = (type: TileType): boolean =>
  type === TileType.DOT || type === TileType.BAM || type === TileType.CRAK;

const useStyles = createUseStyles((theme: Theme) => ({
  editor: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  exampleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  exampleCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: theme.borderRadius.sm,
    border: '2px solid',
  },
  exampleCardValid: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  exampleCardInvalid: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  exampleCardIssues: {
    borderColor: '#FF5722',
    boxShadow: '0 0 0 2px rgba(255, 87, 34, 0.3)',
  },
  validationIssues: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '4px 6px',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderRadius: '3px',
    fontSize: '10px',
    color: '#D84315',
  },
  validationIssue: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  issueIcon: {
    fontSize: '12px',
  },
  exampleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  exampleLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  validLabel: {
    color: '#2E7D32',
  },
  invalidLabel: {
    color: '#C62828',
  },
  exampleActions: {
    display: 'flex',
    gap: theme.spacing.xs,
  },
  toggleButton: {
    padding: '2px 6px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  toggleValid: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    color: '#2E7D32',
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.3)',
    },
  },
  toggleInvalid: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    color: '#C62828',
    '&:hover': {
      backgroundColor: 'rgba(244, 67, 54, 0.3)',
    },
  },
  removeButton: {
    padding: '2px 6px',
    border: 'none',
    borderRadius: '3px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: '#666',
    cursor: 'pointer',
    fontSize: '10px',
    '&:hover': {
      backgroundColor: 'rgba(244, 67, 54, 0.2)',
      color: '#C62828',
    },
  },
  tilesRow: {
    display: 'flex',
    gap: '2px',
    flexWrap: 'wrap',
    minHeight: '36px',
    alignItems: 'center',
  },
  tileWrapper: {
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.7,
    },
  },
  emptySlot: {
    width: '28px',
    height: '36px',
    border: '2px dashed rgba(139, 125, 107, 0.4)',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
    '&:hover': {
      borderColor: '#B84A4A',
      backgroundColor: 'rgba(184, 74, 74, 0.1)',
    },
  },
  emptySlotDragOver: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    transform: 'scale(1.05)',
  },
  picker: {
    padding: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: theme.borderRadius.sm,
    border: '1px solid rgba(139, 125, 107, 0.3)',
  },
  pickerRow: {
    display: 'flex',
    gap: '2px',
    marginBottom: '2px',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  pickerTile: {
    cursor: 'grab',
    opacity: 0.8,
    transition: 'opacity 0.15s, transform 0.15s',
    '&:hover': {
      opacity: 1,
      transform: 'scale(1.1)',
    },
    '&:active': {
      cursor: 'grabbing',
    },
  },
  clickableArea: {
    cursor: 'pointer',
  },
  addButton: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    border: '1px dashed rgba(139, 125, 107, 0.5)',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    color: '#5C564E',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: theme.colors.primary,
      color: theme.colors.primary,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
  },
  noteInput: {
    padding: '4px 6px',
    border: '1px solid rgba(139, 125, 107, 0.3)',
    borderRadius: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    fontSize: '11px',
    color: '#2D2A26',
    width: '100%',
    boxSizing: 'border-box',
    '&::placeholder': {
      color: '#999',
    },
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
    },
  },
  tileCount: {
    fontSize: '10px',
    color: '#666',
  },
  groupedTilesRow: {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    minHeight: '36px',
    alignItems: 'flex-start',
  },
  tileGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  groupTiles: {
    display: 'flex',
    gap: '1px',
    padding: '2px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '4px',
  },
  groupLabel: {
    fontSize: '9px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  superGroupContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  superGroupTiles: {
    display: 'flex',
    gap: '1px',
    padding: '2px 4px',
    backgroundColor: 'rgba(184, 74, 74, 0.1)',
    borderRadius: '4px',
    border: '1px dashed rgba(184, 74, 74, 0.3)',
  },
  superGroupLabel: {
    fontSize: '9px',
    color: '#B84A4A',
    fontWeight: 'bold',
  },
  clickableLabel: {
    cursor: 'pointer',
    padding: '1px 4px',
    borderRadius: '3px',
    transition: 'all 0.15s',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
  },
  clickableLabelSelected: {
    backgroundColor: 'rgba(184, 74, 74, 0.2)',
    color: '#B84A4A',
  },
  groupEditPopup: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '4px',
    padding: theme.spacing.xs,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.sm,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '120px',
  },
  popupSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  popupSectionLabel: {
    fontSize: '9px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  popupButtons: {
    display: 'flex',
    gap: '2px',
  },
  popupButton: {
    padding: '4px 8px',
    border: '1px solid rgba(139, 125, 107, 0.3)',
    borderRadius: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold',
    transition: 'all 0.15s',
    '&:hover': {
      borderColor: theme.colors.primary,
      backgroundColor: 'rgba(184, 74, 74, 0.1)',
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
  suitButtonDot: {
    color: '#1565C0',
    '&:hover': {
      backgroundColor: 'rgba(21, 101, 192, 0.1)',
      borderColor: '#1565C0',
    },
  },
  suitButtonBam: {
    color: '#2E7D32',
    '&:hover': {
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      borderColor: '#2E7D32',
    },
  },
  suitButtonCrak: {
    color: '#C62828',
    '&:hover': {
      backgroundColor: 'rgba(198, 40, 40, 0.1)',
      borderColor: '#C62828',
    },
  },
  dragonButtonRed: {
    color: '#C62828',
    '&:hover': {
      backgroundColor: 'rgba(198, 40, 40, 0.1)',
      borderColor: '#C62828',
    },
  },
  dragonButtonGreen: {
    color: '#2E7D32',
    '&:hover': {
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      borderColor: '#2E7D32',
    },
  },
  dragonButtonWhite: {
    color: '#666',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderColor: '#666',
    },
  },
  windButton: {
    color: '#1565C0',
    '&:hover': {
      backgroundColor: 'rgba(21, 101, 192, 0.1)',
      borderColor: '#1565C0',
    },
  },
  cloneButton: {
    padding: '2px 6px',
    border: 'none',
    borderRadius: '3px',
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    color: '#1565C0',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'rgba(33, 150, 243, 0.3)',
    },
  },
  groupContainer: {
    position: 'relative',
    cursor: 'grab',
    transition: 'transform 0.15s, opacity 0.15s',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  groupDragging: {
    opacity: 0.5,
    transform: 'scale(0.95)',
  },
  groupDragOver: {
    transform: 'translateX(8px)',
  },
  groupDragOverLeft: {
    transform: 'translateX(-8px)',
  },
}));

interface ExampleEditorProps {
  examples: HandExample[];
  patternGroups: PatternGroup[];
  onChange: (examples: HandExample[]) => void;
  validationResults?: ExampleValidationResult[];
}

// Track which group is being edited
interface SelectedGroup {
  exampleIndex: number;
  groupKey: string; // Either "g-{index}" for regular groups or "sg-{superGroupId}" for super groups
  startTileIndex: number;
  tileCount: number;
}

// Track drag state for group reordering within an example
interface DragState {
  exampleIndex: number;
  displayGroupIndex: number; // Index in the display order
}

export function ExampleEditor({ examples, patternGroups, onChange, validationResults }: ExampleEditorProps) {
  const classes = useStyles();
  const [activeExampleIndex, setActiveExampleIndex] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragOverGroupIndex, setDragOverGroupIndex] = useState<number | null>(null);
  // State for dragging tiles from inventory
  const [inventoryDragTile, setInventoryDragTile] = useState<TileCode | null>(null);
  const [dropTargetSlot, setDropTargetSlot] = useState<{ exampleIndex: number; tileIndex: number } | null>(null);

  // Compute display groups from pattern groups (collapsing super groups)
  // Returns array of { patternIndices, tileCount, superGroupId?, types }
  const computeDisplayGroups = () => {
    const displayGroups: {
      patternIndices: number[];
      tileCount: number;
      superGroupId?: string;
      types: GroupType[];
    }[] = [];

    let i = 0;
    while (i < patternGroups.length) {
      const pg = patternGroups[i];
      if (pg.superGroupId) {
        // Collect all consecutive groups with same superGroupId
        const indices: number[] = [];
        const types: GroupType[] = [];
        let count = 0;
        const superGroupId = pg.superGroupId;
        while (i < patternGroups.length && patternGroups[i].superGroupId === superGroupId) {
          indices.push(i);
          types.push(patternGroups[i].type);
          count += patternGroups[i].type;
          i++;
        }
        displayGroups.push({ patternIndices: indices, tileCount: count, superGroupId, types });
      } else {
        displayGroups.push({
          patternIndices: [i],
          tileCount: pg.type,
          types: [pg.type],
        });
        i++;
      }
    }
    return displayGroups;
  };

  const displayGroups = computeDisplayGroups();

  // Compute total expected tiles from pattern groups
  const expectedTileCount = patternGroups.reduce((sum, pg) => sum + pg.type, 0);

  // Ensure example tiles array has the right length, padding with 0 (empty) if needed
  const getFullTilesArray = (example: HandExample): number[] => {
    const tiles = [...example.tiles];
    // Pad with zeros to expected length
    while (tiles.length < expectedTileCount) {
      tiles.push(0);
    }
    return tiles;
  };

  // Get the group order for an example (default is [0, 1, 2, ...])
  const getGroupOrder = (example: HandExample): number[] => {
    if (example.groupOrder && example.groupOrder.length === displayGroups.length) {
      return example.groupOrder;
    }
    return displayGroups.map((_, i) => i);
  };


  // Render a single tile or empty slot
  const renderTileOrSlot = (
    tile: number,
    exampleIndex: number,
    tileIndex: number
  ) => {
    const isDropTarget =
      dropTargetSlot?.exampleIndex === exampleIndex &&
      dropTargetSlot?.tileIndex === tileIndex;

    if (tile === 0) {
      // Empty slot
      return (
        <div
          key={tileIndex}
          className={`${classes.emptySlot} ${isDropTarget ? classes.emptySlotDragOver : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (inventoryDragTile !== null) {
              setDropTargetSlot({ exampleIndex, tileIndex });
            }
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            setDropTargetSlot(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (inventoryDragTile !== null) {
              handleDropTileInSlot(exampleIndex, tileIndex, inventoryDragTile);
              setInventoryDragTile(null);
              setDropTargetSlot(null);
            }
          }}
          title="Drag a tile here"
        />
      );
    }

    // Regular tile
    return (
      <div
        key={tileIndex}
        className={classes.tileWrapper}
        onClick={(e) => {
          e.stopPropagation();
          handleRemoveTile(exampleIndex, tileIndex);
        }}
        title="Click to remove"
      >
        <Tile code={tile as TileCode} size="tiny" />
      </div>
    );
  };

  // Render grouped tiles with visual separation, respecting groupOrder
  const renderGroupedTiles = (example: HandExample, exampleIndex: number) => {
    const tiles = getFullTilesArray(example);
    if (patternGroups.length === 0) {
      // Fallback to flat display if no pattern groups
      return (
        <div className={classes.tilesRow}>
          {tiles.map((tile, tileIndex) => renderTileOrSlot(tile, exampleIndex, tileIndex))}
        </div>
      );
    }

    const groupOrder = getGroupOrder(example);
    const rendered: JSX.Element[] = [];

    // Compute tile start positions for each display position
    const tileStartPositions: number[] = [];
    let pos = 0;
    for (const dgIdx of groupOrder) {
      tileStartPositions.push(pos);
      pos += displayGroups[dgIdx].tileCount;
    }

    for (let displayPos = 0; displayPos < groupOrder.length; displayPos++) {
      const dgIndex = groupOrder[displayPos];
      const dg = displayGroups[dgIndex];
      // Capture tile start position for this group (avoids closure issue)
      const tileStartPos = tileStartPositions[displayPos];

      // Get tiles for this display group from the example's tiles array
      // Tiles are stored in display order, so we use tileStartPos
      const groupTiles = tiles.slice(tileStartPos, tileStartPos + dg.tileCount);

      const isSelected = selectedGroup?.exampleIndex === exampleIndex && selectedGroup?.groupKey === `dg-${displayPos}`;
      const isDragging = dragState?.exampleIndex === exampleIndex && dragState?.displayGroupIndex === displayPos;
      const isDragOver = dragState?.exampleIndex === exampleIndex && dragOverGroupIndex === displayPos;
      const isDragOverLeft = isDragOver && dragState && dragState.displayGroupIndex > displayPos;

      if (dg.superGroupId) {
        // Render as exposure unit (super group)
        rendered.push(
          <div
            key={`dg-${displayPos}`}
            className={`${classes.superGroupContainer} ${classes.groupContainer} ${isDragging ? classes.groupDragging : ''} ${isDragOver ? (isDragOverLeft ? classes.groupDragOverLeft : classes.groupDragOver) : ''}`}
            draggable={!inventoryDragTile}
            onDragStart={(e) => !inventoryDragTile && handleDragStart(e, exampleIndex, displayPos)}
            onDragOver={(e) => !inventoryDragTile && handleDragOver(e, displayPos)}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={(e) => !inventoryDragTile && handleDrop(e, exampleIndex, displayPos)}
          >
            <div className={classes.superGroupTiles}>
              {groupTiles.map((tile, idx) => renderTileOrSlot(tile, exampleIndex, tileStartPos + idx))}
            </div>
            <span
              className={`${classes.superGroupLabel} ${classes.clickableLabel} ${isSelected ? classes.clickableLabelSelected : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleGroupLabelClick(exampleIndex, `dg-${displayPos}`, tileStartPos, dg.tileCount);
              }}
              title="Click to edit group"
            >
              Exposure Unit
            </span>
            {isSelected && renderGroupEditPopup()}
          </div>
        );
      } else {
        // Regular group
        const label = GROUP_TYPE_LABELS[dg.types[0]];
        rendered.push(
          <div
            key={`dg-${displayPos}`}
            className={`${classes.tileGroup} ${classes.groupContainer} ${isDragging ? classes.groupDragging : ''} ${isDragOver ? (isDragOverLeft ? classes.groupDragOverLeft : classes.groupDragOver) : ''}`}
            draggable={!inventoryDragTile}
            onDragStart={(e) => !inventoryDragTile && handleDragStart(e, exampleIndex, displayPos)}
            onDragOver={(e) => !inventoryDragTile && handleDragOver(e, displayPos)}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={(e) => !inventoryDragTile && handleDrop(e, exampleIndex, displayPos)}
          >
            <div className={classes.groupTiles}>
              {groupTiles.map((tile, idx) => renderTileOrSlot(tile, exampleIndex, tileStartPos + idx))}
            </div>
            {label && (
              <span
                className={`${classes.groupLabel} ${classes.clickableLabel} ${isSelected ? classes.clickableLabelSelected : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGroupLabelClick(exampleIndex, `dg-${displayPos}`, tileStartPos, dg.tileCount);
                }}
                title="Click to edit group"
              >
                {label}
              </span>
            )}
            {isSelected && renderGroupEditPopup()}
          </div>
        );
      }
    }

    return <div className={classes.groupedTilesRow}>{rendered}</div>;
  };

  const handleAddExample = (isValid: boolean) => {
    const newExample: HandExample = {
      tiles: [],
      isValid,
    };
    onChange([...examples, newExample]);
    setActiveExampleIndex(examples.length);
  };

  const handleRemoveExample = (index: number) => {
    const newExamples = examples.filter((_, i) => i !== index);
    onChange(newExamples);
    if (activeExampleIndex === index) {
      setActiveExampleIndex(null);
    } else if (activeExampleIndex !== null && activeExampleIndex > index) {
      setActiveExampleIndex(activeExampleIndex - 1);
    }
  };

  const handleToggleValid = (index: number) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], isValid: !newExamples[index].isValid };
    onChange(newExamples);
  };

  const handleRemoveTile = (exampleIndex: number, tileIndex: number) => {
    const newExamples = [...examples];
    const tiles = getFullTilesArray(newExamples[exampleIndex]);
    // Set the tile to 0 (empty) instead of removing it
    tiles[tileIndex] = 0;
    newExamples[exampleIndex] = {
      ...newExamples[exampleIndex],
      tiles: tiles as TileCode[],
    };
    onChange(newExamples);
  };

  // Handle dropping a tile from inventory into an empty slot
  const handleDropTileInSlot = (exampleIndex: number, tileIndex: number, tile: TileCode) => {
    const newExamples = [...examples];
    const tiles = getFullTilesArray(newExamples[exampleIndex]);
    tiles[tileIndex] = tile;
    newExamples[exampleIndex] = {
      ...newExamples[exampleIndex],
      tiles: tiles as TileCode[],
    };
    onChange(newExamples);
  };

  const handleNoteChange = (index: number, note: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], note: note || undefined };
    onChange(newExamples);
  };

  const handleCloneExample = (index: number) => {
    const example = examples[index];
    const clonedExample: HandExample = {
      tiles: [...example.tiles],
      isValid: example.isValid,
      note: example.note ? `${example.note} (copy)` : undefined,
      groupOrder: example.groupOrder ? [...example.groupOrder] : undefined,
    };
    const newExamples = [...examples];
    newExamples.splice(index + 1, 0, clonedExample);
    onChange(newExamples);
  };

  const handleGroupLabelClick = (
    exampleIndex: number,
    groupKey: string,
    startTileIndex: number,
    tileCount: number
  ) => {
    if (selectedGroup?.exampleIndex === exampleIndex && selectedGroup?.groupKey === groupKey) {
      // Toggle off if clicking the same group
      setSelectedGroup(null);
    } else {
      setSelectedGroup({ exampleIndex, groupKey, startTileIndex, tileCount });
    }
  };

  const handleChangeSuit = (newSuit: TileType) => {
    if (!selectedGroup) return;
    const { exampleIndex, startTileIndex, tileCount } = selectedGroup;

    const newExamples = [...examples];
    const newTiles = [...newExamples[exampleIndex].tiles];

    for (let i = startTileIndex; i < startTileIndex + tileCount && i < newTiles.length; i++) {
      const { type, value } = decodeTile(newTiles[i]);
      // Only change suit for numbered tiles
      if (isNumberedSuit(type)) {
        newTiles[i] = encodeTile(newSuit, value);
      }
    }

    newExamples[exampleIndex] = { ...newExamples[exampleIndex], tiles: newTiles };
    onChange(newExamples);
    setSelectedGroup(null);
  };

  const handleIncrementValue = (delta: number) => {
    if (!selectedGroup) return;
    const { exampleIndex, startTileIndex, tileCount } = selectedGroup;

    const newExamples = [...examples];
    const newTiles = [...newExamples[exampleIndex].tiles];

    // Check if all tiles can be incremented/decremented
    let canChange = true;
    for (let i = startTileIndex; i < startTileIndex + tileCount && i < newTiles.length; i++) {
      const { type, value } = decodeTile(newTiles[i]);
      if (isNumberedSuit(type)) {
        const newValue = value + delta;
        if (newValue < 1 || newValue > 9) {
          canChange = false;
          break;
        }
      }
    }

    if (!canChange) return;

    for (let i = startTileIndex; i < startTileIndex + tileCount && i < newTiles.length; i++) {
      const { type, value } = decodeTile(newTiles[i]);
      if (isNumberedSuit(type)) {
        newTiles[i] = encodeTile(type, value + delta);
      }
    }

    newExamples[exampleIndex] = { ...newExamples[exampleIndex], tiles: newTiles };
    onChange(newExamples);
  };

  // Check if increment/decrement is possible for the selected group
  const canIncrement = (delta: number): boolean => {
    if (!selectedGroup) return false;
    const { exampleIndex, startTileIndex, tileCount } = selectedGroup;
    const tiles = examples[exampleIndex]?.tiles || [];

    for (let i = startTileIndex; i < startTileIndex + tileCount && i < tiles.length; i++) {
      const { type, value } = decodeTile(tiles[i]);
      if (isNumberedSuit(type)) {
        const newValue = value + delta;
        if (newValue < 1 || newValue > 9) return false;
      }
    }
    return true;
  };

  // Check if the selected group has any numbered tiles (for suit change)
  const hasNumberedTiles = (): boolean => {
    if (!selectedGroup) return false;
    const { exampleIndex, startTileIndex, tileCount } = selectedGroup;
    const tiles = examples[exampleIndex]?.tiles || [];

    for (let i = startTileIndex; i < startTileIndex + tileCount && i < tiles.length; i++) {
      const { type } = decodeTile(tiles[i]);
      if (isNumberedSuit(type)) return true;
    }
    return false;
  };

  // Check if the selected group has any dragon tiles
  const hasDragonTiles = (): boolean => {
    if (!selectedGroup) return false;
    const { exampleIndex, startTileIndex, tileCount } = selectedGroup;
    const tiles = examples[exampleIndex]?.tiles || [];

    for (let i = startTileIndex; i < startTileIndex + tileCount && i < tiles.length; i++) {
      const { type } = decodeTile(tiles[i]);
      if (type === TileType.DRAGON) return true;
    }
    return false;
  };

  const handleChangeDragon = (newDragon: number) => {
    if (!selectedGroup) return;
    const { exampleIndex, startTileIndex, tileCount } = selectedGroup;

    const newExamples = [...examples];
    const newTiles = [...newExamples[exampleIndex].tiles];

    for (let i = startTileIndex; i < startTileIndex + tileCount && i < newTiles.length; i++) {
      const { type } = decodeTile(newTiles[i]);
      // Only change dragon tiles
      if (type === TileType.DRAGON) {
        newTiles[i] = encodeTile(TileType.DRAGON, newDragon);
      }
    }

    newExamples[exampleIndex] = { ...newExamples[exampleIndex], tiles: newTiles };
    onChange(newExamples);
    setSelectedGroup(null);
  };

  // Check if the selected group has any wind tiles
  const hasWindTiles = (): boolean => {
    if (!selectedGroup) return false;
    const { exampleIndex, startTileIndex, tileCount } = selectedGroup;
    const tiles = examples[exampleIndex]?.tiles || [];

    for (let i = startTileIndex; i < startTileIndex + tileCount && i < tiles.length; i++) {
      const { type } = decodeTile(tiles[i]);
      if (type === TileType.WIND) return true;
    }
    return false;
  };

  const handleChangeWind = (newWind: number) => {
    if (!selectedGroup) return;
    const { exampleIndex, startTileIndex, tileCount } = selectedGroup;

    const newExamples = [...examples];
    const newTiles = [...newExamples[exampleIndex].tiles];

    for (let i = startTileIndex; i < startTileIndex + tileCount && i < newTiles.length; i++) {
      const { type } = decodeTile(newTiles[i]);
      // Only change wind tiles
      if (type === TileType.WIND) {
        newTiles[i] = encodeTile(TileType.WIND, newWind);
      }
    }

    newExamples[exampleIndex] = { ...newExamples[exampleIndex], tiles: newTiles };
    onChange(newExamples);
    setSelectedGroup(null);
  };

  // Drag and drop handlers for reordering display groups within an example
  const handleDragStart = (
    e: React.DragEvent,
    exampleIndex: number,
    displayGroupIndex: number
  ) => {
    setDragState({ exampleIndex, displayGroupIndex });
    e.dataTransfer.effectAllowed = 'move';
    setSelectedGroup(null);
  };

  const handleDragOver = (e: React.DragEvent, displayGroupIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragState && dragState.displayGroupIndex !== displayGroupIndex) {
      setDragOverGroupIndex(displayGroupIndex);
    }
  };

  const handleDragLeave = () => {
    setDragOverGroupIndex(null);
  };

  const handleDragEnd = () => {
    setDragState(null);
    setDragOverGroupIndex(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    exampleIndex: number,
    targetDisplayGroupIndex: number
  ) => {
    e.preventDefault();
    if (!dragState || dragState.exampleIndex !== exampleIndex) {
      setDragState(null);
      setDragOverGroupIndex(null);
      return;
    }

    const sourceDisplayGroupIndex = dragState.displayGroupIndex;

    if (sourceDisplayGroupIndex === targetDisplayGroupIndex) {
      setDragState(null);
      setDragOverGroupIndex(null);
      return;
    }

    const example = examples[exampleIndex];
    const currentGroupOrder = getGroupOrder(example);

    // Create new group order by moving the source to the target position
    const newGroupOrder = [...currentGroupOrder];
    const [movedGroup] = newGroupOrder.splice(sourceDisplayGroupIndex, 1);
    newGroupOrder.splice(targetDisplayGroupIndex, 0, movedGroup);

    // Also reorder the tiles to match the new display order
    const tiles = [...example.tiles];

    // Calculate tile positions based on OLD group order
    const oldTilePositions: { start: number; count: number }[] = [];
    let pos = 0;
    for (const dgIndex of currentGroupOrder) {
      const count = displayGroups[dgIndex].tileCount;
      oldTilePositions.push({ start: pos, count });
      pos += count;
    }

    // Extract tiles for the source group
    const sourceTileStart = oldTilePositions[sourceDisplayGroupIndex].start;
    const sourceTileCount = oldTilePositions[sourceDisplayGroupIndex].count;
    const sourceTiles = tiles.splice(sourceTileStart, sourceTileCount);

    // Calculate new insertion point
    // After splice, positions shift. Calculate target position in the new array.
    let insertAt: number;
    if (sourceDisplayGroupIndex < targetDisplayGroupIndex) {
      // Dragging forward: target shifted left
      insertAt = oldTilePositions[targetDisplayGroupIndex].start - sourceTileCount;
    } else {
      // Dragging backward
      insertAt = oldTilePositions[targetDisplayGroupIndex].start;
    }

    tiles.splice(insertAt, 0, ...sourceTiles);

    // Update the example with new tiles and groupOrder
    const newExamples = [...examples];
    newExamples[exampleIndex] = {
      ...example,
      tiles,
      groupOrder: newGroupOrder,
    };
    onChange(newExamples);

    setDragState(null);
    setDragOverGroupIndex(null);
  };

  const renderGroupEditPopup = () => {
    if (!selectedGroup) return null;

    const hasNumbered = hasNumberedTiles();
    const hasDragons = hasDragonTiles();
    const hasWinds = hasWindTiles();

    return (
      <div className={classes.groupEditPopup} onClick={(e) => e.stopPropagation()}>
        {/* Suit change for numbered tiles */}
        <div className={classes.popupSection}>
          <span className={classes.popupSectionLabel}>Change Suit</span>
          <div className={classes.popupButtons}>
            <button
              className={`${classes.popupButton} ${classes.suitButtonDot}`}
              onClick={() => handleChangeSuit(TileType.DOT)}
              disabled={!hasNumbered}
            >
              Dot
            </button>
            <button
              className={`${classes.popupButton} ${classes.suitButtonBam}`}
              onClick={() => handleChangeSuit(TileType.BAM)}
              disabled={!hasNumbered}
            >
              Bam
            </button>
            <button
              className={`${classes.popupButton} ${classes.suitButtonCrak}`}
              onClick={() => handleChangeSuit(TileType.CRAK)}
              disabled={!hasNumbered}
            >
              Crak
            </button>
          </div>
        </div>

        {/* Dragon change */}
        <div className={classes.popupSection}>
          <span className={classes.popupSectionLabel}>Change Dragon</span>
          <div className={classes.popupButtons}>
            <button
              className={`${classes.popupButton} ${classes.dragonButtonRed}`}
              onClick={() => handleChangeDragon(Dragon.RED)}
              disabled={!hasDragons}
            >
              Red
            </button>
            <button
              className={`${classes.popupButton} ${classes.dragonButtonGreen}`}
              onClick={() => handleChangeDragon(Dragon.GREEN)}
              disabled={!hasDragons}
            >
              Green
            </button>
            <button
              className={`${classes.popupButton} ${classes.dragonButtonWhite}`}
              onClick={() => handleChangeDragon(Dragon.WHITE)}
              disabled={!hasDragons}
            >
              White
            </button>
          </div>
        </div>

        {/* Wind change */}
        <div className={classes.popupSection}>
          <span className={classes.popupSectionLabel}>Change Wind</span>
          <div className={classes.popupButtons}>
            <button
              className={`${classes.popupButton} ${classes.windButton}`}
              onClick={() => handleChangeWind(Wind.EAST)}
              disabled={!hasWinds}
            >
              E
            </button>
            <button
              className={`${classes.popupButton} ${classes.windButton}`}
              onClick={() => handleChangeWind(Wind.SOUTH)}
              disabled={!hasWinds}
            >
              S
            </button>
            <button
              className={`${classes.popupButton} ${classes.windButton}`}
              onClick={() => handleChangeWind(Wind.WEST)}
              disabled={!hasWinds}
            >
              W
            </button>
            <button
              className={`${classes.popupButton} ${classes.windButton}`}
              onClick={() => handleChangeWind(Wind.NORTH)}
              disabled={!hasWinds}
            >
              N
            </button>
          </div>
        </div>

        {/* Value change for numbered tiles */}
        <div className={classes.popupSection}>
          <span className={classes.popupSectionLabel}>Change Value</span>
          <div className={classes.popupButtons}>
            <button
              className={classes.popupButton}
              onClick={() => handleIncrementValue(-1)}
              disabled={!hasNumbered || !canIncrement(-1)}
            >
              − 1
            </button>
            <button
              className={classes.popupButton}
              onClick={() => handleIncrementValue(1)}
              disabled={!hasNumbered || !canIncrement(1)}
            >
              + 1
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPicker = (exampleIndex: number) => {
    const renderPickerTile = (tile: TileCode) => (
      <div
        key={tile}
        className={classes.pickerTile}
        draggable
        onDragStart={(e) => {
          setInventoryDragTile(tile);
          e.dataTransfer.effectAllowed = 'copy';
        }}
        onDragEnd={() => {
          setInventoryDragTile(null);
          setDropTargetSlot(null);
        }}
        onClick={() => {
          // Find first empty slot and fill it
          const tiles = getFullTilesArray(examples[exampleIndex]);
          const emptyIndex = tiles.findIndex(t => t === 0);
          if (emptyIndex !== -1) {
            handleDropTileInSlot(exampleIndex, emptyIndex, tile);
          }
        }}
      >
        <Tile code={tile} size="tiny" />
      </div>
    );

    const renderSuitRow = (suitType: TileType) => {
      const tiles: TileCode[] = [];
      for (let i = 1; i <= 9; i++) {
        tiles.push(encodeTile(suitType, i));
      }
      return <div className={classes.pickerRow}>{tiles.map(renderPickerTile)}</div>;
    };

    const windTiles = [
      encodeTile(TileType.WIND, Wind.EAST),
      encodeTile(TileType.WIND, Wind.SOUTH),
      encodeTile(TileType.WIND, Wind.WEST),
      encodeTile(TileType.WIND, Wind.NORTH),
    ];

    const dragonTiles = [
      encodeTile(TileType.DRAGON, Dragon.RED),
      encodeTile(TileType.DRAGON, Dragon.GREEN),
      encodeTile(TileType.DRAGON, Dragon.WHITE),
    ];

    const flowerTile = encodeTile(TileType.FLOWER, 1);
    const jokerTile = encodeTile(TileType.JOKER, 1);

    return (
      <div className={classes.picker} onClick={(e) => e.stopPropagation()}>
        {renderSuitRow(TileType.DOT)}
        {renderSuitRow(TileType.BAM)}
        {renderSuitRow(TileType.CRAK)}
        <div className={classes.pickerRow}>
          {windTiles.map(renderPickerTile)}
          {dragonTiles.map(renderPickerTile)}
          {renderPickerTile(flowerTile)}
          {renderPickerTile(jokerTile)}
        </div>
      </div>
    );
  };

  return (
    <div className={classes.editor} onClick={() => { setSelectedGroup(null); setActiveExampleIndex(null); }}>
      <div className={classes.exampleList}>
        {examples.map((example, index) => {
          const validation = validationResults?.find(v => v.exampleIndex === index);
          const hasIssues = validation && validation.issues.length > 0;
          return (
            <div
              key={index}
              className={`${classes.exampleCard} ${example.isValid ? classes.exampleCardValid : classes.exampleCardInvalid} ${hasIssues ? classes.exampleCardIssues : ''}`}
            >
              <div className={classes.exampleHeader} onClick={(e) => e.stopPropagation()}>
                <span className={`${classes.exampleLabel} ${example.isValid ? classes.validLabel : classes.invalidLabel}`}>
                  {example.isValid ? 'Valid' : 'Invalid'}
                </span>
                <span className={classes.tileCount}>
                  {getFullTilesArray(example).filter(t => t !== 0).length}/{expectedTileCount} tiles
                </span>
                <div className={classes.exampleActions}>
                  <button
                    className={classes.cloneButton}
                    onClick={() => handleCloneExample(index)}
                    title="Clone this example"
                  >
                    Clone
                  </button>
                  <button
                    className={`${classes.toggleButton} ${example.isValid ? classes.toggleInvalid : classes.toggleValid}`}
                    onClick={() => handleToggleValid(index)}
                  >
                    Mark {example.isValid ? 'Invalid' : 'Valid'}
                  </button>
                  <button
                    className={classes.removeButton}
                    onClick={() => handleRemoveExample(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div
                className={classes.clickableArea}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveExampleIndex(index);
                }}
                title="Click to show tile inventory"
              >
                {renderGroupedTiles(example, index)}
              </div>

              {activeExampleIndex === index && renderPicker(index)}

              {hasIssues && (
                <div className={classes.validationIssues}>
                  {validation.issues.map((issue, issueIdx) => (
                    <div key={issueIdx} className={classes.validationIssue}>
                      <span className={classes.issueIcon}>⚠</span>
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="text"
                className={classes.noteInput}
                value={example.note || ''}
                onChange={(e) => handleNoteChange(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Optional note..."
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button className={classes.addButton} onClick={() => handleAddExample(true)}>
          + Add Valid Example
        </button>
        <button className={classes.addButton} onClick={() => handleAddExample(false)}>
          + Add Invalid Example
        </button>
      </div>
    </div>
  );
}
