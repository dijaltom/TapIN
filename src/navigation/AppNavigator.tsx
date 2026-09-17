import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet, Platform} from 'react-native';

import {HomeScreen} from '../screens/Home/HomeScreen';
import {NFCScanScreen} from '../screens/NFCScan/NFCScanScreen';
import {QRScanScreen} from '../screens/QRScan/QRScanScreen';
import {PassDetailScreen} from '../screens/PassDetail/PassDetailScreen';
import {SettingsScreen} from '../screens/Settings/SettingsScreen';
import {OnboardingScreen} from '../screens/Onboarding/OnboardingScreen';

import {Colors, BorderRadius} from '../theme';
import {RootStackParamList, MainTabParamList} from '../types/pass.types';
import * as Storage from '../services/storage.service';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ────────────────────────────────────────────────────────────────────────────
// Tab bar icon
// ────────────────────────────────────────────────────────────────────────────

const TabIcon = ({
  icon,
  focused,
  color,
}: {
  icon: string;
  focused: boolean;
  color: string;
}) => (
  <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
    <Text style={[styles.tabIconText, {color}]}>{icon}</Text>
  </View>
);

// ────────────────────────────────────────────────────────────────────────────
// Main tab navigator
// ────────────────────────────────────────────────────────────────────────────

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: Colors.accent.primary,
      tabBarInactiveTintColor: Colors.text.tertiary,
      tabBarLabelStyle: styles.tabLabel,
      tabBarBackground: () => (
        <View style={styles.tabBarBg} />
      ),
    }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Wallet',
        tabBarIcon: ({focused, color}) => (
          <TabIcon icon="◉" focused={focused} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="NFCScan"
      component={NFCScanScreen}
      options={{
        tabBarLabel: 'NFC',
        tabBarIcon: ({focused, color}) => (
          <TabIcon icon="◈" focused={focused} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="QRScan"
      component={QRScanScreen}
      options={{
        tabBarLabel: 'QR',
        tabBarIcon: ({focused, color}) => (
          <TabIcon icon="▦" focused={focused} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({focused, color}) => (
          <TabIcon icon="⚙" focused={focused} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// ────────────────────────────────────────────────────────────────────────────
// Root stack navigator
// ────────────────────────────────────────────────────────────────────────────

interface AppNavigatorProps {
  onboardingDone: boolean;
  onOnboardingDone: () => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  onboardingDone,
  onOnboardingDone,
}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: {backgroundColor: Colors.bg.primary},
      }}
      initialRouteName={onboardingDone ? 'Main' : 'Onboarding'}>
      <Stack.Screen name="Onboarding">
        {props => (
          <OnboardingScreen
            {...props}
            onDone={onOnboardingDone}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="PassDetail"
        component={PassDetailScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="NFCScan"
        component={NFCScanScreen}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="QRScan"
        component={QRScanScreen}
        options={{animation: 'slide_from_bottom'}}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 82 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
    // Blur-like effect
    opacity: 0.96,
  },
  tabIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabIconActive: {
    backgroundColor: Colors.accent.primary + '22',
  },
  tabIconText: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
