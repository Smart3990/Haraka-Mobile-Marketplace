import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

/** Hides Android's back/home/recent buttons; a swipe up from the bottom edge shows them for a moment. */
function hideAndroidNavigation() {
  if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('hidden').catch(() => {});
}

export default function RootLayout() {
  useEffect(() => {
    hideAndroidNavigation();
    // Android shows the buttons again after leaving the app (calls, camera, share), so hide them on return
    const sub = AppState.addEventListener('change', (state) => state === 'active' && hideAndroidNavigation());
    return () => sub.remove();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
