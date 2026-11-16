import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import {
  TASAOrbiter_400Regular,
  TASAOrbiter_500Medium,
  TASAOrbiter_600SemiBold,
  TASAOrbiter_700Bold,
} from '@expo-google-fonts/tasa-orbiter';

// Two families only:
//  - Lobster: bold display script for headings / titles / prices (single weight)
//  - TASA Orbiter: modern, clean sans for all other text
export const fonts = {
  display: 'Lobster_400Regular',
  displaySemi: 'Lobster_400Regular',
  body: 'TASAOrbiter_400Regular',
  bodyMedium: 'TASAOrbiter_500Medium',
  bodySemi: 'TASAOrbiter_600SemiBold',
  bodyBold: 'TASAOrbiter_700Bold',
};

// Passed to useFonts() in App.jsx
export const fontAssets = {
  Lobster_400Regular,
  TASAOrbiter_400Regular,
  TASAOrbiter_500Medium,
  TASAOrbiter_600SemiBold,
  TASAOrbiter_700Bold,
};
