import { Text } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { formatAmount } from '@/utils/formatters';

// Rupee price. The heading font has no ₹ glyph, so the symbol uses the body font.
export default function Price({ amount, size = 28, color = colors.primary, style }) {
  return (
    <Text style={[{ fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.25, color }, style]}>
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: size * 0.55 }}>₹</Text>
      {formatAmount(amount)}
    </Text>
  );
}
