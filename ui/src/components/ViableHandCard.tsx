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
  neededSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTop: `1px solid ${theme.colors.border}`,
  },
  neededLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  neededTiles: {
    display: 'flex',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
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
    neededTiles: {
      gap: '2px',
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

      {data.neededTiles.length > 0 && (
        <div className={classes.neededSection}>
          <div className={classes.neededLabel}>Need:</div>
          <div className={classes.neededTiles}>
            {data.neededTiles.slice(0, 8).map((tile, i) => (
              <Tile key={i} code={tile} size="small" />
            ))}
            {data.neededTiles.length > 8 && (
              <span style={{ alignSelf: 'center', color: '#999' }}>
                +{data.neededTiles.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
