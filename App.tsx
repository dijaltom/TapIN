import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';

import {AppNavigator} from './src/navigation/AppNavigator';
import * as Storage from './src/services/storage.service';
import {initNFC} from './src/services/nfc.service';

const navigationTheme = {
  dark: true,
  colors: {
    primary: '#7C5CFC',
    background: '#0A0A0F',
    card: '#16161F',
    text: '#F8F8FF',
    border: 'rgba(255,255,255,0.07)',
    notification: '#7C5CFC',
  },
  fonts: {
    regular: {fontFamily: 'System', fontWeight: '400' as const},
    medium: {fontFamily: 'System', fontWeight: '500' as const},
    bold: {fontFamily: 'System', fontWeight: '700' as const},
    heavy: {fontFamily: 'System', fontWeight: '800' as const},
  },
};

function App(): React.JSX.Element {
  const [onboardingDone, setOnboardingDone] = useState(
    Storage.isOnboardingDone(),
  );
  const [nfcReady, setNfcReady] = useState(false);

  useEffect(() => {
    initNFC().then(supported => {
      setNfcReady(supported);
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator
          onboardingDone={onboardingDone}
          onOnboardingDone={() => setOnboardingDone(true)}
        />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
});

export default App;
