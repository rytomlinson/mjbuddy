import type { Theme as AppTheme } from './theme';

declare module 'react-jss' {
  interface DefaultTheme extends AppTheme {}
}
