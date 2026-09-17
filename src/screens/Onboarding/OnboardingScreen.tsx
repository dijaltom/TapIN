import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {NFCPulse} from '../../components/Card/NFCPulse';
import {GradientButton} from '../../components/UI/GradientButton';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import * as Storage from '../../services/storage.service';

const {width: W, height: H} = Dimensions.get('window');

interface Slide {
  icon: string;
  title: string;
  subtitle: string;
  accent: string;
  showPulse?: boolean;
}

const SLIDES: Slide[] = [
  {
    icon: '◈',
    title: 'Tap & Capture',
    subtitle:
      'Hold your iPhone near any NFC transit card to instantly read and store its data — Delhi Metro, Mumbai Metro, Bangalore Metro and more.',
    accent: Colors.accent.primary,
    showPulse: true,
  },
  {
    icon: '▦',
    title: 'Scan QR Tickets',
    subtitle:
      'Point your camera at any metro QR ticket. TapIN decodes and stores it instantly, so you never fumble for a ticket again.',
    accent: Colors.metro.dmrc.primary,
    showPulse: false,
  },
  {
    icon: '◉',
    title: 'Add to Apple Wallet',
    subtitle:
      'Every pass you save can be added to your Apple Wallet with one tap — complete with metro branding and location reminders.',
    accent: Colors.metro.bmrc.primary,
    showPulse: false,
  },
];

interface OnboardingScreenProps {
  onDone: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({onDone}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({x: W * (currentIndex + 1), animated: true});
      setCurrentIndex(i => i + 1);
    } else {
      Storage.setOnboardingDone();
      onDone();
    }
  };

  const skip = () => {
    Storage.setOnboardingDone();
    onDone();
  };

  const slide = SLIDES[currentIndex];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.bg.primary, Colors.bg.secondary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative glow blob */}
      <View
        style={[
          styles.glowBlob,
          {backgroundColor: slide.accent + '18'},
        ]}
      />

      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}>
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, {width: W}]}>
            {/* Icon or Pulse */}
            <View style={styles.iconContainer}>
              {s.showPulse ? (
                <NFCPulse color={s.accent} size={180} active />
              ) : (
                <Text style={[styles.icon, {color: s.accent}]}>{s.icon}</Text>
              )}
            </View>

            {/* Text */}
            <View style={styles.textBlock}>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.subtitle}>{s.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex
                      ? slide.accent
                      : Colors.text.tertiary,
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <GradientButton
          label={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          onPress={goNext}
          colors={[slide.accent, slide.accent + 'CC']}
          style={styles.cta}
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.bg.primary},

  glowBlob: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
    alignSelf: 'center',
  },

  skipBtn: {
    position: 'absolute',
    top: 60,
    right: Spacing[5],
    zIndex: 10,
    padding: Spacing[2],
  },
  skipText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
  },

  scroll: {flex: 1},

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
  },

  iconContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[8],
  },

  icon: {
    fontSize: 100,
  },

  textBlock: {
    alignItems: 'center',
  },
  title: {
    ...Typography.hero,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  bottom: {
    paddingHorizontal: Spacing[6],
    paddingBottom: 48,
    gap: Spacing[6],
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  cta: {
    width: W - Spacing[6] * 2,
  },
});
