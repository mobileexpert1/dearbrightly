import { injectGlobal } from 'emotion';

injectGlobal`
    * {
        font-family: Roboto;
    }
`;

export const fontFamily = {
  baseFont: 'Roboto, sans-serif',
};

export const fontWeight = {
  light: '300',
  regular: '400',
  bold: '700',
};

export const fontSize = {
  smallest: '12px',
  small: '14px',
  normal: '16px',
  medium: '18px',
  big: '20px',
  biggest: '24px',
  hugeMobile: '30px',
  large: '32px',
  huge: '36px',
  header: '38px',
  bigHeader: '40px',
  hugeNumber: '45px',
  hugeHeader: '50px',
};

export const errorMessageStyle = {
  color: '#c55482',
  fontWeight: '700',
  fontSize: 10,
  lineHeight: '12px',
  fontFamily: 'Roboto',
  padding: 5,
};

export const colors = {
  white: '#fff',
  veryLightBlue: '#CED4DA',
  veryDarkBlue: '#24272A',
  light: '#ededed',
  dark: '#333',
  error: '#c55482',
  screamingGray: '#aaa',
  clear: '#fff',
  clearDarker: '#fcfcfc',
  salmon: '#ffc7bd',
  lightSalmon: '#ffe0db',
  linkColor: '#007bff',
  antdBlue: '#1790fc',
  lightBlue: '#d4eafc',
  facebookBlue: '#3B5998',
  blumine: '#1C4D86',
  blumineLight: '#4E69A2',
  stTropaz: '#2d5992',
  finch: '#606F4B',
  morningGlory: '#a3d3de',
  hoki: '#6087a0',
  venus: '#9a8992',
  cream: '#f2d16c',
  silver: '#b9b9b9',
  flamePea: '#df603c',
  codGray: '#1a1a1a',
  lightMorningGlory: '#a3d3de2e',
  linen: '#F7E0D9',
  alabaster: '#fafafa',
  doveGray: '#666666',
  quicksand: '#bda796',
  black: '#000',
  lightSilver: '#ccc',
  dirtyWhite: '#faf8f7',
  veryLightGray: '#f8f8f8',
  darkModerateBlue: '#3B5998',
  whisper: '#e5e5e5',
  gainsboroOpacity: '#DEDEDE33',
  whitesmoke: '#F1F1F1',
  darkModerateBlueOpacity: '#3B599826',
  whiteSmokeOpacity: '#F1F1F14F',
  mulberryOpacity: '#c5548219',
  mulberry: '#c55482',
  questionBorder: '#00000019',
  frenchPass: '#A4D3DE',
  frenchPassOpacity: '#A4D3DE33',
  remy: '#F7E0D9',
  sharkOpacity: '#24272A80',
  silverLight: '#bdbdbd',
  blackSqueeze: '#EDF6F8',
  alabasterDark: '#FBFBFB',
  whiteOpacity: '#FFFF0000',
  veryLightGrayOpacity: '#00000080',
  gallery: '#F0F0F0',
  shark: '#24272a',
  chambrayOpacity: '#3B599880',
  chambray: '#3b5998',
  lightGrayishRed: '#F7E0D94C',
  veryLightBlumine: '#7c92c0',
  foam: '#d1e9ef',
  foamLight: '#e3f1f5',
  caribbeanGreen: '#02BD9E',
  summaryGreen: '#12AE47',
  red: '#FF0000',
  breakLineGray: '#00000033',
  whiteOpacityLight: '#ffffff19',
  whiteOpacityHeavy: '#ffffff30',
  grayishBlue: '#aab7c4',
  darkPink: '#9e2146',
  veryDarkWithOpacity: '#24272A73',
  infoGray: '#C9C9C9',
  veryDarkGray: '#333333',
  quoteBackground: '#fefbfa',
  veryPale: '#ded9d9',
  disabledColor: '#D9D9D9',
  activeButtonColor: '#4577DB',
  aliceBlue: '#F5F7FA',
  grey: '#e6e6e6',
  platinum: '#e6e0e0',
  snow: '#fbf6f4',
  titanium: '#8b8b8b',
  indigoWhite: '#eff7f9',
  silverFoil: '#b4b4b4',
  guyabano: '#f4f4f4',
  brightGray: '#f0f2f7',
  lightPlatinum: '#7A7A7A',
  darkGreen: '#97AD64',
  thinGrey: '#D2D2D2',
  veryThinGrey: '#9A9A9A',
  medBlue: '#25408f',
};

export const breakpoints = {
  xs: '@media (max-width: 576px)',
  sm: '@media (max-width: 768px)',
  md: '@media (max-width: 992px)',
  lg: '@media (max-width: 1200px)',
  xl: '@media (min-width: 1200px)',
  xxl: '@media (max-width: 1440px)',
};

export const mobileFirstBreakpoints = {
  xs: '@media (min-width:320px)',
  sm: '@media (min-width: 576px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 992px)',
  xl: '@media (min-width: 1200px)',
  xxl: '@media(min-width: 1440px)',
};

export const topMenuHeight = {
  xs: '130px',
  lg: '161px',
};
