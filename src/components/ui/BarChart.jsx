import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

const TOP = 18; // room above the tallest bar for its number
const BOTTOM = 22; // room below the bars for the labels

// Simple bar chart. data: [{ label, value, today? }]. The bar marked `today` is drawn in gold.
// It measures its own width, so it fits any screen.
export default function BarChart({ data, height = 170 }) {
  const [width, setWidth] = useState(0);

  const max = Math.max(1, ...data.map((d) => d.value));
  const plotHeight = height - TOP - BOTTOM;
  const slot = width / Math.max(1, data.length);
  const barWidth = Math.min(28, slot * 0.55);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={styles.wrap}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {/* grid: top, middle and baseline */}
          {[0, 0.5, 1].map((step) => (
            <Line
              key={step}
              x1={0}
              x2={width}
              y1={TOP + plotHeight * step}
              y2={TOP + plotHeight * step}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray={step === 1 ? undefined : '4 5'}
            />
          ))}

          {data.map((d, i) => {
            const barHeight = d.value === 0 ? 3 : (d.value / max) * plotHeight;
            const x = i * slot + (slot - barWidth) / 2;
            const y = TOP + plotHeight - barHeight;
            const fill = d.today ? colors.gold : colors.primary;

            return (
              <G key={`${d.label}-${i}`}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  fill={d.value === 0 ? colors.primaryLight : fill}
                />
                {d.value > 0 ? (
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 5}
                    fontSize={11}
                    fontFamily={fonts.bodyBold}
                    fill={colors.text}
                    textAnchor="middle"
                  >
                    {d.value}
                  </SvgText>
                ) : null}
                <SvgText
                  x={x + barWidth / 2}
                  y={height - 6}
                  fontSize={11}
                  fontFamily={fonts.bodyMedium}
                  fill={d.today ? colors.goldDark : colors.textMuted}
                  textAnchor="middle"
                >
                  {d.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
