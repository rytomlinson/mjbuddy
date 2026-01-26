import { createUseStyles } from 'react-jss';
import { TileCode, TileType, encodeTile, Wind, Dragon } from 'common';
import { Tile } from './Tile';
import type { Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  picker: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
  },
  section: {
    marginBottom: theme.spacing.md,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tileRow: {
    display: 'flex',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
    marginBottom: theme.spacing.xs,
  },
  honorRow: {
    display: 'flex',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  // Mobile responsive
  '@media (max-width: 480px)': {
    picker: {
      padding: theme.spacing.sm,
    },
    section: {
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: '10px',
      marginBottom: theme.spacing.xs,
    },
    tileRow: {
      gap: '2px',
      marginBottom: '2px',
    },
    honorRow: {
      gap: '2px',
    },
  },
}));

interface TilePickerProps {
  onTileSelect: (tile: TileCode) => void;
  disabledTiles?: Set<TileCode>;
  selectedTiles?: TileCode[];
}

export function TilePicker({ onTileSelect, disabledTiles, selectedTiles = [] }: TilePickerProps) {
  const classes = useStyles();

  const selectedSet = new Set(selectedTiles);

  const renderSuitRow = (suitType: TileType, label: string) => {
    const tiles: TileCode[] = [];
    for (let i = 1; i <= 9; i++) {
      tiles.push(encodeTile(suitType, i));
    }

    return (
      <div className={classes.section}>
        <div className={classes.sectionTitle}>{label}</div>
        <div className={classes.tileRow}>
          {tiles.map((tile) => (
            <Tile
              key={tile}
              code={tile}
              size="small"
              selected={selectedSet.has(tile)}
              disabled={disabledTiles?.has(tile)}
              onClick={() => onTileSelect(tile)}
            />
          ))}
        </div>
      </div>
    );
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
    <div className={classes.picker}>
      {renderSuitRow(TileType.DOT, 'Dots')}
      {renderSuitRow(TileType.BAM, 'Bams')}
      {renderSuitRow(TileType.CRAK, 'Craks')}

      <div className={classes.section}>
        <div className={classes.sectionTitle}>Winds, Dragons & Special</div>
        <div className={classes.honorRow}>
          {windTiles.map((tile) => (
            <Tile
              key={tile}
              code={tile}
              size="small"
              selected={selectedSet.has(tile)}
              disabled={disabledTiles?.has(tile)}
              onClick={() => onTileSelect(tile)}
            />
          ))}
          {dragonTiles.map((tile) => (
            <Tile
              key={tile}
              code={tile}
              size="small"
              selected={selectedSet.has(tile)}
              disabled={disabledTiles?.has(tile)}
              onClick={() => onTileSelect(tile)}
            />
          ))}
          <Tile
            code={flowerTile}
            size="small"
            selected={selectedSet.has(flowerTile)}
            disabled={disabledTiles?.has(flowerTile)}
            onClick={() => onTileSelect(flowerTile)}
          />
          <Tile
            code={jokerTile}
            size="small"
            selected={selectedSet.has(jokerTile)}
            disabled={disabledTiles?.has(jokerTile)}
            onClick={() => onTileSelect(jokerTile)}
          />
        </div>
      </div>
    </div>
  );
}
