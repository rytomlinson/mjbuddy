import { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import type { Theme } from '../theme';
import {
  SavedHand,
  loadSavedHands,
  saveHand,
  deleteSavedHand,
  formatSavedDate,
} from '../utils/savedHands';
import { Tile } from './Tile';
import type { TileCode } from 'common';
import type { ExposedMeld } from '../slices/handSlice';

const useStyles = createUseStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    width: '332px',
    boxSizing: 'content-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  title: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    color: theme.colors.text,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  count: {
    fontWeight: 'normal',
    color: theme.colors.textSecondary,
  },
  collapseIcon: {
    fontSize: '10px',
    color: theme.colors.textSecondary,
    transition: 'transform 0.2s',
  },
  collapseIconRotated: {
    transform: 'rotate(-90deg)',
  },
  content: {
    marginTop: theme.spacing.sm,
  },
  saveForm: {
    display: 'flex',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  input: {
    flex: 1,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    '&::placeholder': {
      color: theme.colors.textMuted,
    },
  },
  saveButton: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    backgroundColor: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: theme.colors.primaryHover,
    },
    '&:disabled': {
      backgroundColor: theme.colors.textMuted,
      cursor: 'not-allowed',
    },
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  savedItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceHover,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(184, 74, 74, 0.1)',
    },
  },
  savedInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
  },
  savedName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    color: theme.colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  savedMeta: {
    fontSize: '11px',
    color: theme.colors.textMuted,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  savedTiles: {
    display: 'flex',
    gap: '1px',
    marginLeft: theme.spacing.xs,
    flexShrink: 0,
  },
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    color: theme.colors.textMuted,
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    fontSize: '12px',
    cursor: 'pointer',
    flexShrink: 0,
    '&:hover': {
      backgroundColor: 'rgba(255, 82, 82, 0.15)',
      color: '#FF5252',
    },
  },
  empty: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.sm,
  },
  '@media (max-width: 480px)': {
    container: {
      width: '264px',
    },
    savedTiles: {
      display: 'none', // Hide preview tiles on mobile
    },
  },
}));

interface SavedHandsProps {
  currentTiles: TileCode[];
  currentDrawnTile: TileCode | null;
  currentExposedMelds: ExposedMeld[];
  onLoadHand: (tiles: TileCode[], drawnTile: TileCode | null, exposedMelds: ExposedMeld[]) => void;
}

export function SavedHands({
  currentTiles,
  currentDrawnTile,
  currentExposedMelds,
  onLoadHand,
}: SavedHandsProps) {
  const classes = useStyles();
  const [collapsed, setCollapsed] = useState(true);
  const [savedHands, setSavedHands] = useState<SavedHand[]>([]);
  const [saveName, setSaveName] = useState('');

  // Load saved hands on mount
  useEffect(() => {
    setSavedHands(loadSavedHands());
  }, []);

  const handleSave = () => {
    if (currentTiles.length === 0) return;

    const saved = saveHand(saveName, currentTiles, currentDrawnTile, currentExposedMelds);
    setSavedHands([saved, ...savedHands.slice(0, 9)]);
    setSaveName('');
  };

  const handleLoad = (hand: SavedHand) => {
    onLoadHand(hand.tiles, hand.drawnTile, hand.exposedMelds);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSavedHand(id);
    setSavedHands(savedHands.filter(h => h.id !== id));
  };

  const canSave = currentTiles.length > 0;

  return (
    <div className={classes.container}>
      <div className={classes.header} onClick={() => setCollapsed(!collapsed)}>
        <div className={classes.title}>
          <span className={`${classes.collapseIcon} ${collapsed ? classes.collapseIconRotated : ''}`}>
            &#9660;
          </span>
          Saved Hands
          <span className={classes.count}>({savedHands.length})</span>
        </div>
      </div>

      {!collapsed && (
        <div className={classes.content}>
          <div className={classes.saveForm}>
            <input
              type="text"
              className={classes.input}
              placeholder="Name (optional)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canSave && handleSave()}
            />
            <button
              className={classes.saveButton}
              onClick={handleSave}
              disabled={!canSave}
            >
              Save
            </button>
          </div>

          {savedHands.length === 0 ? (
            <div className={classes.empty}>No saved hands yet</div>
          ) : (
            <div className={classes.list}>
              {savedHands.map((hand) => (
                <div
                  key={hand.id}
                  className={classes.savedItem}
                  onClick={() => handleLoad(hand)}
                >
                  <div className={classes.savedInfo}>
                    <div className={classes.savedName}>{hand.name}</div>
                    <div className={classes.savedMeta}>
                      {hand.tiles.length} tiles
                      {hand.exposedMelds.length > 0 && ` + ${hand.exposedMelds.length} melds`}
                      <span>&#8226;</span>
                      {formatSavedDate(hand.savedAt)}
                    </div>
                  </div>
                  <div className={classes.savedTiles}>
                    {hand.tiles.slice(0, 5).map((tile, i) => (
                      <Tile key={i} code={tile} size="tiny" />
                    ))}
                    {hand.tiles.length > 5 && (
                      <span style={{ fontSize: '10px', color: '#888', alignSelf: 'center' }}>
                        +{hand.tiles.length - 5}
                      </span>
                    )}
                  </div>
                  <button
                    className={classes.deleteButton}
                    onClick={(e) => handleDelete(e, hand.id)}
                    title="Delete"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
