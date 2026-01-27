import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { TileCode, getMaxTileCount, normalizeTileForCounting, isJoker } from 'common';
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
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    width: 'fit-content',
  },
  sectionTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionCount: {
    fontWeight: 'normal',
    color: theme.colors.textSecondary,
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
  resultsList: {
    maxHeight: '600px',
    overflowY: 'auto',
  },
  adviceBox: {
    backgroundColor: 'rgba(76, 133, 87, 0.85)',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    borderLeft: `3px solid #2E7D32`,
    width: '332px',
    boxSizing: 'content-box',
  },
  adviceLabel: {
    fontSize: theme.fontSizes.sm,
    color: '#E8F5E9',
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': {
      opacity: 0.8,
    },
  },
  adviceLabelCollapsed: {
    marginBottom: 0,
  },
  collapseIcon: {
    fontSize: '10px',
    transition: 'transform 0.2s',
  },
  collapseIconRotated: {
    transform: 'rotate(-90deg)',
  },
  adviceText: {
    fontSize: theme.fontSizes.md,
    color: '#FFFFFF',
    lineHeight: 1.5,
    margin: 0,
  },
  adviceLoading: {
    fontSize: theme.fontSizes.sm,
    color: '#C8E6C9',
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
    marginBottom: theme.spacing.sm,
    width: '332px',
    boxSizing: 'content-box',
  },
  callableTiles: {
    display: 'flex',
    gap: '1px',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  callableTile: {
    position: 'relative',
    cursor: 'pointer',
    borderRadius: theme.borderRadius.sm,
    border: '2px solid transparent',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: theme.colors.primary,
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
    backgroundColor: '#4CAF50',
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
    section: {
      // Match left panel widths (TileRack, TilePicker, etc.)
      width: '332px',
      boxSizing: 'content-box',
    },
    hideOnMobile: {
      display: 'none',
    },
  },
  '@media (max-width: 480px)': {
    analyzer: {
      padding: theme.spacing.sm,
    },
    adviceBox: {
      width: '264px',
    },
    section: {
      padding: theme.spacing.sm,
      width: '264px',
    },
    callableSection: {
      padding: theme.spacing.sm,
      width: '264px',
    },
    callableTiles: {
      gap: theme.spacing.xs,
    },
  },
}));

type InputMode = 'hand' | 'charleston' | 'drawn';

export function HandAnalyzer() {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const tiles = useAppSelector(selectHandTiles);
  const drawnTile = useAppSelector(selectDrawnTile);
  const exposedMelds = useAppSelector(selectExposedMelds);
  const isHandFull = useAppSelector(selectIsHandFull);

  const [inputMode, setInputMode] = useState<InputMode>('hand');
  const [selectedCallableTile, setSelectedCallableTile] = useState<number | null>(null);
  const [strategyCollapsed, setStrategyCollapsed] = useState(false);
  const [charlestonSelected, setCharlestonSelected] = useState<Set<number>>(new Set());

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
    } else if (inputMode === 'charleston') {
      // Charleston mode: add tiles when refilling (hand not full)
      if (!isHandFull) {
        dispatch(addTile(tile));
      }
    } else {
      // Gameplay mode: set as drawn tile
      dispatch(setDrawnTile(tile));
    }
  };

  const handleTileClick = (_tile: TileCode, index: number) => {
    if (index === -1) {
      // Discarding the drawn tile
      dispatch(setDrawnTile(null));
    } else if (inputMode === 'charleston') {
      // Charleston mode: toggle tile selection (max 3), but only when hand is full
      if (!isHandFull) return; // Can't select tiles when refilling
      setCharlestonSelected(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else if (newSet.size < 3) {
          newSet.add(index);
        }
        return newSet;
      });
    } else if (inputMode === 'drawn' && drawnTile !== null) {
      // Gameplay mode: discard from hand and insert drawn tile at that position
      dispatch(removeTile(index));
      dispatch(insertTileAt({ tile: drawnTile, index }));
      dispatch(setDrawnTile(null));
    } else {
      // Set Hand mode: just remove the tile
      dispatch(removeTile(index));
    }
  };

  const handleClear = () => {
    dispatch(clearTiles());
    dispatch(setDrawnTile(null));
    setCharlestonSelected(new Set());
  };

  const handleModeChange = (newMode: InputMode) => {
    setInputMode(newMode);
    setCharlestonSelected(new Set()); // Clear selection when changing modes
  };

  const handleCharlestonPass = () => {
    // Remove the selected tiles from hand (in reverse order to maintain indices)
    const selectedIndices = Array.from(charlestonSelected).sort((a, b) => b - a);
    for (const index of selectedIndices) {
      dispatch(removeTile(index));
    }
    setCharlestonSelected(new Set());
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

  // Compute usage stats for each tile position in the player's hand
  // Returns { count: number of hands using this tile, minDistance: closest hand distance }
  const tileUsageStats: { count: number; minDistance: number }[] = tiles.map((tile, index) => {
    // Count how many times this tile appears before this index (to handle duplicates)
    const occurrenceBefore = tiles.slice(0, index).filter(t => t === tile).length;

    // Find hands that use this tile and track count + minimum distance
    let count = 0;
    let minDistance = Infinity;
    for (const result of results) {
      const countInHand = result.fullHandTiles.filter(t => t === tile).length;
      if (countInHand > occurrenceBefore) {
        count++;
        if (result.distance < minDistance) {
          minDistance = result.distance;
        }
      }
    }
    return { count, minDistance: minDistance === Infinity ? 0 : minDistance };
  });

  // Compute Charleston pass order - which tiles to pass (1, 2, 3) based on least value to keep
  const charlestonPassData = (() => {
    if (inputMode !== 'charleston' || results.length === 0) {
      return { passOrder: tiles.map(() => undefined as number | undefined), strategyText: '' };
    }

    // Calculate a "keep score" for each tile - higher = more valuable to keep
    // Skip Jokers - never recommend passing them
    const keepScores = tileUsageStats
      .map((stats, index) => ({
        index,
        tile: tiles[index],
        count: stats.count,
        minDistance: stats.minDistance,
        // Keep score: prioritize tiles used by more hands, then by closer hands
        // count * 100 gives strong weight to number of hands
        // (10 - minDistance) rewards tiles with closer hands (minDistance typically 0-10)
        keepScore: stats.count * 100 + (stats.count > 0 ? (10 - Math.min(stats.minDistance, 10)) : 0),
        isJoker: isJoker(tiles[index]),
      }))
      .filter(item => !item.isJoker); // Never recommend passing Jokers

    // Sort by keep score ascending (lowest = best to pass)
    const sorted = [...keepScores].sort((a, b) => a.keepScore - b.keepScore);

    // Check if there are any non-Joker tiles to consider
    if (sorted.length === 0) {
      return {
        passOrder: tiles.map(() => undefined as number | undefined),
        strategyText: 'Keep your Jokers! Pass any non-Joker tiles you prefer.',
      };
    }

    // Check if there's meaningful difference
    const minScore = sorted[0]?.keepScore ?? 0;
    const maxScore = sorted[sorted.length - 1]?.keepScore ?? 0;

    if (minScore === maxScore) {
      return {
        passOrder: tiles.map(() => undefined as number | undefined),
        strategyText: 'All non-Joker tiles have equal value for your recommended hands. Pass any you prefer (but keep Jokers!).',
      };
    }

    // Assign pass order to tiles that are clearly less valuable
    const passOrder: (number | undefined)[] = new Array(tiles.length).fill(undefined);
    const passReasons: string[] = [];
    let currentOrder = 1;

    for (const item of sorted) {
      if (currentOrder > 3) break;

      // Only mark if this tile is less valuable than the best tiles
      if (item.keepScore >= maxScore * 0.8) break; // Stop if within 80% of max value

      passOrder[item.index] = currentOrder;

      // Generate reason text
      if (item.count === 0) {
        passReasons.push(`#${currentOrder}: Not used by any recommended hand`);
      } else if (item.minDistance >= 5) {
        passReasons.push(`#${currentOrder}: Only helps distant hands (${item.minDistance} away)`);
      } else {
        passReasons.push(`#${currentOrder}: Used by fewer hands (${item.count})`);
      }

      currentOrder++;
    }

    const strategyText = passReasons.length > 0
      ? `Pass suggestions:\n${passReasons.join('\n')}`
      : 'All tiles contribute to your recommended hands. Consider which hands you want to pursue.';

    return { passOrder, strategyText };
  })();

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
      <div className={classes.sectionTitle}>
        <span>Callable Discard Tiles</span>
        <span className={classes.sectionCount}>({callableTiles.length})</span>
      </div>
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
        {/* Strategy Tip Section - only in Charleston and Gameplay modes */}
        {(inputMode === 'charleston' || inputMode === 'drawn') && tiles.length >= 3 && (
          <div className={classes.adviceBox}>
            <div
              className={`${classes.adviceLabel} ${strategyCollapsed ? classes.adviceLabelCollapsed : ''}`}
              onClick={() => setStrategyCollapsed(!strategyCollapsed)}
            >
              <span className={`${classes.collapseIcon} ${strategyCollapsed ? classes.collapseIconRotated : ''}`}>&#9660;</span>
              <span>&#128161;</span> {inputMode === 'charleston' ? 'Charleston' : 'Strategy'}
            </div>
            {!strategyCollapsed && (
              inputMode === 'charleston' ? (
                <p className={classes.adviceText} style={{ whiteSpace: 'pre-line' }}>
                  {charlestonPassData.strategyText || 'Add tiles to see pass suggestions.'}
                </p>
              ) : adviceLoading ? (
                <p className={classes.adviceLoading}>Analyzing your hand...</p>
              ) : (
                <p className={classes.adviceText}>{adviceData?.advice}</p>
              )
            )}
          </div>
        )}

        {/* Callable Tiles Section - only in Gameplay mode */}
        {inputMode === 'drawn' && tiles.length >= 3 && (
          <div className={classes.callableSection}>
            {renderCallableTiles()}
          </div>
        )}

        <TileRack
          tiles={tiles}
          drawnTile={drawnTile ?? undefined}
          onTileClick={handleTileClick}
          onClear={handleClear}
          onReorder={handleReorder}
          onAddTile={handleAddTileAtPosition}
          onRemoveTile={handleRemoveTileByIndex}
          tileUsageStats={tileUsageStats}
          charlestonPassOrder={charlestonPassData.passOrder}
          charlestonSelected={charlestonSelected}
          onCharlestonPass={handleCharlestonPass}
          isHandFull={isHandFull}
          mode={inputMode}
          onModeChange={handleModeChange}
        />

        <TilePicker
          onTileSelect={handleTileSelect}
          disabledTiles={disabledTiles}
        />

      </div>

      {/* Recommended Hands Section - only in Charleston and Gameplay modes */}
      {(inputMode === 'charleston' || inputMode === 'drawn') && (
        <div className={classes.rightPanel}>
          <div className={classes.section}>
          <div className={classes.sectionTitle}>
            <span>Recommended Hands</span>
            <span className={classes.sectionCount}>({results.length} viable)</span>
          </div>

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
      )}
    </div>
  );
}
