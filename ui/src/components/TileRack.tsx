import { useState, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { TileCode, sortTiles, isJoker } from 'common';
import { Tile } from './Tile';
import { theme, type Theme } from '../theme';
import type { ExposedMeld } from '../slices/handSlice';

// Export meld colors for use in other components
export const getMeldColor = (meldIndex: number): string => {
  return theme.colors.meldColors[meldIndex % theme.colors.meldColors.length];
};

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
    // Match other sections width
    width: '332px',
    boxSizing: 'content-box',
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
  slotSelected: {
    borderColor: '#FF9800',
    borderWidth: '3px',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    boxShadow: '0 0 8px rgba(255, 152, 0, 0.5)',
  },
  slotDropTarget: {
    borderColor: theme.colors.primary,
    borderWidth: '2px',
    backgroundColor: 'rgba(184, 74, 74, 0.1)',
  },
  draggableTile: {
    cursor: 'grab',
    position: 'relative',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  tileBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    color: 'white',
    borderRadius: '50%',
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    zIndex: 1,
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
  slotDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: theme.colors.border,
    cursor: 'not-allowed',
  },
  slotDisabledX: {
    color: theme.colors.textMuted,
    fontSize: '24px',
    fontWeight: 'bold',
    userSelect: 'none',
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
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  exposedSection: {
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  exposedMelds: {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  meld: {
    display: 'flex',
    gap: '2px',
    padding: '4px',
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
  },
  meldTileWrapper: {
    position: 'relative',
  },
  swappableJoker: {
    cursor: 'pointer',
    borderRadius: theme.borderRadius.sm,
    boxShadow: '0 0 0 2px #4CAF50',
    transition: 'all 0.2s',
    '&:hover': {
      boxShadow: '0 0 8px 2px rgba(76, 175, 80, 0.6)',
      transform: 'scale(1.05)',
    },
  },
  // Mobile responsive
  '@media (max-width: 480px)': {
    tiles: {
      minHeight: '50px',
      padding: theme.spacing.xs,
      // Match TilePicker mobile width
      width: '264px',
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

type InputMode = 'hand' | 'charleston' | 'drawn';

interface TileRackProps {
  tiles: TileCode[];
  drawnTile?: TileCode;
  exposedMelds?: ExposedMeld[];
  label?: string;
  onTileClick?: (tile: TileCode, index: number) => void;
  onClear?: () => void;
  onModeChange?: (mode: InputMode) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onAddTile?: (tile: TileCode, atIndex?: number) => void;
  onRemoveTile?: (index: number) => void;
  tileUsageStats?: { count: number; minDistance: number }[];
  drawnTileStats?: { count: number; minDistance: number };
  charlestonPassOrder?: (number | undefined)[];
  charlestonSelected?: Set<number>;
  onCharlestonPass?: () => void;
  onJokerSwap?: (meldIndex: number, tileIndex: number) => void;
  isHandFull?: boolean;
  sorted?: boolean;
  maxTiles?: number;
  mode?: InputMode;
  pendingDiscard?: boolean;
}

export function TileRack({
  tiles,
  drawnTile,
  exposedMelds = [],
  label = 'Your Hand',
  onTileClick,
  onClear,
  onModeChange,
  onReorder,
  onAddTile,
  onRemoveTile,
  tileUsageStats,
  drawnTileStats,
  charlestonPassOrder,
  charlestonSelected,
  onCharlestonPass,
  onJokerSwap,
  isHandFull = true,
  sorted = true,
  maxTiles = 13,
  mode = 'hand',
  pendingDiscard = false,
}: TileRackProps) {
  const classes = useStyles();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dropSuccessful, setDropSuccessful] = useState(false);

  // Compute total tile count - memoized to ensure accurate recalculation
  const totalTileCount = useMemo(() => {
    const concealedCount = tiles.length;
    const exposedCount = exposedMelds.reduce((sum, meld) => sum + meld.tiles.length, 0);
    const drawnCount = drawnTile !== undefined ? 1 : 0;
    return concealedCount + exposedCount + drawnCount;
  }, [tiles.length, exposedMelds, drawnTile]);

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
    } else if (mode === 'hand' || (mode === 'charleston' && !isHandFull)) {
      // For external drops (from inventory) in Set Hand mode or Charleston refill, allow drop on any slot if hand not full
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
    } else if (source === 'inventory' && (mode === 'hand' || (mode === 'charleston' && !isHandFull))) {
      // Drop from inventory - in Set Hand mode or Charleston refill
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
          <span className={classes.tileCount}>({totalTileCount}/{maxTiles})</span>
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
              className={`${classes.modeOption} ${mode === 'charleston' ? classes.modeOptionActive : ''}`}
              onClick={() => onModeChange('charleston')}
              disabled={tiles.length < maxTiles}
              title={tiles.length < maxTiles ? `Need ${maxTiles} tiles to start charleston` : undefined}
            >
              Charleston
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

      {/* Exposed Section - only shown when there are exposed melds */}
      {exposedMelds.length > 0 && (
        <div className={classes.exposedSection}>
          <div className={classes.sectionLabel}>Exposed</div>
          <div className={classes.exposedMelds}>
            {exposedMelds.map((meld, meldIndex) => {
              // Find the natural (non-joker) tile in this meld
              const naturalTile = meld.tiles.find(t => !isJoker(t));
              // Check if player has a matching tile in concealed hand or drawn slot
              const hasMatchingTile = naturalTile !== undefined && (
                tiles.includes(naturalTile) || drawnTile === naturalTile
              );

              const meldColor = getMeldColor(meldIndex);

              return (
                <div
                  key={meldIndex}
                  className={classes.meld}
                  style={{ borderColor: meldColor }}
                >
                  {meld.tiles.map((tile, tileIndex) => {
                    const tileIsJoker = isJoker(tile);
                    const isSwappable = tileIsJoker && hasMatchingTile && onJokerSwap;

                    return (
                      <div
                        key={tileIndex}
                        className={`${classes.meldTileWrapper} ${isSwappable ? classes.swappableJoker : ''}`}
                        onClick={isSwappable ? () => onJokerSwap(meldIndex, tileIndex) : undefined}
                        title={isSwappable ? 'Click to swap with matching tile from your hand' : undefined}
                      >
                        <Tile code={tile} size="small" />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Concealed Section Label - only shown when there are exposed melds */}
      {exposedMelds.length > 0 && (
        <div className={classes.sectionLabel}>Concealed</div>
      )}

      <div className={classes.tilesContent}>
        <div className={classes.mainTiles}>
          {/* Calculate available concealed slots (13 - exposed tiles) */}
          {(() => {
            const exposedTileCount = exposedMelds.reduce((sum, meld) => sum + meld.tiles.length, 0);
            const availableSlots = maxTiles - exposedTileCount;

            return Array.from({ length: maxTiles }).map((_, slotIndex) => {
              const isDisabledSlot = slotIndex >= availableSlots;
              const tile = displayTiles[slotIndex];
              const isDragging = draggedIndex === slotIndex;
              const isDropTarget = dropTargetIndex === slotIndex;
              const isSelected = mode === 'charleston' && charlestonSelected?.has(slotIndex);
              const canDrag = onReorder && tile !== undefined && !isDisabledSlot;

              // Disabled slots show X and cannot be interacted with
              if (isDisabledSlot) {
                return (
                  <div
                    key={`slot-${slotIndex}`}
                    className={`${classes.slot} ${classes.slotDisabled}`}
                  >
                    <span className={classes.slotDisabledX}>✕</span>
                  </div>
                );
              }

              return (
                <div
                  key={`slot-${slotIndex}`}
                  className={`${classes.slot} ${isDragging ? classes.slotDragging : ''} ${isDropTarget ? classes.slotDropTarget : ''} ${isSelected ? classes.slotSelected : ''}`}
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
                        onClick={(() => {
                          // In Gameplay mode, only allow clicking when there are 14 tiles
                          // (drawnTile present or pendingDiscard after a call)
                          if (mode === 'drawn') {
                            const has14Tiles = drawnTile !== undefined || pendingDiscard;
                            if (!has14Tiles) return undefined;
                          }
                          return onTileClick ? () => onTileClick(tile, slotIndex) : undefined;
                        })()}
                      />
                      {mode === 'charleston' ? (
                        // Charleston mode: show pass order (1, 2, 3)
                        charlestonPassOrder && charlestonPassOrder[slotIndex] !== undefined && (
                          <div className={classes.tileBadge} style={{ backgroundColor: '#FF9800' }}>
                            {charlestonPassOrder[slotIndex]}
                          </div>
                        )
                      ) : mode === 'drawn' ? (
                        // Gameplay mode: show usage stats
                        tileUsageStats && tileUsageStats[slotIndex]?.count > 0 && (() => {
                          const stats = tileUsageStats[slotIndex];
                          // Color based on how close the nearest hand is: red = very close (valuable), green = far (less valuable)
                          let bgColor = '#4CAF50'; // green - far/less valuable
                          if (stats.minDistance <= 2) {
                            bgColor = '#C62828'; // red - very close/most valuable
                          } else if (stats.minDistance <= 4) {
                            bgColor = '#F9A825'; // yellow/orange - medium
                          }
                          return (
                            <div className={classes.tileBadge} style={{ backgroundColor: bgColor }}>
                              {stats.count}
                            </div>
                          );
                        })()
                      ) : null /* Set Hand mode: no badges */}
                    </div>
                  )}
                </div>
              );
            });
          })()}
          {/* 14th slot: Clear/Pass button in Set Hand/Charleston mode, Drawn slot in Gameplay mode */}
          {mode === 'hand' ? (
            // Show Clear button in Set Hand mode when there are tiles
            onClear && tiles.length > 0 ? (
              <div className={classes.slot}>
                <button className={classes.clearButton} onClick={onClear}>
                  Clear
                </button>
              </div>
            ) : null
          ) : mode === 'charleston' ? (
            // Show Pass button in Charleston mode (disabled unless 1-3 tiles selected)
            <div className={classes.slot}>
              <button
                className={classes.clearButton}
                onClick={onCharlestonPass}
                disabled={!charlestonSelected || charlestonSelected.size === 0 || charlestonSelected.size > 3}
                style={{
                  opacity: (!charlestonSelected || charlestonSelected.size === 0) ? 0.4 : 1,
                  cursor: (!charlestonSelected || charlestonSelected.size === 0) ? 'not-allowed' : 'pointer',
                }}
              >
                Pass {charlestonSelected && charlestonSelected.size > 0 ? `(${charlestonSelected.size})` : ''}
              </button>
            </div>
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
                  <div className={classes.draggableTile}>
                    <Tile
                      code={drawnTile}
                      onClick={onTileClick ? () => onTileClick(drawnTile, -1) : undefined}
                    />
                    {drawnTileStats && drawnTileStats.count > 0 && (() => {
                      // Color based on how close the nearest hand is
                      let bgColor = '#4CAF50'; // green - far/less valuable
                      if (drawnTileStats.minDistance <= 2) {
                        bgColor = '#C62828'; // red - very close/most valuable
                      } else if (drawnTileStats.minDistance <= 4) {
                        bgColor = '#F9A825'; // yellow/orange - medium
                      }
                      return (
                        <div className={classes.tileBadge} style={{ backgroundColor: bgColor }}>
                          {drawnTileStats.count}
                        </div>
                      );
                    })()}
                  </div>
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
        {pendingDiscard
          ? 'Click a tile to discard.'
          : mode === 'hand'
          ? 'Set your hand tiles.'
          : mode === 'charleston'
          ? (isHandFull
              ? 'Select up to 3 using suggestions, then "Pass", then replace.'
              : 'Refill your hand from the inventory.')
          : drawnTile !== undefined
          ? 'Click any tile to discard it.'
          : 'Draw a tile or call a discard to continue.'}
      </div>
    </div>
  );
}
