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
    '&:hover': {
      backgroundColor: theme.colors.surfaceHover,
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
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
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
  sorted = true,
  maxTiles = 13,
  mode = 'hand',
}: TileRackProps) {
  const classes = useStyles();

  const displayTiles = sorted ? sortTiles(tiles) : tiles;

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
            return (
              <div key={`slot-${slotIndex}`} className={classes.slot}>
                {tile !== undefined && (
                  <Tile
                    code={tile}
                    onClick={onTileClick ? () => onTileClick(tile, slotIndex) : undefined}
                  />
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
            <div className={`${classes.slot} ${classes.drawSlot}`}>
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
          ? 'Click hand tiles above to −, inventory tiles to +.'
          : 'Draw an inventory tile by click, then discard any tile.'}
      </div>
    </div>
  );
}
