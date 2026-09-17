import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Vibration,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {v4 as uuidv4} from 'uuid';

import {NFCPulse} from '../../components/Card/NFCPulse';
import {GradientButton} from '../../components/UI/GradientButton';
import {GlassCard} from '../../components/UI/GlassCard';
import {MetroBadge} from '../../components/UI/MetroBadge';

import {readNFCTag, cancelNFCScan} from '../../services/nfc.service';
import {usePassesStore} from '../../store/passes.store';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import {RootStackParamList, Pass, NFCTagData} from '../../types/pass.types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

export const NFCScanScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {addPass} = usePassesStore();

  const [state, setState] = useState<ScanState>('idle');
  const [tagData, setTagData] = useState<NFCTagData | null>(null);
  const [error, setError] = useState('');
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);

  // Check NFC availability on mount
  useEffect(() => {
    import('../../services/nfc.service').then(({initNFC}) => {
      initNFC().then(ok => setNfcAvailable(ok));
    });
  }, []);

  const startScan = useCallback(async () => {
    setState('scanning');
    setTagData(null);
    setError('');

    try {
      const data = await readNFCTag();
      setState('success');
      setTagData(data);
      Vibration.vibrate(80);
    } catch (err: any) {
      if (err?.message?.includes('cancelled')) {
        setState('idle');
      } else {
        setState('error');
        setError(err?.message || 'Could not read NFC tag. Try again.');
      }
    }
  }, []);

  const cancel = useCallback(() => {
    cancelNFCScan();
    setState('idle');
  }, []);

  const savePass = useCallback(() => {
    if (!tagData) return;

    const firstNdef = tagData.ndefRecords.find(r => r.payloadText);
    const name = firstNdef?.payloadText?.slice(0, 30) || `NFC Card ${tagData.uid.slice(0, 8)}`;

    const pass: Pass = {
      id: uuidv4(),
      name,
      type: 'nfc',
      source: 'nfc_scan',
      metroKey: 'generic',
      createdAt: Date.now(),
      nfcData: tagData,
      displayValue: tagData.uid,
      addedToWallet: false,
    };

    addPass(pass);
    Vibration.vibrate([0, 80, 50, 80]);
    navigation.navigate('PassDetail', {passId: pass.id});
  }, [tagData, addPass, navigation]);

  const reset = () => {
    setState('idle');
    setTagData(null);
    setError('');
  };

  const accentColor =
    state === 'success'
      ? Colors.success
      : state === 'error'
      ? Colors.error
      : Colors.accent.primary;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.bg.primary, Colors.bg.secondary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background glow */}
      <View style={[styles.glow, {backgroundColor: accentColor + '15'}]} />

      <SafeAreaView style={styles.safe}>
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>NFC Scanner</Text>
          <Text style={styles.subtitle}>
            {state === 'idle' && 'Hold your iPhone near an NFC card'}
            {state === 'scanning' && 'Reading card... keep it close'}
            {state === 'success' && 'Card detected!'}
            {state === 'error' && 'Could not read the card'}
          </Text>

          {/* NFC not available banner (free build / no entitlement) */}
          {nfcAvailable === false && (
            <View style={styles.nfcBanner}>
              <Text style={styles.nfcBannerIcon}>⚠️</Text>
              <View style={{flex: 1}}>
                <Text style={styles.nfcBannerTitle}>NFC Not Available</Text>
                <Text style={styles.nfcBannerText}>
                  NFC requires an Apple Developer account ($99/yr) for the
                  required entitlement. QR scanning still works perfectly!
                </Text>
              </View>
            </View>
          )}

          {/* Pulse animation */}
          <View style={styles.pulseContainer}>
            <NFCPulse
              color={accentColor}
              size={200}
              active={state === 'scanning'}
            />
            {state !== 'scanning' && (
              <Text style={[styles.icon, {color: accentColor}]}>
                {state === 'success' ? '✓' : state === 'error' ? '✕' : '◈'}
              </Text>
            )}
          </View>

          {/* Tag result */}
          {tagData && state === 'success' && (
            <GlassCard style={styles.resultCard} strong>
              <View style={styles.resultRow}>
                <MetroBadge metroKey="generic" size="sm" />
              </View>

              <LabeledRow label="Card UID" value={tagData.uid} mono />
              <LabeledRow label="Standard" value={tagData.standard ?? 'Unknown'} />
              <LabeledRow
                label="Tech Types"
                value={tagData.techTypes.map(t => t.split('.').pop()).join(', ')}
              />

              {tagData.ndefRecords.length > 0 && (
                <LabeledRow
                  label="NDEF Data"
                  value={
                    tagData.ndefRecords[0].payloadText ||
                    tagData.ndefRecords[0].payload
                  }
                />
              )}
            </GlassCard>
          )}

          {/* Error */}
          {state === 'error' && (
            <GlassCard style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </GlassCard>
          )}

          {/* CTAs */}
          <View style={styles.ctas}>
            {(state === 'idle' || state === 'error') && (
              <GradientButton
                label={state === 'error' ? 'Try Again' : 'Start Scanning'}
                onPress={startScan}
                size="lg"
                style={styles.btn}
              />
            )}

            {state === 'scanning' && (
              <GradientButton
                label="Cancel"
                onPress={cancel}
                colors={['#444', '#333']}
                size="lg"
                style={styles.btn}
              />
            )}

            {state === 'success' && tagData && (
              <>
                <GradientButton
                  label="Save to TapIN"
                  onPress={savePass}
                  size="lg"
                  style={styles.btn}
                />
                <TouchableOpacity onPress={reset} style={styles.scanAgain}>
                  <Text style={styles.scanAgainText}>Scan Another</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const LabeledRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, mono && styles.monoText]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: {flex: 1},
  safe: {flex: 1},
  glow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -80,
    alignSelf: 'center',
  },
  back: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
  },
  backText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[8],
  },
  pulseContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[8],
  },
  icon: {
    position: 'absolute',
    fontSize: 72,
  },
  resultCard: {
    width: '100%',
    padding: Spacing[4],
    gap: Spacing[3],
    marginBottom: Spacing[6],
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  rowLabel: {
    ...Typography.label,
    color: Colors.text.tertiary,
    flex: 0.4,
  },
  rowValue: {
    ...Typography.caption,
    color: Colors.text.primary,
    flex: 0.6,
    textAlign: 'right',
  },
  monoText: {
    fontFamily: 'Courier New',
    fontSize: 11,
  },
  errorCard: {
    width: '100%',
    padding: Spacing[4],
    backgroundColor: Colors.error + '18',
    marginBottom: Spacing[6],
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
  },
  ctas: {
    width: '100%',
    gap: Spacing[3],
    alignItems: 'center',
  },
  btn: {width: '100%'},
  scanAgain: {padding: Spacing[3]},
  scanAgainText: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
  },
  nfcBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.warning + '18',
    borderWidth: 1,
    borderColor: Colors.warning + '44',
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[5],
    gap: Spacing[3],
    alignItems: 'flex-start',
    width: '100%',
  },
  nfcBannerIcon: {fontSize: 20},
  nfcBannerTitle: {
    ...Typography.bodyMedium,
    color: Colors.warning,
    marginBottom: 4,
  },
  nfcBannerText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
