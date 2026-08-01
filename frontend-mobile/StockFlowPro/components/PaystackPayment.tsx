import { useState, useMemo } from 'react';
import { Modal, View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';

const PAYSTACK_KEY = 'pk_test_6620d84161debea0ad30c0617bde2eea7de28051';

interface Props {
  email: string;
  amount: number;
  currencyCode?: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  visible: boolean;
}

export default function PaystackPayment({ email, amount, currencyCode = 'GHS', onSuccess, onClose, visible }: Props) {
  const [loading, setLoading] = useState(true);
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://js.paystack.co/v1/inline.js"></script>
    </head>
    <body style="margin:0;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;">
      <script>
        window.onload = function() {
          var handler = PaystackPop.setup({
            key: '${PAYSTACK_KEY}',
            email: '${email}',
            amount: ${amount * 100},
            currency: '${currencyCode}',
            callback: function(response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', reference: response.reference }));
            },
            onClose: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'close' }));
            }
          });
          handler.openIframe();
        };
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'success') {
        onSuccess(data.reference);
      } else if (data.type === 'close') {
        onClose();
      }
    } catch (e) {}
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Secure Payment</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        {loading && (
          <View style={s.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.loaderText}>Loading payment...</Text>
          </View>
        )}
        <WebView
          source={{ html }}
          onMessage={handleMessage}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    </Modal>
  )
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: 50 },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 14, color: colors.textMuted },
  loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 10, backgroundColor: colors.surface },
  loaderText: { marginTop: 12, fontSize: 14, color: colors.textMuted },
});