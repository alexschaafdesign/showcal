import colors from './colors';

const colorTokens = {
  // Core Brand Colors
  primary: {
    light: colors.purple80,
    main: colors.purple50,
    dark: colors.purple30,
  },
  secondary: {
    light: colors.blue80,
    main: colors.blue50,
    dark: colors.blue30,
  },
  error: {
    light: colors.red70,
    main: colors.red50,
    dark: colors.red30,
  },
  warning: {
    light: colors.yellow80,
    main: colors.yellow60,
    dark: colors.yellow40,
  },
  success: {
    light: colors.green80,
    main: colors.green60,
    dark: colors.green40,
  },
  info: {
    light: colors.cyan80,
    main: colors.cyan60,
    dark: colors.cyan40,
  },
  neutral: {
    light: colors.gray90,
    main: colors.gray50,
    dark: colors.gray30,
  },
  background: {
    default: colors.gray98,
    paper: colors.gray99,
  },
  text: {
    primary: colors.gray10,
    secondary: colors.gray40,
  },
};
export default colorTokens;