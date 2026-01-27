import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { TileCode, sortTiles } from 'common';
import { Tile } from './Tile';
import type { Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  rackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  rackLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  tileCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    fontWeight: 'normal',
  },
  modeToggle: {
    display: 'inline-flex',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  modeOption: {
    padding: `2px ${theme.spacing.sm}`,
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
    transition: 'all 0.2s',
    border: 'none',
    borderRight: `1px solid ${theme.colors.border}`,
    '&:last-child': {
      borderRight: 'none',
    },
    '&:hover:not(:disabled)': {
      backgroundColor: theme.colors.surfaceHover,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
  modeOptionActive: {
    backgroundColor: theme.colors.primary,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.colors.primaryHover,
    },
  },
  tiles: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    minHeight: '60px',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  },
  tilesContent: {
    display: 'flex',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  mainTiles: {
    display: 'flex',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
    // 7 slots per row: 7 * 44px + 6 * 4px gaps = 332px
    maxWidth: '332px',
    // Fixed height for 2 rows: 2 * 56px + 4px gap + 16px for drawn badge = 132px
    minHeight: '132px',
    alignContent: 'flex-start',
    paddingBottom: '16px',
  },
  drawnTileWrapper: {
    position: 'relative',
  },
  drawnBadge: {
    position: 'absolute',
    bottom: '-14px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '9px',
    color: theme.colors.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  slot: {
    width: '44px',
    height: '56px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.15s, background-color 0.15s',
  },
  slotDragging: {
    opacity: 0.5,
  },
  slotDropTarget: {
    borderColor: theme.colors.primary,
    borderWidth: '2px',
    backgroundColor: 'rgba(184, 74, 74, 0.1)',
  },
  draggableTile: {
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  drawSlot: {
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderWidth: '2px',
    backgroundColor: 'rgba(184, 74, 74, 0.05)',
  },
  drawLabel: {
    color: theme.colors.primary,
    fontSize: '8px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  clearButton: {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.textMuted,
    fontSize: '8px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      color: theme.colors.error,
      backgroundColor: 'rgba(255,82,82,0.1)',
    },
  },
  prompt: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: '2px',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Mobile responsive
  '@media (max-width: 480px)': {
    tiles: {
      minHeight: '50px',
      padding: theme.spacing.xs,
    },
    mainTiles: {
      gap: '2px',
      // 7 slots per row on mobile: 7 * 36px + 6 * 2px = 264px
      maxWidth: '264px',
      // 2 rows on mobile: 2 * 46px + 2px gap + 14px for badge = 108px
      minHeight: '108px',
      paddingBottom: '14px',
    },
    drawLabel: {
      fontSize: '6px',
    },
    clearButton: {
      fontSize: '6px',
    },
    slot: {
      width: '36px',
      height: '46px',
    },
    prompt: {
      fontSize: '11px',
    },
    modeOption: {
      padding: `2px ${theme.spacing.xs}`,
      fontSize: '10px',
    },
  },
}));

type InputMode = 'hand' | 'drawn';

interface TileRackProps {
  tiles: TileCode[];
  drawnTile?: TileCode;
  label?: string;
  onTileClick?: (tile: TileCode, index: number) => void;
  onClear?: () => void;
  onModeChange?: (mode: InputMode) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onAddTile?: (tile: TileCode, atIndex?: number) => void;
  onRemoveTile?: (index: number) => void;
  sorted?: boolean;
  maxTiles?: number;
  mode?: InputMode;
}

export function TileRack({
  tiles,
  drawnTile,
  label = 'Your Hand',
  onTileClick,
  onClear,
  onModeChange,
  onReorder,
  onAddTile,
  onRemoveTile,
  sorted = true,
  maxTiles = 13,
  mode = 'hand',
}: TileRackProps) {
  const classes = useStyles();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dropSuccessful, setDropSuccessful] = useState(false);

  // Don't sort if reordering is enabled (user controls order)
  const displayTiles = sorted && !onReorder ? sortTiles(tiles) : tiles;

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index);
    setDropSuccessful(false);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-tile-source', 'hand');
    e.dataTransfer.setData('application/x-tile-index', String(index));
  };

  const handleDragEnd = (index: number) => () => {
    // If drop wasn't successful (dragged outside), remove the tile
    if (!dropSuccessful && onRemoveTile) {
      onRemoveTile(index);
    }
    setDraggedIndex(null);
    setDropTargetIndex(null);
    setDropSuccessful(false);
  };

  const handleDragOver = (slotIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();

    // For internal reorder, only show drop target on filled slots
    if (draggedIndex !== null) {
      e.dataTransfer.dropEffect = 'move';
      if (slotIndex !== draggedIndex && slotIndex < tiles.length) {
        setDropTargetIndex(slotIndex);
      }
    } else if (mode === 'hand') {
      // For external drops (from inventory) in Set Hand mode, allow drop on any slot if hand not full
      e.dataTransfer.dropEffect = 'copy';
      if (tiles.length < maxTiles) {
        setDropTargetIndex(slotIndex);
      }
    }
    // In Gameplay mode, inventory drops on hand slots are not allowed (must use Draw slot)
  };

  const handleDrawSlotDragOver = (e: React.DragEvent) => {
    // Only allow inventory drops when Draw slot is empty
    if (mode === 'drawn' && drawnTile === undefined) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDropTargetIndex(-1); // Use -1 to indicate draw slot
    }
  };

  const handleDrawSlotDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const source = e.dataTransfer.getData('application/x-tile-source');

    if (source === 'inventory' && mode === 'drawn' && drawnTile === undefined) {
      const tileCode = parseInt(e.dataTransfer.getData('application/x-tile-code'), 10);
      if (!isNaN(tileCode) && onAddTile) {
        // In Gameplay mode, adding to draw slot is handled by setting drawn tile
        // Use special index -1 to indicate draw slot
        onAddTile(tileCode as TileCode, -1);
      }
    }
    setDropTargetIndex(null);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();

    const source = e.dataTransfer.getData('application/x-tile-source');

    if (source === 'hand') {
      // Internal reorder
      const fromIndex = draggedIndex;
      if (fromIndex !== null && fromIndex !== toIndex && onReorder) {
        onReorder(fromIndex, toIndex);
      }
      setDropSuccessful(true);
    } else if (source === 'inventory' && mode === 'hand') {
      // Drop from inventory - only in Set Hand mode
      const tileCode = parseInt(e.dataTransfer.getData('application/x-tile-code'), 10);
      if (!isNaN(tileCode) && onAddTile && tiles.length < maxTiles) {
        // If dropping on an existing tile, insert at that position
        // Otherwise add at the end
        const insertIndex = toIndex < tiles.length ? toIndex : undefined;
        onAddTile(tileCode as TileCode, insertIndex);
      }
    }

    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  return (
    <div className={classes.tiles}>
      <div className={classes.rackHeader}>
        <div className={classes.rackLabel}>
          <span>{label}</span>
          <span className={classes.tileCount}>({tiles.length}/{maxTiles})</span>
        </div>
        {onModeChange && (
          <div className={classes.modeToggle}>
            <button
              className={`${classes.modeOption} ${mode === 'hand' ? classes.modeOptionActive : ''}`}
              onClick={() => onModeChange('hand')}
            >
              Set Hand
            </button>
            <button
              className={`${classes.modeOption} ${mode === 'drawn' ? classes.modeOptionActive : ''}`}
              onClick={() => onModeChange('drawn')}
              disabled={tiles.length < maxTiles}
              title={tiles.length < maxTiles ? `Need ${maxTiles} tiles to start gameplay` : undefined}
            >
              Gameplay
            </button>
          </div>
        )}
      </div>
      <div className={classes.tilesContent}>
        <div className={classes.mainTiles}>
          {/* Render all 13 hand slots */}
          {Array.from({ length: maxTiles }).map((_, slotIndex) => {
            const tile = displayTiles[slotIndex];
            const isDragging = draggedIndex === slotIndex;
            const isDropTarget = dropTargetIndex === slotIndex;
            const canDrag = onReorder && tile !== undefined;

            return (
              <div
                key={`slot-${slotIndex}`}
                className={`${classes.slot} ${isDragging ? classes.slotDragging : ''} ${isDropTarget ? classes.slotDropTarget : ''}`}
                onDragOver={onReorder ? handleDragOver(slotIndex) : undefined}
                onDragLeave={onReorder ? handleDragLeave : undefined}
                onDrop={onReorder ? handleDrop(slotIndex) : undefined}
              >
                {tile !== undefined && (
                  <div
                    className={canDrag ? classes.draggableTile : undefined}
                    draggable={canDrag}
                    onDragStart={canDrag ? handleDragStart(slotIndex) : undefined}
                    onDragEnd={canDrag ? handleDragEnd(slotIndex) : undefined}
                  >
                    <Tile
                      code={tile}
                      onClick={onTileClick ? () => onTileClick(tile, slotIndex) : undefined}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {/* 14th slot: Clear button in Set Hand mode, Drawn slot in Gameplay mode */}
          {mode === 'hand' ? (
            // Show Clear button in Set Hand mode when there are tiles
            onClear && tiles.length > 0 ? (
              <div className={classes.slot}>
                <button className={classes.clearButton} onClick={onClear}>
                  Clear
                </button>
              </div>
            ) : null
          ) : (
            // Gameplay mode: always show the 14th slot
            <div
              className={`${classes.slot} ${classes.drawSlot} ${dropTargetIndex === -1 ? classes.slotDropTarget : ''}`}
              onDragOver={handleDrawSlotDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrawSlotDrop}
            >
              {drawnTile !== undefined ? (
                <div className={classes.drawnTileWrapper}>
                  <Tile
                    code={drawnTile}
                    onClick={onTileClick ? () => onTileClick(drawnTile, -1) : undefined}
                  />
                  <span className={classes.drawnBadge}>Drawn</span>
                </div>
              ) : (
                <span className={classes.drawLabel}>Draw</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={classes.prompt}>
        {mode === 'hand'
          ? 'Set your starting hand using the tiles below.'
          : 'Draw an inventory tile by click, then discard any tile.'}
      </div>
    </div>
  );
}
