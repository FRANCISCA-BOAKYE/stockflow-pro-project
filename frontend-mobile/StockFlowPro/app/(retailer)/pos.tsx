import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, AppState
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import PaystackPayment from '../../components/PaystackPayment';
import SuccessCheckmark from '../../components/SuccessCheckmark';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useCurrency } from '../../hooks/useCurrency';
import { ThemeColors } from '../../theme/colors';
import { generateIdempotencyKey, enqueueSale, isNetworkFailure, flushQueue, getPendingSales } from '../../services/offlineQueue';
import { showToast } from '../../components/toast';
import Card from '../../components/Card';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import { space } from '../../theme/spacing';

type CartLine = { productId: number; name: string; unit: string; priceUsd: number; available: number; qty: number };

export default function POSScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeColors();
  const { country, convert, format } = useCurrency();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payment, setPayment] = useState('CASH');
  const [creditBuyer, setCreditBuyer] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [wantsInvoice, setWantsInvoice] = useState(true);
  const [isPickup, setIsPickup] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [showPaystack, setShowPaystack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const isPremium = user?.subscriptionPlan === 'PREMIUM';

  const refreshPendingCount = useCallback(async () => {
    const pending = await getPendingSales();
    setPendingCount(pending.length);
  }, []);

  const syncPending = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await flushQueue();
      if (result.synced > 0) showToast(`${result.synced} offline sale${result.synced > 1 ? 's' : ''} synced`);
      if (result.droppedErrors.length > 0) {
        Alert.alert('Some offline sales failed to sync', result.droppedErrors.join('\n'));
      }
      setPendingCount(result.failed);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();
    syncPending();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncPending();
    });
    return () => sub.remove();
  }, []);

  const PAYMENT_MODES = [
    { key: 'CASH', label: 'Cash', icon: 'cash-outline' },
    ...(country.paystackLive ? [{ key: 'CARD', label: 'Card', icon: 'card-outline' }] : []),
    { key: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline' },
    { key: 'CREDIT', label: 'Credit', icon: 'time-outline' },
  ];

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get(`/retailer/products${search.length > 1 ? `?search=${search}` : ''}`);
      setProducts(res.data?.content || res.data || []);
    } catch (e) {
      console.log('Error fetching products:', e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const results = search.length > 1 ? products : [];
  const total = cart.reduce((sum, l) => sum + l.priceUsd * l.qty, 0);

  const addToCart = (p: any) => {
    setSearch('');
    setCart(c => {
      const existing = c.find(l => l.productId === p.id);
      if (existing) {
        return c.map(l => l.productId === p.id ? { ...l, qty: Math.min(l.available, l.qty + 1) } : l);
      }
      return [...c, { productId: p.id, name: p.name, unit: p.unit, priceUsd: Number(p.priceUsd), available: p.quantity, qty: 1 }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(c => c.map(l => l.productId === productId
      ? { ...l, qty: Math.max(1, Math.min(l.available, l.qty + delta)) }
      : l));
  };

  const removeLine = (productId: number) => {
    setCart(c => c.filter(l => l.productId !== productId));
  };

  const resetForm = () => {
    setCart([]); setSearch(''); setPayment('CASH'); setCreditBuyer('');
    setDueDate(''); setMobileNumber(''); setBuyerContact(''); setBuyerAddress('');
    setWantsInvoice(true);
    setIsPickup(false); setBuyerEmail('');
  };

  const confirmSale = async () => {
    if (cart.length === 0) { Alert.alert('Empty cart', 'Add at least one product.'); return; }
    if (payment === 'CREDIT' && !creditBuyer.trim()) { Alert.alert('Missing info', 'Enter the buyer name for credit.'); return; }
    if (payment === 'MOBILE_MONEY' && !mobileNumber.trim()) { Alert.alert('Missing info', 'Enter the mobile money number.'); return; }
    if (payment === 'CREDIT' && !dueDate.trim()) { Alert.alert('Missing info', 'Enter a due date for credit.'); return; }
    if (isPickup && !buyerEmail.trim()) { Alert.alert('Missing info', 'Enter the customer\'s email to send the pickup code.'); return; }
    if (payment === 'CARD') { setShowPaystack(true); return; }
    await recordSale(payment);
  };

  const recordSale = async (paymentMode: string, paystackReference?: string) => {
    setSubmitting(true);
    const body: any = {
      items: cart.map(l => ({ productId: l.productId, quantity: l.qty, unitPriceUsd: l.priceUsd })),
      paymentMode,
      buyerName: creditBuyer || user?.name || 'Walk-in customer',
      idempotencyKey: generateIdempotencyKey(),
    };
    try {
      if (paymentMode === 'CARD') {
        body.paystackReference = paystackReference;
      }
      if (paymentMode === 'MOBILE_MONEY') {
        body.mobileMoneyNumber = mobileNumber.trim();
      }
      if (paymentMode === 'CREDIT') {
        body.dueDate = dueDate;
      }
      if (buyerContact.trim()) {
        body.buyerContact = buyerContact.trim();
      }
      if (isPremium && buyerAddress.trim()) {
        body.buyerAddress = buyerAddress.trim();
      }
      if (isPremium) {
        body.wantsInvoice = isPickup ? true : wantsInvoice;
      }
      if (isPickup) {
        body.isPickup = true;
        body.buyerEmail = buyerEmail.trim();
      }
      const res = await api.post('/pos/retail', body);
      const inv = res.data;
      const itemLines = (inv.items || []).map((it: any) => `${it.productName} x${it.quantity}`).join('\n');
      const pickupLine = inv.pickupCode ? `\nPickup code: ${inv.pickupCode} (emailed to customer)` : '';
      const customerLine = inv.customerId ? `\nCustomer ID: ${inv.customerId}` : '';
      pendingSuccessRef.current = () => {
        Alert.alert(
          'Sale confirmed ✓',
          `${itemLines}\nTotal: ${format(Number(inv.totalUsd))}\nInvoice: ${inv.invoiceNumber || '—'}${pickupLine}${customerLine}`,
          [{ text: 'OK', onPress: () => { resetForm(); fetchProducts(); } }]
        );
      };
      setShowSuccessAnim(true);
    } catch (e: any) {
      if (isNetworkFailure(e)) {
        await enqueueSale('/pos/retail', body, `Sale · ${format(total)}`);
        await refreshPendingCount();
        Alert.alert(
          'Saved offline',
          'No connection right now — this sale is saved on the device and will sync automatically once you\'re back online.',
          [{ text: 'OK', onPress: () => { resetForm(); } }]
        );
      } else {
        Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Sale failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const pendingSuccessRef = useRef<(() => void) | null>(null);

  const handlePaystackSuccess = async (reference: string) => {
    setShowPaystack(false);
    await recordSale('CARD', reference);
  };

  return (
    <SafeAreaView style={s.page}>
      <PaystackPayment
        visible={showPaystack}
        email={user?.email || 'customer@business.com'}
        amount={convert(total)}
        currencyCode={country.currencyCode}
        onSuccess={handlePaystackSuccess}
        onClose={() => setShowPaystack(false)}
      />
      <SuccessCheckmark
        visible={showSuccessAnim}
        message="Sale complete"
        onDone={() => {
          setShowSuccessAnim(false);
          pendingSuccessRef.current?.();
          pendingSuccessRef.current = null;
        }}
      />
      <View style={s.header}>
        <Text style={s.title}>POS</Text>
        <Text style={s.sub}>New sale</Text>
      </View>
      <ScrollView style={s.body} contentContainerStyle={{ gap: 12, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {pendingCount > 0 && (
          <TouchableOpacity style={s.pendingBanner} onPress={syncPending} disabled={syncing}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
            <Text style={s.pendingBannerText}>
              {pendingCount} sale{pendingCount > 1 ? 's' : ''} saved offline, not yet synced
            </Text>
            {syncing ? <ActivityIndicator size="small" color={colors.warning} /> : (
              <Text style={s.pendingBannerRetry}>Retry</Text>
            )}
          </TouchableOpacity>
        )}
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.textPlaceholder} style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search products to add..." placeholderTextColor={colors.textPlaceholder}
            value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textPlaceholder} />
            </TouchableOpacity>
          )}
        </View>

        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}

        {results.length > 0 && (
          <View style={s.resultsBox}>
            {results.map(p => (
              <TouchableOpacity key={p.id} style={s.result} onPress={() => addToCart(p)}>
                <View style={s.resultIcon}>
                  <Ionicons name="cube-outline" size={16} color={colors.primary} />
                </View>
                <Text style={s.resultName}>{p.name}</Text>
                <Text style={s.resultPrice}>{format(Number(p.priceUsd))}</Text>
                <Ionicons name="add-circle" size={20} color={colors.success} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {cart.length > 0 && (
          <View>
            <Text style={s.sectionLabel}>Cart ({cart.length} item{cart.length > 1 ? 's' : ''})</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {cart.map(line => (
                <Card key={line.productId} style={{ gap: space[2] }} radiusSize="lg" padding={space[4]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.prodName}>{line.name}</Text>
                      <Text style={s.prodPrice}>{format(line.priceUsd)} per {line.unit} · {line.available} available</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeLine(line.productId)}>
                      <Ionicons name="trash-outline" size={17} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                  <View style={s.stepperRow}>
                    <Text style={s.stepLabel}>Quantity</Text>
                    <View style={s.stepper}>
                      <TouchableOpacity style={s.stepBtn} onPress={() => updateQty(line.productId, -1)}>
                        <Ionicons name="remove" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <Text style={s.stepNum}>{line.qty}</Text>
                      <TouchableOpacity style={[s.stepBtn, s.stepBtnBlue]} onPress={() => updateQty(line.productId, 1)}>
                        <Ionicons name="add" size={18} color={colors.onPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        <View>
          <Text style={s.sectionLabel}>Payment mode</Text>
          <View style={s.paymentRow}>
            {PAYMENT_MODES.map(mode => (
              <TouchableOpacity key={mode.key} style={[s.payBtn, payment === mode.key && s.payBtnActive]} onPress={() => setPayment(mode.key)}>
                <Ionicons name={mode.icon as any} size={13} color={payment === mode.key ? colors.onPrimary : colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[s.payBtnText, payment === mode.key && s.payBtnTextActive]}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {!country.paystackLive && (
            <Text style={s.cardComingSoon}>Card payments are coming soon to {country.name} — cash, mobile money, and credit work now.</Text>
          )}
        </View>

        {cart.length > 0 && (
          <Card style={{ gap: space[1] }} radiusSize="lg" padding={space[4]}>
            <FormField
              label={`Buyer name ${payment === 'CREDIT' ? '' : '(optional)'}`}
              placeholder="Customer name"
              value={creditBuyer}
              onChangeText={setCreditBuyer}
            />
            <FormField
              label="Customer phone (optional)"
              placeholder="e.g. 0244000000"
              value={buyerContact}
              onChangeText={setBuyerContact}
              keyboardType="phone-pad"
            />
            <Text style={{ fontSize: 11, color: colors.textPlaceholder, marginTop: -8 }}>Enter their phone to link this sale to their permanent customer ID — repeat visits build one purchase history instead of starting over each time.</Text>
            {payment === 'CREDIT' && (
              <FormField
                label="Due date"
                placeholder="e.g. 2026-07-30"
                value={dueDate}
                onChangeText={setDueDate}
              />
            )}
            {isPremium && (
              <FormField
                label="Address (optional)"
                placeholder="Customer address"
                value={buyerAddress}
                onChangeText={setBuyerAddress}
              />
            )}
          </Card>
        )}

        {isPremium && cart.length > 0 && (
          <TouchableOpacity style={s.invoiceToggleRow} onPress={() => setWantsInvoice(v => !v)}>
            <Ionicons name={wantsInvoice ? 'checkbox' : 'square-outline'} size={20} color={wantsInvoice ? colors.primary : colors.textPlaceholder} />
            <Text style={s.invoiceToggleText}>Customer wants an invoice</Text>
          </TouchableOpacity>
        )}

        {cart.length > 0 && (
          <View>
            <TouchableOpacity style={s.invoiceToggleRow} onPress={() => setIsPickup(v => !v)}>
              <Ionicons name={isPickup ? 'checkbox' : 'square-outline'} size={20} color={isPickup ? colors.primary : colors.textPlaceholder} />
              <Text style={s.invoiceToggleText}>Customer is collecting later (send pickup code)</Text>
            </TouchableOpacity>
            {isPickup && (
              <Card style={{ marginTop: 8 }} radiusSize="lg" padding={space[4]}>
                <FormField
                  label="Customer email"
                  placeholder="customer@email.com"
                  value={buyerEmail}
                  onChangeText={setBuyerEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Card>
            )}
          </View>
        )}

        {payment === 'MOBILE_MONEY' && (
          <Card radiusSize="lg" padding={space[4]}>
            <FormField
              label="Mobile money number"
              placeholder="e.g. 0244000000"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
          </Card>
        )}

        {payment === 'CARD' && (
          <Card radiusSize="lg" padding={space[4]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
              <Text style={{ fontSize: 12, color: colors.success, fontWeight: '600' }}>Secure card payment via Paystack</Text>
            </View>
          </Card>
        )}

        {cart.length > 0 && (
          <Card style={{ gap: space[2] }} radiusSize="lg" padding={space[4]}>
            <Text style={s.sectionLabel}>Order summary</Text>
            {cart.map(line => (
              <View key={line.productId} style={s.summaryRow}>
                <Text style={s.summaryItem}>{line.name} x{line.qty}</Text>
                <Text style={s.summaryAmt}>{format(line.priceUsd * line.qty)}</Text>
              </View>
            ))}
            <View style={s.divider} />
            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalAmt}>{format(total)}</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      <View style={s.footer}>
        <Button
          title={`Confirm Sale · ${format(total)}`}
          onPress={confirmSale}
          disabled={cart.length === 0}
          loading={submitting}
          icon="checkmark-circle-outline"
          iconPosition="left"
          style={{ backgroundColor: colors.success, shadowColor: colors.success }}
        />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  body: { flex: 1, padding: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 13, color: colors.textSecondary },
  resultsBox: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, overflow: 'hidden' },
  result: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  resultIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  resultName: { flex: 1, fontSize: 13, color: colors.textPrimary },
  resultPrice: { fontSize: 13, fontWeight: '600', color: colors.primary, fontVariant: ['tabular-nums'] },
  prodName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  prodPrice: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 0.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  stepBtnBlue: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNum: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, minWidth: 28, textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  cardComingSoon: { fontSize: 11, color: colors.textPlaceholder, marginTop: 8, lineHeight: 15 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.warningSurface, borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: colors.warning + '33' },
  pendingBannerText: { flex: 1, fontSize: 12, color: colors.warning, fontWeight: '500' },
  pendingBannerRetry: { fontSize: 12, color: colors.warning, fontWeight: '700' },
  paymentRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  payBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border },
  payBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  payBtnText: { fontSize: 12, color: colors.textSecondary },
  payBtnTextActive: { color: colors.onPrimary, fontWeight: '500' },
  invoiceToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: colors.border },
  invoiceToggleText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { fontSize: 12, color: colors.textMuted },
  summaryAmt: { fontSize: 12, fontWeight: '500', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  divider: { height: 0.5, backgroundColor: colors.border },
  totalLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  totalAmt: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  footer: { padding: 12, backgroundColor: colors.surface, borderTopWidth: 0.5, borderTopColor: colors.borderStrong },
});
