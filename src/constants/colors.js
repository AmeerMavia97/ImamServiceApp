// Single source of truth for every color in the app.
// Never hard-code a color inside a screen or component.
// Palette: bottle green + cream + antique gold.
export const colors = {
  // Bottle green
  primary: '#0F4C3A',
  primaryDark: '#0A3328',
  primaryDeep: '#062219',
  primaryLight: '#E3EEE8',
  primarySoft: '#F0F6F3',
  primaryMid: '#204F3D', // solid mosque silhouette in the Home hero

  // Antique gold
  gold: '#B8913F',
  goldDark: '#86651D',
  goldLight: '#E9D7A6',
  goldSoft: '#F6EDD3',

  // Surfaces
  background: '#FAF6EC',
  surface: '#FFFFFF',
  border: '#E9E1CB',
  divider: '#EFE8D6',

  // Text
  text: '#13231C',
  textMuted: '#6A756F',
  textOnPrimary: '#FFFFFF',
  textOnPrimaryMuted: 'rgba(255,255,255,0.74)',

  // Status
  success: '#1E8E5A',
  successSoft: '#DDF3E8',
  warning: '#B7791F',
  warningSoft: '#FBEFD5',
  danger: '#C0392B',
  dangerSoft: '#FBE4E1',

  // Utility
  white: '#FFFFFF',
  shadow: '#0A2E22',
  overlay: 'rgba(6,34,25,0.55)',
  glass: 'rgba(255,255,255,0.08)', // translucent card on a dark green background
  glassBorder: 'rgba(233,215,166,0.28)',
  transparent: 'transparent',
};
