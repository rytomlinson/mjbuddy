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
    display: 'flex',
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
  tilesWithDrawn: {
    display: 'flex',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  mainTiles: {
    display: 'flex',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  drawnSeparator: {
    width: '2px',
    height: '50px',
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  drawnTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  drawnLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  empty: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    padding: theme.spacing.md,
    textAlign: 'center',
    width: '100%',
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
    },
    tilesWithDrawn: {
      gap: '2px',
      flexWrap: 'wrap',
    },
    drawnSeparator: {
      height: '40px',
      marginLeft: theme.spacing.xs,
      marginRight: theme.spacing.xs,
    },
    empty: {
      fontSize: theme.fontSizes.sm,
      padding: theme.spacing.sm,
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
          <div className={classes.tilesWithDrawn}>
            <div className={classes.mainTiles}>
              {displayTiles.map((tile, index) => (
                <Tile
                  key={`${tile}-${index}`}
                  code={tile}
                  onClick={onTileClick ? () => onTileClick(tile, index) : undefined}
                />
              ))}
            </div>
            {drawnTile !== undefined && (
              <>
                <div className={classes.drawnSeparator} />
                <div className={classes.drawnTile}>
                  <Tile
                    code={drawnTile}
                    onClick={onTileClick ? () => onTileClick(drawnTile, -1) : undefined}
                  />
                  <span className={classes.drawnLabel}>Drawn</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
