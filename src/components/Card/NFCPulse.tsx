import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {Colors} from '../../theme';

interface NFCPulseProps {
  color?: string;
  size?: number;
  active?: boolean;
}

const Ring = ({
  delay,
  color,
  size,
}: {
  delay: number;
  color: string;
  size: number;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {duration: 2400, easing: Easing.out(Easing.cubic)}),
        -1,
        false,
      ),
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.3, 1.6],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.3, 1],
      [0.8, 0.5, 0],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{scale}],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export const NFCPulse: React.FC<NFCPulseProps> = ({
  color = Colors.accent.primary,
  size = 160,
  active = true,
}) => {
  if (!active) return null;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Ring delay={0} color={color} size={size} />
      <Ring delay={600} color={color} size={size} />
      <Ring delay={1200} color={color} size={size} />

      {/* Center icon */}
      <View
        style={[
          styles.center,
          {
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: (size * 0.35) / 2,
            backgroundColor: color + '22',
            borderColor: color + '66',
          },
        ]}>
        <View
          style={{
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: (size * 0.18) / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
