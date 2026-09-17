import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Vibration,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {v4 as uuidv4} from 'uuid';

import {GradientButton} from '../../components/UI/GradientButton';
import {GlassCard} from '../../components/UI/GlassCard';
import {MetroBadge} from '../../components/UI/MetroBadge';
import {decodeQR, getDefaultPassName} from '../../services/qr.service';
import {usePassesStore} from '../../store/passes.store';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import {RootStackParamList, Pass, QRTicketData} from '../../types/pass.types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ScanState = 'scanning' | 'preview' | 'saved';

export const QRScanScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {addPass} = usePassesStore();
  const device = useCameraDevice('back');

  const [state, setState] = useState<ScanState>('scanning');
  const [ticketData, setTicketData] = useState<QRTicketData | null>(null);
  const [savedPassId, setSavedPassId] = useState<string | null>(null);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'aztec', 'data-matrix', 'code-128', 'pdf-417'],
    onCodeScanned: codes => {
      if (state !== 'scanning' || codes.length === 0) return;
      const raw = codes[0].value;
      if (!raw) return;
      const decoded = decodeQR(raw);
      setTicketData(decoded);
      setState('preview');
      Vibration.vibrate(60);
    },
  });

  const savePass = useCallback(() => {
    if (!ticketData) return;
    const name = getDefaultPassName(ticketData);

    const pass: Pass = {
      id: uuidv4(),
      name,
      type: 'qr',
      source: 'qr_scan',
      metroKey: ticketData.metroKey,
      createdAt: Date.now(),
      qrData: ticketData,
      displayValue: ticketData.raw,
      addedToWallet: false,
    };

    addPass(pass);
    setSavedPassId(pass.id);
    setState('saved');
    Vibration.vibrate([0, 60, 40, 60]);
  }, [ticketData, addPass]);

  const scanAgain = () => {
    setState('scanning');
    setTicketData(null);
    setSavedPassId(null);
  };

  if (!device) {
    return (
      <View style={styles.noCamera}>
        <Text style={styles.noCameraText}>Camera not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Camera — only shown while scanning */}
      {state === 'scanning' && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          codeScanner={codeScanner}
        />
      )}

      {/* Dark overlay when not scanning */}
      {state !== 'scanning' && (
        <LinearGradient
          colors={[Colors.bg.primary, Colors.bg.secondary]}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Scan frame overlay */}
      {state === 'scanning' && (
        <View style={styles.overlay}>
          <View style={styles.frameOuter}>
            {/* Corner markers */}
            {['tl', 'tr', 'bl', 'br'].map(corner => (
              <CornerMarker key={corner} corner={corner as any} />
            ))}
          </View>
          <Text style={styles.hint}>Point at QR code or barcode</Text>
        </View>
      )}

      <SafeAreaView style={styles.safe} pointerEvents="box-none">
        {/* Back */}
        <TouchableOpacity
          style={[
            styles.back,
            state === 'scanning' && styles.backDark,
          ]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.title, state === 'scanning' && styles.titleDark]}>
          {state === 'scanning' ? 'QR Scanner' : state === 'preview' ? 'Ticket Found' : 'Saved! 🎉'}
        </Text>

        {/* Preview / saved card */}
        {(state === 'preview' || state === 'saved') && ticketData && (
          <View style={styles.previewContainer}>
            <GlassCard style={styles.previewCard} strong>
              <View style={styles.previewHeader}>
                <MetroBadge metroKey={ticketData.metroKey} />
                {ticketData.isTransit && (
                  <View style={styles.transitBadge}>
                    <Text style={styles.transitText}>🚇 Transit</Text>
                  </View>
                )}
              </View>

              {Object.entries(ticketData.fields).map(([key, value]) => (
                <View key={key} style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{key}</Text>
                  <Text style={styles.fieldValue}>{value}</Text>
                </View>
              ))}

              <View style={styles.rawContainer}>
                <Text style={styles.rawLabel}>RAW DATA</Text>
                <Text style={styles.rawValue} numberOfLines={2}>
                  {ticketData.raw}
                </Text>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Bottom CTAs */}
        <View style={styles.ctas}>
          {state === 'preview' && (
            <>
              <GradientButton
                label="Save to TapIN"
                onPress={savePass}
                size="lg"
                style={styles.btn}
              />
              <TouchableOpacity onPress={scanAgain} style={styles.secondary}>
                <Text style={styles.secondaryText}>Scan Again</Text>
              </TouchableOpacity>
            </>
          )}

          {state === 'saved' && savedPassId && (
            <>
              <GradientButton
                label="View Pass"
                onPress={() =>
                  navigation.navigate('PassDetail', {passId: savedPassId})
                }
                size="lg"
                style={styles.btn}
              />
              <TouchableOpacity onPress={scanAgain} style={styles.secondary}>
                <Text style={styles.secondaryText}>Scan Another</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Corner marker for scan frame
// ────────────────────────────────────────────────────────────────────────────

const CornerMarker = ({
  corner,
}: {
  corner: 'tl' | 'tr' | 'bl' | 'br';
}) => {
  const isTop = corner.startsWith('t');
  const isLeft = corner.endsWith('l');
  return (
    <View
      style={[
        styles.corner,
        isTop ? styles.cornerTop : styles.cornerBottom,
        isLeft ? styles.cornerLeft : styles.cornerRight,
      ]}>
      <View
        style={[
          styles.cornerH,
          {[isLeft ? 'left' : 'right']: 0},
        ]}
      />
      <View
        style={[
          styles.cornerV,
          {[isTop ? 'top' : 'bottom']: 0},
          {[isLeft ? 'left' : 'right']: 0},
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#000'},
  noCamera: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.primary,
  },
  noCameraText: {...Typography.body, color: Colors.text.secondary},
  safe: {flex: 1, zIndex: 10},

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  frameOuter: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  hint: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing[5],
    textAlign: 'center',
  },

  corner: {position: 'absolute', width: 40, height: 40},
  cornerTop: {top: 0},
  cornerBottom: {bottom: 0},
  cornerLeft: {left: 0},
  cornerRight: {right: 0},
  cornerH: {
    position: 'absolute',
    width: 40,
    height: 3,
    backgroundColor: Colors.accent.primary,
    borderRadius: 2,
  },
  cornerV: {
    position: 'absolute',
    width: 3,
    height: 40,
    backgroundColor: Colors.accent.primary,
    borderRadius: 2,
  },

  back: {paddingHorizontal: Spacing[5], paddingTop: Spacing[4]},
  backDark: {},
  backText: {...Typography.body, color: 'rgba(255,255,255,0.85)'},

  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    paddingHorizontal: Spacing[5],
    marginTop: Spacing[2],
  },
  titleDark: {color: '#fff'},

  previewContainer: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
  },
  previewCard: {padding: Spacing[5], gap: Spacing[3]},
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  transitBadge: {
    backgroundColor: Colors.info + '22',
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  transitText: {...Typography.caption, color: Colors.info},

  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  fieldLabel: {...Typography.label, color: Colors.text.tertiary},
  fieldValue: {...Typography.bodyMedium, color: Colors.text.primary},

  rawContainer: {
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    marginTop: Spacing[2],
  },
  rawLabel: {...Typography.label, color: Colors.text.tertiary, marginBottom: 4},
  rawValue: {...Typography.mono, color: Colors.text.secondary, fontSize: 10},

  ctas: {
    padding: Spacing[5],
    paddingBottom: 32,
    gap: Spacing[3],
    alignItems: 'center',
  },
  btn: {width: '100%'},
  secondary: {padding: Spacing[3]},
  secondaryText: {...Typography.bodyMedium, color: Colors.text.secondary},
});
