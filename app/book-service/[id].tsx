import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  Bookmark,
  Star,
  MapPin,
  ShieldCheck,
  Check,
  Mic,
  Upload,
  X,
  Crosshair,
  Clock,
  MessageSquare,
  ArrowRight,
  Calendar,
} from 'lucide-react-native';
import {
  ARTISANS_DIRECTORY,
  FEATURED_ARTISANS,
  ArtisanItem,
} from '../../src/lib/listingData';
import { getArtisanProfileData } from '../../src/lib/artisanProfileData';

export default function BookServiceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const artisan: ArtisanItem =
    ARTISANS_DIRECTORY.find((a) => a.id === id) ||
    FEATURED_ARTISANS.find((a) => a.id === id) ||
    ARTISANS_DIRECTORY[0];

  const profileData = getArtisanProfileData(artisan);
  const firstName = artisan.name.split(' ')[0];

  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [selectedService, setSelectedService] = useState<string>(
    profileData.services && profileData.services[0]
      ? profileData.services[0].title
      : 'Custom Wardrobe'
  );
  const [isCustomService, setIsCustomService] = useState<boolean>(false);
  const [customServiceName, setCustomServiceName] = useState<string>('');
  const [customServicesList, setCustomServicesList] = useState<string[]>([]);

  const handleAddCustom = () => {
    const trimmed = customServiceName.trim();
    if (!trimmed) return;
    if (!customServicesList.includes(trimmed)) {
      setCustomServicesList((prev) => [...prev, trimmed]);
    }
    setSelectedService(trimmed);
    setIsCustomService(false);
    setCustomServiceName('');
  };

  const [description, setDescription] = useState<string>(
    'Need professional assessment and work on site. Measurements and materials to be discussed upon arrival.'
  );

  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState<boolean>(true);

  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
  ]);

  const [selectedDate, setSelectedDate] = useState<string>('TODAY 26 Feb');
  const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);
  const [selectedWindow, setSelectedWindow] = useState<string>('Morning');
  const [location, setLocation] = useState<string>('House No. 14, Spintex Road near Shell, Accra');
  const [clientName, setClientName] = useState<string>('Kojo Mensah');
  const [clientPhone, setClientPhone] = useState<string>('+233 24 987 6543');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [referenceCode, setReferenceCode] = useState<string>('HRK-BK-8924');
  const [hasAgreedTerms, setHasAgreedTerms] = useState<boolean>(true);

  const defaultServices =
    profileData.services && profileData.services.length > 0
      ? profileData.services.map((s) => s.title)
      : [
          'Solar Inverter Setup',
          'Full House Conduit Wiring',
          'Fault Tracing & Breaker Fix',
          'CCTV & Backup Battery',
        ];
  const servicesList = Array.from(new Set([...defaultServices, ...customServicesList]));

  const bookingDates = [
    { label: 'TODAY', day: '26', month: 'Feb' },
    { label: 'TOMORROW', day: '27', month: 'Feb' },
    { label: 'WED', day: '28', month: 'Feb' },
    { label: 'THU', day: '29', month: 'Feb' },
    { label: 'FRI', day: '01', month: 'Mar' },
    { label: 'SAT', day: '02', month: 'Mar' },
  ];

  const arrivalWindows = [
    { id: 'Morning', title: 'Morning', time: '8am - 12pm' },
    { id: 'Afternoon', title: 'Afternoon', time: '12pm - 4pm' },
    { id: 'Evening', title: 'Evening', time: '4pm - 7pm' },
  ];

  const baseRateFormatted = profileData.calloutPrice || artisan.rate || 'GH₵ 150.00';

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              if (bookingStep === 2) {
                setBookingStep(1);
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft size={20} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Service Booking</Text>
        </View>

        <Image
          source={{ uri: artisan.avatar }}
          style={styles.headerAvatar}
          contentFit="cover"
        />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressStepText}>
            {bookingStep === 1
              ? 'Step 1 of 2: Job Specification'
              : 'Step 2 of 2: Review & Confirmation'}
          </Text>
          <Text style={styles.progressPercentText}>
            {bookingStep === 1 ? '50%' : '100%'}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: bookingStep === 1 ? '50%' : '100%' },
            ]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Artisan Profile Summary Card - Matching Image 1 & Profile Hero Exactly */}
        <View style={styles.card}>
          <View style={styles.artisanRow}>
            {/* Avatar with Online Dot */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: artisan.avatar }}
                style={styles.avatarCircular}
                contentFit="cover"
              />
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.artisanDetails}>
              {/* Location tag */}
              <View style={styles.statusLocRow}>
                <View style={styles.locationTagRow}>
                  <MapPin size={10} color="#94A3B8" />
                  <Text style={styles.locText} numberOfLines={1}>{artisan.location}, Accra</Text>
                </View>
              </View>

              {/* Name & Rate + Bookmark */}
              <View style={styles.nameRow}>
                <View style={styles.nameWithBadge}>
                  <Text style={styles.artisanName}>{artisan.name}</Text>
                  {artisan.verified && <CheckCircle size={14} color="#059669" />}
                </View>

                {/* Price / Rate & Bookmark Action */}
                <View style={styles.rateBookmarkRow}>
                  <Text style={styles.rateText}>{artisan.rate}</Text>
                  <Bookmark size={16} color="#EA580C" fill="#EA580C" />
                </View>
              </View>

              {/* Subrole matching Profile Hero */}
              <Text style={styles.artisanRole}>{profileData.subrole}</Text>

              {/* Badges - Non-admin users see ONLY "Verified" for verified artisans, and no tag for unverified */}
              {artisan.verified && (
                <View style={styles.trustBadgesRow}>
                  <View style={styles.badgeItem}>
                    <CheckCircle size={12} color="#059669" />
                    <Text style={styles.badgeTextGreen}>Verified</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* 4-Item Quick Stats Grid matching Profile Exactly */}
          <View style={styles.statsGrid}>
            <View style={styles.statsCol}>
              <View style={styles.ratingBadge}>
                <Star size={11} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{artisan.rating}</Text>
              </View>
              <Text style={styles.statsSub}>128 reviews</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsCol}>
              <Text style={styles.statsValue}>{artisan.jobsCompleted}</Text>
              <Text style={styles.statsSub}>Completed</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsCol}>
              <Text style={styles.statsValue}>8+ yrs</Text>
              <Text style={styles.statsSub}>Experience</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsCol}>
              <Text style={styles.statsGreenValue}>100%</Text>
              <Text style={styles.statsSub}>On-time</Text>
            </View>
          </View>

          {/* Audio Intro & Portfolio Count matching Image 1 */}
          <View style={styles.audioPortfolioRow}>
            {artisan.audioIntro ? (
              <View style={styles.audioIntroCol}>
                <Mic size={13} color="#EA580C" />
                <Text style={styles.audioIntroText}>
                  Listen to Work Intro ({artisan.audioIntro})
                </Text>
              </View>
            ) : null}

            <Text style={styles.portfolioCountText}>
              View Portfolio ({artisan.portfolioCount || 18} photos)
            </Text>
          </View>

          {/* Consultation Fee Row */}
          <View style={styles.feeBox}>
            <Text style={styles.feeLabel}>Consultation / Base Fee</Text>
            <Text style={styles.feeValue}>{baseRateFormatted}</Text>
          </View>
        </View>

        {bookingStep === 1 ? (
          <>
            {/* 1. Select Service with Custom Service Option */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Select Service</Text>
                <Text style={styles.sectionSubtitle}>Required</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
                {servicesList.map((srv) => {
                  const isSelected = selectedService === srv && !isCustomService;
                  return (
                    <Pressable
                      key={srv}
                      style={[styles.serviceChip, isSelected && styles.serviceChipSelected]}
                      onPress={() => {
                        setIsCustomService(false);
                        setSelectedService(srv);
                      }}
                    >
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      <Text
                        style={[
                          styles.serviceChipText,
                          isSelected && styles.serviceChipTextSelected,
                        ]}
                      >
                        {srv}
                      </Text>
                    </Pressable>
                  );
                })}

                {/* Custom Service Option Chip */}
                <Pressable
                  style={[styles.serviceChip, isCustomService && styles.serviceChipSelected]}
                  onPress={() => {
                    setIsCustomService(true);
                    if (!customServiceName) {
                      setCustomServiceName('');
                      setSelectedService('Custom Service');
                    } else {
                      setSelectedService(customServiceName);
                    }
                  }}
                >
                  {isCustomService && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  <Text
                    style={[
                      styles.serviceChipCustomText,
                      isCustomService && styles.serviceChipTextSelected,
                    ]}
                  >
                    + Custom Service
                  </Text>
                </Pressable>
              </ScrollView>

              {/* Custom Service Text Input - Clean background and Done button */}
              {isCustomService && (
                <View style={styles.customServiceInputCard}>
                  <Text style={styles.customServiceLabel}>Add Custom Service Specification:</Text>
                  <View style={styles.customServiceInputRow}>
                    <TextInput
                      style={styles.customServiceInput}
                      value={customServiceName}
                      onChangeText={(val: string) => setCustomServiceName(val)}
                      onSubmitEditing={handleAddCustom}
                      returnKeyType="done"
                      placeholder="e.g. Inverter battery setup, pipe unclogging..."
                      placeholderTextColor="#94A3B8"
                      autoFocus
                    />
                    <Pressable style={styles.customServiceDoneBtn} onPress={handleAddCustom}>
                      <Text style={styles.customServiceDoneText}>Done</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* 2. Describe Job - 5 Lines Text Area */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Describe the Job</Text>
                <Text style={styles.sectionSubtitle}>Detail helps accurate pricing</Text>
              </View>

              <View style={styles.descCard}>
                <TextInput
                  style={styles.descInput}
                  multiline
                  numberOfLines={5}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what you need fixed or built, dimensions, material preferences..."
                  placeholderTextColor="#94A3B8"
                />

                {/* Voice Note Simulation Row */}
                <View style={styles.voiceNoteBar}>
                  <View style={styles.voiceNoteLeft}>
                    <Pressable
                      style={[
                        styles.recordBtn,
                        isRecordingAudio && styles.recordBtnActive,
                      ]}
                      onPress={() => {
                        setIsRecordingAudio(!isRecordingAudio);
                        if (!isRecordingAudio) setHasRecordedAudio(true);
                      }}
                    >
                      <Mic size={15} color="#FFFFFF" />
                    </Pressable>
                    <View>
                      <Text style={styles.voiceNoteTitle}>
                        {isRecordingAudio
                          ? 'Recording audio voice note...'
                          : hasRecordedAudio
                          ? 'Audio note attached (Twi & English)'
                          : 'Tap to record audio note'}
                      </Text>
                      <Text style={styles.voiceNoteSub}>Max 2 mins (Twi or English)</Text>
                    </View>
                  </View>

                  <Text style={styles.voiceTimer}>
                    {isRecordingAudio ? '00:07' : hasRecordedAudio ? '00:18' : '00:00'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 3. Photos - Clean white thumbnails */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Add Photos or Sketches</Text>
                <Text style={styles.sectionSubtitle}>Up to 5 images</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                <Pressable
                  style={styles.uploadBtn}
                  onPress={() =>
                    setPhotos((prev) => [
                      ...prev,
                      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
                    ])
                  }
                >
                  <Upload size={18} color="#EA580C" />
                  <Text style={styles.uploadBtnText}>Upload</Text>
                </Pressable>

                {photos.map((pUrl, i) => (
                  <View key={i} style={styles.photoThumb}>
                    <Image source={{ uri: pUrl }} style={styles.photoImg} contentFit="cover" />
                    <Pressable
                      style={styles.photoRemoveBtn}
                      onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X size={10} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 4. Schedule Date - Restored Previous Horizontal Cards Design with Calendar Icon */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Schedule Visit Date</Text>
                <Pressable
                  style={styles.calTriggerHeaderBtn}
                  onPress={() => setShowDatePickerModal(true)}
                >
                  <Calendar size={13} color="#EA580C" />
                  <Text style={styles.calTriggerHeaderText}>Calendar</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
                {bookingDates.map((item) => {
                  const dateStr = `${item.label} ${item.day} ${item.month}`;
                  const isSelected = selectedDate === dateStr;
                  return (
                    <Pressable
                      key={dateStr}
                      style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                      onPress={() => setSelectedDate(dateStr)}
                    >
                      <Text style={[styles.dateChipLabel, isSelected && styles.dateChipTextSelected]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>
                        {item.day}
                      </Text>
                      <Text style={[styles.dateChipMonth, isSelected && styles.dateChipTextSelected]}>
                        {item.month}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 5. Arrival Window - Clean text, no background color */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Arrival Window</Text>

              <View style={styles.windowsRow}>
                {arrivalWindows.map((win) => {
                  const isSelected = selectedWindow === win.id;
                  return (
                    <Pressable
                      key={win.id}
                      style={[styles.windowChip, isSelected && styles.windowChipSelected]}
                      onPress={() => setSelectedWindow(win.id)}
                    >
                      <Text style={[styles.windowTitle, isSelected && styles.windowTitleSelected]}>
                        {win.title}
                      </Text>
                      <Text style={styles.windowTime}>{win.time}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 6. Location */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Service Location (Accra)</Text>
                <Pressable
                  style={styles.gpsRow}
                  onPress={() => setLocation('Current GPS: Spintex Road, Accra (5.632, -0.108)')}
                >
                  <Crosshair size={12} color="#EA580C" />
                  <Text style={styles.gpsText}>Use Current GPS</Text>
                </Pressable>
              </View>

              <View style={styles.locationCard}>
                <View style={styles.locationInputRow}>
                  <MapPin size={16} color="#EA580C" />
                  <TextInput
                    style={styles.locationInput}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="House No., Street Name, Area, City"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Map box - Arrival approx 25 mins card hidden per user request */}
                <View style={styles.mapBox}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
                    }}
                    style={styles.mapImg}
                    contentFit="cover"
                  />
                  <View style={styles.mapPinContainer}>
                    <View style={styles.mapPinDot}>
                      <MapPin size={12} color="#FFFFFF" />
                    </View>
                    <Text style={styles.mapPinText}>Spintex Rd (~2.1 km away)</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 7. Inspection & Rate Breakdown */}
            <View style={styles.rateCard}>
              <Text style={styles.rateCardTitle}>Inspection & Service Rate</Text>

              <View style={styles.rateRow}>
                <View>
                  <Text style={styles.rateRowLabel}>Base Inspection / Consultation</Text>
                  <Text style={styles.rateRowCleanSub}>Direct to Artisan</Text>
                </View>
                <Text style={styles.rateRowVal}>{baseRateFormatted}</Text>
              </View>

              <View style={styles.rateRow}>
                <View style={styles.badgeItem}>
                  <Text style={styles.rateRowLabel}>Platform Connection Fee</Text>
                  <ShieldCheck size={12} color="#059669" />
                </View>
                <Text style={styles.rateRowFree}>FREE (GH₵ 0.00)</Text>
              </View>

              <View style={styles.rateTotalBox}>
                <View>
                  <Text style={styles.rateTotalTitle}>Estimated Inspection Total</Text>
                  <Text style={styles.rateTotalSub}>Pay {firstName} directly on site</Text>
                </View>
                <Text style={styles.rateTotalVal}>{baseRateFormatted}</Text>
              </View>

              <Text style={styles.cashNotice}>
                <Text style={styles.cashNoticeBold}>Pay Directly on Site</Text>. Haraka does not
                collect or process payments. Pay {firstName} directly via cash or mobile money after
                inspection.
              </Text>
            </View>

            {/* Zero-Commission Guarantee */}
            <View style={styles.guaranteeCard}>
              <ShieldCheck size={18} color="#059669" />
              <View style={styles.guaranteeContent}>
                <Text style={styles.guaranteeTitle}>Zero-Commission Direct Link Guarantee</Text>
                <Text style={styles.guaranteeText}>
                  Haraka&apos;s sole purpose is connecting clients with verified Ghanaian artisans.
                  All agreements and payments happen directly between you and {firstName}.
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* Step 2: Review & Direct Connect - Matching Attached Screen Exactly */
          <View style={styles.step2Container}>
            {/* 1. Artisan & Appointment Details Card */}
            <View style={styles.card}>
              <View style={styles.artisanRow}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: artisan.avatar }}
                    style={styles.avatarCircular}
                    contentFit="cover"
                  />
                  <View style={styles.onlineDot} />
                </View>

                <View style={styles.artisanDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.artisanName}>{artisan.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Star size={11} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{artisan.rating}</Text>
                      <Text style={styles.statsSub}>(64)</Text>
                    </View>
                  </View>

                  <Text style={styles.artisanRole}>
                    {profileData.subrole || 'Master Woodworker & Joinery Lead'}
                  </Text>

                  <View style={styles.trustBadgesRow}>
                    {artisan.verified && (
                      <View style={styles.badgeItem}>
                        <CheckCircle size={12} color="#059669" />
                        <Text style={styles.badgeTextGreen}>Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Appointment Box */}
              <View style={styles.appointmentBox}>
                <View style={styles.appointmentRow}>
                  <Clock size={13} color="#0D9488" />
                  <Text style={styles.appointmentTextBold}>{selectedService}</Text>
                </View>
                <View style={styles.appointmentRow}>
                  <Calendar size={13} color="#EA580C" />
                  <Text style={styles.appointmentText}>
                    {selectedDate} • {selectedWindow}
                  </Text>
                </View>
                <View style={styles.appointmentRowBetween}>
                  <View style={styles.appointmentRow}>
                    <MapPin size={13} color="#94A3B8" />
                    <Text style={styles.appointmentText} numberOfLines={1}>{location}</Text>
                  </View>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceBadgeText}>3.4 km</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. Attached Job Brief Card */}
            <View style={styles.card}>
              <View style={styles.summaryHeaderRow}>
                <Text style={styles.summaryTitle}>Attached Job Brief</Text>
                <Pressable onPress={() => setBookingStep(1)}>
                  <Text style={styles.editDetailsText}>Edit Step 1</Text>
                </Pressable>
              </View>

              {/* Voice Note Player Pill */}
              <View style={styles.voiceNotePill}>
                <View style={styles.voiceNoteLeft}>
                  <View style={styles.voicePlayBtn}>
                    <Mic size={14} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.voiceTitle}>Voice Note (0:18)</Text>
                    <Text style={styles.voiceSub}>Twi & English instructions</Text>
                  </View>
                </View>
                <View style={styles.soundwaves}>
                  {[35, 75, 25, 90, 55, 100, 45, 80, 50, 95].map((h, i) => (
                    <View
                      key={i}
                      style={[styles.soundwaveBar, { height: `${h}%` }]}
                    />
                  ))}
                </View>
              </View>

              {/* Description */}
              {description ? (
                <View style={styles.descBox}>
                  <Text style={styles.descLabel}>Job Description</Text>
                  <Text style={styles.descVal}>{description}</Text>
                </View>
              ) : null}

              {/* Photos Preview */}
              <View style={styles.photosGrid}>
                <View style={styles.photoItem}>
                  <Image
                    source={{ uri: photos[0] || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' }}
                    style={styles.photoImg}
                    contentFit="cover"
                  />
                  <View style={styles.photoTag}>
                    <Text style={styles.photoTagText}>Wall</Text>
                  </View>
                </View>
                <View style={styles.photoItem}>
                  <Image
                    source={{ uri: photos[1] || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80' }}
                    style={styles.photoImg}
                    contentFit="cover"
                  />
                  <View style={styles.photoTag}>
                    <Text style={styles.photoTagText}>Reference Sketch</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. 100% Direct Transaction Card */}
            <View style={styles.card}>
              <View style={styles.directHeaderRow}>
                <View style={styles.directIconBox}>
                  <ShieldCheck size={20} color="#059669" />
                </View>
                <View>
                  <Text style={styles.directTitle}>100% Direct Transaction</Text>
                  <Text style={styles.directSub}>Zero Platform Handling Fee</Text>
                </View>
              </View>

              <View style={styles.directNoticeBox}>
                <Text style={styles.directNoticeText}>
                  Haraka never collects or processes artisan payments. Our sole duty is connecting you directly with verified professionals across Ghana.
                </Text>
              </View>

              <View style={styles.feeBreakdown}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Artisan On-site Inspection Fee</Text>
                  <Text style={styles.summaryVal}>{baseRateFormatted}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Haraka Linkage Fee</Text>
                  <Text style={styles.rateRowFree}>FREE (GH₵ 0.00)</Text>
                </View>
                <View style={[styles.summaryRow, styles.payableRow]}>
                  <Text style={styles.payableLabel}>Payable on Arrival</Text>
                  <Text style={styles.summaryValOrange}>{baseRateFormatted}</Text>
                </View>
              </View>

              <View style={styles.momoBox}>
                <Text style={styles.momoText}>
                  Pay direct to {firstName} via <Text style={styles.cashNoticeBold}>Cash</Text> or personal <Text style={styles.cashNoticeBold}>MTN MoMo / Telecel Cash</Text>.
                </Text>
              </View>
            </View>

            {/* 4. In-App Live Coordination Card */}
            <View style={styles.card}>
              <View style={styles.liveCoordHeader}>
                <MessageSquare size={16} color="#0284C7" />
                <Text style={styles.summaryTitle}>In-App Live Coordination</Text>
              </View>
              <Text style={styles.guaranteeText}>
                Upon dispatching this request, an immediate direct chat room opens with {artisan.name} inside Haraka. Track live artisan arrival ETA and exchange precise landmarks without sharing external personal contacts.
              </Text>
            </View>

            {/* 5. Booking Summary Card */}
            <View style={styles.card}>
              <View style={styles.summaryHeaderRow}>
                <Text style={styles.summaryTitle}>Booking Summary</Text>
                <Pressable onPress={() => setBookingStep(1)}>
                  <Text style={styles.editDetailsText}>Edit Details</Text>
                </Pressable>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Selected Artisan</Text>
                <Text style={styles.summaryVal}>{artisan.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryVal}>{selectedService}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Scheduled Date</Text>
                <Text style={styles.summaryVal}>{selectedDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Arrival Window</Text>
                <Text style={styles.summaryVal}>{selectedWindow}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryVal}>{location}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Inspection Fee</Text>
                <Text style={styles.summaryValOrange}>{baseRateFormatted}</Text>
              </View>
            </View>

            {/* 6. Contact Details */}
            <View style={styles.card}>
              <Text style={styles.summaryTitle}>Your Contact Details for {firstName}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number (Call / In-App Alerts)</Text>
                <TextInput
                  style={styles.textInput}
                  value={clientPhone}
                  onChangeText={setClientPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* 7. Consent Agreement Checkbox */}
            <Pressable
              style={styles.consentRow}
              onPress={() => setHasAgreedTerms(!hasAgreedTerms)}
            >
              <View style={[styles.checkbox, hasAgreedTerms && styles.checkboxActive]}>
                {hasAgreedTerms && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.consentText}>
                I understand Haraka connects me directly with <Text style={styles.cashNoticeBold}>{artisan.name}</Text> and all job negotiation, materials purchase, and final payments are settled directly between us.
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.footerContainer}>
        <View style={styles.footer}>
          <Pressable
            style={styles.footerChatBtn}
            onPress={() => router.push('/chat/conv-1' as any)}
          >
            <MessageSquare size={16} color="#0F172A" />
            <Text style={styles.footerChatText}>Chat</Text>
          </Pressable>

          {bookingStep === 1 ? (
            <Pressable
              style={styles.footerPrimaryBtn}
              onPress={() => setBookingStep(2)}
            >
              <Text style={styles.footerPrimaryText} numberOfLines={1}>
                Review Booking Details (Step 2 of 2)
              </Text>
              <ArrowRight size={15} color="#FFFFFF" />
            </Pressable>
          ) : (
            <Pressable
              style={[styles.footerPrimaryBtn, !hasAgreedTerms && styles.btnDisabled]}
              disabled={!hasAgreedTerms}
              onPress={() => {
                const code = `HRK-BK-${Math.floor(1000 + Math.random() * 9000)}`;
                setReferenceCode(code);
                setShowSuccessModal(true);
              }}
            >
              <CheckCircle size={15} color="#FFFFFF" />
              <Text style={styles.footerPrimaryText} numberOfLines={1}>Confirm Booking Request</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.onlineStatusRow}>
          <View style={styles.onlineDotSmall} />
          <Text style={styles.onlineStatusText}>
            {artisan.name} is online • Usually responds within 15 minutes
          </Text>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePickerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleRow}>
                <Calendar size={18} color="#EA580C" />
                <Text style={styles.modalTitle}>Select Visit Date</Text>
              </View>
              <Pressable onPress={() => setShowDatePickerModal(false)}>
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.quickDatesLabel}>Suggested Dates</Text>
            <View style={styles.quickDatesGrid}>
              {bookingDates.map((d) => {
                const dateStr = `${d.label} ${d.day} ${d.month}`;
                const isSelected = selectedDate === dateStr;
                return (
                  <Pressable
                    key={dateStr}
                    style={[
                      styles.quickDateCard,
                      isSelected && styles.quickDateCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedDate(dateStr);
                      setShowDatePickerModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.quickDateLabel,
                        isSelected && styles.quickDateLabelSelected,
                      ]}
                    >
                      {d.label}
                    </Text>
                    <Text
                      style={[
                        styles.quickDateDay,
                        isSelected && styles.quickDateDaySelected,
                      ]}
                    >
                      {d.day} {d.month}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={styles.modalDoneBtn}
              onPress={() => setShowDatePickerModal(false)}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Booking Request Confirmed!</Text>
            <Text style={styles.modalRefText}>
              Reference: <Text style={styles.modalRefBold}>{referenceCode}</Text>
            </Text>

            <View style={styles.modalDetailsBox}>
              <Text style={styles.modalDetailLine}>
                <Text style={styles.bold}>Artisan:</Text> {artisan.name}
              </Text>
              <Text style={styles.modalDetailLine}>
                <Text style={styles.bold}>Service:</Text> {selectedService}
              </Text>
              <Text style={styles.modalDetailLine}>
                <Text style={styles.bold}>Date:</Text> {selectedDate} ({selectedWindow})
              </Text>
            </View>

            <Text style={styles.modalPhoneNotice}>
              {firstName} will contact you directly at {clientPhone} or via in-app chat before arrival.
            </Text>

            <Pressable
              style={styles.modalChatBtn}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/chat/conv-1' as any);
              }}
            >
              <Text style={styles.modalChatBtnText}>Chat with {firstName} Now</Text>
            </Pressable>

            <Pressable
              style={styles.modalSavedBtn}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/(tabs)/' as any);
              }}
            >
              <Text style={styles.modalSavedBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressBarContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressStepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  artisanRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 1,
  },
  artisanDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rateBookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  artisanName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  artisanRole: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  dotSeparator: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  jobsText: {
    fontSize: 11,
    color: '#64748B',
  },
  locText: {
    fontSize: 11,
    color: '#64748B',
  },
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeTextGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  badgeTextNeutral: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  audioPortfolioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    marginTop: 4,
  },
  audioIntroCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  audioIntroText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  portfolioCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  feeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feeLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  section: {
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
  },
  servicesScroll: {
    flexDirection: 'row',
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  serviceChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  serviceChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  serviceChipTextSelected: {
    color: '#FFFFFF',
  },
  descCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  descInput: {
    fontSize: 12,
    color: '#1E293B',
    minHeight: 140,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  voiceNoteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  voiceNoteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: {
    backgroundColor: '#DC2626',
  },
  voiceNoteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  voiceNoteSub: {
    fontSize: 9,
    color: '#94A3B8',
  },
  voiceTimer: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    fontFamily: 'monospace',
  },
  photosScroll: {
    flexDirection: 'row',
  },
  uploadBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginRight: 8,
  },
  uploadBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 8,
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datesScroll: {
    flexDirection: 'row',
  },
  dateChip: {
    width: 60,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginRight: 8,
  },
  dateChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  dateChipLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  dateChipDay: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  dateChipMonth: {
    fontSize: 10,
    color: '#64748B',
  },
  dateChipTextSelected: {
    color: '#FFFFFF',
  },
  windowsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  windowChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  windowChipSelected: {
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  windowTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  windowTitleSelected: {
    color: '#0F172A',
  },
  windowTime: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gpsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locationInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  mapBox: {
    height: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImg: {
    width: '100%',
    height: '100%',
  },
  mapPinContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  mapPinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 3,
  },
  mapEtaBar: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapEtaText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#334155',
  },
  rateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 10,
  },
  rateCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rateRowLabel: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  rateRowCleanSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
    marginTop: 1,
  },
  rateRowVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  rateRowFree: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  rateTotalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  rateTotalTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  rateTotalSub: {
    fontSize: 10,
    color: '#64748B',
  },
  rateTotalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EA580C',
  },
  cashNotice: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginTop: 4,
  },
  cashNoticeBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  guaranteeCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  guaranteeContent: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  guaranteeText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 14,
  },
  step2Container: {
    gap: 14,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  editDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: 160,
    textAlign: 'right',
  },
  summaryValOrange: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  onlineDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineStatusText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  appointmentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  appointmentRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  appointmentTextBold: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  appointmentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  distanceBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  distanceBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
  },
  voiceNotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FA',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  voicePlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  voiceSub: {
    fontSize: 10,
    color: '#64748B',
  },
  soundwaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 20,
  },
  soundwaveBar: {
    width: 2.5,
    backgroundColor: '#EA580C',
    borderRadius: 2,
  },
  descBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  descLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  descVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 15,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoItem: {
    flex: 1,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  photoTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  photoTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  directHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  directIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  directSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  directNoticeBox: {
    backgroundColor: '#F1F4FD',
    borderRadius: 10,
    padding: 10,
  },
  directNoticeText: {
    fontSize: 10.5,
    color: '#334155',
    lineHeight: 15,
  },
  feeBreakdown: {
    gap: 6,
    paddingTop: 4,
  },
  payableRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 4,
  },
  payableLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  momoBox: {
    backgroundColor: '#EDF1FA',
    borderRadius: 10,
    padding: 8,
  },
  momoText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 14,
  },
  liveCoordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  consentText: {
    flex: 1,
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 14,
  },
  footerChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  footerChatText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  footerPrimaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 10,
  },
  modalCheckCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalRefText: {
    fontSize: 12,
    color: '#64748B',
  },
  modalRefBold: {
    color: '#EA580C',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  modalDetailsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalDetailLine: {
    fontSize: 11,
    color: '#334155',
  },
  bold: {
    fontWeight: '700',
  },
  modalPhoneNotice: {
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
  },
  modalChatBtn: {
    width: '100%',
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  modalChatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSavedBtn: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSavedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  avatarCircular: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  activeNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeNowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  locationTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  badgeTextAmber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  badgeTextSky: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  statsCol: {
    flex: 1,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  statsGreenValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  statsSub: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  statsDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  serviceChipCustomText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  customServiceInputCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    gap: 6,
  },
  customServiceLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  customServiceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customServiceInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  customServiceDoneBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  customServiceDoneText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  calTriggerHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  calTriggerHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  footerStep2Row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  footerBackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  selectedDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  datePickerBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  datePickerMain: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  selectDateActionBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectDateActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickDatesLabel: {
    width: '100%',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  quickDatesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickDateCard: {
    width: '48%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickDateCardSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  quickDateLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  quickDateLabelSelected: {
    color: '#EA580C',
  },
  quickDateDay: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  quickDateDaySelected: {
    color: '#9A3412',
  },
  modalDoneBtn: {
    width: '100%',
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  modalDoneBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
