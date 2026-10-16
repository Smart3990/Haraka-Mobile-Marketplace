import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Zap,
  Check,
  Rocket,
  Flame,
  Truck,
  ShieldCheck,
  Mic,
  Phone,
  Tag,
  Play,
  Pause,
  Volume2,
} from 'lucide-react-native';

export default function PostAdStep3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const title = (params.title as string) || '';
  const price = (params.price as string) || '';
  const originalPrice = (params.originalPrice as string) || '';
  const city = (params.city as string) || '';
  const neighborhood = (params.neighborhood as string) || '';
  const condition = (params.condition as string) || '';
  const category = (params.category as string) || '';
  const description = (params.description as string) || '';
  const phone = (params.phone as string) || '';
  const deliveryAvailable = params.deliveryAvailable === 'true';
  const negotiable = params.negotiable === 'true';
  const hasAudioDescription = params.hasAudioDescription === 'true';
  const audioDuration = params.audioDuration ? parseInt(params.audioDuration as string, 10) : 0;

  let photosList: string[] = [];
  try {
    if (params.photosJson) {
      photosList = JSON.parse(params.photosJson as string);
    }
  } catch (_) {}
  if (!photosList.length && params.coverPhoto) {
    photosList = [params.coverPhoto as string];
  }
  const coverPhoto = photosList[0] || null;

  const numPrice = parseFloat(price) || 0;
  const numOriginal = parseFloat(originalPrice) || 0;
  const hasDiscount = numOriginal > numPrice && numPrice > 0;
  const discountPercent = hasDiscount ? Math.round(((numOriginal - numPrice) / numOriginal) * 100) : 0;

  const handlePublish = () => {
    if (!agreedToGuidelines) return;
    setIsPublished(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Review & Boost</Text>
          <Text style={styles.stepIndicator}>Step 3 of 3: Publish Ad</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Stepper matching attached reference image */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperRelative}>
          {/* Connecting line 1 -> 2 (Bright Orange) */}
          <View style={[styles.connectorLine, styles.connectorLine1]} />
          {/* Connecting line 2 -> 3 (Bright Orange) */}
          <View style={[styles.connectorLine, styles.connectorLine2]} />

          <View style={styles.stepsRow}>
            {/* Step 1: Completed with Green Circle and White Checkmark */}
            <View style={styles.stepColumn}>
              <View style={[styles.circle, styles.circleCompleted]}>
                <Check size={16} color="#FFFFFF" strokeWidth={3.5} />
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Item Details</Text>
            </View>

            {/* Step 2: Completed with Green Circle and White Checkmark */}
            <View style={styles.stepColumn}>
              <View style={[styles.circle, styles.circleCompleted]}>
                <Check size={16} color="#FFFFFF" strokeWidth={3.5} />
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Pricing & Delivery</Text>
            </View>

            {/* Step 3: Active with Vibrant Orange Circle and White 3 */}
            <View style={styles.stepColumn}>
              <View style={[styles.circle, styles.circleActive]}>
                <Text style={styles.circleNumberActive}>3</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelActive]}>Publish</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Photo & Gallery Preview */}
        <View style={styles.coverPreviewCard}>
          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto }}
              style={styles.coverLargeImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.coverLargeImage, { backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8' }}>No Photos Uploaded</Text>
            </View>
          )}
          {coverPhoto && (
            <View style={styles.coverPhotoBadge}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.coverPhotoBadgeText}>Chosen Cover Photo</Text>
            </View>
          )}
          <View style={styles.photoCountBadge}>
            <Text style={styles.photoCountBadgeText}>
              {photosList.length} photo{photosList.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {photosList.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbStrip}>
            {photosList.map((p, idx) => (
              <View
                key={idx}
                style={[styles.smallThumbWrap, idx === 0 && styles.smallThumbWrapActive]}
              >
                <Image source={{ uri: p }} style={styles.smallThumb} contentFit="cover" />
                {idx === 0 && (
                  <View style={styles.smallCoverTag}>
                    <Text style={styles.smallCoverTagText}>Cover</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Title & Price Card */}
        <View style={styles.priceOverviewCard}>
          <View style={styles.priceRow}>
            <View style={styles.priceWithDiscount}>
              <Text style={styles.previewPrice}>
                GH₵ {numPrice.toLocaleString()}
              </Text>
              {hasDiscount && (
                <>
                  <Text style={styles.previewOriginalPrice}>
                    GH₵ {numOriginal.toLocaleString()}
                  </Text>
                  <Text style={styles.discountPillText}>
                    Save GH₵ {(numOriginal - numPrice).toLocaleString()} ({discountPercent}% OFF)
                  </Text>
                </>
              )}
            </View>
          </View>

          <Text style={styles.previewTitle}>
            {title}
          </Text>

          <Text style={styles.negotiableText}>
            • {negotiable ? 'Price is Negotiable (Counter-offers welcome)' : 'Fixed Price (Firm)'}
          </Text>
        </View>

        {/* All Added Listing Specifications */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsCardTitle}>All Listing Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{category}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Condition</Text>
            <Text style={styles.detailValue}>{condition}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Region in Ghana</Text>
            <Text style={styles.detailValue}>{city} Region</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Neighborhood</Text>
            <Text style={styles.detailValue}>{neighborhood}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery</Text>
            <Text style={[styles.detailValue, deliveryAvailable && styles.deliveryGreenText]}>
              {deliveryAvailable ? 'Courier Delivery Available' : 'Local Pickup Only'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Seller Contact</Text>
            <Text style={styles.detailValue}>{phone}</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionBox}>
          <Text style={styles.detailsCardTitle}>Item Description</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Audio Description Player matching attached image 2 */}
        {hasAudioDescription && (
          <View style={styles.audioPlayerCard}>
            {/* Header: Mint Circle with Dark Green Mic icon + Title */}
            <View style={styles.audioHeaderRow}>
              <View style={styles.audioMintCircle}>
                <Mic size={15} color="#0B6B46" />
              </View>
              <Text style={styles.audioTitleText}>Audio Description by Seller</Text>
            </View>

            {/* Inner Player Box */}
            <View style={styles.audioBox}>
              <View style={styles.playBtnCircle}>
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
              </View>

              <View style={styles.waveformCol}>
                <View style={styles.waveformBarsRow}>
                  {[
                    { h: 32, type: 'green' },
                    { h: 65, type: 'green' },
                    { h: 96, type: 'green' },
                    { h: 60, type: 'green' },
                    { h: 44, type: 'green' },
                    { h: 80, type: 'orange' },
                    { h: 100, type: 'orange' },
                    { h: 56, type: 'orange' },
                    { h: 38, type: 'unplayed' },
                    { h: 68, type: 'unplayed' },
                    { h: 86, type: 'unplayed' },
                    { h: 52, type: 'unplayed' },
                    { h: 35, type: 'unplayed' },
                    { h: 76, type: 'unplayed' },
                    { h: 82, type: 'unplayed' },
                    { h: 32, type: 'unplayed' },
                    { h: 60, type: 'unplayed' },
                    { h: 24, type: 'unplayed' },
                  ].map((bar, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.waveBar,
                        {
                          height: `${bar.h}%`,
                          backgroundColor:
                            bar.type === 'green'
                              ? '#00A86B'
                              : bar.type === 'orange'
                              ? '#FF6B00'
                              : '#D2DFED',
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.audioTimersRow}>
                  <Text style={styles.audioTimeGreen}>0:18</Text>
                  <Text style={styles.audioTimeSlate}>
                    0:{audioDuration < 10 ? `0${audioDuration}` : audioDuration || '42'}
                  </Text>
                </View>
              </View>

              <View style={styles.audioControlsRight}>
                <View style={styles.speedPill}>
                  <Text style={styles.speedPillText}>1x</Text>
                </View>
                <Volume2 size={16} color="#475569" />
              </View>
            </View>
          </View>
        )}

        {/* Image 1: Safety & Direct Payment Banner */}
        <View style={styles.image1Banner}>
          <View style={styles.image1BannerRow}>
            <View style={styles.image1IconBox}>
              <ShieldCheck size={13} color="#047857" />
            </View>
            <Text style={styles.image1Text}>
              Haraka does not process or escrow payments. You deal directly with buyers and receive full payment upon inspection via cash or direct mobile money (<Text style={styles.image1Bold}>MTN MoMo / Telecel Cash</Text>). Always meet in safe, busy public physical location.
            </Text>
          </View>
        </View>

        {/* Image 2: Guidelines & Possession Confirmation Checkbox */}
        <Pressable
          style={styles.confirmationBox}
          onPress={() => setAgreedToGuidelines(!agreedToGuidelines)}
        >
          <View style={[styles.checkboxSquare, agreedToGuidelines && styles.checkboxSquareChecked]}>
            {agreedToGuidelines && <Check size={14} color="#FFFFFF" strokeWidth={3.5} />}
          </View>
          <Text style={styles.confirmationText}>
            I confirm this item is genuine, currently in my possession in Ghana, and conforms to Haraka Marketplace Guidelines.
          </Text>
        </Pressable>
      </ScrollView>

      {/* Footer Publish Button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.publishBtn, !agreedToGuidelines && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={!agreedToGuidelines}
        >
          <Text style={styles.publishBtnText}>Publish Free Ad Now</Text>
        </Pressable>
      </View>

      {/* Success Modal */}
      {isPublished && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckCircle size={48} color="#16A34A" />
            </View>
            <Text style={styles.successHeading}>Ad Published Successfully! 🎉</Text>
            <Text style={styles.successSub}>
              Your ad is now live across Haraka Ghana. Interested buyers can reach you directly via in-app chat and direct phone calls.
            </Text>

            <View style={styles.successButtonsRow}>
              <Pressable
                style={styles.viewAdBtn}
                onPress={() => {
                  setIsPublished(false);
                  router.push('/(tabs)' as any);
                }}
              >
                <Text style={styles.viewAdBtnText}>Return to Home</Text>
              </Pressable>

              <Pressable
                style={styles.browseListingsBtn}
                onPress={() => {
                  setIsPublished(false);
                  router.push(`/listing/listing-airpods-pro-2` as any);
                }}
              >
                <Text style={styles.browseListingsBtnText}>View My Ad</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
    backgroundColor: '#FF6A00',
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
  circleNumberActive: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
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

  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 16,
  },
  /* Cover Preview */
  coverPreviewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    height: 190,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coverLargeImage: {
    width: '100%',
    height: '100%',
  },
  coverPhotoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6A00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  coverPhotoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  photoCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  thumbStrip: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  smallThumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  smallThumbWrapActive: {
    borderWidth: 2,
    borderColor: '#FF6A00',
  },
  smallThumb: {
    width: '100%',
    height: '100%',
  },
  smallCoverTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6A00',
    paddingVertical: 1,
    alignItems: 'center',
  },
  smallCoverTagText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '800',
  },

  /* Price Overview Card */
  priceOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceWithDiscount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF6A00',
  },
  previewOriginalPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  previewTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 6,
  },
  negotiableText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
  },

  /* Details Card */
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  detailsCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },
  deliveryGreenText: {
    color: '#047857',
  },

  /* Description Box */
  descriptionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 4,
  },

  /* Image 2 Audio Description Player */
  audioPlayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  audioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  audioMintCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F7EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  audioBox: {
    backgroundColor: '#EEF3F8',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playBtnCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00A86B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  waveformCol: {
    flex: 1,
  },
  waveformBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 3,
    marginBottom: 4,
  },
  waveBar: {
    flex: 1,
    borderRadius: 4,
  },
  audioTimersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  audioTimeGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
  },
  audioTimeSlate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  audioControlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  speedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },

  /* Image 1 Banner */
  image1Banner: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 14,
    padding: 8,
    marginBottom: 8,
  },
  image1BannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  image1IconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  image1Text: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
    fontWeight: '400',
  },
  image1Bold: {
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Image 2 Confirmation Box */
  confirmationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 14,
    padding: 8,
    marginBottom: 16,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxSquareChecked: {
    backgroundColor: '#046A38',
    borderColor: '#046A38',
  },
  confirmationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#0F172A',
    lineHeight: 17,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
  },
  publishBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  publishBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  successButtonsRow: {
    width: '100%',
    gap: 10,
  },
  viewAdBtn: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAdBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  browseListingsBtn: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseListingsBtnText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
});
