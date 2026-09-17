import React, {useRef, useState} from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {Pass} from '../../types/pass.types';
import {PassCard} from './PassCard';
import {Colors, Typography, Spacing, CardDimensions} from '../../theme';

interface CardCarouselProps {
  passes: Pass[];
  onCardPress?: (pass: Pass) => void;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = CardDimensions.width;
const CARD_HEIGHT = CardDimensions.height;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const CARD_GAP = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export const CardCarousel: React.FC<CardCarouselProps> = ({
  passes,
  onCardPress,
}) => {
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollX.value = event.contentOffset.x;
  });

  if (passes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>✦</Text>
        <Text style={styles.emptyTitle}>No passes yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to scan your first NFC card or QR ticket
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
          gap: CARD_GAP,
          alignItems: 'center',
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={e => {
          const idx = Math.round(
            e.nativeEvent.contentOffset.x / SNAP_INTERVAL,
          );
          setActiveIndex(Math.max(0, Math.min(idx, passes.length - 1)));
        }}>
        {passes.map((pass, index) => (
          <CarouselItem
            key={pass.id}
            pass={pass}
            index={index}
            scrollX={scrollX}
            onPress={() => onCardPress?.(pass)}
          />
        ))}
      </AnimatedScrollView>

      {/* Dot indicators */}
      {passes.length > 1 && (
        <View style={styles.dots}>
          {passes.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

interface CarouselItemProps {
  pass: Pass;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}

const CarouselItem: React.FC<CarouselItemProps> = ({
  pass,
  index,
  scrollX,
  onPress,
}) => {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.88, 1, 0.88],
      Extrapolation.CLAMP,
    );

    const rotateYDeg = interpolate(
      scrollX.value,
      inputRange,
      [8, 0, -8],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.65, 1, 0.65],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        {scale},
        {perspective: 800},
        {rotateY: `${rotateYDeg}deg`},
      ] as any,
      opacity,
    };
  });

  return (
    <Animated.View style={animStyle}>
      <PassCard pass={pass} onPress={onPress} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT + 48,
    justifyContent: 'center',
  },
  empty: {
    height: CARD_HEIGHT + 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
  },
  emptyIcon: {
    fontSize: 40,
    color: Colors.accent.primary,
    marginBottom: Spacing[3],
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing[3],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.text.tertiary,
  },
  dotActive: {
    backgroundColor: Colors.accent.primary,
    width: 18,
  },
});
