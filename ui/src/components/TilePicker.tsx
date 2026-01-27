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
    // Match TileRack width: 332px
    width: '332px',
    boxSizing: 'content-box',
  },
  tileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  honorRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  tileWrapper: {
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  tileWrapperDisabled: {
    cursor: 'default',
  },
  header: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    marginBottom: theme.spacing.sm,
  },
  // Mobile responsive
  '@media (max-width: 480px)': {
    picker: {
      padding: theme.spacing.xs,
      // Match TileRack mobile width: 264px
      width: '264px',
    },
  },
}));

interface TilePickerProps {
  onTileSelect: (tile: TileCode) => void;
  disabledTiles?: Set<TileCode>;
  selectedTiles?: TileCode[];
}

export function TilePicker({
  onTileSelect,
  disabledTiles,
  selectedTiles = [],
}: TilePickerProps) {
  const classes = useStyles();

  const selectedSet = new Set(selectedTiles);

  const handleDragStart = (tile: TileCode) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/x-tile-code', String(tile));
    e.dataTransfer.setData('application/x-tile-source', 'inventory');
  };

  const renderTile = (tile: TileCode) => {
    const isDisabled = disabledTiles?.has(tile);
    return (
      <div
        key={tile}
        className={`${classes.tileWrapper} ${isDisabled ? classes.tileWrapperDisabled : ''}`}
        draggable={!isDisabled}
        onDragStart={!isDisabled ? handleDragStart(tile) : undefined}
      >
        <Tile
          code={tile}
          size="small"
          selected={selectedSet.has(tile)}
          disabled={isDisabled}
          onClick={() => onTileSelect(tile)}
        />
      </div>
    );
  };

  const renderSuitRow = (suitType: TileType) => {
    const tiles: TileCode[] = [];
    for (let i = 1; i <= 9; i++) {
      tiles.push(encodeTile(suitType, i));
    }

    return (
      <div className={classes.tileRow}>
        {tiles.map((tile) => renderTile(tile))}
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
      <div className={classes.header}>Inventory</div>
      {renderSuitRow(TileType.DOT)}
      {renderSuitRow(TileType.BAM)}
      {renderSuitRow(TileType.CRAK)}

      <div className={classes.honorRow}>
        {windTiles.map((tile) => renderTile(tile))}
        {dragonTiles.map((tile) => renderTile(tile))}
        {renderTile(flowerTile)}
        {renderTile(jokerTile)}
      </div>
    </div>
  );
}
