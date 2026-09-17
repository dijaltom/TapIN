import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Typography, BorderRadius, Spacing} from '../../theme';
import {MetroKey} from '../../theme/colors';

interface MetroBadgeProps {
  metroKey: MetroKey;
  size?: 'sm' | 'md';
}

export const MetroBadge: React.FC<MetroBadgeProps> = ({
  metroKey,
  size = 'md',
}) => {
  const metro = Colors.metro[metroKey];

  return (
    <View
      style={[
        styles.badge,
        {backgroundColor: metro.primary + '33'},
        size === 'sm' && styles.sm,
      ]}>
      <View
        style={[
          styles.dot,
          {backgroundColor: metro.primary},
          size === 'sm' && styles.dotSm,
        ]}
      />
      <Text
        style={[
          styles.label,
          {color: metro.primary},
          size === 'sm' && styles.labelSm,
        ]}>
        {metro.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    gap: Spacing[1],
  },
  sm: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  label: {
    ...Typography.label,
    fontSize: 11,
  },
  labelSm: {
    fontSize: 9,
  },
});
