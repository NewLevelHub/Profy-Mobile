import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radii, spacing, typography } from '../../constants/themes/themes';

interface Props {
  onPress: () => void;
  isLoading?: boolean;
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3L37.1 9.7C34 6.9 29.2 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.7 19 12 24 12c3.1 0 5.8 1.1 7.9 3L37.1 9.7C34 6.9 29.2 5 24 5c-7.7 0-14.4 4.1-18.1 9.7z" />
      <Path fill="#4CAF50" d="M24 45c5.2 0 9.8-1.9 13.4-5l-6.2-5.2C29.4 36.6 26.8 37.5 24 37.5c-5.3 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 40.8 16.2 45 24 45z" />
      <Path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.4-2.3 4.5-4.3 6l6.2 5.2C40.9 36.5 44 31.2 44 25c0-1.3-.1-2.6-.4-3.9z" />
    </Svg>
  );
}

export default function GoogleSignInButton({ onPress, isLoading = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.textSecondary} size="small" />
      ) : (
        <View style={styles.inner}>
          <GoogleIcon />
          <Text style={styles.label}>Продолжить с Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
});
