import { useState } from 'react';
import { FlatList, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import masjidImage from '@/assets/images/onboarding-masjid.png';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { ONBOARDING_SLIDES } from '@/constants/onboarding';
import { markOnboardingSeen } from '@/utils/storage';

const PHOTO_RATIO = 0.6; 


export default function Onboarding({ onDone }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const photoHeight = Math.round(height * PHOTO_RATIO );
  const compact = height < 700; 

  const handleStart = async () => {
    setSaving(true);
    await markOnboardingSeen();
    onDone();
  };

  return (
    <View style={styles.container}>
      {/* Big rounded bottom-left corner, straight bottom-right */}
      <View style={[styles.photo, { height: photoHeight, borderBottomLeftRadius: width * 0.42 }]}>
        <Image source={masjidImage}  style={{ width, height:   photoHeight , objectposition: 'top', resizeMode: 'cover'
         }} />
        <LinearGradient
          colors={['rgba(6,34,25,0.5)', 'rgba(6,34,25,0)']}
          style={[styles.scrim, { height: insets.top + 60 }]}
        />
      </View>

      <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 10) + 20 }]}>
        <View>
          <FlatList
            data={ONBOARDING_SLIDES}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.pager}
            onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width }]}>
                <AppText
                  variant="display"
                  color={colors.textOnPrimary}
                  style={compact ? styles.titleCompact : styles.title}
                >
                  {item.title}
                </AppText>
                <AppText variant="body" color={colors.textOnPrimaryMuted}>
                  {item.description}
                </AppText>
              </View>
            )}
          />

          <View style={styles.dots}>
            {ONBOARDING_SLIDES.map((slide, i) => (
              <View key={slide.id} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
        </View>

        <AppButton
          title="Get Started"
          variant="gold"
          iconRight="arrow-forward"
          loading={saving}
          onPress={handleStart}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDeep },
  photo: { overflow: 'hidden', backgroundColor: colors.primaryDark },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0 },
  panel: { flex: 1, justifyContent: 'space-between', paddingTop: 18, paddingHorizontal: 24 },
  pager: { flexGrow: 0, marginHorizontal: -24 },
  slide: { paddingHorizontal: 24, gap: 6 },
  title: { fontSize: 38, lineHeight: 46 },
  titleCompact: { fontSize: 30, lineHeight: 38 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textOnPrimaryMuted, opacity: 0.45 },
  dotActive: { width: 26, backgroundColor: colors.gold, opacity: 1 },
  button: { alignSelf: 'flex-center', paddingHorizontal: 30 , },
});
