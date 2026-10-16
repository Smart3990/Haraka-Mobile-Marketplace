import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Truck,
  Phone,
  MessageCircle,
  ArrowRight,
  Check,
  Flame,
  ChevronDown,
  X,
} from 'lucide-react-native';
import { GHANA_16_REGIONS, POPULAR_GHANA_TOWNS } from '../../src/lib/listingData';

export default function PostAdStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [sellingPrice, setSellingPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [region, setRegion] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [phone, setPhone] = useState('');
  const [allowWhatsApp, setAllowWhatsApp] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const numSelling = parseFloat(sellingPrice) || 0;
  const numOriginal = parseFloat(originalPrice) || 0;
  const hasDiscount = numOriginal > numSelling && numSelling > 0;
  const savings = hasDiscount ? numOriginal - numSelling : 0;
  const discountPercent = hasDiscount ? Math.round((savings / numOriginal) * 100) : 0;

  const popularTowns = POPULAR_GHANA_TOWNS[region] || [];

  const handleNext = () => {
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      setValidationError('Please enter a valid selling price greater than GH₵ 0.');
      return;
    }
    if (!region) {
      setValidationError('Please select a Ghana region.');
      return;
    }
    if (!neighborhood.trim() || neighborhood.trim().length < 3) {
      setValidationError('Neighborhood or landmark is required (at least 3 characters).');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setValidationError('Please enter a valid Ghana contact phone number.');
      return;
    }
    setValidationError(null);
    router.push({
      pathname: '/post-ad/step3',
      params: {
        ...params,
        price: sellingPrice,
        originalPrice: originalPrice,
        currency: 'GH₵',
        negotiable: isNegotiable ? 'true' : 'false',
        city: region,
        neighborhood,
        deliveryAvailable: deliveryAvailable ? 'true' : 'false',
        phone,
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Post Free Ad</Text>
          <Text style={styles.stepIndicator}>Step 2 of 3: Pricing & Location</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Stepper matching attached reference image */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperRelative}>
          {/* Connecting line 1 -> 2 (Bright Orange) */}
          <View style={[styles.connectorLine, styles.connectorLine1]} />
          {/* Connecting line 2 -> 3 (Light Slate) */}
          <View style={[styles.connectorLine, styles.connectorLine2]} />

          <View style={styles.stepsRow}>
            {/* Step 1: Completed with Green Circle and White Checkmark */}
            <View style={styles.stepColumn}>
              <View style={[styles.circle, styles.circleCompleted]}>
                <Check size={16} color="#FFFFFF" strokeWidth={3.5} />
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Item Details</Text>
            </View>

            {/* Step 2: Active with Vibrant Orange Circle and White 2 */}
            <View style={styles.stepColumn}>
              <View style={[styles.circle, styles.circleActive]}>
                <Text style={styles.circleNumberActive}>2</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelActive]}>Pricing & Delivery</Text>
            </View>

            {/* Step 3: Pending with Soft Slate Circle and Number 3 */}
            <View style={styles.stepColumn}>
              <View style={[styles.circle, styles.circlePending]}>
                <Text style={styles.circleNumberPending}>3</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelPending]}>Publish</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pricing Section: Selling Price & Original Price */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Selling Price (GH₵) <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.priceInputWrapper}>
            <Text style={styles.currencyPrefixActive}>GH₵</Text>
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              placeholder="e.g. 1800"
              placeholderTextColor="#94A3B8"
              value={sellingPrice}
              onChangeText={setSellingPrice}
            />
          </View>
          <Text style={styles.fieldSubtext}>Actual price the buyer pays for your item</Text>

          <Text style={[styles.label, { marginTop: 14 }]}>
            Original / Regular Price (GH₵) <Text style={styles.optionalTag}>(Optional)</Text>
          </Text>
          <View style={styles.priceInputWrapper}>
            <Text style={styles.currencyPrefixMuted}>GH₵</Text>
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              placeholder="e.g. 2200"
              placeholderTextColor="#94A3B8"
              value={originalPrice}
              onChangeText={setOriginalPrice}
            />
          </View>
          <Text style={styles.fieldSubtext}>Original retail or showroom price to highlight buyer savings</Text>

          {/* Discount & Savings text without background */}
          {hasDiscount && (
            <View style={styles.discountTextWrapper}>
              <View style={styles.discountHeaderRow}>
                <Flame size={15} color="#059669" />
                <Text style={styles.discountBannerTitle}>
                  Great Deal: Save GH₵ {savings.toLocaleString()} ({discountPercent}% OFF)
                </Text>
              </View>
              <Text style={styles.discountBannerSub}>
                A special discount badge will be showcased on your ad
              </Text>
            </View>
          )}

          {/* Negotiable Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Price is Negotiable</Text>
              <Text style={styles.toggleSub}>Allow buyers to send friendly offers & negotiate</Text>
            </View>
            <Switch
              value={isNegotiable}
              onValueChange={setIsNegotiable}
              trackColor={{ false: '#CBD5E1', true: '#FED7AA' }}
              thumbColor={isNegotiable ? '#FF6A00' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* Region Selection: 16 Regions of Ghana */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.label}>
              Region in Ghana <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={styles.badge16RegionsText}>16 Regions of Ghana</Text>
          </View>

          {/* Region Dropdown Trigger */}
          <Pressable
            style={[styles.regionSelectBtn, showRegionDropdown && styles.regionSelectBtnActive]}
            onPress={() => setShowRegionDropdown(!showRegionDropdown)}
          >
            <View style={styles.regionSelectLeft}>
              <MapPin size={16} color="#EA580C" />
              <Text style={styles.regionSelectText}>{region} Region</Text>
            </View>
            <ChevronDown
              size={18}
              color={showRegionDropdown ? '#EA580C' : '#64748B'}
              style={showRegionDropdown ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </Pressable>

          {/* Inline Region Dropdown Menu matching Category dropdown */}
          {showRegionDropdown && (
            <View style={styles.regionDropdownMenu}>
              <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                {GHANA_16_REGIONS.filter((reg) => reg.id !== 'all').map((reg) => {
                  const isSelected = region === reg.id || region === reg.name;
                  return (
                    <Pressable
                      key={reg.id}
                      style={[styles.regionDropdownItem, isSelected && styles.regionDropdownItemActive]}
                      onPress={() => {
                        setRegion(reg.name);
                        setShowRegionDropdown(false);
                      }}
                    >
                      <Text style={[styles.regionItemName, isSelected && styles.regionItemNameActive]}>
                        {reg.name} Region
                      </Text>
                      {isSelected && <Check size={16} color="#EA580C" strokeWidth={2.5} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Quick Town Chips for the Selected Region */}
          {popularTowns.length > 0 && (
            <View style={styles.popularTownsSection}>
              <Text style={styles.popularTownsTitle}>
                Popular towns / districts in {region}:
              </Text>
              <View style={styles.townChipsRow}>
                {popularTowns.slice(0, 8).map((town) => {
                  const isSelected = neighborhood === town;
                  return (
                    <Pressable
                      key={town}
                      style={[styles.townChip, isSelected && styles.townChipActive]}
                      onPress={() => setNeighborhood(town)}
                    >
                      <Text style={[styles.townChipText, isSelected && styles.townChipTextActive]}>
                        {town}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <Text style={[styles.label, { marginTop: 14 }]}>
            Neighborhood or Landmark <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. East Legon American House, Spintex Road, Osu Oxford St"
            placeholderTextColor="#94A3B8"
            value={neighborhood}
            onChangeText={setNeighborhood}
          />
        </View>

        {/* Delivery Options */}
        <View style={styles.section}>
          <Text style={styles.label}>Delivery & Logistics</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextGroup}>
              <View style={styles.iconHeadingRow}>
                <Truck size={16} color="#0284C7" />
                <Text style={styles.toggleTitle}>Courier Delivery Available</Text>
              </View>
              <Text style={styles.toggleSub}>I can send via dispatch rider / parcel across Ghana</Text>
            </View>
            <Switch
              value={deliveryAvailable}
              onValueChange={setDeliveryAvailable}
              trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
              thumbColor={deliveryAvailable ? '#0284C7' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Ghana Contact Phone Number</Text>
          <View style={styles.phoneInputRow}>
            <Phone size={16} color="#64748B" />
            <TextInput
              style={styles.phoneInput}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholder="+233 24 000 0000"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.iconHeadingRow}>
              <MessageCircle size={16} color="#16A34A" />
              <Text style={styles.toggleTitle}>Allow In-App Buyer Chats</Text>
            </View>
            <Switch
              value={allowWhatsApp}
              onValueChange={setAllowWhatsApp}
              trackColor={{ false: '#CBD5E1', true: '#BBF7D0' }}
              thumbColor={allowWhatsApp ? '#16A34A' : '#F1F5F9'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Next Button */}
      <View style={styles.footer}>
        {validationError ? (
          <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
            ⚠️ {validationError}
          </Text>
        ) : null}
        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Review & Publish (Step 3/3)</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitles: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepIndicator: {
    fontSize: 11,
    color: '#FF6A00',
    fontWeight: '700',
    marginTop: 2,
  },
  placeholder: {
    width: 36,
  },

  /* Stepper matching attached image */
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepperRelative: {
    position: 'relative',
    width: '100%',
  },
  connectorLine: {
    position: 'absolute',
    top: 15,
    height: 3.5,
    borderRadius: 2,
    zIndex: 1,
  },
  connectorLine1: {
    left: '16.66%',
    width: '33.33%',
    backgroundColor: '#FF6A00',
  },
  connectorLine2: {
    left: '50%',
    width: '33.33%',
    backgroundColor: '#E2E8F0',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  stepColumn: {
    flex: 1,
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F6',
  },
  circleCompleted: {
    backgroundColor: '#046A38',
  },
  circleActive: {
    backgroundColor: '#FF6A00',
    shadowColor: '#FF6A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  circlePending: {
    backgroundColor: '#EEF2F6',
  },
  circleNumberActive: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  circleNumberPending: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: '#046A38',
  },
  stepLabelActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  stepLabelPending: {
    color: '#64748B',
    fontWeight: '500',
  },

  /* Scroll Content & Sections */
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  currencyBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
  },
  currencyInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  flagEmoji: {
    fontSize: 20,
  },
  currencyNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C2D12',
  },
  currencyNoticeSub: {
    fontSize: 10,
    color: '#C2410C',
  },
  ghcOnlyPill: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ghcOnlyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#EF4444',
    fontWeight: '800',
  },
  optionalTag: {
    fontWeight: '400',
    color: '#94A3B8',
    fontSize: 11,
  },
  fieldSubtext: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 4,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  currencyPrefixActive: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FF6A00',
    marginRight: 8,
  },
  currencyPrefixMuted: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  discountTextWrapper: {
    marginTop: 8,
    paddingVertical: 4,
  },
  discountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065F46',
  },
  discountBannerSub: {
    fontSize: 10.5,
    color: '#047857',
    marginTop: 3,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  toggleTextGroup: {
    flex: 1,
  },
  iconHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },

  badge16Regions: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badge16RegionsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },

  regionSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  regionSelectBtnActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFFFFF',
  },
  regionSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regionSelectText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  regionDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 6,
    maxHeight: 220,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  regionDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regionDropdownItemActive: {
    backgroundColor: '#FFF7ED',
  },
  regionItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  regionItemNameActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  regionItemCapital: {
    fontSize: 10,
    color: '#64748B',
  },

  popularTownsSection: {
    marginTop: 10,
  },
  popularTownsTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  townChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  townChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  townChipActive: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  townChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  townChipTextActive: {
    color: '#FFFFFF',
  },

  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 13,
    color: '#0F172A',
  },

  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Image 2 Region Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 360,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  detectedBold: {
    fontWeight: '700',
    color: '#059669',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  modalList: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalRegionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    borderRadius: 10,
  },
  modalRegionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalRegionName: {
    fontSize: 12.5,
    color: '#334155',
  },
  modalRegionNameActive: {
    fontWeight: '800',
    color: '#0F172A',
  },
  detectedInlineText: {
    marginLeft: 6,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  nextBtn: {
    backgroundColor: '#FF6A00',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF6A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
