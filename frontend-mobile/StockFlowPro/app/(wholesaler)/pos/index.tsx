import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert,
  ActivityIndicator, Modal, FlatList, AppState
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../services/api';
import PaystackPayment from '../../../components/PaystackPayment';
import PressableScale from '../../../components/PressableScale';
import SuccessCheckmark from '../../../components/SuccessCheckmark';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useCurrency } from '../../../hooks/useCurrency';
import { ThemeColors } from '../../../theme/colors';
import { SkeletonRow } from '../../../components/Skeleton';
import { generateIdempotencyKey, enqueueSale, isNetworkFailure, flushQueue, getPendingSales } from '../../../services/offlineQueue';
import { showToast } from '../../../components/toast';

const MIN_QTY = 10;

type CartLine = { productId: number; name: string; unit: string; priceUsd: number; available: number; qty: number };

export default function WholesalerPOSScreen() {
  const { user } = useAuthStore()
  const { colors } = useThemeColors();
  const { country, convert, format } = useCurrency();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const PAYMENT_MODES = [
    { key: 'CASH', label: 'Cash', icon: 'cash-outline' },
    ...(country.paystackLive ? [{ key: 'CARD', label: 'Card', icon: 'card-outline' }] : []),
    { key: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'swap-horizontal-outline' },
    { key: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline' },
    { key: 'CREDIT', label: 'Credit', icon: 'time-outline' },
  ];
  const [stock, setStock] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [buyerName, setBuyerName] = useState('')
  const [payment, setPayment] = useState('CASH')
  const [dueDate, setDueDate] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [wantsInvoice, setWantsInvoice] = useState(true)
  const [isPickup, setIsPickup] = useState(false)
  const [buyerEmail, setBuyerEmail] = useState('')
  const [showPaystack, setShowPaystack] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const isPremium = user?.subscriptionPlan === 'PREMIUM'

  const syncPending = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await flushQueue();
      if (result.synced > 0) showToast(`${result.synced} offline order${result.synced > 1 ? 's' : ''} synced`);
      if (result.droppedErrors.length > 0) Alert.alert('Some offline orders failed to sync', result.droppedErrors.join('\n'));
      setPendingCount(result.failed);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    getPendingSales().then(p => setPendingCount(p.length));
    syncPending();
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') syncPending(); });
    return () => sub.remove();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [stockRes, partnerRes] = await Promise.all([
        api.get('/wholesaler/stock'),
        api.get('/links/partners'),
      ])
      setStock(stockRes.data || [])
      const retailers = (partnerRes.data || []).filter((p: any) =>
        p.status === 'ACTIVE' && (p.partnerBusiness?.tierType === 'RETAILER' || p.requesterBusiness?.tierType === 'RETAILER')
      ).map((p: any) => {
        const retailer = p.partnerBusiness?.tierType === 'RETAILER' ? p.partnerBusiness : p.requesterBusiness
        return { id: retailer.id, name: retailer.name }
      })
      setPartners(retailers)
    } catch (e) {
      console.log('Error fetching data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const results = search.length > 1
    ? stock.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : []

  const total = cart.reduce((sum, l) => sum + l.priceUsd * l.qty, 0);

  const addToCart = (p: any) => {
    setSearch('')
    setCart(c => {
      const existing = c.find(l => l.productId === p.id);
      if (existing) {
        return c.map(l => l.productId === p.id ? { ...l, qty: Math.min(l.available, l.qty + MIN_QTY) } : l);
      }
      return [...c, { productId: p.id, name: p.name, unit: p.unit, priceUsd: Number(p.priceUsd || 0), available: p.quantity, qty: Math.min(p.quantity, MIN_QTY) }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(c => c.map(l => l.productId === productId
      ? { ...l, qty: Math.max(MIN_QTY, Math.min(l.available, l.qty + delta)) }
      : l));
  };

  const removeLine = (productId: number) => {
    setCart(c => c.filter(l => l.productId !== productId));
  };

  const resetForm = () => {
    setCart([]); setSearch(''); setPayment('CASH'); setDueDate('');
    setSelectedPartner(null); setBuyerName(''); setWantsInvoice(true); setMobileNumber('');
    setIsPickup(false); setBuyerEmail('');
  };

  const confirmOrder = async () => {
    if (cart.length === 0) { Alert.alert('Empty cart', 'Add at least one product.'); return }
    if (!selectedPartner && !buyerName.trim()) { Alert.alert('Missing info', 'Select a linked retailer, or enter a buyer name for a walk-in sale.'); return }
    if (payment === 'MOBILE_MONEY' && !mobileNumber.trim()) { Alert.alert('Missing info', 'Please enter the mobile money number.'); return }
    if (payment === 'CREDIT' && !dueDate.trim()) { Alert.alert('Missing info', 'Please enter a due date for credit payment.'); return }
    if (isPickup && !buyerEmail.trim()) { Alert.alert('Missing info', "Enter the buyer's email to send the pickup code."); return }
    if (payment === 'CARD') { setShowPaystack(true); return }
    await recordSale(payment)
  }

  const recordSale = async (paymentMode: string, paystackReference?: string) => {
    setSubmitting(true)
    const body: any = {
      items: cart.map(l => ({ productId: l.productId, quantity: l.qty, amountUsd: Number((l.priceUsd * l.qty).toFixed(2)) })),
      paymentMode,
      idempotencyKey: generateIdempotencyKey(),
    }
    if (selectedPartner) body.retailerBusinessId = selectedPartner.id
    else body.buyerName = buyerName.trim()
    if (paymentMode === 'CREDIT') body.dueDate = dueDate
    if (paymentMode === 'CARD') body.paystackReference = paystackReference
    if (paymentMode === 'MOBILE_MONEY') body.mobileMoneyNumber = mobileNumber.trim()
    if (isPremium) body.wantsInvoice = isPickup ? true : wantsInvoice
    if (isPickup) { body.isPickup = true; body.buyerEmail = buyerEmail.trim() }

    try {
      const res = await api.post('/wholesaler/sell', body)
      const sale = res.data
      const itemLines = (sale.items || []).map((it: any) => `${it.productName} x${it.quantity}`).join('\n')
      const pickupLine = sale.pickupCode ? `\nPickup code: ${sale.pickupCode} (emailed to buyer)` : ''
      pendingSuccessRef.current = () => {
        Alert.alert('Order confirmed ✓', `${itemLines}\nTotal: ${format(Number(sale.totalUsd))} via ${paymentMode}${pickupLine}`, [
          { text: 'OK', onPress: () => { resetForm(); fetchData() } }
        ])
      };
      setShowSuccessAnim(true);
    } catch (e: any) {
      if (isNetworkFailure(e)) {
        await enqueueSale('/wholesaler/sell', body, `Order · ${format(total)}`);
        const pending = await getPendingSales();
        setPendingCount(pending.length);
        Alert.alert('Saved offline', 'No connection right now — this order is saved on the device and will sync automatically once you\'re back online.', [
          { text: 'OK', onPress: () => resetForm() }
        ]);
      } else {
        Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Sale failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const pendingSuccessRef = useRef<(() => void) | null>(null);

  const handlePaystackSuccess = async (reference: string) => {
    setShowPaystack(false)
    await recordSale('CARD', reference)
  }

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Bulk Orders</Text>
        <Text style={s.sub}>Sell to retailers</Text>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </View>
    </SafeAreaView>
  )

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
        message="Order complete"
        onDone={() => {
          setShowSuccessAnim(false);
          pendingSuccessRef.current?.();
          pendingSuccessRef.current = null;
        }}
      />

      <View style={s.header}>
        <Text style={s.title}>Bulk Orders</Text>
        <Text style={s.sub}>Sell to retailers</Text>
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ gap: 12, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {pendingCount > 0 && (
          <TouchableOpacity style={s.pendingBanner} onPress={syncPending} disabled={syncing}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
            <Text style={s.pendingBannerText}>{pendingCount} order{pendingCount > 1 ? 's' : ''} saved offline, not yet synced</Text>
            {syncing ? <ActivityIndicator size="small" color={colors.warning} /> : <Text style={s.pendingBannerRetry}>Retry</Text>}
          </TouchableOpacity>
        )}

        {/* Partner selector */}
        <TouchableOpacity style={s.partnerBtn} onPress={() => setShowPartnerModal(true)}>
          <Ionicons name="business-outline" size={16} color={colors.primary} />
          <Text style={[s.partnerBtnText, selectedPartner && { color: colors.textPrimary }]}>
            {selectedPartner ? selectedPartner.name : 'Select linked retailer (optional)'}
          </Text>
          <Ionicons name="chevron-down-outline" size={14} color={colors.textPlaceholder} />
        </TouchableOpacity>

        {!selectedPartner && (
          <View style={s.card}>
            <Text style={s.fieldLabel}>Buyer name (walk-in / not-yet-linked business)</Text>
            <View style={s.fieldInputRow}>
              <TextInput style={s.fieldInput} placeholder="e.g. Kojo's Store" placeholderTextColor={colors.textPlaceholder}
                value={buyerName} onChangeText={setBuyerName} />
            </View>
            <Text style={{ fontSize: 11, color: colors.textPlaceholder }}>Selling to someone with no StockFlow Pro account yet? Enter their business name here instead of picking a linked retailer.</Text>
          </View>
        )}

        {/* Stock search */}
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.textPlaceholder} style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search warehouse stock to add..." placeholderTextColor={colors.textPlaceholder}
            value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textPlaceholder} />
            </TouchableOpacity>
          )}
        </View>

        {results.length > 0 && (
          <View style={s.resultsBox}>
            {results.map(p => (
              <TouchableOpacity key={p.id} style={s.result} onPress={() => addToCart(p)}>
                <View style={s.resultIcon}>
                  <Ionicons name="archive-outline" size={16} color={colors.primary} />
                </View>
                <Text style={s.resultName}>{p.name}</Text>
                <Text style={s.resultStock}>{format(Number(p.priceUsd || 0))} · {p.quantity} {p.unit}</Text>
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
                <View key={line.productId} style={s.card}>
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
                    <Text style={s.stepLabel}>Quantity (min {MIN_QTY})</Text>
                    <View style={s.stepper}>
                      <TouchableOpacity style={s.stepBtn} onPress={() => updateQty(line.productId, -MIN_QTY)}>
                        <Ionicons name="remove" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <Text style={s.stepNum}>{line.qty}</Text>
                      <TouchableOpacity style={[s.stepBtn, s.stepBtnBlue]} onPress={() => updateQty(line.productId, MIN_QTY)}>
                        <Ionicons name="add" size={18} color={colors.onPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
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
            <Text style={s.cardComingSoon}>Card payments are coming soon to {country.name} — cash, bank transfer, mobile money, and credit work now.</Text>
          )}
        </View>

        {payment === 'CREDIT' && (
          <View style={s.card}>
            <Text style={s.fieldLabel}>Due date</Text>
            <View style={s.fieldInputRow}>
              <TextInput style={s.fieldInput} placeholder="e.g. 2026-07-30" placeholderTextColor={colors.textPlaceholder}
                value={dueDate} onChangeText={setDueDate} />
            </View>
            <Text style={{ fontSize: 11, color: colors.textPlaceholder }}>A credit record will be created for this retailer</Text>
          </View>
        )}

        {payment === 'MOBILE_MONEY' && (
          <View style={s.card}>
            <Text style={s.fieldLabel}>Mobile money number</Text>
            <View style={s.fieldInputRow}>
              <TextInput style={s.fieldInput} placeholder="e.g. 0244000000" placeholderTextColor={colors.textPlaceholder}
                value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
            </View>
          </View>
        )}

        {payment === 'CARD' && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
              <Text style={{ fontSize: 12, color: colors.success, fontWeight: '600' }}>Secure card payment via Paystack</Text>
            </View>
          </View>
        )}

        {isPremium && cart.length > 0 && (
          <TouchableOpacity style={s.invoiceToggleRow} onPress={() => setWantsInvoice(v => !v)}>
            <Ionicons name={wantsInvoice ? 'checkbox' : 'square-outline'} size={20} color={wantsInvoice ? colors.primary : colors.textPlaceholder} />
            <Text style={s.invoiceToggleText}>Buyer wants an invoice</Text>
          </TouchableOpacity>
        )}

        {cart.length > 0 && (
          <View>
            <TouchableOpacity style={s.invoiceToggleRow} onPress={() => setIsPickup(v => !v)}>
              <Ionicons name={isPickup ? 'checkbox' : 'square-outline'} size={20} color={isPickup ? colors.primary : colors.textPlaceholder} />
              <Text style={s.invoiceToggleText}>Buyer is collecting later (send pickup code)</Text>
            </TouchableOpacity>
            {isPickup && (
              <View style={[s.card, { marginTop: 8 }]}>
                <Text style={s.fieldLabel}>Buyer email</Text>
                <View style={s.fieldInputRow}>
                  <TextInput style={s.fieldInput} placeholder="buyer@email.com" placeholderTextColor={colors.textPlaceholder}
                    value={buyerEmail} onChangeText={setBuyerEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
              </View>
            )}
          </View>
        )}

        {cart.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Order summary</Text>
            {cart.map(line => (
              <View key={line.productId} style={s.summaryRow}>
                <Text style={s.summaryItem}>{line.name} x{line.qty}</Text>
                <Text style={s.summaryAmt}>{format(line.priceUsd * line.qty)}</Text>
              </View>
            ))}
            <View style={s.dividerLine} />
            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalAmt}>{format(total)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        <PressableScale style={[s.confirmBtn, (cart.length === 0 || submitting) && { opacity: 0.4 }]} onPress={confirmOrder} disabled={cart.length === 0 || submitting} haptic>
          {submitting ? <ActivityIndicator color={colors.onPrimary} /> : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.onPrimary} style={{ marginRight: 8 }} />
              <Text style={s.confirmText}>Confirm Order · {format(total)}</Text>
            </>
          )}
        </PressableScale>
      </View>

      {/* Partner modal */}
      <Modal visible={showPartnerModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPartnerModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Select Retailer</Text>
            <TouchableOpacity onPress={() => setShowPartnerModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {partners.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="people-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No linked retailers</Text>
              <Text style={s.emptySub}>Retailers must send you a link request first</Text>
            </View>
          ) : (
            <FlatList
              data={partners}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.partnerItem} onPress={() => { setSelectedPartner(item); setShowPartnerModal(false) }}>
                  <View style={s.partnerIcon}>
                    <Ionicons name="storefront-outline" size={18} color={colors.success} />
                  </View>
                  <Text style={s.partnerName}>{item.name}</Text>
                  <Ionicons name="checkmark-circle" size={18} color={selectedPartner?.id === item.id ? colors.success : colors.borderStrong} />
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  body: { flex: 1, padding: 12 },
  partnerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  partnerBtnText: { flex: 1, fontSize: 13, color: colors.textPlaceholder },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 13, color: colors.textSecondary },
  resultsBox: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, overflow: 'hidden' },
  result: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  resultIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  resultName: { flex: 1, fontSize: 13, color: colors.textPrimary },
  resultStock: { fontSize: 12, color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: colors.border, gap: 8 },
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
  fieldLabel: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  fieldInputRow: { borderWidth: 0.5, borderColor: colors.borderStrong, borderRadius: 10, overflow: 'hidden' },
  fieldInput: { padding: 10, fontSize: 13, color: colors.textPrimary },
  invoiceToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: colors.border },
  invoiceToggleText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { fontSize: 12, color: colors.textMuted },
  summaryAmt: { fontSize: 12, fontWeight: '500', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  dividerLine: { height: 0.5, backgroundColor: colors.border },
  totalLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  totalAmt: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  footer: { padding: 12, backgroundColor: colors.surface, borderTopWidth: 0.5, borderTopColor: colors.borderStrong },
  confirmBtn: { backgroundColor: colors.success, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: colors.onPrimary, fontSize: 14, fontWeight: '600' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  partnerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  partnerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.successSurface, alignItems: 'center', justifyContent: 'center' },
  partnerName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center', paddingHorizontal: 40 },
})
