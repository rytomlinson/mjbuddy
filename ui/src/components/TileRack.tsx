import { createUseStyles } from 'react-jss';
import { TileCode, sortTiles } from 'common';
import { Tile } from './Tile';
import type { Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  rackLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tileCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
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
    // 7 tiles per row: 7 * 40px + 6 * 4px gaps = 304px
    maxWidth: '304px',
    // Fixed height for 2 rows: 2 * 52px + 4px gap + 16px for drawn badge = 124px
    minHeight: '124px',
    alignContent: 'flex-start',
    paddingBottom: '16px',
  },
  drawnPlaceholder: {
    width: '40px',
    height: '52px',
    border: `2px dashed ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.primary,
    fontSize: '8px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    backgroundColor: 'rgba(184, 74, 74, 0.05)',
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
  empty: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    padding: theme.spacing.md,
    textAlign: 'center',
    width: '304px',
    minHeight: '124px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    border: 'none',
    fontSize: theme.fontSizes.sm,
    cursor: 'pointer',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    '&:hover': {
      color: theme.colors.error,
      backgroundColor: 'rgba(255,82,82,0.1)',
    },
  },
  // Mobile responsive
  '@media (max-width: 480px)': {
    tiles: {
      minHeight: '50px',
      padding: theme.spacing.xs,
    },
    mainTiles: {
      gap: '2px',
      // 7 tiles per row on mobile: 7 * 32px + 6 * 2px = 236px
      maxWidth: '236px',
      // 2 rows on mobile: 2 * 42px + 2px gap + 14px for badge = 100px
      minHeight: '100px',
      paddingBottom: '14px',
    },
    drawnPlaceholder: {
      width: '32px',
      height: '42px',
      fontSize: '6px',
    },
    empty: {
      fontSize: theme.fontSizes.sm,
      padding: theme.spacing.sm,
      width: '236px',
      minHeight: '100px',
    },
  },
}));

interface TileRackProps {
  tiles: TileCode[];
  drawnTile?: TileCode;
  label?: string;
  onTileClick?: (tile: TileCode, index: number) => void;
  onClear?: () => void;
  sorted?: boolean;
  maxTiles?: number;
}

export function TileRack({
  tiles,
  drawnTile,
  label = 'Your Hand',
  onTileClick,
  onClear,
  sorted = true,
  maxTiles = 13,
}: TileRackProps) {
  const classes = useStyles();

  const displayTiles = sorted ? sortTiles(tiles) : tiles;

  return (
    <div className={classes.tiles}>
      <div className={classes.rackLabel}>
        <span>{label}</span>
        <span className={classes.tileCount}>
          {tiles.length}/{maxTiles}
          {onClear && tiles.length > 0 && (
            <button className={classes.clearButton} onClick={onClear}>
              Clear
            </button>
          )}
        </span>
      </div>
      <div className={classes.tilesContent}>
        {displayTiles.length === 0 && !drawnTile ? (
          <div className={classes.empty}>Click tiles below to add to your hand</div>
        ) : (
          <div className={classes.mainTiles}>
            {displayTiles.map((tile, index) => (
              <Tile
                key={`${tile}-${index}`}
                code={tile}
                onClick={onTileClick ? () => onTileClick(tile, index) : undefined}
              />
            ))}
            {/* Show drawn tile placeholder when hand is full but no drawn tile */}
            {tiles.length >= maxTiles && drawnTile === undefined && (
              <div className={classes.drawnPlaceholder}>Drawn</div>
            )}
            {/* Show drawn tile when present */}
            {drawnTile !== undefined && (
              <div className={classes.drawnTileWrapper}>
                <Tile
                  code={drawnTile}
                  onClick={onTileClick ? () => onTileClick(drawnTile, -1) : undefined}
                />
                <span className={classes.drawnBadge}>Drawn</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
