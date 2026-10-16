import { Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HarakaApp from '../src/HarakaApp.dom';

/** Links the web view can't open itself: phone calls, SMS, email, WhatsApp. */
const EXTERNAL_LINK = /^(tel|sms|mailto|whatsapp|intent):|^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i;

export default function Index() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HarakaApp
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
          onShouldStartLoadWithRequest: (request) => {
            if (EXTERNAL_LINK.test(request.url)) {
              Linking.openURL(request.url).catch(() => {});
              return false;
            }
            return true;
          },
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  webview: { flex: 1, backgroundColor: '#FFFFFF' },
});
