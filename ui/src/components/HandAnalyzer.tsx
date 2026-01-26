import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { TileCode } from 'common';
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
import { ViableHandCard, ViableHandData } from './ViableHandCard';
import { CallAdvisor } from './CallAdvisor';
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
  tabs: {
    display: 'flex',
    borderBottom: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    fontSize: theme.fontSizes.md,
    fontWeight: 500,
    transition: 'all 0.2s',
    '&:hover': {
      color: theme.colors.text,
      backgroundColor: theme.colors.surfaceHover,
    },
  },
  tabActive: {
    color: theme.colors.primary,
    borderBottomColor: theme.colors.primary,
    '&:hover': {
      color: theme.colors.primary,
    },
  },
  '@media (max-width: 900px)': {
    analyzer: {
      gridTemplateColumns: '1fr',
    },
  },
}));

type InputMode = 'hand' | 'drawn';
type ActiveTab = 'analysis' | 'calls';

export function HandAnalyzer() {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const tiles = useAppSelector(selectHandTiles);
  const drawnTile = useAppSelector(selectDrawnTile);
  const exposedMelds = useAppSelector(selectExposedMelds);
  const isHandFull = useAppSelector(selectIsHandFull);

  const [inputMode, setInputMode] = useState<InputMode>('hand');
  const [activeTab, setActiveTab] = useState<ActiveTab>('analysis');

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

  return (
    <div className={classes.analyzer}>
      <div className={classes.leftPanel}>
        <div className={classes.headerRow}>
          <div className={classes.header}>
            <h1 className={classes.title}>Mah Jongg Buddy</h1>
            <p className={classes.subtitle}>Enter your tiles to find the best hands</p>
          </div>
          <button className={classes.resetButton} onClick={handleReset}>
            Reset All
          </button>
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
          <TilePicker onTileSelect={handleTileSelect} />
        </div>

        <div className={classes.tip}>
          <strong>Tip:</strong> Click tiles in your hand to remove them. The analysis updates automatically as you add tiles.
        </div>
      </div>

      <div className={classes.rightPanel}>
        <div className={classes.tabs}>
          <button
            className={`${classes.tab} ${activeTab === 'analysis' ? classes.tabActive : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            Hand Analysis
          </button>
          <button
            className={`${classes.tab} ${activeTab === 'calls' ? classes.tabActive : ''}`}
            onClick={() => setActiveTab('calls')}
          >
            Call Advisor
          </button>
        </div>

        {activeTab === 'analysis' ? (
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
                  <ViableHandCard key={result.handId} data={result} rank={index + 1} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <CallAdvisor />
        )}
      </div>
    </div>
  );
}
