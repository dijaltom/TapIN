import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {CardCarousel} from '../../components/Card/CardCarousel';
import {GlassCard} from '../../components/UI/GlassCard';
import {usePassesStore} from '../../store/passes.store';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import {RootStackParamList} from '../../types/pass.types';
import {Pass} from '../../types/pass.types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const {passes, loadPasses, removePass} = usePassesStore();

  useEffect(() => {
    loadPasses();
  }, [loadPasses]);

  const handleCardPress = useCallback(
    (pass: Pass) => {
      navigation.navigate('PassDetail', {passId: pass.id});
    },
    [navigation],
  );

  const recentPasses = passes.slice(0, 10);
  const totalCount = passes.length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <LinearGradient
        colors={[Colors.bg.primary, Colors.bg.secondary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top glow */}
      <View style={styles.topGlow} />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>My Wallet</Text>
              <Text style={styles.subGreeting}>
                {totalCount > 0
                  ? `${totalCount} pass${totalCount > 1 ? 'es' : ''} saved`
                  : 'Ready to scan your first pass'}
              </Text>
            </View>

            {/* Settings icon */}
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Main' as any)}>
              <Text style={styles.settingsIcon}>⚙</Text>
            </TouchableOpacity>
          </View>

          {/* Card carousel */}
          <CardCarousel
            passes={recentPasses}
            onCardPress={handleCardPress}
          />

          {/* Quick action buttons */}
          <View style={styles.actions}>
            <QuickAction
              icon="◈"
              label="Scan NFC"
              subtitle="Hold to card"
              color={Colors.accent.primary}
              onPress={() => navigation.navigate('NFCScan')}
            />
            <QuickAction
              icon="▦"
              label="Scan QR"
              subtitle="Point at ticket"
              color={Colors.metro.dmrc.primary}
              onPress={() => navigation.navigate('QRScan')}
            />
          </View>

          {/* Recent passes list */}
          {passes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Passes</Text>
              {passes.map(pass => (
                <PassListItem
                  key={pass.id}
                  pass={pass}
                  onPress={() => handleCardPress(pass)}
                  onDelete={() => {
                    Alert.alert(
                      'Delete Pass',
                      `Remove "${pass.name}"?`,
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => removePass(pass.id),
                        },
                      ],
                    );
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

const QuickAction = ({
  icon,
  label,
  subtitle,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.qaWrapper}>
    <GlassCard style={styles.qaCard} strong>
      <LinearGradient
        colors={[color + '22', Colors.bg.glass]}
        style={styles.qaGradient}>
        <Text style={[styles.qaIcon, {color}]}>{icon}</Text>
        <Text style={styles.qaLabel}>{label}</Text>
        <Text style={styles.qaSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </GlassCard>
  </TouchableOpacity>
);

const PassListItem = ({
  pass,
  onPress,
  onDelete,
}: {
  pass: Pass;
  onPress: () => void;
  onDelete: () => void;
}) => {
  const metro = Colors.metro[pass.metroKey];

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onDelete} activeOpacity={0.75}>
      <GlassCard style={styles.listItem}>
        <View
          style={[styles.listDot, {backgroundColor: metro.primary}]}
        />
        <View style={styles.listContent}>
          <Text style={styles.listName} numberOfLines={1}>{pass.name}</Text>
          <Text style={styles.listMeta}>
            {metro.label} · {pass.type.toUpperCase()}
            {pass.addedToWallet ? ' · In Wallet' : ''}
          </Text>
        </View>
        <Text style={styles.listChevron}>›</Text>
      </GlassCard>
    </TouchableOpacity>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {flex: 1},
  safe: {flex: 1},
  scroll: {paddingBottom: 100},

  topGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.accent.glow,
    top: -120,
    alignSelf: 'center',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[5],
  },
  greeting: {
    ...Typography.h1,
    color: Colors.text.primary,
  },
  subGreeting: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bg.glass,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
    color: Colors.text.secondary,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    marginTop: Spacing[6],
  },
  qaWrapper: {flex: 1},
  qaCard: {flex: 1, overflow: 'hidden'},
  qaGradient: {
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[1],
  },
  qaIcon: {fontSize: 32, marginBottom: Spacing[1]},
  qaLabel: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  qaSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },

  section: {
    paddingHorizontal: Spacing[5],
    marginTop: Spacing[6],
    gap: Spacing[2],
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    gap: Spacing[3],
  },
  listDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listContent: {flex: 1},
  listName: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  listMeta: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  listChevron: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
});
