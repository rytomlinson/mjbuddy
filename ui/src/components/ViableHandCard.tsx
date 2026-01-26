import { createUseStyles } from 'react-jss';
import { TileCode } from 'common';
import { Tile } from './Tile';
import type { Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing.sm,
    transition: 'border-color 0.2s',
    '&:hover': {
      borderColor: theme.colors.primary,
    },
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  handInfo: {
    flex: 1,
  },
  handName: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    margin: 0,
    marginBottom: theme.spacing.xs,
  },
  pattern: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    margin: 0,
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  distance: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  distanceLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  distanceValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
  },
  distanceGood: {
    backgroundColor: '#2E7D32',
    color: 'white',
  },
  distanceMedium: {
    backgroundColor: '#F9A825',
    color: 'black',
  },
  distanceFar: {
    backgroundColor: '#C62828',
    color: 'white',
  },
  points: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  viability: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  viabilityLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  viabilityBar: {
    width: '60px',
    height: '6px',
    backgroundColor: theme.colors.surfaceHover,
    borderRadius: '3px',
    overflow: 'hidden',
  },
  viabilityFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s',
  },
  viabilityHigh: {
    backgroundColor: '#4CAF50',
  },
  viabilityMedium: {
    backgroundColor: '#FFC107',
  },
  viabilityLow: {
    backgroundColor: '#FF5252',
  },
  tags: {
    display: 'flex',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  tag: {
    fontSize: theme.fontSizes.sm,
    padding: `2px ${theme.spacing.xs}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceHover,
    color: theme.colors.textSecondary,
  },
  tagConcealed: {
    backgroundColor: 'rgba(142, 36, 170, 0.2)',
    color: '#CE93D8',
  },
  tilesSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTop: `1px solid ${theme.colors.border}`,
  },
  tilesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tilesLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  legend: {
    display: 'flex',
    gap: theme.spacing.md,
    fontSize: theme.fontSizes.sm,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDotHave: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
  },
  legendDotNeed: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#FF5252',
  },
  legendText: {
    color: theme.colors.textMuted,
  },
  allTiles: {
    display: 'flex',
    gap: '3px',
    flexWrap: 'wrap',
  },
  tileWrapper: {
    position: 'relative',
  },
  tileHave: {
    opacity: 1,
    boxShadow: '0 0 0 2px #4CAF50',
    borderRadius: theme.borderRadius.sm,
  },
  tileNeed: {
    opacity: 0.6,
    boxShadow: '0 0 0 2px #FF5252',
    borderRadius: theme.borderRadius.sm,
  },
  tileIndicator: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  indicatorHave: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  indicatorNeed: {
    backgroundColor: '#FF5252',
    color: 'white',
  },
  // Mobile responsive
  '@media (max-width: 480px)': {
    card: {
      padding: theme.spacing.sm,
    },
    cardTop: {
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    stats: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    handName: {
      fontSize: theme.fontSizes.sm,
    },
    pattern: {
      fontSize: '11px',
    },
    distanceValue: {
      fontSize: theme.fontSizes.md,
      padding: `2px ${theme.spacing.xs}`,
    },
    allTiles: {
      gap: '2px',
    },
    legend: {
      gap: theme.spacing.sm,
      fontSize: '10px',
    },
    tileIndicator: {
      width: '12px',
      height: '12px',
      fontSize: '8px',
      top: '-3px',
      right: '-3px',
    },
  },
}));

export interface ViableHandData {
  handId: number;
  handName: string;
  displayPattern: string;
  distance: number;
  points: number;
  isConcealed: boolean;
  neededTiles: TileCode[];
  fullHandTiles: TileCode[];
  jokersUsable: number;
  probability: number;
  viabilityScore: number;
}

interface ViableHandCardProps {
  data: ViableHandData;
  rank: number;
}

export function ViableHandCard({ data, rank }: ViableHandCardProps) {
  const classes = useStyles();

  const getDistanceClass = () => {
    if (data.distance <= 2) return classes.distanceGood;
    if (data.distance <= 4) return classes.distanceMedium;
    return classes.distanceFar;
  };

  const getViabilityClass = () => {
    if (data.viabilityScore >= 50) return classes.viabilityHigh;
    if (data.viabilityScore >= 20) return classes.viabilityMedium;
    return classes.viabilityLow;
  };

  return (
    <div className={classes.card}>
      <div className={classes.cardTop}>
        <div className={classes.handInfo}>
          <h3 className={classes.handName}>
            #{rank} {data.handName}
          </h3>
          <p className={classes.pattern}>{data.displayPattern}</p>
        </div>
        <div className={classes.stats}>
          <div className={classes.distance}>
            <span className={classes.distanceLabel}>tiles away</span>
            <span className={`${classes.distanceValue} ${getDistanceClass()}`}>
              {data.distance}
            </span>
          </div>
          <span className={classes.points}>{data.points} pts</span>
          <div className={classes.viability}>
            <span className={classes.viabilityLabel}>viability</span>
            <div className={classes.viabilityBar}>
              <div
                className={`${classes.viabilityFill} ${getViabilityClass()}`}
                style={{ width: `${Math.round(data.viabilityScore)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={classes.tags}>
        {data.isConcealed && (
          <span className={`${classes.tag} ${classes.tagConcealed}`}>Concealed</span>
        )}
        {data.jokersUsable > 0 && (
          <span className={classes.tag}>{data.jokersUsable} joker{data.jokersUsable > 1 ? 's' : ''} help</span>
        )}
      </div>

      {data.fullHandTiles.length > 0 && (
        <div className={classes.tilesSection}>
          <div className={classes.tilesHeader}>
            <span className={classes.tilesLabel}>Complete hand:</span>
            <div className={classes.legend}>
              <div className={classes.legendItem}>
                <div className={classes.legendDotHave} />
                <span className={classes.legendText}>Have</span>
              </div>
              <div className={classes.legendItem}>
                <div className={classes.legendDotNeed} />
                <span className={classes.legendText}>Need</span>
              </div>
            </div>
          </div>
          <div className={classes.allTiles}>
            {(() => {
              // Create a copy of needed tiles to track which are still needed
              const neededCopy = [...data.neededTiles];

              return data.fullHandTiles.map((tile, i) => {
                // Check if this tile is in the needed list
                const neededIndex = neededCopy.indexOf(tile);
                const isNeeded = neededIndex !== -1;

                // Remove from needed copy so we don't double-count
                if (isNeeded) {
                  neededCopy.splice(neededIndex, 1);
                }

                return (
                  <div key={i} className={classes.tileWrapper}>
                    <div className={isNeeded ? classes.tileNeed : classes.tileHave}>
                      <Tile code={tile} size="small" />
                    </div>
                    <div className={`${classes.tileIndicator} ${isNeeded ? classes.indicatorNeed : classes.indicatorHave}`}>
                      {isNeeded ? '?' : '\u2713'}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
