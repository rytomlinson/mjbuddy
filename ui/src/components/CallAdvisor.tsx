import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { TileCode, TileType, encodeTile, Wind, Dragon } from 'common';
import { useAppSelector } from '../hooks';
import {
  selectHandTiles,
  selectDrawnTile,
  selectExposedMelds,
} from '../slices/handSlice';
import { trpc } from '../trpc';
import { Tile } from './Tile';
import { CallAdviceCard, CallAdviceData } from './CallAdviceCard';
import type { Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  advisor: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
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
    color: theme.colors.success,
  },
  discardSection: {
    marginBottom: theme.spacing.md,
  },
  discardLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  selectedDiscard: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceHover,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  selectedLabel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  clearButton: {
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    cursor: 'pointer',
    fontSize: theme.fontSizes.sm,
    marginLeft: 'auto',
    '&:hover': {
      backgroundColor: theme.colors.surfaceHover,
      color: theme.colors.error,
    },
  },
  tileGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  tileRow: {
    display: 'flex',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  rowLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    minWidth: '60px',
    alignSelf: 'center',
  },
  resultsList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  placeholder: {
    textAlign: 'center',
    padding: theme.spacing.lg,
    color: theme.colors.textMuted,
  },
  placeholderIcon: {
    fontSize: '36px',
    marginBottom: theme.spacing.sm,
    opacity: 0.5,
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
  noCallsMessage: {
    textAlign: 'center',
    padding: theme.spacing.lg,
    color: theme.colors.textMuted,
  },
  winAlert: {
    backgroundColor: 'rgba(46, 125, 50, 0.2)',
    border: '2px solid #2E7D32',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  winAlertText: {
    color: '#4CAF50',
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
  },
  // Mobile responsive
  '@media (max-width: 480px)': {
    section: {
      padding: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.md,
    },
    tileGrid: {
      gap: theme.spacing.xs,
    },
    tileRow: {
      gap: '2px',
    },
    rowLabel: {
      minWidth: '45px',
      fontSize: '11px',
    },
    selectedDiscard: {
      padding: theme.spacing.xs,
      gap: theme.spacing.sm,
    },
    winAlert: {
      padding: theme.spacing.sm,
    },
    winAlertText: {
      fontSize: theme.fontSizes.md,
    },
  },
}));

interface CallAdvisorProps {
  cardYearId?: number;
}

export function CallAdvisor({ cardYearId }: CallAdvisorProps) {
  const classes = useStyles();
  const [discardedTile, setDiscardedTile] = useState<TileCode | null>(null);

  const tiles = useAppSelector(selectHandTiles);
  const drawnTile = useAppSelector(selectDrawnTile);
  const exposedMelds = useAppSelector(selectExposedMelds);

  // Query for call analysis
  const { data: callData, isLoading, error } = trpc.analysis.analyzeCall.useQuery(
    {
      discardedTile: discardedTile!,
      playerState: {
        tiles,
        drawnTile: drawnTile ?? undefined,
        exposedMelds,
      },
      cardYearId,
    },
    {
      enabled: discardedTile !== null && tiles.length >= 3,
      refetchOnWindowFocus: false,
    }
  );

  const handleTileClick = (tile: TileCode) => {
    setDiscardedTile(tile);
  };

  const handleClear = () => {
    setDiscardedTile(null);
  };

  const renderTileRow = (tileType: TileType, label: string, count: number = 9) => {
    const tilesList: TileCode[] = [];
    for (let i = 1; i <= count; i++) {
      tilesList.push(encodeTile(tileType, i));
    }

    return (
      <div className={classes.tileRow}>
        <span className={classes.rowLabel}>{label}</span>
        {tilesList.map((tile) => (
          <Tile
            key={tile}
            code={tile}
            size="small"
            selected={discardedTile === tile}
            onClick={() => handleTileClick(tile)}
          />
        ))}
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

  const calls: CallAdviceData[] = callData?.calls ?? [];
  const hasWinCall = calls.some((c) => c.callType === 'win');

  return (
    <div className={classes.advisor}>
      <div className={classes.section}>
        <h2 className={classes.sectionTitle}>
          <span className={classes.sectionIcon}>&#128226;</span>
          Call Advisor
        </h2>

        {tiles.length < 3 ? (
          <div className={classes.placeholder}>
            <div className={classes.placeholderIcon}>&#129464;</div>
            <p>Add at least 3 tiles to your hand first</p>
          </div>
        ) : (
          <>
            <div className={classes.discardSection}>
              <div className={classes.discardLabel}>
                Click a tile to check if you should call it:
              </div>

              {discardedTile && (
                <div className={classes.selectedDiscard}>
                  <span className={classes.selectedLabel}>Checking discard:</span>
                  <Tile code={discardedTile} size="medium" />
                  <button className={classes.clearButton} onClick={handleClear}>
                    Clear
                  </button>
                </div>
              )}

              <div className={classes.tileGrid}>
                {renderTileRow(TileType.DOT, 'Dots')}
                {renderTileRow(TileType.BAM, 'Bams')}
                {renderTileRow(TileType.CRAK, 'Craks')}
                <div className={classes.tileRow}>
                  <span className={classes.rowLabel}>Winds</span>
                  {windTiles.map((tile) => (
                    <Tile
                      key={tile}
                      code={tile}
                      size="small"
                      selected={discardedTile === tile}
                      onClick={() => handleTileClick(tile)}
                    />
                  ))}
                </div>
                <div className={classes.tileRow}>
                  <span className={classes.rowLabel}>Dragons</span>
                  {dragonTiles.map((tile) => (
                    <Tile
                      key={tile}
                      code={tile}
                      size="small"
                      selected={discardedTile === tile}
                      onClick={() => handleTileClick(tile)}
                    />
                  ))}
                </div>
                <div className={classes.tileRow}>
                  <span className={classes.rowLabel}>Special</span>
                  <Tile
                    code={flowerTile}
                    size="small"
                    selected={discardedTile === flowerTile}
                    onClick={() => handleTileClick(flowerTile)}
                  />
                </div>
              </div>
            </div>

            {discardedTile && (
              <div>
                {isLoading ? (
                  <div className={classes.loading}>Analyzing calls...</div>
                ) : error ? (
                  <div className={classes.error}>Error analyzing calls. Please try again.</div>
                ) : calls.length === 0 ? (
                  <div className={classes.noCallsMessage}>
                    <p>No calls available for this tile.</p>
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      This tile doesn't help any of your viable hands right now.
                    </p>
                  </div>
                ) : (
                  <>
                    {hasWinCall && (
                      <div className={classes.winAlert}>
                        <span className={classes.winAlertText}>
                          You can call MAH JONGG!
                        </span>
                      </div>
                    )}
                    <div className={classes.resultsList}>
                      {calls.map((call) => (
                        <CallAdviceCard
                          key={call.handId}
                          data={call}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
