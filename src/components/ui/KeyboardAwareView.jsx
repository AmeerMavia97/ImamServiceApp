import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, View } from 'react-native';

// Keeps a screen's bottom content (e.g. a sticky Submit bar) above the keyboard.
//
// iOS: the normal KeyboardAvoidingView works fine.
// Android (edge-to-edge): KeyboardAvoidingView can leave stale padding after the keyboard
// closes, so the footer stays stuck in the middle of the screen. Here we measure how much
// the keyboard REALLY covers this view each time it opens (0 if Android already resized the
// window), and reset to 0 as soon as it closes.
export default function KeyboardAwareView({ style, keyboardVerticalOffset = 0, children }) {
  const ref = useRef(null);
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      ref.current?.measureInWindow((x, y, width, height) => {
        setInset(Math.max(0, Math.round(y + height - event.endCoordinates.screenY)));
      });
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setInset(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={keyboardVerticalOffset} style={style}>
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View ref={ref} collapsable={false} style={[style, { paddingBottom: inset }]}>
      {children}
    </View>
  );
}
