import { createUseStyles } from 'react-jss';
import { TileCode, TileType, encodeTile, Wind, Dragon } from 'common';
import { Tile } from './Tile';
import type { Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  picker: {
    display: 'inline-block',
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
  modeToggle: {
    display: 'flex',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  modeButton: {
    flex: 1,
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    fontSize: theme.fontSizes.md,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: theme.colors.surfaceHover,
    },
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.colors.primaryHover,
    },
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
    modeToggle: {
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    modeButton: {
      padding: theme.spacing.xs,
      fontSize: theme.fontSizes.sm,
    },
  },
}));

type InputMode = 'hand' | 'drawn';

interface TilePickerProps {
  onTileSelect: (tile: TileCode) => void;
  disabledTiles?: Set<TileCode>;
  selectedTiles?: TileCode[];
  inputMode?: InputMode;
  onModeChange?: (mode: InputMode) => void;
}

export function TilePicker({
  onTileSelect,
  disabledTiles,
  selectedTiles = [],
  inputMode = 'hand',
  onModeChange,
}: TilePickerProps) {
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
      {onModeChange && (
        <div className={classes.modeToggle}>
          <button
            className={`${classes.modeButton} ${inputMode === 'hand' ? classes.modeButtonActive : ''}`}
            onClick={() => onModeChange('hand')}
          >
            Add to Hand
          </button>
          <button
            className={`${classes.modeButton} ${inputMode === 'drawn' ? classes.modeButtonActive : ''}`}
            onClick={() => onModeChange('drawn')}
          >
            Set Drawn Tile
          </button>
        </div>
      )}
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
