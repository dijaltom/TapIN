import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {Pass} from '../../types/pass.types';
import {Colors, Typography, Spacing, BorderRadius, CardDimensions} from '../../theme';
import {MetroBadge} from '../UI/MetroBadge';

interface PassCardProps {
  pass: Pass;
  onPress?: () => void;
  scale?: number;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export const PassCard: React.FC<PassCardProps> = ({
  pass,
  onPress,
  scale = 1,
}) => {
  const metro = Colors.metro[pass.metroKey];
  const pressed = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(pressed.value, [0, 1], [1, 0.97]),
      },
    ],
  }));

  const cardWidth = CardDimensions.width * scale;
  const cardHeight = CardDimensions.height * scale;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const displayType = pass.type === 'nfc'
    ? '◈ NFC'
    : pass.type === 'qr'
    ? '▦ QR'
    : '||| BARCODE';

  return (
    <Animated.View style={[animStyle, {width: cardWidth, height: cardHeight}]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          pressed.value = withSpring(1);
        }}
        onPressOut={() => {
          pressed.value = withSpring(0);
        }}
        activeOpacity={1}
        style={{flex: 1}}>
        <LinearGradient
          colors={metro.gradient as string[]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            styles.card,
            {
              width: cardWidth,
              height: cardHeight,
              borderRadius: BorderRadius['2xl'] * scale,
            },
          ]}>

          {/* Decorative circles */}
          <View style={[styles.circle1, {opacity: 0.15}]} />
          <View style={[styles.circle2, {opacity: 0.10}]} />

          {/* Top row */}
          <View style={styles.topRow}>
            <MetroBadge metroKey={pass.metroKey} size="sm" />
            <Text style={styles.typeLabel}>{displayType}</Text>
          </View>

          {/* Main title */}
          <Text style={[styles.name, {fontSize: (scale >= 1 ? 18 : 15)}]} numberOfLines={1}>
            {pass.name}
          </Text>

          {/* Fields preview */}
          {pass.qrData?.fields && (
            <View style={styles.fields}>
              {Object.entries(pass.qrData.fields)
                .slice(0, 2)
                .map(([key, value]) => (
                  <View key={key} style={styles.field}>
                    <Text style={styles.fieldLabel}>{key}</Text>
                    <Text style={styles.fieldValue} numberOfLines={1}>
                      {value}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          {/* NFC uid display */}
          {pass.type === 'nfc' && pass.nfcData && (
            <Text style={styles.uid}>
              UID: {pass.nfcData.uid}
            </Text>
          )}

          {/* Bottom row */}
          <View style={styles.bottomRow}>
            <Text style={styles.date}>{formatDate(pass.createdAt)}</Text>
            {pass.addedToWallet && (
              <View style={styles.walletBadge}>
                <Text style={styles.walletText}>In Wallet</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: Spacing[5],
    overflow: 'hidden',
    justifyContent: 'space-between',
    // Premium shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 14,
  },

  // Decorative background shapes
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    top: -60,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    bottom: -40,
    left: 20,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  typeLabel: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
  },

  name: {
    ...Typography.h3,
    color: '#fff',
    marginTop: Spacing[2],
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },

  fields: {
    flexDirection: 'row',
    gap: Spacing[4],
    flex: 1,
    alignItems: 'flex-end',
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    marginBottom: 2,
  },
  fieldValue: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '600',
  },

  uid: {
    ...Typography.mono,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: Spacing[2],
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.65)',
  },
  walletBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  walletText: {
    ...Typography.label,
    color: '#fff',
    fontSize: 8,
  },
});
