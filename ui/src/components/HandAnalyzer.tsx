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
  removeTile,
  clearTiles,
  setDrawnTile,
  resetHand,
} from '../slices/handSlice';
import { trpc } from '../trpc';
import { TilePicker } from './TilePicker';
import { TileRack } from './TileRack';
import { ViableHandCard, ViableHandData, CallHighlight } from './ViableHandCard';
import { Tile } from './Tile';
import type { Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  analyzer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.text,
    margin: 0,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    margin: 0,
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
    color: theme.colors.text,
    '&:hover': {
      backgroundColor: theme.colors.primaryHover,
    },
  },
  placeholder: {
    textAlign: 'center',
    padding: theme.spacing.xl,
    color: theme.colors.textMuted,
  },
  placeholderIcon: {
    fontSize: '48px',
    marginBottom: theme.spacing.md,
    opacity: 0.5,
  },
  tip: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    borderLeft: `3px solid ${theme.colors.primary}`,
  },
  resultsList: {
    maxHeight: '600px',
    overflowY: 'auto',
  },
  adviceBox: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
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
  resetButton: {
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    cursor: 'pointer',
    fontSize: theme.fontSizes.sm,
    '&:hover': {
      backgroundColor: theme.colors.surfaceHover,
      color: theme.colors.error,
    },
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerControls: {
    display: 'flex',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  yearSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  yearLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  yearSelect: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    fontSize: theme.fontSizes.sm,
    cursor: 'pointer',
    '&:hover': {
      borderColor: theme.colors.primary,
    },
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
    },
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
    boxShadow: '0 0 8px rgba(255, 107, 0, 0.5)',
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
  '@media (max-width: 900px)': {
    analyzer: {
      gridTemplateColumns: '1fr',
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    title: {
      fontSize: theme.fontSizes.xl,
    },
    subtitle: {
      fontSize: theme.fontSizes.sm,
    },
    headerRow: {
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    resetButton: {
      alignSelf: 'flex-start',
    },
  },
  '@media (max-width: 480px)': {
    analyzer: {
      padding: theme.spacing.sm,
    },
    section: {
      padding: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSizes.lg,
    },
    modeButton: {
      padding: theme.spacing.xs,
      fontSize: theme.fontSizes.sm,
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
  const [selectedYearId, setSelectedYearId] = useState<number | undefined>(undefined);
  const [selectedCallableTile, setSelectedCallableTile] = useState<number | null>(null);

  // Query for card years
  const { data: cardYears } = trpc.cardYear.list.useQuery();

  // Query for analysis
  const { data: analysisData, isLoading, error } = trpc.analysis.analyzeHand.useQuery(
    {
      playerState: {
        tiles,
        drawnTile: drawnTile ?? undefined,
        exposedMelds,
      },
      cardYearId: selectedYearId,
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
      cardYearId: selectedYearId,
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
      cardYearId: selectedYearId,
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
      dispatch(setDrawnTile(null));
    } else {
      dispatch(removeTile(index));
    }
  };

  const handleClear = () => {
    dispatch(clearTiles());
    dispatch(setDrawnTile(null));
  };

  const handleReset = () => {
    dispatch(resetHand());
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

  return (
    <div className={classes.analyzer}>
      <div className={classes.leftPanel}>
        <div className={classes.headerRow}>
          <div className={classes.header}>
            <h1 className={classes.title}>Mah Jongg Buddy</h1>
            <p className={classes.subtitle}>Enter your tiles to find the best hands</p>
          </div>
          <div className={classes.headerControls}>
            <div className={classes.yearSelector}>
              <span className={classes.yearLabel}>Card:</span>
              <select
                className={classes.yearSelect}
                value={selectedYearId ?? ''}
                onChange={(e) => setSelectedYearId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Active Year</option>
                {cardYears?.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year} {year.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <button className={classes.resetButton} onClick={handleReset}>
              Reset All
            </button>
          </div>
        </div>

        <TileRack
          tiles={tiles}
          drawnTile={drawnTile ?? undefined}
          onTileClick={handleTileClick}
          onClear={handleClear}
        />

        <div>
          <div className={classes.modeToggle}>
            <button
              className={`${classes.modeButton} ${inputMode === 'hand' ? classes.modeButtonActive : ''}`}
              onClick={() => setInputMode('hand')}
            >
              Add to Hand
            </button>
            <button
              className={`${classes.modeButton} ${inputMode === 'drawn' ? classes.modeButtonActive : ''}`}
              onClick={() => setInputMode('drawn')}
            >
              Set Drawn Tile
            </button>
          </div>
          <TilePicker onTileSelect={handleTileSelect} disabledTiles={disabledTiles} />
        </div>

        <div className={classes.tip}>
          <strong>Tip:</strong> Click tiles in your hand to remove them. The analysis updates automatically as you add tiles.
        </div>
      </div>

      <div className={classes.rightPanel}>
        {/* Callable Tiles Section */}
        {tiles.length >= 3 && (
          <div className={classes.callableSection}>
            <h2 className={classes.sectionTitle}>
              <span className={classes.sectionIcon}>&#128227;</span>
              Callable Tiles
              {callableTiles.length > 0 && (
                <span className={classes.callCount}>{callableTiles.length}</span>
              )}
            </h2>
            <p className={classes.callableLabel}>
              Tiles you can call if discarded:
            </p>
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
                  </div>
                ))}
              </div>
            )}
            {callableTiles.length > 0 && (
              <p className={classes.callableLabel} style={{ marginTop: '8px' }}>
                {selectedCallableTile
                  ? 'Highlighted hands below show which tiles you would expose when making this call.'
                  : 'Click a tile to see which hands you can call it for.'}
              </p>
            )}
          </div>
        )}

        {/* Recommended Hands Section */}
        <div className={classes.section}>
          <h2 className={classes.sectionTitle}>
            <span className={classes.sectionIcon}>&#128202;</span>
            Recommended Hands
            {results.length > 0 && (
              <span style={{ fontWeight: 'normal', fontSize: '14px', color: '#999', marginLeft: 'auto' }}>
                {results.length} viable hand{results.length !== 1 ? 's' : ''}
              </span>
            )}
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
              <div className={classes.placeholderIcon}>&#127000;</div>
              <p>Add at least 3 tiles to see recommendations</p>
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
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
