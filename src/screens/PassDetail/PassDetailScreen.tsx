import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';

import {GlassCard} from '../../components/UI/GlassCard';
import {GradientButton} from '../../components/UI/GradientButton';
import {MetroBadge} from '../../components/UI/MetroBadge';
import {PassCard} from '../../components/Card/PassCard';

import {usePassesStore} from '../../store/passes.store';
import {addToAppleWallet} from '../../services/wallet.service';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import {RootStackParamList} from '../../types/pass.types';

type Route = RouteProp<RootStackParamList, 'PassDetail'>;

const {width: W} = Dimensions.get('window');
const QR_SIZE = W * 0.55;

export const PassDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const {passes, removePass, markWallet} = usePassesStore();

  const pass = passes.find(p => p.id === route.params.passId);

  if (!pass) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Pass not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const metro = Colors.metro[pass.metroKey];

  const handleAddToWallet = useCallback(async () => {
    const success = await addToAppleWallet(pass);
    if (success) {
      markWallet(pass.id, pass.id);
    }
  }, [pass, markWallet]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out my ${metro.label} pass: ${pass.name}`,
        title: pass.name,
      });
    } catch {}
  }, [pass, metro]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Pass', `Remove "${pass.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removePass(pass.id);
          navigation.goBack();
        },
      },
    ]);
  }, [pass, removePass, navigation]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.bg.primary, Colors.bg.secondary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top colored glow matching metro */}
      <View
        style={[styles.glow, {backgroundColor: metro.primary + '20'}]}
      />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>‹ Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.deleteBtn}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Physical card preview */}
          <View style={styles.cardContainer}>
            <PassCard pass={pass} />
          </View>

          {/* QR Code display */}
          <GlassCard style={styles.qrContainer} strong>
            <Text style={styles.qrLabel}>
              {pass.type === 'nfc' ? 'CARD IDENTIFIER' : 'SCAN CODE'}
            </Text>
            <View style={styles.qrWrapper}>
              <QRCode
                value={pass.displayValue || 'tapin'}
                size={QR_SIZE}
                color={Colors.text.primary}
                backgroundColor="transparent"
                logoBackgroundColor="transparent"
              />
            </View>
            <Text style={styles.qrValue} numberOfLines={2}>
              {pass.displayValue}
            </Text>
          </GlassCard>

          {/* Details */}
          <GlassCard style={styles.detailsCard}>
            <View style={styles.detailHeader}>
              <MetroBadge metroKey={pass.metroKey} />
              <Text style={styles.passType}>{pass.type.toUpperCase()}</Text>
            </View>

            <DetailRow label="Name" value={pass.name} />
            <DetailRow
              label="Added"
              value={new Date(pass.createdAt).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
            <DetailRow label="Source" value={pass.source === 'nfc_scan' ? 'NFC Scan' : 'QR Scan'} />

            {pass.nfcData && (
              <>
                <DetailRow label="Card UID" value={pass.nfcData.uid} mono />
                <DetailRow label="Standard" value={pass.nfcData.standard ?? '—'} />
                <DetailRow
                  label="Tech"
                  value={pass.nfcData.techTypes.map(t => t.split('.').pop()).join(', ')}
                />
                {pass.nfcData.ndefRecords.length > 0 && (
                  <DetailRow
                    label="NDEF"
                    value={pass.nfcData.ndefRecords[0].payloadText || '(binary)'}
                  />
                )}
              </>
            )}

            {pass.qrData?.fields &&
              Object.entries(pass.qrData.fields).map(([k, v]) => (
                <DetailRow key={k} label={k} value={v} />
              ))}
          </GlassCard>

          {/* Action buttons */}
          <View style={styles.actions}>
            {!pass.addedToWallet ? (
              <GradientButton
                label="Add to Apple Wallet"
                onPress={handleAddToWallet}
                colors={['#1C1C1E', '#2C2C2E']}
                style={styles.walletBtn}
                size="lg"
                icon={<Text style={{fontSize: 18}}>🍎</Text>}
              />
            ) : (
              <View style={styles.inWallet}>
                <Text style={styles.inWalletText}>✓ Added to Apple Wallet</Text>
              </View>
            )}

            <GradientButton
              label="Share"
              onPress={handleShare}
              colors={[Colors.accent.primary, Colors.accent.secondary]}
              size="lg"
              style={{flex: 1}}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const DetailRow = ({
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
    <Text
      style={[styles.rowValue, mono && styles.monoValue]}
      numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: {flex: 1},
  safe: {flex: 1},
  scroll: {paddingBottom: 48},
  glow: {
    position: 'absolute',
    width: 400,
    height: 300,
    borderRadius: 200,
    top: -100,
    alignSelf: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.primary,
    gap: Spacing[4],
  },
  notFoundText: {...Typography.h3, color: Colors.text.secondary},
  backLink: {...Typography.body, color: Colors.accent.primary},

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
  },
  back: {...Typography.body, color: Colors.text.secondary},
  deleteBtn: {...Typography.bodyMedium, color: Colors.error},

  cardContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[5],
  },

  qrContainer: {
    marginHorizontal: Spacing[5],
    padding: Spacing[6],
    alignItems: 'center',
    gap: Spacing[4],
    marginBottom: Spacing[4],
  },
  qrLabel: {...Typography.label, color: Colors.text.tertiary},
  qrWrapper: {
    padding: Spacing[4],
    backgroundColor: Colors.text.primary,
    borderRadius: BorderRadius.lg,
  },
  qrValue: {
    ...Typography.mono,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontSize: 10,
  },

  detailsCard: {
    marginHorizontal: Spacing[5],
    padding: Spacing[5],
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  passType: {
    ...Typography.label,
    color: Colors.text.tertiary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    gap: Spacing[4],
  },
  rowLabel: {...Typography.label, color: Colors.text.tertiary, flex: 0.38},
  rowValue: {
    ...Typography.caption,
    color: Colors.text.primary,
    flex: 0.62,
    textAlign: 'right',
  },
  monoValue: {fontFamily: 'Courier New', fontSize: 10},

  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
    marginTop: Spacing[2],
  },
  walletBtn: {flex: 1},
  inWallet: {
    flex: 1,
    backgroundColor: Colors.success + '18',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.success + '44',
    paddingVertical: Spacing[3],
  },
  inWalletText: {
    ...Typography.bodyMedium,
    color: Colors.success,
  },
});
