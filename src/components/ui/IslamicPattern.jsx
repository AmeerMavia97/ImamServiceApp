import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/colors';

// Builds an 8-pointed star (Rub el Hizb style) centred at (cx, cy).
function starPath(cx, cy, outer, inner) {
  const points = [];
  for (let i = 0; i < 16; i += 1) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${points.join('L')}Z`;
}

// Decorative Islamic star pattern that fills its parent completely.
// It measures the parent with onLayout and draws at that exact pixel size,
// so the stars always cover the full area (header, strip, card...).
export default function IslamicPattern({ color = colors.goldLight, opacity = 0.06, size = 44 }) {
  const [box, setBox] = useState(null);
  const c = size / 2;
  const corner = starPath(0, 0, size * 0.18, size * 0.09);

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setBox({ width, height });
      }}
    >
      {box ? (
        <Svg width={box.width} height={box.height}>
          <Defs>
            <Pattern id="islamicStar" width={size} height={size} patternUnits="userSpaceOnUse">
              <Path
                d={starPath(c, c, size * 0.42, size * 0.2)}
                fill="none"
                stroke={color}
                strokeWidth={1.2}
                opacity={opacity}
              />
              {/* Small stars on the tile corners join up across neighbouring tiles */}
              {[
                [0, 0],
                [size, 0],
                [0, size],
                [size, size],
              ].map(([x, y]) => (
                <Path
                  key={`${x}-${y}`}
                  d={corner}
                  fill={color}
                  opacity={opacity * 0.8}
                  transform={`translate(${x} ${y})`}
                />
              ))}
            </Pattern>
          </Defs>
          <Rect x={0} y={0} width={box.width} height={box.height} fill="url(#islamicStar)" />
        </Svg>
      ) : null}
    </View>
  );
}
