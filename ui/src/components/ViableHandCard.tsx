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
    transition: 'all 0.2s',
    width: 'fit-content',
    '&:hover': {
      borderColor: theme.colors.primary,
    },
  },
  cardHighlighted: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(184, 74, 74, 0.1)',
    boxShadow: '0 0 12px rgba(184, 74, 74, 0.3)',
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
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rankBadge: {
    backgroundColor: theme.colors.textMuted,
    color: 'white',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    flexShrink: 0,
  },
  pattern: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  notesIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: theme.colors.textMuted,
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'help',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
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
  tagConcealed: {
    fontSize: theme.fontSizes.sm,
    padding: `2px ${theme.spacing.xs}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(142, 36, 170, 0.2)',
    color: '#CE93D8',
  },
  tagRevealed: {
    fontSize: theme.fontSizes.sm,
    padding: `2px ${theme.spacing.xs}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceHover,
    color: theme.colors.textSecondary,
  },
  handMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    margin: 0,
    marginTop: theme.spacing.xs,
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
  legendDotExpose: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#B84A4A',
  },
  legendText: {
    color: theme.colors.textMuted,
  },
  allTiles: {
    display: 'flex',
    gap: '3px',
    flexWrap: 'wrap',
    // 7 tiles per row: 7 * 32px + 6 * 3px gaps = 242px
    maxWidth: '242px',
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
  tileExposed: {
    boxShadow: '0 0 0 3px #B84A4A',
    borderRadius: theme.borderRadius.sm,
    animation: '$pulse 1.5s ease-in-out infinite',
  },
  indicatorExposed: {
    backgroundColor: '#B84A4A',
    color: 'white',
  },
  callBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    color: 'white',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  organizeIcon: {
    width: '32px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'all 0.2s',
    '& img': {
      width: '24px',
      height: '24px',
    },
    '&:hover': {
      opacity: 1,
      transform: 'scale(1.1)',
    },
  },
  '@keyframes pulse': {
    '0%, 100%': {
      boxShadow: '0 0 0 3px #B84A4A',
    },
    '50%': {
      boxShadow: '0 0 0 5px rgba(184, 74, 74, 0.5)',
    },
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
      // 7 tiles per row on mobile: 7 * 26px + 6 * 2px = 194px
      maxWidth: '194px',
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
  notes?: string | null;
}

export interface CallHighlight {
  handId: number;
  callType: string;
  exposedTiles: TileCode[];
}

interface ViableHandCardProps {
  data: ViableHandData;
  rank: number;
  callHighlight?: CallHighlight;
  onOrganize?: (fullHandTiles: TileCode[]) => void;
}

export function ViableHandCard({ data, rank, callHighlight, onOrganize }: ViableHandCardProps) {
  const classes = useStyles();

  const isHighlighted = callHighlight?.handId === data.handId;

  const getDistanceClass = () => {
    if (data.distance <= 2) return classes.distanceGood;
    if (data.distance <= 4) return classes.distanceMedium;
    return classes.distanceFar;
  };

  return (
    <div className={`${classes.card} ${isHighlighted ? classes.cardHighlighted : ''}`}>
      <div className={classes.cardTop}>
        <div className={classes.handInfo}>
          <h3 className={classes.handName}>
            <span className={classes.rankBadge}>{rank}</span>
            {data.handName}
            {isHighlighted && callHighlight && (
              <span className={classes.callBadge}>
                {callHighlight.callType}
              </span>
            )}
          </h3>
          <p className={classes.handMeta}>
            <span className={classes.points}>{data.points} pts</span>
            <span className={data.isConcealed ? classes.tagConcealed : classes.tagRevealed}>
              {data.isConcealed ? 'Concealed' : 'Exposed'}
            </span>
          </p>
        </div>
        <div className={classes.stats}>
          <span className={`${classes.distanceValue} ${getDistanceClass()}`}>
            {data.distance}
          </span>
          {onOrganize && (
            <div
              className={classes.organizeIcon}
              onClick={() => onOrganize(data.fullHandTiles)}
              title="Organize hand to match"
            >
              <img src="/hand.svg" alt="Organize" />
            </div>
          )}
        </div>
      </div>

      {data.fullHandTiles.length > 0 && (
        <div className={classes.tilesSection}>
          <div className={classes.tilesHeader}>
            <span className={classes.pattern}>
              {data.displayPattern}
              {data.notes && (
                <span className={classes.notesIcon} title={data.notes}>&#8505;</span>
              )}
            </span>
          </div>
          <div className={classes.allTiles}>
            {(() => {
              // Create a copy of needed tiles to track which are still needed
              const neededCopy = [...data.neededTiles];
              // Create a copy of exposed tiles to track which ones to highlight
              const exposedCopy = isHighlighted && callHighlight ? [...callHighlight.exposedTiles] : [];

              return data.fullHandTiles.map((tile, i) => {
                // Check if this tile is in the needed list
                const neededIndex = neededCopy.indexOf(tile);
                const isNeeded = neededIndex !== -1;

                // Remove from needed copy so we don't double-count
                if (isNeeded) {
                  neededCopy.splice(neededIndex, 1);
                }

                // Check if this tile would be exposed in a call
                const exposedIndex = exposedCopy.indexOf(tile);
                const isExposed = exposedIndex !== -1;
                if (isExposed) {
                  exposedCopy.splice(exposedIndex, 1);
                }

                // Determine the tile class
                let tileClass = isNeeded ? classes.tileNeed : classes.tileHave;
                let indicatorClass = isNeeded ? classes.indicatorNeed : classes.indicatorHave;
                let indicatorText = isNeeded ? '?' : '\u2713';

                if (isExposed) {
                  tileClass = classes.tileExposed;
                  indicatorClass = classes.indicatorExposed;
                  indicatorText = '\u2191'; // Up arrow for "expose"
                }

                return (
                  <div key={i} className={classes.tileWrapper}>
                    <div className={tileClass}>
                      <Tile code={tile} size="small" />
                    </div>
                    <div className={`${classes.tileIndicator} ${indicatorClass}`}>
                      {indicatorText}
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
