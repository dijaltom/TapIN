import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {usePassesStore} from '../../store/passes.store';
import {GlassCard} from '../../components/UI/GlassCard';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import * as Storage from '../../services/storage.service';

export const SettingsScreen: React.FC = () => {
  const {passes, loadPasses} = usePassesStore();
  const settings = Storage.getSettings();

  const [locationReminders, setLocationReminders] = useState(
    settings.locationReminders,
  );
  const [haptics, setHaptics] = useState(settings.haptics);

  const toggle = (key: 'locationReminders' | 'haptics', value: boolean) => {
    Storage.saveSettings({[key]: value});
    if (key === 'locationReminders') setLocationReminders(value);
    if (key === 'haptics') setHaptics(value);
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Passes',
      'This will permanently delete all your saved passes. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            passes.forEach(p => Storage.deletePass(p.id));
            loadPasses();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.bg.primary, Colors.bg.secondary]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>

          <Text style={styles.title}>Settings</Text>

          {/* Stats */}
          <GlassCard style={styles.statsCard} strong>
            <Text style={styles.sectionLabel}>WALLET</Text>
            <View style={styles.statsRow}>
              <StatItem value={passes.length} label="Total Passes" />
              <StatItem
                value={passes.filter(p => p.type === 'nfc').length}
                label="NFC Cards"
              />
              <StatItem
                value={passes.filter(p => p.type === 'qr').length}
                label="QR Tickets"
              />
            </View>
          </GlassCard>

          {/* Preferences */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionLabel}>PREFERENCES</Text>

            <SettingRow
              label="Location Reminders"
              subtitle="Notify when near a metro station"
              control={
                <Switch
                  value={locationReminders}
                  onValueChange={v => toggle('locationReminders', v)}
                  trackColor={{
                    false: Colors.bg.elevated,
                    true: Colors.accent.primary,
                  }}
                  thumbColor="#fff"
                />
              }
            />

            <SettingRow
              label="Haptic Feedback"
              subtitle="Vibrate on successful scan"
              control={
                <Switch
                  value={haptics}
                  onValueChange={v => toggle('haptics', v)}
                  trackColor={{
                    false: Colors.bg.elevated,
                    true: Colors.accent.primary,
                  }}
                  thumbColor="#fff"
                />
              }
            />
          </GlassCard>

          {/* About */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionLabel}>ABOUT</Text>

            <SettingRow
              label="App Version"
              control={<Text style={styles.value}>1.0.0</Text>}
            />
            <SettingRow
              label="Build"
              control={<Text style={styles.value}>2024.1</Text>}
            />

            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://developer.apple.com/wallet/',
                )
              }>
              <SettingRow
                label="Apple Wallet Docs"
                control={<Text style={styles.link}>Open →</Text>}
              />
            </TouchableOpacity>
          </GlassCard>

          {/* Metro support */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionLabel}>SUPPORTED METROS</Text>
            {Object.entries(Colors.metro)
              .filter(([k]) => k !== 'generic')
              .map(([key, val]) => (
                <View key={key} style={styles.metroRow}>
                  <View
                    style={[
                      styles.metroDot,
                      {backgroundColor: val.primary},
                    ]}
                  />
                  <Text style={styles.metroName}>{val.label}</Text>
                </View>
              ))}
          </GlassCard>

          {/* Danger zone */}
          <GlassCard style={[styles.section, styles.dangerSection]}>
            <Text style={[styles.sectionLabel, {color: Colors.error}]}>
              DANGER ZONE
            </Text>
            <TouchableOpacity onPress={clearAll} style={styles.dangerBtn}>
              <Text style={styles.dangerText}>Clear All Passes</Text>
            </TouchableOpacity>
          </GlassCard>

          <Text style={styles.footer}>
            TapIN — Made for India 🇮🇳{'\n'}
            NFC reading & QR scanning for Indian metro transit
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const StatItem = ({value, label}: {value: number; label: string}) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SettingRow = ({
  label,
  subtitle,
  control,
}: {
  label: string;
  subtitle?: string;
  control: React.ReactNode;
}) => (
  <View style={styles.settingRow}>
    <View style={{flex: 1}}>
      <Text style={styles.settingLabel}>{label}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {control}
  </View>
);

const styles = StyleSheet.create({
  root: {flex: 1},
  safe: {flex: 1},
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: 80,
    gap: Spacing[4],
  },

  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },

  statsCard: {padding: Spacing[5]},
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing[4],
  },
  statItem: {alignItems: 'center', gap: 4},
  statValue: {
    ...Typography.h1,
    color: Colors.accent.primary,
  },
  statLabel: {...Typography.caption, color: Colors.text.tertiary},

  section: {padding: Spacing[5], gap: Spacing[3]},
  sectionLabel: {
    ...Typography.label,
    color: Colors.text.tertiary,
    marginBottom: Spacing[1],
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    gap: Spacing[3],
  },
  settingLabel: {...Typography.bodyMedium, color: Colors.text.primary},
  settingSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  value: {...Typography.caption, color: Colors.text.tertiary},
  link: {...Typography.bodyMedium, color: Colors.accent.primary},

  metroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
  },
  metroDot: {width: 10, height: 10, borderRadius: 5},
  metroName: {...Typography.body, color: Colors.text.primary},

  dangerSection: {borderColor: Colors.error + '33'},
  dangerBtn: {
    paddingVertical: Spacing[3],
    alignItems: 'center',
    backgroundColor: Colors.error + '18',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '33',
  },
  dangerText: {...Typography.bodyMedium, color: Colors.error},

  footer: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    paddingVertical: Spacing[4],
  },
});
