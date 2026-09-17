import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import {Colors, BorderRadius} from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
  rounded?: keyof typeof BorderRadius;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  strong = false,
  rounded = 'xl',
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: strong
            ? Colors.bg.glassStrong
            : Colors.bg.glass,
          borderRadius: BorderRadius[rounded],
        },
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
    // iOS blur-like effect via opacity layers
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
