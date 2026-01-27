import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { TileCode, getMaxTileCount, normalizeTileForCounting } from 'common';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  selectHandTiles,
  selectDrawnTile,
  selectExposedMelds,
  selectIsHandFull,
  addTile,
  insertTileAt,
  removeTile,
  clearTiles,
  setDrawnTile,
  setTiles,
  reorderTile,
} from '../slices/handSlice';
import { trpc } from '../trpc';
import { TilePicker } from './TilePicker';
import { TileRack } from './TileRack';
import { ViableHandCard, ViableHandData, CallHighlight } from './ViableHandCard';
import { Tile } from './Tile';
import { theme, type Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  analyzer: {
    display: 'flex',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  leftPanel: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  rightPanel: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    maxWidth: '332px',
  },
  logo: {
    height: '100px',
    maxWidth: '100%',
    objectFit: 'contain',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionIcon: {
    color: theme.colors.primary,
  },
  placeholder: {
    textAlign: 'center',
    padding: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
  tip: {
    backgroundColor: 'rgba(184, 74, 74, 0.1)',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    borderLeft: `3px solid ${theme.colors.primary}`,
    maxWidth: '332px',
  },
  resultsList: {
    maxHeight: '600px',
    overflowY: 'auto',
  },
  adviceBox: {
    backgroundColor: 'rgba(184, 74, 74, 0.1)',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeft: `3px solid ${theme.colors.primary}`,
  },
  adviceLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  adviceText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    lineHeight: 1.5,
    margin: 0,
  },
  adviceLoading: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  loading: {
    textAlign: 'center',
    padding: theme.spacing.lg,
    color: theme.colors.textMuted,
  },
  error: {
    textAlign: 'center',
    padding: theme.spacing.lg,
    color: theme.colors.error,
  },
  callableSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing.md,
  },
  callableTiles: {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  callableTile: {
    position: 'relative',
    cursor: 'pointer',
    borderRadius: theme.borderRadius.sm,
    padding: '2px',
    border: '2px solid transparent',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: theme.colors.primary,
      transform: 'scale(1.05)',
    },
  },
  callableTileSelected: {
    borderColor: theme.colors.primary,
    boxShadow: '0 0 8px rgba(184, 74, 74, 0.5)',
  },
  callableTileBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: theme.colors.primary,
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
  },
  callableEmpty: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
  callableLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  callCount: {
    backgroundColor: theme.colors.primary,
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  // Hide on mobile
  hideOnMobile: {
    display: 'block',
  },
  '@media (max-width: 900px)': {
    analyzer: {
      flexDirection: 'column',
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    logo: {
      height: '80px',
    },
    // Hide header on mobile
    hideOnMobile: {
      display: 'none',
    },
  },
  '@media (max-width: 480px)': {
    analyzer: {
      padding: theme.spacing.sm,
    },
    section: {
      padding: theme.spacing.sm,
    },
    callableSection: {
      padding: theme.spacing.sm,
    },
    callableTiles: {
      gap: theme.spacing.xs,
    },
  },
}));

type InputMode = 'hand' | 'drawn';

export function HandAnalyzer() {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const tiles = useAppSelector(selectHandTiles);
  const drawnTile = useAppSelector(selectDrawnTile);
  const exposedMelds = useAppSelector(selectExposedMelds);
  const isHandFull = useAppSelector(selectIsHandFull);

  const [inputMode, setInputMode] = useState<InputMode>('hand');
  const [selectedCallableTile, setSelectedCallableTile] = useState<number | null>(null);

  // Query for analysis
  const { data: analysisData, isLoading, error } = trpc.analysis.analyzeHand.useQuery(
    {
      playerState: {
        tiles,
        drawnTile: drawnTile ?? undefined,
        exposedMelds,
      },
      maxResults: 10,
    },
    {
      enabled: tiles.length >= 3, // Only analyze when we have at least 3 tiles
      refetchOnWindowFocus: false,
    }
  );

  // Query for strategic advice
  const { data: adviceData, isLoading: adviceLoading } = trpc.analysis.getAdvice.useQuery(
    {
      playerState: {
        tiles,
        drawnTile: drawnTile ?? undefined,
        exposedMelds,
      },
    },
    {
      enabled: tiles.length >= 3,
      refetchOnWindowFocus: false,
      staleTime: 30000, // Don't refetch advice too frequently
    }
  );

  // Query for callable tiles
  const { data: callableData } = trpc.analysis.getCallableTiles.useQuery(
    {
      playerState: {
        tiles,
        drawnTile: drawnTile ?? undefined,
        exposedMelds,
      },
    },
    {
      enabled: tiles.length >= 3,
      refetchOnWindowFocus: false,
    }
  );

  const handleTileSelect = (tile: TileCode) => {
    if (inputMode === 'hand') {
      if (!isHandFull) {
        dispatch(addTile(tile));
      }
    } else {
      dispatch(setDrawnTile(tile));
    }
  };

  const handleTileClick = (_tile: TileCode, index: number) => {
    if (index === -1) {
      // Discarding the drawn tile
      dispatch(setDrawnTile(null));
    } else {
      // Discarding from hand - also clear the drawn tile (completes the turn)
      dispatch(removeTile(index));
      dispatch(setDrawnTile(null));
    }
  };

  const handleClear = () => {
    dispatch(clearTiles());
    dispatch(setDrawnTile(null));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    dispatch(reorderTile({ fromIndex, toIndex }));
  };

  const handleAddTileAtPosition = (tile: number, atIndex?: number) => {
    if (atIndex === -1) {
      // Special case: drop on draw slot in Gameplay mode
      dispatch(setDrawnTile(tile));
    } else if (atIndex !== undefined) {
      dispatch(insertTileAt({ tile, index: atIndex }));
    } else {
      dispatch(addTile(tile));
    }
  };

  const handleRemoveTileByIndex = (index: number) => {
    dispatch(removeTile(index));
  };

  const handleOrganizeTiles = (fullHandTiles: number[]) => {
    // Reorder the player's tiles to match the order in fullHandTiles
    // Create a copy of player's tiles to work with
    const remaining = [...tiles];
    const organized: number[] = [];

    // Go through fullHandTiles and pick matching tiles from remaining
    for (const targetTile of fullHandTiles) {
      const idx = remaining.indexOf(targetTile);
      if (idx !== -1) {
        organized.push(remaining[idx]);
        remaining.splice(idx, 1);
      }
    }

    // Add any remaining tiles that weren't in fullHandTiles (shouldn't happen normally)
    organized.push(...remaining);

    dispatch(setTiles(organized));
  };

  const results: ViableHandData[] = analysisData?.results ?? [];
  const callableTiles = callableData?.callableTiles ?? [];

  // Compute call highlights for each hand based on selected callable tile
  const getCallHighlight = (handId: number): CallHighlight | undefined => {
    if (!selectedCallableTile) return undefined;

    const callableEntry = callableTiles.find(ct => ct.tile === selectedCallableTile);
    if (!callableEntry) return undefined;

    const callForHand = callableEntry.calls.find(c => c.handId === handId);
    if (!callForHand) return undefined;

    return {
      handId: callForHand.handId,
      callType: callForHand.callType,
      exposedTiles: callForHand.exposedTiles,
    };
  };

  // Handle callable tile click
  const handleCallableTileClick = (tile: number) => {
    setSelectedCallableTile(prev => prev === tile ? null : tile);
  };

  // Compute disabled tiles (tiles that have reached their max count)
  const disabledTiles = (() => {
    // Collect all tiles in use
    const allTiles: TileCode[] = [...tiles];
    if (drawnTile) {
      allTiles.push(drawnTile);
    }
    for (const meld of exposedMelds) {
      allTiles.push(...meld.tiles);
    }

    // Count tiles by normalized code (flowers/jokers are equivalent)
    const counts = new Map<TileCode, number>();
    for (const tile of allTiles) {
      const normalized = normalizeTileForCounting(tile);
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }

    // Find tiles that have reached their max
    const disabled = new Set<TileCode>();
    for (const [normalizedTile, count] of counts) {
      if (count >= getMaxTileCount(normalizedTile)) {
        disabled.add(normalizedTile);
      }
    }

    return disabled;
  })();

  // Callable tiles content (rendered in two places for mobile/desktop layout)
  const renderCallableTiles = () => (
    <>
      <h2 className={classes.sectionTitle}>
        Tiles Callable When Discarded ({callableTiles.length})
      </h2>
      {callableTiles.length === 0 ? (
        <p className={classes.callableEmpty}>
          No tiles can be called right now. You need more matching tiles in your hand to make a call.
        </p>
      ) : (
        <div className={classes.callableTiles}>
          {callableTiles.map((ct) => (
            <div
              key={ct.tile}
              className={`${classes.callableTile} ${selectedCallableTile === ct.tile ? classes.callableTileSelected : ''}`}
              onClick={() => handleCallableTileClick(ct.tile)}
              title={`${ct.calls.length} hand${ct.calls.length !== 1 ? 's' : ''} can call this`}
            >
              <Tile code={ct.tile} size="medium" />
              <div className={classes.callableTileBadge}>{ct.calls.length}</div>
            </div>
          ))}
        </div>
      )}
      {selectedCallableTile && (
        <p className={classes.callableLabel} style={{ marginTop: '8px' }}>
          Highlighted hands below show which tiles you would expose when making this call.
        </p>
      )}
    </>
  );

  return (
    <div className={classes.analyzer}>
      <div className={classes.leftPanel}>
        {/* Header - hidden on mobile */}
        <div className={`${classes.header} ${classes.hideOnMobile}`}>
          <img src="/mjb_logo.png" alt="Mah Jongg Buddy" className={classes.logo} />
        </div>

        <TileRack
          tiles={tiles}
          drawnTile={drawnTile ?? undefined}
          onTileClick={handleTileClick}
          onClear={handleClear}
          onReorder={handleReorder}
          onAddTile={handleAddTileAtPosition}
          onRemoveTile={handleRemoveTileByIndex}
          mode={inputMode}
          onModeChange={setInputMode}
        />

        <TilePicker
          onTileSelect={handleTileSelect}
          disabledTiles={disabledTiles}
        />

        <div className={`${classes.tip} ${classes.hideOnMobile}`}>
          <strong>Tip:</strong> Click tiles in your hand to remove them. The analysis updates automatically as you add tiles.
        </div>
      </div>

      <div className={classes.rightPanel}>
        {/* Callable Tiles Section */}
        {tiles.length >= 3 && (
          <div className={classes.callableSection}>
            {renderCallableTiles()}
          </div>
        )}

        {/* Recommended Hands Section */}
        <div className={classes.section}>
          <h2 className={classes.sectionTitle}>
            Recommended Hands ({results.length} viable)
          </h2>

          {tiles.length >= 3 && (
            <div className={classes.adviceBox}>
              <div className={classes.adviceLabel}>
                <span>&#128161;</span> Strategy
              </div>
              {adviceLoading ? (
                <p className={classes.adviceLoading}>Analyzing your hand...</p>
              ) : (
                <p className={classes.adviceText}>{adviceData?.advice}</p>
              )}
            </div>
          )}

          {tiles.length < 3 ? (
            <div className={classes.placeholder}>
              No recommendations available
            </div>
          ) : isLoading ? (
            <div className={classes.loading}>Analyzing hands...</div>
          ) : error ? (
            <div className={classes.error}>Error analyzing hand. Please try again.</div>
          ) : results.length === 0 ? (
            <div className={classes.placeholder}>
              <p>No viable hands found with current tiles.</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                Try adding more tiles or different combinations.
              </p>
            </div>
          ) : (
            <div className={classes.resultsList}>
              {results.map((result, index) => (
                <ViableHandCard
                  key={result.handId}
                  data={result}
                  rank={index + 1}
                  callHighlight={getCallHighlight(result.handId)}
                  onOrganize={handleOrganizeTiles}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
