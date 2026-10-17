import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import HarakaApp from '../src/HarakaApp.dom';

/** Links opened outside the app: phone calls, SMS, email, WhatsApp, and the Privacy Policy / Terms pages. */
const EXTERNAL_LINK =
  /^(tel|sms|mailto|whatsapp|intent):|^https?:\/\/(wa\.me|api\.whatsapp\.com)\/|^https:\/\/(harakaapp|ga4-viewer-kiyumart-platform)\.web\.app\/(privacy|terms)\.html/i;

// Show notifications even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Asks permission and returns this phone's Expo push token (null if refused or unavailable). */
async function registerForPush(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Messages & updates',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return null;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (err) {
    console.warn('Push registration failed', err);
    return null;
  }
}

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/** Sends push notifications through Expo's push service (done here because web pages can't call it). */
async function sendPush(messages: PushMessage[]): Promise<void> {
  if (messages.length === 0) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages.map((m) => ({ ...m, sound: 'default', channelId: 'default' }))),
    });
  } catch (err) {
    console.warn('Push send failed', err);
  }
}

export default function Index() {
  // Screen to open when the user taps a notification (passed into the web app)
  const [openRoute, setOpenRoute] = useState<{ type: string; id: string; at: number } | null>(null);

  useEffect(() => {
    const open = (data: Record<string, unknown> | undefined) => {
      if (data && typeof data.type === 'string') {
        setOpenRoute({ type: data.type, id: String(data.id || ''), at: Date.now() });
      }
    };
    Notifications.getLastNotificationResponseAsync().then((r) => open(r?.notification.request.content.data));
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification.request.content.data));
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Keeps text boxes above the keyboard */}
      <KeyboardAvoidingView style={styles.container} behavior="padding">
      <HarakaApp
        registerForPush={registerForPush}
        sendPush={sendPush}
        openRoute={openRoute}
        dom={{
          style: styles.webview,
          // Use react-native-webview: it supports microphone, location and link handling below
          useExpoDOMWebView: false,
          // Let the web app use the microphone (voice notes) and location (region detection)
          mediaPlaybackRequiresUserAction: false,
          allowsInlineMediaPlayback: true,
          mediaCapturePermissionGrantType: 'grant',
          geolocationEnabled: true,
          bounces: false,
          overScrollMode: 'never',
          // The page itself never scrolls or zooms; only the app's screens scroll inside it
          scrollEnabled: Platform.OS !== 'ios',
          setBuiltInZoomControls: false,
          contentInsetAdjustmentBehavior: 'never',
          automaticallyAdjustContentInsets: false,
          // Ignore the phone's font-size setting so layouts don't overflow
          textZoom: 100,
          showsVerticalScrollIndicator: false,
          showsHorizontalScrollIndicator: false,
          onShouldStartLoadWithRequest: (request) => {
            if (EXTERNAL_LINK.test(request.url)) {
              Linking.openURL(request.url).catch(() => {});
              return false;
            }
            return true;
          },
        }}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  webview: { flex: 1, backgroundColor: '#FFFFFF' },
});
