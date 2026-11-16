import { useState } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/colors';

// Password input with a show / hide eye button (same simple look as the other auth fields).
export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      variant="simple"
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!visible}
      right={
        <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10} accessibilityLabel="Show or hide password">
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      }
    />
  );
}
