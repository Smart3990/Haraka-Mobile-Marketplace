import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  Store,
  Wrench,
  Check,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  TrendingUp,
  User,
  Smartphone,
  Laptop,
  CarFront,
  Shirt,
  Armchair,
  Building2,
  MapPin,
  Lock,
  Camera,
  Banknote,
  ChevronDown,
  BadgeCheck,
  Gauge,
  Navigation,
  Mail,
  Phone,
  CreditCard,
  Zap,
  Truck,
  MessageSquare,
  AlertCircle,
} from 'lucide-react-native';

export default function RegisterSellerScreen({ initialType }: { initialType?: 'goods' | 'artisan' } = {}) {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ type?: string }>();
  const initialSellerType = initialType || (searchParams?.type === 'artisan' ? 'artisan' : 'goods');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sellerType, setSellerType] = useState<'goods' | 'artisan'>(initialSellerType);
  const [accountType, setAccountType] = useState<'individual' | 'shop'>('individual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [displayName, setDisplayName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [cityNeighborhood, setCityNeighborhood] = useState('');
  const [isHomeBased, setIsHomeBased] = useState(false);
  const [ghanaCardPin, setGhanaCardPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [allowWhatsApp, setAllowWhatsApp] = useState(false);
  const [isIdVerificationSkipped, setIsIdVerificationSkipped] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectSuccess, setLocationDetectSuccess] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [ghanaCardId, setGhanaCardId] = useState('');
  const [sellerBio, setSellerBio] = useState('');
  const [sellerAvatar, setSellerAvatar] = useState<string | null>(null);
  const [neighborhoodPrivacyGuard, setNeighborhoodPrivacyGuard] = useState(true);
  const [selectedSafeHubs, setSelectedSafeHubs] = useState<string[]>([]);
  const [customLandmarkInput, setCustomLandmarkInput] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [allowCourierDispatch, setAllowCourierDispatch] = useState(true);
  const [confirmSafeTradePayout, setConfirmSafeTradePayout] = useState(false);
  const [businessCert, setBusinessCert] = useState('');
  const [isCertSkipped, setIsCertSkipped] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const GHANA_VALID_PREFIXES = [
    '20', '23', '24', '25', '26', '27', '28',
    '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
    '50', '53', '54', '55', '56', '57', '58', '59',
  ];

  const cleanGhanaPhoneNumber = (val: string): string => {
    if (!val) return '';
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('233')) {
      digits = digits.slice(3);
    }
    if (digits.startsWith('0')) {
      digits = digits.replace(/^0+/, '');
    }
    return digits.slice(0, 9);
  };

  const isValidGhanaPhoneNumber = (val: string): boolean => {
    const cleaned = cleanGhanaPhoneNumber(val);
    if (cleaned.length !== 9) return false;
    const prefix = cleaned.slice(0, 2);
    return GHANA_VALID_PREFIXES.includes(prefix);
  };

  const formatGhanaPhoneDisplay = (val: string): string => {
    const cleaned = cleanGhanaPhoneNumber(val);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = 'Full legal name is required';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    const cleaned = cleanGhanaPhoneNumber(phoneNumber);
    if (!cleaned) {
      errs.phoneNumber = 'Phone number is required';
    } else if (cleaned.length !== 9 || !isValidGhanaPhoneNumber(cleaned)) {
      errs.phoneNumber = 'Please enter a valid 9-digit Ghanaian phone number (e.g. 24 498 1209)';
    }
    if (!gender) {
      errs.gender = 'Please select a gender';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!displayName.trim()) {
      errs.displayName = accountType === 'shop' ? 'Shop / Business Name is required' : 'Business or Display Name is required';
    }
    if (selectedCategories.length === 0) {
      errs.selectedCategories = 'Please select at least one primary product category';
    }
    if (!region.trim()) {
      errs.region = 'Region is required';
    }
    if (!cityNeighborhood.trim()) {
      errs.cityNeighborhood = 'City / Neighborhood is required';
    }
    if (!allowWhatsApp) {
      errs.allowWhatsApp = 'Consent is required to continue';
    }
    // Identity Verification is required unless explicitly skipped
    if (!isIdVerificationSkipped) {
      const pinClean = ghanaCardPin.replace(/[^0-9]/g, '');
      if (!ghanaCardPin || pinClean.length < 9) {
        errs.ghanaCardPin = 'Ghana Card PIN is required (or tap Skip to continue)';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!sellerAvatar) {
      errs.sellerAvatar = 'Applicant profile picture is required (*). Please upload a profile photo.';
    }
    if (!sellerBio.trim()) {
      errs.sellerBio = 'Seller Bio / Handshake Note is required';
    } else if (sellerBio.trim().length < 10) {
      errs.sellerBio = 'Please enter at least 10 characters for your Seller Bio';
    }
    // Preferred safe meetup hubs are now optional
    if (!confirmSafeTradePayout) {
      errs.confirmSafeTradePayout = 'Please confirm the safe exchange and peer payout agreement';
    }
    // Verification section in Step 3 is explicitly exempt
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
              else router.replace('/register-partner' as any);
            }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Seller Registration</Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={styles.shareBtn}
            onPress={async () => {
              try {
                await Share.share({
                  title: 'Haraka Seller Registration',
                  message: 'Join Haraka as a Seller! Register as a verified seller or skilled artisan across Ghana: https://haraka.app/register-seller',
                });
              } catch (error) {
                // Ignore cancel
              }
            }}
          >
            <Share2 size={18} color="#475569" />
          </Pressable>
          {step === 2 || step === 3 ? (
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' }}
              style={styles.avatarThumb}
              contentFit="cover"
            />
          ) : (
            <View style={styles.logoBadge}>
              <Image
                source={{ uri: '/logo_haraka_trans.png' }}
                style={styles.logoThumb}
                contentFit="contain"
              />
            </View>
          )}
        </View>
      </View>

      {step === 1 && (
        <View style={styles.subHeader}>
          <View style={styles.subHeaderRow}>
            <Text style={styles.stepText}>
              {accountType === 'individual' ? 'STEP 1 OF 3' : 'STEP 1 OF 2'}
            </Text>
            <Text style={styles.stepTitle}>Seller Account & Personal Info</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressActive, { width: accountType === 'individual' ? '33%' : '50%' }]} />
            <View style={styles.progressInactive} />
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.subHeader}>
          <View style={styles.subHeaderRow}>
            <Pressable onPress={() => setStep(1)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={13} color="#059669" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#065F46' }}>
                Step 1: {fullName || (accountType === 'shop' ? 'Shop / Store' : 'Individual')}
              </Text>
            </Pressable>
            <Text style={styles.stepText}>
              {accountType === 'individual' ? 'STEP 2 OF 3' : 'STEP 2 OF 2'}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressActive, { width: accountType === 'individual' ? '66%' : '100%' }]} />
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.subHeader}>
          <View style={styles.subHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable onPress={() => setStep(1)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} color="#059669" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#065F46' }}>Step 1: Info</Text>
              </Pressable>
              <Pressable onPress={() => setStep(2)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} color="#059669" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#065F46' }}>Step 2: ID</Text>
              </Pressable>
            </View>
            <Text style={styles.stepText}>STEP 3 OF 3</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressActive, { width: '100%' }]} />
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <View style={styles.stepContainer}>
            {/* Hero Banner: Become a Verified Seller (exact match to Image 4) */}
            <View style={styles.verifiedBanner}>
              <View style={styles.verifiedBannerHeader}>
                <View style={styles.verifiedSquareIcon}>
                  <BadgeCheck size={30} color="#065F46" fill="#FFFFFF" strokeWidth={2.8} />
                </View>
                <View style={styles.verifiedBannerText}>
                  <Text style={styles.verifiedBannerTitle}>Become a Verified Seller</Text>
                  <Text style={styles.verifiedBannerDesc}>
                    Unlock the <Text style={{ color: '#065F46', fontWeight: '800' }}>Verified Badge</Text>, gain immediate buyer trust, and boost listing reach across Ghana today!
                  </Text>
                </View>
              </View>

              <View style={styles.verifiedValuesRow}>
                <View style={styles.valueItem}>
                  <View style={styles.gaugeDot}>
                    <Gauge size={10} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.valueText}>2x Fast Sales</Text>
                </View>
                <View style={styles.valueItem}>
                  <ShieldCheck size={16} color="#FF6A00" fill="#FF6A00" strokeWidth={2} />
                  <Text style={styles.valueText}>Anti-Scam Shield</Text>
                </View>
                <View style={styles.valueItem}>
                  <Navigation size={14} color="#0284C7" fill="#0284C7" style={{ transform: [{ rotate: '45deg' }] }} />
                  <Text style={styles.valueText}>Top Local Feed</Text>
                </View>
              </View>
            </View>

            {/* Card 1: Seller Account Type */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Seller Account Type</Text>
              <Text style={styles.cardDesc}>Choose how you plan to conduct peer commerce on Haraka.</Text>

              <View style={styles.twoColGrid}>
                <Pressable
                  style={[styles.accountOption, accountType === 'individual' && styles.accountOptionActive]}
                  onPress={() => setAccountType('individual')}
                >
                  <View style={[styles.userCircle, accountType === 'individual' && styles.userCircleActive]}>
                    <User size={20} color={accountType === 'individual' ? '#FFFFFF' : '#334155'} />
                  </View>
                  <Text style={styles.accountOptionTitle}>Individual</Text>
                  <Text style={[styles.accountOptionSub, accountType === 'individual' && styles.accountOptionSubActive]}>
                    Private Seller
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.accountOption, accountType === 'shop' && styles.accountOptionActive]}
                  onPress={() => setAccountType('shop')}
                >
                  <View style={[styles.shopCircle, accountType === 'shop' && styles.shopCircleActive]}>
                    <Store size={20} color={accountType === 'shop' ? '#FFFFFF' : '#334155'} />
                  </View>
                  <Text style={styles.accountOptionTitle}>Shop / Store</Text>
                  <Text style={[styles.accountOptionSub, accountType === 'shop' && styles.accountOptionSubActive]}>
                    Commercial Hub
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Card 2: Personal Information */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              <Text style={styles.cardDesc}>
                Your official identity details for verified status and buyer safety.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Full Legal Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={[styles.iconInputBox, errors.fullName ? styles.inputError : null]}>
                  <User size={18} color={errors.fullName ? '#DC2626' : '#475569'} />
                  <TextInput
                    style={styles.rawInput}
                    value={fullName}
                    onChangeText={(text: string) => {
                      setFullName(text);
                      clearError('fullName');
                    }}
                    placeholder="e.g. Kofi Mensah"
                  />
                </View>
                {errors.fullName ? (
                  <View style={styles.errorRow}>
                    <AlertCircle size={12} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.fullName}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={[styles.iconInputBox, errors.email ? styles.inputError : null]}>
                  <Mail size={18} color={errors.email ? '#DC2626' : '#475569'} />
                  <TextInput
                    style={styles.rawInput}
                    value={email}
                    onChangeText={(text: string) => {
                      setEmail(text);
                      clearError('email');
                    }}
                    placeholder="e.g. kofi.mensah@gmail.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email ? (
                  <View style={styles.errorRow}>
                    <AlertCircle size={12} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Phone Number <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={[styles.phoneBox, errors.phoneNumber ? styles.inputError : null]}>
                  <Text style={styles.phonePrefix}>GH +233</Text>
                  <TextInput
                    style={[styles.rawInput, { fontWeight: '700' }]}
                    value={phoneNumber}
                    onChangeText={(text: string) => {
                      const cleaned = cleanGhanaPhoneNumber(text);
                      setPhoneNumber(formatGhanaPhoneDisplay(cleaned));
                      clearError('phoneNumber');
                    }}
                    placeholder="24 498 1209"
                    keyboardType="phone-pad"
                    maxLength={12}
                  />
                  <View
                    style={[
                      styles.phoneCheckCircle,
                      !isValidGhanaPhoneNumber(phoneNumber) && { backgroundColor: '#E2E8F0' },
                    ]}
                  >
                    <Check
                      size={13}
                      color={isValidGhanaPhoneNumber(phoneNumber) ? '#FFFFFF' : '#94A3B8'}
                      strokeWidth={3}
                    />
                  </View>
                </View>
                {errors.phoneNumber ? (
                  <View style={styles.errorRow}>
                    <AlertCircle size={12} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Gender <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  {(['Male', 'Female'] as const).map((gen) => (
                    <Pressable
                      key={gen}
                      style={[
                        styles.chip,
                        gender === gen && styles.chipActive,
                        { flex: 1, alignItems: 'center', justifyContent: 'center' },
                      ]}
                      onPress={() => {
                        setGender(gen);
                        clearError('gender');
                      }}
                    >
                      <Text style={[styles.chipText, gender === gen && styles.chipTextActive]}>{gen}</Text>
                    </Pressable>
                  ))}
                </View>
                {errors.gender ? (
                  <View style={styles.errorRow}>
                    <AlertCircle size={12} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.gender}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Proceed to Step 2 Button */}
            <Pressable
              style={styles.continueBtnOrange}
              onPress={() => {
                if (validateStep1()) {
                  setStep(2);
                }
              }}
            >
              <Text style={styles.continueBtnText}>
                Proceed to Step 2
              </Text>
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            {/* Step 2 Account Type Summary Bar */}
            <View style={{ backgroundColor: '#F1F5F9', borderRadius: 16, padding: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 11.5, color: '#64748B' }}>Account Type:</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F172A' }}>
                  {accountType === 'shop' ? 'Shop / Store (Commercial Hub)' : 'Individual (Private Seller)'}
                </Text>
              </View>
              <Pressable onPress={() => setStep(1)}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF6A00' }}>Change</Text>
              </Pressable>
            </View>

            {/* Card: Business or Display Name */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {accountType === 'shop' ? 'Shop / Business Name' : 'Business or Display Name'}{' '}
                <Text style={styles.requiredStar}>*</Text>
              </Text>
              <Text style={styles.cardDesc}>Displayed prominently on your ads and public profile storefront.</Text>
              <View style={[styles.iconInputBox, errors.displayName ? styles.inputError : null]}>
                <Store size={18} color={errors.displayName ? '#DC2626' : '#475569'} />
                <TextInput
                  style={styles.rawInput}
                  value={displayName}
                  onChangeText={(text: string) => {
                    setDisplayName(text);
                    clearError('displayName');
                  }}
                  placeholder={accountType === 'shop' ? 'e.g. Accra City Phones & Gadgets' : 'K. Mensah Gadgets & Electronics'}
                />
              </View>
              {errors.displayName ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={12} color="#DC2626" />
                  <Text style={styles.errorText}>{errors.displayName}</Text>
                </View>
              ) : null}
            </View>

            {/* Card 3: Primary Product Categories */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>
                  Primary Product Categories <Text style={styles.requiredStar}>*</Text>
                </Text>
                <Text style={styles.multiSelectBadge}>Multi-select</Text>
              </View>

              <View style={styles.chipsWrap}>
                {['Mobile Phones', 'Electronics', 'Vehicles', 'Fashion', 'Furniture', 'Home Appliances'].map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <Pressable
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                        );
                        clearError('selectedCategories');
                      }}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.selectedCategories ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={12} color="#DC2626" />
                  <Text style={styles.errorText}>{errors.selectedCategories}</Text>
                </View>
              ) : null}
            </View>

            {/* Card 4: Primary Storefront / Location */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Primary Storefront / Location</Text>
                  <Text style={styles.cardDesc}>Accurate town tagging helps nearby buyers find your listings quickly.</Text>
                </View>
                <Pressable
                  style={styles.autoDetectBtn}
                  onPress={async () => {
                    setIsDetectingLocation(true);

                    const applyFoundLocation = (city: string, reg: string) => {
                      setRegion(reg || 'Greater Accra');
                      setCityNeighborhood(city || 'East Legon, Accra');
                      setIsDetectingLocation(false);
                      setLocationDetectSuccess(true);
                      clearError('region');
                      clearError('cityNeighborhood');
                    };

                    try {
                      const getPos = (enableHighAccuracy: boolean, timeoutMs: number) => {
                        return new Promise<GeolocationPosition>((resolve, reject) => {
                          if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
                            return reject(new Error('Geolocation unavailable'));
                          }
                          navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy,
                            timeout: timeoutMs,
                            maximumAge: 10000,
                          });
                        });
                      };

                      let coords: { latitude: number; longitude: number } | null = null;
                      try {
                        const pos = await getPos(true, 8000);
                        coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                      } catch {
                        try {
                          const pos = await getPos(false, 5000);
                          coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                        } catch {}
                      }

                      if (coords) {
                        const { latitude, longitude } = coords;
                        try {
                          const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                          );
                          if (res.ok) {
                            const data = await res.json();
                            const addr = data.address || {};
                            const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || '';
                            const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
                            const state = addr.state || addr.region || '';
                            const resolvedCity = suburb && city && suburb !== city ? `${suburb}, ${city}` : (suburb || city || 'Accra');
                            applyFoundLocation(resolvedCity, state || 'Greater Accra');
                            return;
                          }
                        } catch {}

                        try {
                          const res = await fetch(`https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`);
                          if (res.ok) {
                            const data = await res.json();
                            const props = data.features?.[0]?.properties || {};
                            const loc = props.district || props.locality || props.city || props.name || '';
                            const state = props.state || '';
                            if (loc || state) {
                              applyFoundLocation(loc || 'Accra', state || 'Greater Accra');
                              return;
                            }
                          }
                        } catch {}

                        if (latitude >= 4.5 && latitude <= 11.5 && longitude >= -3.5 && longitude <= 1.5) {
                          applyFoundLocation('Accra Central', 'Greater Accra');
                          return;
                        }
                      }

                      try {
                        const ipRes = await fetch('https://ipwho.is/');
                        if (ipRes.ok) {
                          const ipData = await ipRes.json();
                          if (ipData.success && (ipData.country_code === 'GH' || ipData.country === 'Ghana')) {
                            applyFoundLocation(ipData.city || 'Accra', ipData.region || 'Greater Accra');
                            return;
                          }
                        }
                      } catch {}

                      applyFoundLocation('East Legon, Accra', 'Greater Accra');
                    } catch {
                      applyFoundLocation('East Legon, Accra', 'Greater Accra');
                    } finally {
                      setIsDetectingLocation(false);
                    }
                  }}
                >
                  <Text style={styles.autoDetectBtnText}>
                    {isDetectingLocation ? 'Detecting...' : 'Auto-detect'}
                  </Text>
                </Pressable>
              </View>

              {locationDetectSuccess && (
                <View style={styles.locationSuccessBanner}>
                  <CheckCircle2 size={13} color="#059669" />
                  <Text style={styles.locationSuccessText}>
                    Location auto-filled: {cityNeighborhood} ({region})
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Region <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={[styles.iconInputBox, errors.region ? styles.inputError : null]}>
                  <Building2 size={18} color={errors.region ? '#DC2626' : '#475569'} />
                  <TextInput
                    style={styles.rawInput}
                    value={region}
                    onChangeText={(text: string) => {
                      setRegion(text);
                      clearError('region');
                    }}
                  />
                  <ChevronDown size={18} color="#475569" />
                </View>
                {errors.region ? (
                  <View style={styles.errorRow}>
                    <AlertCircle size={12} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.region}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  City / Neighborhood <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={[styles.iconInputBox, errors.cityNeighborhood ? styles.inputError : null]}>
                  <MapPin size={18} color={errors.cityNeighborhood ? '#DC2626' : '#475569'} />
                  <TextInput
                    style={styles.rawInput}
                    value={cityNeighborhood}
                    onChangeText={(text: string) => {
                      setCityNeighborhood(text);
                      clearError('cityNeighborhood');
                    }}
                    placeholder="Tip Toe Lane, Kwame Nkrumah Circle"
                  />
                </View>
                {errors.cityNeighborhood ? (
                  <View style={styles.errorRow}>
                    <AlertCircle size={12} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.cityNeighborhood}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleTitle}>Home-based seller / Pickup only</Text>
                  <Text style={styles.toggleSub}>Hide exact address; show neighborhood radius</Text>
                </View>
                <Pressable
                  style={[styles.switchTrack, isHomeBased && styles.switchTrackActive]}
                  onPress={() => setIsHomeBased(!isHomeBased)}
                >
                  <View style={[styles.switchThumb, isHomeBased && styles.switchThumbActive]} />
                </Pressable>
              </View>
            </View>

            {/* Card 5: Identity Verification (Ghana Card) */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.cardTitle}>Identity Verification <Text style={styles.requiredStar}>*</Text></Text>
                </View>
                <Pressable
                  style={[styles.skipBadge, isIdVerificationSkipped && styles.skipBadgeActive]}
                  onPress={() => setIsIdVerificationSkipped(!isIdVerificationSkipped)}
                >
                  <Text style={[styles.skipBadgeText, isIdVerificationSkipped && styles.skipBadgeTextActive]}>
                    {isIdVerificationSkipped ? '✓ Skipped' : 'Skip'}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.cardDesc}>
                Required for verified seller status (or tap Skip to continue without verification badge).
              </Text>

              {isIdVerificationSkipped ? (
                <View style={styles.skippedNotice}>
                  <CheckCircle2 size={16} color="#64748B" />
                  <Text style={styles.skippedNoticeText}>
                    Identity verification skipped. Complete this anytime in your Profile to earn the Verified Seller badge.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ghana Card PIN (Optional)</Text>
                    <View style={styles.iconInputBox}>
                      <Building2 size={18} color="#475569" />
                      <TextInput
                        style={[styles.rawInput, { fontFamily: 'monospace', fontWeight: '700' }]}
                        value={ghanaCardPin}
                        onChangeText={setGhanaCardPin}
                        placeholder="GHA-XXXXXXXXX-X"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ghana Card (Front Side)</Text>
                    <View style={styles.idCardPreview}>
                      <View style={styles.idCardCheck}>
                        <CheckCircle2 size={22} color="#059669" strokeWidth={2.5} />
                      </View>
                      <Text style={styles.idCardAttached}>Front ID Photo Attached</Text>
                      <Text style={styles.idCardFilename}>card_front_id_ghana.jpg • 2.4 MB</Text>
                      <Pressable style={styles.retakeBtn}>
                        <Camera size={13} color="#1E293B" />
                        <Text style={styles.retakeBtnText}>Retake Photo</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ghana Card (Back Side)</Text>
                    <View style={styles.idCardPreview}>
                      <View style={styles.idCardCheck}>
                        <CheckCircle2 size={22} color="#059669" strokeWidth={2.5} />
                      </View>
                      <Text style={styles.idCardAttached}>Back ID Photo Attached</Text>
                      <Text style={styles.idCardFilename}>card_back_id_ghana.jpg • 2.1 MB</Text>
                      <Pressable style={styles.retakeBtn}>
                        <Camera size={13} color="#1E293B" />
                        <Text style={styles.retakeBtnText}>Retake Photo</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Card: Business / Trade Certificate (Optional • Can be skipped) */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.cardTitle}>Business / Trade Certificate</Text>
                  <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 }}>
                    <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#64748B' }}>Optional</Text>
                  </View>
                </View>
                <Pressable
                  style={[styles.skipBadge, isCertSkipped && styles.skipBadgeActive]}
                  onPress={() => setIsCertSkipped(!isCertSkipped)}
                >
                  <Text style={[styles.skipBadgeText, isCertSkipped && styles.skipBadgeTextActive]}>
                    {isCertSkipped ? 'Skipped ✓' : 'Skip'}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.cardDesc}>
                Provide Registrar General Department (RGD) registration, Business Operating Permit, or Trade Guild certificate. (Optional - can be skipped).
              </Text>

              {isCertSkipped ? (
                <View style={{ borderRadius: 14, padding: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', gap: 4 }}>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#0F172A' }}>Certificate verification skipped</Text>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>
                    You can register and attach your business/trade certificate anytime later in your profile.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  <Text style={styles.label}>Certificate / Registration #</Text>
                  <View style={styles.iconInputBox}>
                    <ShieldCheck size={16} color="#64748B" />
                    <TextInput
                      style={styles.rawInput}
                      placeholder="e.g. CS-092348 or NVTI-2024"
                      value={businessCert}
                      onChangeText={setBusinessCert}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Card 6: Seller Contact & Direct Inquiries */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Seller Contact & Direct Inquiries</Text>
              <Text style={styles.cardDesc}>Buyers will call or direct-chat with you on this line.</Text>

              <View style={styles.phoneBox}>
                <Text style={styles.phonePrefix}>GH +233</Text>
                <TextInput
                  style={[styles.rawInput, { fontWeight: '700' }]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
                <View
                  style={[
                    styles.phoneCheckCircle,
                    phoneNumber.replace(/\D/g, '').length < 9 && { backgroundColor: '#E2E8F0' },
                  ]}
                >
                  <Check
                    size={13}
                    color={phoneNumber.replace(/\D/g, '').length >= 9 ? '#FFFFFF' : '#94A3B8'}
                    strokeWidth={3}
                  />
                </View>
              </View>

              <Pressable
                style={styles.checkboxRow}
                onPress={() => {
                  setAllowWhatsApp(!allowWhatsApp);
                  clearError('allowWhatsApp');
                }}
              >
                <View style={[styles.checkbox, allowWhatsApp && styles.checkboxActive]}>
                  {allowWhatsApp && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={styles.checkboxText}>
                  I consent to Haraka displaying my contact details to buyers and routing direct inquiries and order updates.
                </Text>
              </Pressable>
            </View>

            {/* Card 7: Consent of How the Info Will Be Used */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} color="#047857" strokeWidth={2.5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    Consent & Information Usage <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <Text style={styles.cardDesc}>How your submitted identity, storefront, and contact details are used.</Text>
                </View>
              </View>

              <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8, marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <Check size={12} color="#047857" strokeWidth={3} style={{ marginTop: 2 }} />
                  <Text style={{ fontSize: 11, color: '#334155', flex: 1, lineHeight: 16 }}>
                    <Text style={{ fontWeight: '800' }}>Merchant Verification: </Text>
                    Ghana Card data and ID photos are reviewed strictly to confirm merchant authenticity, prevent scams, and grant Verified Seller status. All ID files remain encrypted and private.
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <Check size={12} color="#047857" strokeWidth={3} style={{ marginTop: 2 }} />
                  <Text style={{ fontSize: 11, color: '#334155', flex: 1, lineHeight: 16 }}>
                    <Text style={{ fontWeight: '800' }}>Storefront Presentation: </Text>
                    Display Name, category selections, and neighborhood/region are published on your ads so local buyers can discover your listings.
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <Check size={12} color="#047857" strokeWidth={3} style={{ marginTop: 2 }} />
                  <Text style={{ fontSize: 11, color: '#334155', flex: 1, lineHeight: 16 }}>
                    <Text style={{ fontWeight: '800' }}>Buyer Inquiries: </Text>
                    Your contact number and in-app chat allow interested Ghanaian buyers to reach out directly to arrange in-person pickup.
                  </Text>
                </View>
              </View>

              <Pressable
                style={[
                  styles.checkboxRow,
                  { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 14 },
                  errors.allowWhatsApp ? styles.inputError : null,
                ]}
                onPress={() => {
                  setAllowWhatsApp(!allowWhatsApp);
                  clearError('allowWhatsApp');
                }}
              >
                <View style={[styles.checkbox, allowWhatsApp && styles.checkboxActive]}>
                  {allowWhatsApp && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={[styles.checkboxText, { fontWeight: '700', color: '#0F172A' }]}>
                  I consent to Haraka using my information for merchant verification, public storefront display, and direct buyer communication as outlined above. <Text style={styles.requiredStar}>*</Text>
                </Text>
              </Pressable>
              {errors.allowWhatsApp ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={12} color="#DC2626" />
                  <Text style={styles.errorText}>{errors.allowWhatsApp}</Text>
                </View>
              ) : null}
            </View>

            {/* Complete Seller Registration Button */}
            <Pressable
              style={styles.continueBtnOrange}
              onPress={() => {
                if (validateStep2()) {
                  setStep(3);
                }
              }}
            >
              <Text style={styles.continueBtnText}>
                save &amp; proceed to step 3
              </Text>
            </Pressable>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            {/* Card 1: Private Seller Profile */}
            <View style={[styles.card, { borderColor: '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={26} color="#047857" strokeWidth={2.4} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#0F172A' }}>Private Seller Profile</Text>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#A7F3D0' }}>
                      <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#047857' }}>
                        {accountType === 'shop' ? 'Commercial Hub' : '0% Commission'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11.5, color: '#475569', marginTop: 4, lineHeight: 16 }}>
                    {accountType === 'shop'
                      ? 'Operate your commercial storefront or trade hub safely across Accra, Kumasi & Tema without intermediary fees.'
                      : 'Sell personal gadgets, vehicles, sneakers, or home gear safely across Accra, Kumasi & Tema without shop overhead.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Card 2: SUBMITTED REGISTRATION INFO */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#0F172A', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    SUBMITTED REGISTRATION INFO
                  </Text>
                  <Text style={{ fontSize: 10.5, color: '#64748B', marginTop: 2 }}>
                    Review all details entered across Steps 1 & 2 before final activation.
                  </Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#A7F3D0', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Check size={12} color="#047857" strokeWidth={3} />
                  <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#047857' }}>Ready</Text>
                </View>
              </View>

              {/* Section 1: Step 1 Personal Info */}
              <View style={{ borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <User size={14} color="#047857" strokeWidth={2.4} />
                    <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase' }}>Step 1: Personal & Account</Text>
                  </View>
                  <Pressable onPress={() => setStep(1)}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF6A00' }}>Edit</Text>
                  </Pressable>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>Full Legal Name</Text>
                    <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#0F172A', marginTop: 2 }}>{fullName || 'Kofi Mensah'}</Text>
                  </View>
                  <View style={{ flex: 1, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>Account Role</Text>
                    <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#047857', marginTop: 2 }}>
                      {accountType === 'shop' ? 'Shop / Store Hub' : 'Private Seller'}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>Email Address</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>{email || 'kofi.mensah@gmail.com'}</Text>
                  </View>
                  <View style={{ flex: 1, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>Gender</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>{gender || 'Male'}</Text>
                  </View>
                </View>

                <View style={{ padding: 8, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} color="#64748B" />
                    <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#0F172A' }}>+233 {phoneNumber || '24 498 1209'}</Text>
                  </View>
                  <CheckCircle2 size={14} color="#059669" />
                </View>
              </View>

              {/* Section 2: Step 2 Storefront & Location Info */}
              <View style={{ borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Store size={14} color="#047857" strokeWidth={2.4} />
                    <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase' }}>Step 2: Storefront & Location</Text>
                  </View>
                  <Pressable onPress={() => setStep(2)}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF6A00' }}>Edit</Text>
                  </Pressable>
                </View>

                <View style={{ padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>Display Name</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F172A', marginTop: 2 }}>{displayName || 'K. Mensah Gadgets & Electronics'}</Text>
                </View>

                <View style={{ padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', marginBottom: 4 }}>Product Categories</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {selectedCategories.map((c) => (
                      <View key={c} style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1' }}>
                        <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#334155' }}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>Region</Text>
                    <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#0F172A', marginTop: 2 }}>{region || 'Greater Accra'}</Text>
                  </View>
                  <View style={{ flex: 1, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600' }}>City / Neighborhood</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A', marginTop: 2 }}>{cityNeighborhood || 'Shiashie, East Legon'}</Text>
                  </View>
                </View>

                <View style={{ padding: 8, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, color: '#334155', fontWeight: '600' }}>
                    {accountType === 'shop'
                      ? '🏬 Physical Commercial Storefront'
                      : isHomeBased
                      ? '🏠 Home-based / Pickup only'
                      : '📍 Local Town Meetup'}
                  </Text>
                  <CheckCircle2 size={14} color="#059669" />
                </View>
              </View>

              {/* Section 3: Identity Verification (Ghana Card) */}
              <View style={{ borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} color="#047857" strokeWidth={2.4} />
                    <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#1E293B', textTransform: 'uppercase' }}>Identity Verification</Text>
                  </View>
                  <Pressable onPress={() => setStep(2)}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF6A00' }}>Edit</Text>
                  </Pressable>
                </View>

                {isIdVerificationSkipped ? (
                  <View style={{ borderWidth: 1, borderColor: '#FCD34D', padding: 8, borderRadius: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400E' }}>Verification Skipped</Text>
                    <Text style={{ fontSize: 10, color: '#B45309', marginTop: 2 }}>Can be completed in Profile anytime.</Text>
                  </View>
                ) : (
                  <>
                    <View style={{ padding: 8, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <CreditCard size={14} color="#64748B" />
                        <Text style={{ fontSize: 11.5, fontFamily: 'monospace', fontWeight: '800', color: '#0F172A' }}>
                          {ghanaCardPin || 'GHA-729018491-9'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#047857' }}>Valid PIN ✓</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Camera size={13} color="#047857" />
                        <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#047857' }}>Front ID Attached ✓</Text>
                      </View>
                      <View style={{ flex: 1, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Camera size={13} color="#047857" />
                        <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#047857' }}>Back ID Attached ✓</Text>
                      </View>
                    </View>
                  </>
                )}

                <View style={{ padding: 8, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>Direct Buyer Inquiries: Consent Granted</Text>
                  <CheckCircle2 size={14} color="#059669" />
                </View>
              </View>
            </View>

            {/* Card 3: Public Marketplace Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Public Marketplace Card</Text>
              <Text style={styles.cardDesc}>This is how buyers see your credibility in chat and listing previews.</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <Pressable
                  onPress={() => {
                    const sampleAvatars = [
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                    ];
                    const nextAvatar = sampleAvatars[(sampleAvatars.indexOf(sellerAvatar || '') + 1) % sampleAvatars.length];
                    setSellerAvatar(nextAvatar);
                  }}
                  style={{ position: 'relative' }}
                >
                  {sellerAvatar ? (
                    <Image
                      source={{ uri: sellerAvatar }}
                      style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#FFFFFF' }}
                    />
                  ) : (
                    <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' }}>
                      <User size={26} color="#94A3B8" />
                    </View>
                  )}
                  <View style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF6A00', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={11} color="#FFFFFF" strokeWidth={2.6} />
                  </View>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: '#0F172A' }}>{fullName || 'Kofi Mensah'}</Text>
                    <Pressable
                      onPress={() => {
                        const sampleAvatars = [
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                        ];
                        const nextAvatar = sampleAvatars[(sampleAvatars.indexOf(sellerAvatar || '') + 1) % sampleAvatars.length];
                        setSellerAvatar(nextAvatar);
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF6A00' }}>Change Photo</Text>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#C2410C' }}>
                      {responseTime ? `Fast Responder (${responseTime})` : 'Set Target Response Time'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Set Typical Response Time */}
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Typical Response Time</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {['< 5 mins', '< 15 mins', '< 30 mins', '< 1 hour', 'Within 2 hours'].map((time) => {
                    const isSel = responseTime === time;
                    return (
                      <Pressable
                        key={time}
                        onPress={() => setResponseTime(time)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isSel ? '#FF6A00' : '#CBD5E1',
                          backgroundColor: isSel ? '#FF6A00' : '#FFFFFF',
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: isSel ? '#FFFFFF' : '#334155' }}>
                          {time}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>
                  Seller Bio / Handshake Note <Text style={styles.requiredStar}>*</Text>{' '}
                  <Text style={styles.requiredBadge}>(Required - min 10 characters)</Text>
                </Text>
                <TextInput
                  style={[
                    styles.rawInput,
                    { height: 60, textAlignVertical: 'top', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#E2E8F0' },
                    errors.sellerBio ? styles.inputError : null,
                  ]}
                  multiline
                  value={sellerBio}
                  onChangeText={(text: string) => {
                    setSellerBio(text);
                    clearError('sellerBio');
                  }}
                  maxLength={160}
                  placeholder="Tell buyers about your products, inspection terms, and response speed..."
                />
                {errors.sellerBio ? (
                  <View style={styles.errorRow}>
                    <AlertCircle size={12} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.sellerBio}</Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                style={[styles.checkboxRow, { padding: 10, borderRadius: 12, borderColor: '#E2E8F0', borderWidth: 1 }]}
                onPress={() => setNeighborhoodPrivacyGuard(!neighborhoodPrivacyGuard)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#0F172A' }}>Neighborhood Privacy Guard</Text>
                  <Text style={{ fontSize: 10.5, color: '#64748B', marginTop: 1 }}>
                    Hides exact residential GPS. Publicly displays "{cityNeighborhood || 'Circle'}, {region}".
                  </Text>
                </View>
                <View style={[styles.checkbox, neighborhoodPrivacyGuard && { backgroundColor: '#047857', borderColor: '#047857' }]}>
                  {neighborhoodPrivacyGuard && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </Pressable>
            </View>

            {/* Card 4: Preferred Safe Meetup Hubs */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Navigation size={16} color="#C2410C" />
                <Text style={styles.cardTitle}>
                  Preferred Safe Meetup Hubs <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>(Optional)</Text>
                </Text>
              </View>
              <Text style={styles.cardDesc}>
                Add safe, populated daylight spots where you meet buyers for inspection:
              </Text>

              {/* Add Custom Landmark Input and Button */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <TextInput
                  style={[
                    styles.rawInput,
                    {
                      flex: 1,
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      height: 40,
                      fontSize: 12,
                      backgroundColor: '#F8FAFC',
                    },
                  ]}
                  placeholder="Add custom landmark (e.g. Accra Mall Gate)..."
                  value={customLandmarkInput}
                  onChangeText={setCustomLandmarkInput}
                />
                <Pressable
                  onPress={() => {
                    if (customLandmarkInput.trim()) {
                      if (!selectedSafeHubs.includes(customLandmarkInput.trim())) {
                        setSelectedSafeHubs([...selectedSafeHubs, customLandmarkInput.trim()]);
                        clearError('selectedSafeHubs');
                      }
                      setCustomLandmarkInput('');
                    }
                  }}
                  style={{
                    backgroundColor: '#065F46',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>+ Add</Text>
                </Pressable>
              </View>

              {/* Added Landmarks - Styled cleanly like Image 4 (White bg, thin border, dark text, clean remove icon, NO heavy green background) */}
              {selectedSafeHubs.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {selectedSafeHubs.map((hub) => (
                    <View
                      key={hub}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#CBD5E1',
                        backgroundColor: '#FFFFFF',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <MapPin size={12} color="#475569" />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>{hub}</Text>
                      <Pressable
                        onPress={() =>
                          setSelectedSafeHubs(selectedSafeHubs.filter((h) => h !== hub))
                        }
                        style={{ padding: 2 }}
                      >
                        <X size={12} color="#64748B" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 11, color: '#64748B', fontStyle: 'italic', marginTop: 6 }}>
                  No landmarks added yet. Type your custom meetup spot above and tap "+ Add".
                </Text>
              )}
              {errors.selectedSafeHubs ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={12} color="#DC2626" />
                  <Text style={styles.errorText}>{errors.selectedSafeHubs}</Text>
                </View>
              ) : null}

              <Pressable
                style={[styles.checkboxRow, { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 6 }]}
                onPress={() => setAllowCourierDispatch(!allowCourierDispatch)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#1E293B' }}>Allow Yango / Bolt Dispatch Delivery</Text>
                  <Text style={{ fontSize: 10.5, color: '#64748B', marginTop: 1 }}>
                    Accept orders where buyer pays for courier pickup after confirming details.
                  </Text>
                </View>
                <View style={[styles.checkbox, allowCourierDispatch && styles.checkboxActive]}>
                  {allowCourierDispatch && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </Pressable>
            </View>

            {/* Card 5: 100% Direct Payout to You */}
            <View style={[styles.card, { borderColor: '#E2E8F0' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#0F172A' }}>100% Direct Payout to You</Text>
              </View>
              <Text style={{ fontSize: 11.5, color: '#475569', lineHeight: 17 }}>
                Haraka never holds your funds. Buyers inspect in daylight and pay you directly via MTN MoMo, Telecel Cash, or cash at exchange.
              </Text>
              <Pressable
                style={[
                  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
                  errors.confirmSafeTradePayout ? { padding: 6, borderRadius: 10, borderColor: '#EF4444', borderWidth: 1 } : null,
                ]}
                onPress={() => {
                  setConfirmSafeTradePayout(!confirmSafeTradePayout);
                  clearError('confirmSafeTradePayout');
                }}
              >
                <View style={[styles.checkbox, confirmSafeTradePayout && { backgroundColor: '#047857', borderColor: '#047857' }, { marginTop: 2 }]}>
                  {confirmSafeTradePayout && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155', flex: 1, lineHeight: 16 }}>
                  I confirm that all listed items are personally owned, accurately represented, and that I will conduct item exchanges in safe, public daylight spots. <Text style={styles.requiredStar}>* Required</Text>
                </Text>
              </Pressable>
              {errors.confirmSafeTradePayout ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={12} color="#DC2626" />
                  <Text style={styles.errorText}>{errors.confirmSafeTradePayout}</Text>
                </View>
              ) : null}
            </View>

            {/* Action Buttons for Step 3 */}
            <View style={{ gap: 10, marginTop: 4 }}>
              <Pressable
                style={styles.continueBtnOrange}
                onPress={() => {
                  if (validateStep3()) {
                    router.push('/post-ad/step1' as any);
                  }
                }}
              >
                <Text style={styles.continueBtnText}>
                  Submit application
                </Text>
              </Pressable>

              <Pressable
                style={{ paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => setStep(2)}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>← Back to Step 2</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Safe Trading Guidelines Card */}
        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeader}>
            <ShieldCheck size={18} color="#EA580C" strokeWidth={2.5} />
            <Text style={styles.guidelinesTitle}>Safe Trading Guidelines</Text>
          </View>
          <View style={styles.guidelinesList}>
            <View style={styles.guidelinesRow}>
              <CheckCircle2 size={15} color="#047857" strokeWidth={2.2} />
              <Text style={styles.guidelinesText}>
                Meet in safe, busy public physical locations in person.
              </Text>
            </View>
            <View style={styles.guidelinesRow}>
              <CheckCircle2 size={15} color="#047857" strokeWidth={2.2} />
              <Text style={styles.guidelinesText}>
                Inspect the item thoroughly before releasing cash or mobile money.
              </Text>
            </View>
            <View style={styles.guidelinesRow}>
              <XCircle size={15} color="#E11D48" strokeWidth={2.2} />
              <Text style={styles.guidelinesText}>
                Never pay advance delivery or reservation fees without seeing the product in person.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareBtn: {
    padding: 6,
    borderRadius: 20,
  },
  logoBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoThumb: {
    width: '100%',
    height: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  stepContainer: {
    gap: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  heroBadge: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBoxGreen: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxOrange: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FEEFD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  bulletsList: {
    gap: 10,
    paddingTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircleGreen: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(52, 168, 83, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleOrange: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(251, 146, 60, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
  continueBtnGreen: {
    backgroundColor: '#0B6640',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  continueBtnOrange: {
    backgroundColor: '#FF6A00',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 14,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  submitBtn: {
    backgroundColor: '#FF6A00',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  guidelinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginTop: 16,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guidelinesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  guidelinesList: {
    gap: 8,
  },
  guidelinesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  guidelinesText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
  verifiedBanner: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  verifiedBannerHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  verifiedSquareIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#065F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBannerText: {
    flex: 1,
  },
  verifiedBannerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0B1528',
  },
  verifiedBannerDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 17,
  },
  verifiedValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gaugeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#065F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillTextGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  pillTextAmber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  pillTextBlue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  subHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF6A00',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressActive: {
    flex: 1,
    backgroundColor: '#FF6A00',
  },
  progressInactive: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  avatarThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  twoColGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  accountOption: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  accountOptionActive: {
    borderColor: '#FF6A00',
    backgroundColor: '#FFF7ED',
  },
  userCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  userCircleActive: {
    backgroundColor: '#FF6A00',
  },
  shopCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  shopCircleActive: {
    backgroundColor: '#FF6A00',
  },
  accountOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  accountOptionSub: {
    fontSize: 10.5,
    color: '#64748B',
  },
  accountOptionSubActive: {
    color: '#FF6A00',
    fontWeight: '700',
  },
  autoDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  autoDetectBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  locationSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginTop: 4,
  },
  locationSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  skipBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  skipBadgeActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  skipBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  skipBadgeTextActive: {
    color: '#92400E',
  },
  skippedNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 14,
  },
  skippedNoticeText: {
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
  multiSelectBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6A00',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6A00',
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FF6A00',
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  toggleTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 10.5,
    color: '#64748B',
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    padding: 2,
  },
  switchTrackActive: {
    backgroundColor: '#FF6A00',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  niaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  niaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  iconInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  rawInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  idCardPreview: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  idCardCheck: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idCardAttached: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  idCardFilename: {
    fontSize: 11,
    color: '#64748B',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  retakeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  otpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  otpBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  phonePrefix: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 8,
  },
  phoneCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkboxText: {
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
  promiseCard: {
    backgroundColor: '#047857',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  promiseIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shrink: 0,
  },
  promiseTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  promiseDesc: {
    fontSize: 11,
    color: '#D1FAE5',
    lineHeight: 16,
  },
  requiredStar: {
    color: '#EF4444',
    fontWeight: '800',
  },
  requiredBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 4,
  },
  optionalBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
});
