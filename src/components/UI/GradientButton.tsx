import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Typography, BorderRadius, Spacing} from '../../theme';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  colors?: string[];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_STYLES = {
  sm: {paddingVertical: Spacing[2], paddingHorizontal: Spacing[4]},
  md: {paddingVertical: Spacing[3], paddingHorizontal: Spacing[6]},
  lg: {paddingVertical: Spacing[4], paddingHorizontal: Spacing[8]},
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  colors = [Colors.accent.primary, Colors.accent.secondary],
  style,
  textStyle,
  disabled = false,
  loading = false,
  icon,
  size = 'md',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[styles.wrapper, style, (disabled || loading) && styles.disabled]}>
      <LinearGradient
        colors={disabled ? ['#3a3a4a', '#2a2a3a'] : colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.gradient, SIZE_STYLES[size]]}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text style={[styles.label, textStyle]}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    shadowColor: Colors.accent.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
});
