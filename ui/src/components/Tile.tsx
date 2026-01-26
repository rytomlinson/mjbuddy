import { createUseStyles } from 'react-jss';
import {
  TileCode,
  TileType,
  getTileType,
  getTileValue,
  Wind,
  Dragon,
} from 'common';
import type { Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  tile: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '52px',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#FFFFF0', // Ivory tile background
    border: '2px solid #D4D4D4',
    boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.1s, box-shadow 0.1s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '3px 3px 6px rgba(0,0,0,0.3)',
    },
  },
  tileSmall: {
    width: '32px',
    height: '42px',
    fontSize: theme.fontSizes.md,
  },
  tileLarge: {
    width: '50px',
    height: '65px',
    fontSize: theme.fontSizes.xl,
  },
  selected: {
    border: `3px solid ${theme.colors.primary}`,
    boxShadow: `0 0 8px ${theme.colors.primary}`,
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      transform: 'none',
      boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    },
  },
  // Suit colors
  dot: {
    color: '#1E88E5', // Blue for dots
  },
  bam: {
    color: '#43A047', // Green for bams
  },
  crak: {
    color: '#E53935', // Red for craks
  },
  wind: {
    color: '#424242', // Dark gray for winds
  },
  dragon: {
    // Colors set per dragon type
  },
  redDragon: {
    color: '#C62828',
  },
  greenDragon: {
    color: '#2E7D32',
  },
  whiteDragon: {
    color: '#616161',
    border: '2px dashed #9E9E9E',
  },
  flower: {
    color: '#8E24AA', // Purple for flowers
    background: 'linear-gradient(135deg, #FFFFF0 0%, #F3E5F5 100%)',
  },
  joker: {
    color: theme.colors.primary,
    background: `linear-gradient(135deg, #FFFFF0 0%, #F5E6E6 100%)`,
    fontWeight: 'bold',
  },
  // Number display
  number: {
    fontSize: 'inherit',
    lineHeight: 1,
  },
  symbol: {
    fontSize: '0.7em',
    marginTop: '2px',
  },
  tileContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Mobile responsive
  '@media (max-width: 480px)': {
    tile: {
      width: '32px',
      height: '42px',
      fontSize: theme.fontSizes.md,
    },
    tileSmall: {
      width: '26px',
      height: '34px',
      fontSize: theme.fontSizes.sm,
    },
    tileLarge: {
      width: '40px',
      height: '52px',
      fontSize: theme.fontSizes.lg,
    },
    symbol: {
      fontSize: '0.6em',
    },
  },
}));

interface TileProps {
  code: TileCode;
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const WIND_SYMBOLS: Record<number, string> = {
  [Wind.EAST]: 'E',
  [Wind.SOUTH]: 'S',
  [Wind.WEST]: 'W',
  [Wind.NORTH]: 'N',
};

const WIND_CHARS: Record<number, string> = {
  [Wind.EAST]: '東',
  [Wind.SOUTH]: '南',
  [Wind.WEST]: '西',
  [Wind.NORTH]: '北',
};

const DRAGON_CHARS: Record<number, string> = {
  [Dragon.RED]: '中',
  [Dragon.GREEN]: '發',
  [Dragon.WHITE]: '',
};

export function Tile({ code, size = 'medium', selected, disabled, onClick }: TileProps) {
  const classes = useStyles();
  const tileType = getTileType(code);
  const value = getTileValue(code);

  const sizeClass = size === 'small' ? classes.tileSmall : size === 'large' ? classes.tileLarge : '';

  const getTypeClass = () => {
    switch (tileType) {
      case TileType.DOT:
        return classes.dot;
      case TileType.BAM:
        return classes.bam;
      case TileType.CRAK:
        return classes.crak;
      case TileType.WIND:
        return classes.wind;
      case TileType.DRAGON:
        if (value === Dragon.RED) return classes.redDragon;
        if (value === Dragon.GREEN) return classes.greenDragon;
        return classes.whiteDragon;
      case TileType.FLOWER:
        return classes.flower;
      case TileType.JOKER:
        return classes.joker;
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (tileType) {
      case TileType.DOT:
        return (
          <div className={classes.tileContent}>
            <span className={classes.number}>{value}</span>
            <span className={classes.symbol}>●</span>
          </div>
        );
      case TileType.BAM:
        return (
          <div className={classes.tileContent}>
            <span className={classes.number}>{value}</span>
            <span className={classes.symbol}>▮</span>
          </div>
        );
      case TileType.CRAK:
        return (
          <div className={classes.tileContent}>
            <span className={classes.number}>{value}</span>
            <span className={classes.symbol}>萬</span>
          </div>
        );
      case TileType.WIND:
        return (
          <div className={classes.tileContent}>
            <span className={classes.number}>{WIND_SYMBOLS[value]}</span>
            <span className={classes.symbol}>{WIND_CHARS[value]}</span>
          </div>
        );
      case TileType.DRAGON:
        if (value === Dragon.WHITE) {
          return <span style={{ fontSize: '1.2em' }}>□</span>;
        }
        return <span>{DRAGON_CHARS[value]}</span>;
      case TileType.FLOWER:
        return (
          <div className={classes.tileContent}>
            <span>✿</span>
          </div>
        );
      case TileType.JOKER:
        return (
          <div className={classes.tileContent}>
            <span style={{ fontSize: '0.8em' }}>J</span>
          </div>
        );
      default:
        return <span>?</span>;
    }
  };

  const classNames = [
    classes.tile,
    sizeClass,
    getTypeClass(),
    selected && classes.selected,
    disabled && classes.disabled,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={disabled ? undefined : onClick}>
      {renderContent()}
    </div>
  );
}
