import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { TileCode, TileType, encodeTile, Wind, Dragon } from 'common';
import type { HandExample } from 'common';
import { Tile } from './Tile';
import type { Theme } from '../theme';

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
  tileSlot: {
    width: '28px',
    height: '36px',
    border: '1px dashed rgba(139, 125, 107, 0.4)',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': {
      borderColor: theme.colors.primary,
      backgroundColor: 'rgba(184, 74, 74, 0.05)',
    },
  },
  tileWrapper: {
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.7,
    },
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
    cursor: 'pointer',
    opacity: 0.8,
    transition: 'opacity 0.15s, transform 0.15s',
    '&:hover': {
      opacity: 1,
      transform: 'scale(1.1)',
    },
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
}));

interface ExampleEditorProps {
  examples: HandExample[];
  onChange: (examples: HandExample[]) => void;
}

export function ExampleEditor({ examples, onChange }: ExampleEditorProps) {
  const classes = useStyles();
  const [activeExampleIndex, setActiveExampleIndex] = useState<number | null>(null);

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

  const handleAddTile = (index: number, tile: TileCode) => {
    if (examples[index].tiles.length >= 14) return;
    const newExamples = [...examples];
    newExamples[index] = {
      ...newExamples[index],
      tiles: [...newExamples[index].tiles, tile],
    };
    onChange(newExamples);
  };

  const handleRemoveTile = (exampleIndex: number, tileIndex: number) => {
    const newExamples = [...examples];
    newExamples[exampleIndex] = {
      ...newExamples[exampleIndex],
      tiles: newExamples[exampleIndex].tiles.filter((_, i) => i !== tileIndex),
    };
    onChange(newExamples);
  };

  const handleNoteChange = (index: number, note: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], note: note || undefined };
    onChange(newExamples);
  };

  const renderPicker = (exampleIndex: number) => {
    const renderTile = (tile: TileCode) => (
      <div
        key={tile}
        className={classes.pickerTile}
        onClick={() => handleAddTile(exampleIndex, tile)}
      >
        <Tile code={tile} size="tiny" />
      </div>
    );

    const renderSuitRow = (suitType: TileType) => {
      const tiles: TileCode[] = [];
      for (let i = 1; i <= 9; i++) {
        tiles.push(encodeTile(suitType, i));
      }
      return <div className={classes.pickerRow}>{tiles.map(renderTile)}</div>;
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
        {renderSuitRow(TileType.DOT)}
        {renderSuitRow(TileType.BAM)}
        {renderSuitRow(TileType.CRAK)}
        <div className={classes.pickerRow}>
          {windTiles.map(renderTile)}
          {dragonTiles.map(renderTile)}
          {renderTile(flowerTile)}
          {renderTile(jokerTile)}
        </div>
      </div>
    );
  };

  return (
    <div className={classes.editor}>
      <div className={classes.exampleList}>
        {examples.map((example, index) => (
          <div
            key={index}
            className={`${classes.exampleCard} ${example.isValid ? classes.exampleCardValid : classes.exampleCardInvalid}`}
          >
            <div className={classes.exampleHeader}>
              <span className={`${classes.exampleLabel} ${example.isValid ? classes.validLabel : classes.invalidLabel}`}>
                {example.isValid ? 'Valid' : 'Invalid'}
              </span>
              <span className={classes.tileCount}>{example.tiles.length}/14 tiles</span>
              <div className={classes.exampleActions}>
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

            <div className={classes.tilesRow}>
              {example.tiles.map((tile, tileIndex) => (
                <div
                  key={tileIndex}
                  className={classes.tileWrapper}
                  onClick={() => handleRemoveTile(index, tileIndex)}
                  title="Click to remove"
                >
                  <Tile code={tile} size="tiny" />
                </div>
              ))}
              {example.tiles.length < 14 && (
                <div
                  className={classes.tileSlot}
                  onClick={() => setActiveExampleIndex(activeExampleIndex === index ? null : index)}
                  title="Click to add tiles"
                >
                  +
                </div>
              )}
            </div>

            {activeExampleIndex === index && renderPicker(index)}

            <input
              type="text"
              className={classes.noteInput}
              value={example.note || ''}
              onChange={(e) => handleNoteChange(index, e.target.value)}
              placeholder="Optional note..."
            />
          </div>
        ))}
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
