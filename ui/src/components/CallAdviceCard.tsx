import { createUseStyles } from 'react-jss';
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
      borderColor: theme.colors.success,
    },
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  callInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  callType: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    textTransform: 'uppercase',
  },
  callWin: {
    backgroundColor: '#2E7D32',
    color: 'white',
  },
  callPung: {
    backgroundColor: '#1976D2',
    color: 'white',
  },
  callKong: {
    backgroundColor: '#7B1FA2',
    color: 'white',
  },
  callQuint: {
    backgroundColor: '#C2185B',
    color: 'white',
  },
  points: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  newDistance: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
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
    callInfo: {
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
    callType: {
      fontSize: theme.fontSizes.sm,
      padding: `2px ${theme.spacing.xs}`,
    },
  },
}));

export interface CallAdviceData {
  handId: number;
  handName: string;
  displayPattern: string;
  canCall: boolean;
  callType: 'pung' | 'kong' | 'quint' | 'win' | null;
  newDistance: number;
  points: number;
}

interface CallAdviceCardProps {
  data: CallAdviceData;
}

export function CallAdviceCard({ data }: CallAdviceCardProps) {
  const classes = useStyles();

  const getCallTypeClass = () => {
    switch (data.callType) {
      case 'win':
        return classes.callWin;
      case 'pung':
        return classes.callPung;
      case 'kong':
        return classes.callKong;
      case 'quint':
        return classes.callQuint;
      default:
        return '';
    }
  };

  const getCallTypeLabel = () => {
    switch (data.callType) {
      case 'win':
        return 'MAH JONGG!';
      case 'pung':
        return 'Call Pung';
      case 'kong':
        return 'Call Kong';
      case 'quint':
        return 'Call Quint';
      default:
        return '';
    }
  };

  return (
    <div className={classes.card}>
      <div className={classes.cardTop}>
        <div className={classes.handInfo}>
          <h3 className={classes.handName}>{data.handName}</h3>
          <p className={classes.pattern}>{data.displayPattern}</p>
        </div>
        <div className={classes.callInfo}>
          <span className={`${classes.callType} ${getCallTypeClass()}`}>
            {getCallTypeLabel()}
          </span>
          <span className={classes.points}>{data.points} pts</span>
          {data.newDistance > 0 && (
            <span className={classes.newDistance}>
              {data.newDistance} tile{data.newDistance !== 1 ? 's' : ''} away after call
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
