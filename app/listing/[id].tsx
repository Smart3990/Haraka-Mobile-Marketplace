import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Share,
  Linking,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  CheckCircle,
  ShieldCheck,
  Phone,
  MessageCircle,
  Truck,
  Eye,
  Calendar,
  AlertTriangle,
  Star,
  Zap,
  Mic,
  Play,
  Pause,
  Volume2,
  ArrowRight,
  Clock,
  X,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react-native';
import { INITIAL_LISTINGS, INITIAL_CONVERSATIONS, Listing, ChatConversation } from '../../src/lib/listingData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ListingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Find listing or fallback to the first one (AirPods Pro)
  const listing: Listing =
    INITIAL_LISTINGS.find((item) => item.id === id) || INITIAL_LISTINGS[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [customOffer, setCustomOffer] = useState(listing.price - 15);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCallPopover, setShowCallPopover] = useState(false);
  const [reportReason, setReportReason] = useState('Suspicious or fraudulent seller activity');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleShare = async () => {
    try {
      const deepLink = `https://haraka.app/listing/${listing.id}`;
      await Share.share({
        title: listing.title,
        message: `Check out ${listing.title} (${listing.currency || 'GH₵'} ${listing.price.toLocaleString()}) on Haraka Marketplace!\n\nLink: ${deepLink}`,
        url: deepLink,
      });
    } catch {
      // ignore
    }
  };

  const sellerActiveListings = INITIAL_LISTINGS.filter(
    (l) => l.seller.id === listing.seller.id || (l.seller.name && listing.seller.name && l.seller.name.toLowerCase() === listing.seller.name.toLowerCase())
  );
  const sellerListingsCount = Math.max(sellerActiveListings.length, 1);

  const similarListings = INITIAL_LISTINGS.filter(
    (item) => item.category === listing.category && item.id !== listing.id
  );

  const getDynamicSafeTradingTips = (targetItem: Partial<Listing>) => {
    const cat = (targetItem.category || '').toLowerCase();
    const sub = (targetItem.subcategory || '').toLowerCase();
    const hood = targetItem.location?.neighborhood || 'East Legon';
    const city = targetItem.location?.city || 'Accra';

    let tip1 = 'Meet in safe, busy public physical location';
    let tip2 = `Thoroughly inspect the item condition, accessories, and functionality before releasing payment.`;
    let tip3 = `Never send upfront mobile money deposits or delivery fees before seeing the product in person.`;

    if (cat.includes('vehicle') || sub.includes('car') || sub.includes('motorcycle')) {
      tip1 = `Meet in a public daytime location in ${hood}, ${city} (e.g. near a well-lit service station or mechanic hub).`;
      tip2 = `Inspect chassis/VIN, engine block, and test drive with a qualified mechanic before releasing payment.`;
      tip3 = `Verify custom clearance, DVLA registration, and roadworthy papers before closing payment.`;
    } else if (cat.includes('property') || sub.includes('house') || sub.includes('apartment') || sub.includes('land')) {
      tip1 = `Always conduct physical site inspections in daylight in ${hood}, ${city} with the verified property agent.`;
      tip2 = `Verify land title deed, indenture, and site plan at Lands Commission before signing lease or purchase contracts.`;
      tip3 = `Never pay reservation deposits or viewing fees to unofficial intermediaries without legal receipt.`;
    } else if (cat.includes('phone') || sub.includes('iphone') || sub.includes('samsung') || sub.includes('tablet')) {
      tip1 = 'Meet in safe, busy public physical location';
      tip2 = `Check IMEI status (*#06#), iCloud/Google FRP lock removal, battery health, and test active SIM network.`;
      tip3 = `Avoid remote transfers or uninspected deliveries. Hand over payment only after complete hardware testing.`;
    } else if (cat.includes('electronic') || sub.includes('laptop') || sub.includes('tv') || sub.includes('audio')) {
      tip1 = `Meet in convenient commercial centers in ${hood}, ${city} with access to a power outlet for testing.`;
      tip2 = `Power on device, check screen pixels, port functionality, original specs, and battery cycle health.`;
      tip3 = `Inspect all included accessories and serial numbers in person before making mobile money payment.`;
    } else if (cat.includes('pet') || sub.includes('dog') || sub.includes('puppy')) {
      tip1 = `Meet the pet breeder or owner in a secure daytime area in ${hood}, ${city}.`;
      tip2 = `Inspect active temperament, purebred traits, and demand official veterinary vaccination card with vet stamp.`;
      tip3 = `Never send reservation or transport deposits for puppies/pets without physical verification.`;
    } else if (cat.includes('agriculture') || sub.includes('farm') || sub.includes('poultry') || sub.includes('grain')) {
      tip1 = `Arrange inspection or delivery handover at the farm or storage depot in ${hood}, ${city}.`;
      tip2 = `Count crates/bags, verify freshness grade, weight, and batch quality before signing delivery note.`;
      tip3 = `Never pay in advance for bulk farm commodities without verifying stock and seller credentials.`;
    } else if (cat.includes('fashion') || cat.includes('beauty')) {
      tip1 = `Meet in comfortable public meetup spots in ${hood}, ${city}.`;
      tip2 = `Inspect fabric texture, stitching, sizing, and authentic designer serials before finalizing purchase.`;
      tip3 = `Check all seams and zippers in person before releasing cash or mobile money.`;
    }

    return [tip1, tip2, tip3];
  };

  return (
    <View style={styles.container}>
      {/* Tap anywhere on empty space to close call popover */}
      {showCallPopover && (
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 35 }}
          onPress={() => setShowCallPopover(false)}
        />
      )}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photo Gallery Carousel matching attached image */}
        <View style={styles.galleryContainer}>
          {/* Floating Top Nav */}
          <View style={styles.topFloatingNav}>
            <Pressable style={styles.navCircleBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#0F172A" />
            </Pressable>

            <View style={styles.topRightActions}>
              <Pressable style={styles.navCircleBtn} onPress={handleShare}>
                <Share2 size={18} color="#0F172A" />
              </Pressable>
              <Pressable
                style={styles.navCircleBtn}
                onPress={() => setIsSaved(!isSaved)}
              >
                <Heart
                  size={18}
                  color="#EF4444"
                  fill={isSaved ? '#EF4444' : 'transparent'}
                />
              </Pressable>
            </View>
          </View>

          <Image
            source={{ uri: listing.images[activeImageIndex] || listing.images[0] }}
            style={styles.mainGalleryImage}
            contentFit="cover"
            transition={200}
          />

          {/* Product Condition Text on Product Image - Zero Background Color, Crisp Shadow for Visibility */}
          {listing.condition ? (
            <View style={styles.conditionImageBadgeWrap}>
              <View style={styles.conditionImageBadge}>
                <Text style={styles.conditionImageBadgeText}>🏷️ {listing.condition}</Text>
              </View>
            </View>
          ) : null}

          {/* Pagination Dots matching attached image 2 */}
          <View style={styles.paginationDotsWrap}>
            {listing.images.map((_, dotIdx) => {
              const isActive = activeImageIndex === dotIdx;
              return (
                <Pressable
                  key={dotIdx}
                  onPress={() => setActiveImageIndex(dotIdx)}
                  style={[
                    styles.paginationDot,
                    isActive ? styles.paginationDotActive : styles.paginationDotInactive,
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Photo Thumbnails Row beneath image matching attached image */}
        {listing.images.length > 1 && (
          <View style={styles.thumbStripRow}>
            {listing.images.map((img, idx) => {
              const isActive = activeImageIndex === idx;
              return (
                <Pressable
                  key={idx}
                  style={[
                    styles.thumbBox,
                    isActive ? styles.thumbBoxActive : styles.thumbBoxInactive,
                  ]}
                  onPress={() => setActiveImageIndex(idx)}
                >
                  <Image source={{ uri: img }} style={styles.thumbImg} contentFit="cover" />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Content Body */}
        <View style={styles.contentBody}>
          {/* 1. Price, Negotiable Badge, Title & Meta Info */}
          <View style={styles.infoCard}>
            <View style={styles.priceRow}>
              <View style={styles.priceLeftGroup}>
                <Text style={styles.orangePriceText}>
                  GH₵ {listing.price.toLocaleString()}
                </Text>
                {listing.originalPrice && (
                  <Text style={styles.strikethroughPriceText}>
                    GH₵ {listing.originalPrice.toLocaleString()}
                  </Text>
                )}
              </View>

              {listing.negotiable && (
                <Text style={styles.cleanNegotiableText}>Negotiable</Text>
              )}
            </View>

            <Text style={styles.listingTitle}>{listing.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={13} color="#059669" />
                <Text style={styles.metaTextGreen}>
                  {listing.location.neighborhood}, {listing.location.city}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Clock size={13} color="#64748B" />
                <Text style={styles.metaText}>{listing.createdAt || 'Posted recently'}</Text>
              </View>

              <View style={styles.metaItem}>
                <Eye size={13} color="#64748B" />
                <Text style={styles.metaText}>{listing.views !== undefined ? listing.views : 0} views</Text>
              </View>
            </View>
          </View>

          {/* 2. Seller Card matching attached image */}
          <View style={styles.sellerCard}>
            <View style={styles.sellerHeader}>
              <View style={styles.sellerAvatarWrap}>
                <Image
                  source={{ uri: listing.seller.avatar }}
                  style={styles.sellerAvatar}
                  contentFit="cover"
                />
                <View style={styles.onlineBadgeDot} />
              </View>

              <View style={styles.sellerInfo}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{listing.seller.name}</Text>
                  <Text style={styles.cleanVerifiedText}>VERIFIED</Text>
                </View>

                <View style={styles.ratingRow}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {listing.seller.rating} ({listing.seller.reviewCount} verified reviews)
                  </Text>
                </View>
              </View>

              <Pressable style={styles.cleanFollowBtn}>
                <Text style={styles.cleanFollowBtnText}>Follow</Text>
              </Pressable>
            </View>

            <View style={styles.sellerHighlightsRow}>
              <View style={styles.sellerHighlightItem}>
                <Calendar size={13} color="#059669" />
                <Text style={styles.highlightText}>{listing.seller.memberSince || 'Member since 2022'}</Text>
              </View>
              <View style={styles.sellerHighlightItem}>
                <Text style={styles.highlightText}>{listing.seller.responseTime || 'Replies under 5 mins'}</Text>
              </View>
            </View>

            <View style={styles.sellerLinkRow}>
              <Pressable style={styles.viewListingsBtn}>
                <Text style={styles.viewListingsText}>
                  View all {sellerListingsCount} active {sellerListingsCount === 1 ? 'listing' : 'listings'}
                </Text>
                <ArrowRight size={13} color="#059669" />
              </Pressable>
              <View style={styles.activeNowBadge}>
                <View style={styles.greenPulseDot} />
                <Text style={styles.activeNowText}>Active Now</Text>
              </View>
            </View>
          </View>

          {/* 3. Audio Description Player matching attached image */}
          {listing.hasAudioDescription && (
            <View style={styles.audioPlayerCard}>
              <View style={styles.audioHeaderRow}>
                <View style={styles.audioMintCircle}>
                  <Mic size={15} color="#0B6B46" />
                </View>
                <Text style={styles.audioTitleText}>Audio Description by Seller</Text>
              </View>

              <View style={styles.audioBox}>
                <Pressable
                  style={styles.playBtnCircle}
                  onPress={() => setIsPlayingAudio(!isPlayingAudio)}
                >
                  {isPlayingAudio ? (
                    <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
                  )}
                </Pressable>

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
                      0:{listing.audioDescriptionDuration || 30}
                    </Text>
                  </View>
                </View>

                <View style={styles.audioControlsRight}>
                  <Pressable
                    style={styles.speedPill}
                    onPress={() => setAudioSpeed(audioSpeed === 1 ? 1.5 : audioSpeed === 1.5 ? 2 : 1)}
                  >
                    <Text style={styles.speedPillText}>{audioSpeed}x</Text>
                  </Pressable>
                  <Pressable onPress={() => setIsMuted(!isMuted)}>
                    <Volume2 size={16} color={isMuted ? '#94A3B8' : '#475569'} />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.audioCaptionText}>
                Listen to {listing.seller.name} explain the genuine condition and key details of this item in {listing.location.neighborhood}, {listing.location.city}.
              </Text>
            </View>
          )}

          {/* 4. Item Specifications Card with Real Data & Quantities */}
          <View style={styles.specsCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={styles.subSectionTitle}>Item Specifications</Text>
              {listing.quantity !== undefined && (
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#047857' }}>
                  {listing.quantity} {listing.quantity === 1 ? 'unit available' : 'units available'}
                </Text>
              )}
            </View>

            <View style={styles.specsGrid}>
              {listing.condition && !listing.specifications?.['Condition'] && (
                <View style={styles.specGridCol}>
                  <Text style={styles.specLabel}>Condition</Text>
                  <Text style={styles.specValueGreen}>{listing.condition}</Text>
                </View>
              )}

              <View style={styles.specGridCol}>
                <Text style={styles.specLabel}>Category</Text>
                <Text style={styles.specValue}>{listing.categoryName || listing.category}</Text>
              </View>

              <View style={styles.specGridCol}>
                <Text style={styles.specLabel}>Delivery</Text>
                <Text style={listing.deliveryAvailable ? styles.specValueGreen : styles.specValue}>
                  {listing.deliveryAvailable ? 'Available' : 'Pickup Only'}
                </Text>
              </View>

              {listing.specifications && Object.entries(listing.specifications).map(([key, val]) => {
                const isFull = key.toLowerCase().includes('included') || key.toLowerCase().includes('description') || val.length > 30;
                const isGreen = key.toLowerCase().includes('condition') || key.toLowerCase().includes('warranty') || key.toLowerCase().includes('battery') || key.toLowerCase().includes('duty');
                return (
                  <View key={key} style={isFull ? styles.specGridFull : styles.specGridCol}>
                    <Text style={styles.specLabel}>{key}</Text>
                    <Text style={isGreen ? styles.specValueGreen : styles.specValue}>{val}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 5. Description Card matching attached image */}
          <View style={styles.descSection}>
            <Text style={styles.subSectionTitle}>Description</Text>
            <Text style={styles.descText}>{listing.description}</Text>
          </View>

          {/* 6. Safe Trading Guidelines Card - Static, Non-Clickable, No View Button */}
          <View style={styles.safeTipsBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <ShieldAlert size={18} color="#C2410C" />
              <Text style={styles.safeTipsTitle}>Safe Trading Guidelines</Text>
            </View>

            <View style={styles.safeTipsList}>
              <View style={styles.safeTipItem}>
                <CheckCircle2 size={16} color="#059669" />
                <Text style={styles.safeTipText}>Meet in safe, busy public physical location.</Text>
              </View>
              <View style={styles.safeTipItem}>
                <CheckCircle2 size={16} color="#059669" />
                <Text style={styles.safeTipText}>Inspect the item thoroughly before releasing cash or mobile money.</Text>
              </View>
              <View style={styles.safeTipItem}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  <X size={10} color="#DC2626" strokeWidth={3} />
                </View>
                <Text style={styles.safeTipText}>Never pay advance delivery or reservation fees without seeing the product in person.</Text>
              </View>
            </View>
          </View>

          {/* 7. Report & Listing ID Box matching attached image */}
          <View style={styles.reportRowBox}>
            <Pressable style={styles.reportBtn} onPress={() => setShowReportModal(true)}>
              <Text style={styles.reportBtnText}>Report this listing</Text>
            </Pressable>
            <Text style={styles.listingIdText}>Listing ID: #{listing.id === 'listing-airpods-pro-2' ? 'HK-849102' : `HK-${listing.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar matching attached image */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.chatAndOfferBtn}
          onPress={() => {
            const conv = INITIAL_CONVERSATIONS.find(
              (c) => c.listingId === listing.id || c.otherUser.id === listing.seller.id
            );
            router.push(`/chat/${conv ? conv.id : 'conv-1'}` as any);
          }}
        >
          <MessageCircle size={16} color="#FFFFFF" />
          <Text style={styles.chatAndOfferText}>Chat & Offer</Text>
        </Pressable>

        <View style={{ flex: 1, position: 'relative' }}>
          {showCallPopover && (
            <View style={styles.callPopoverContainer}>
              <Pressable
                style={styles.callPopoverOption}
                onPress={() => {
                  setShowCallPopover(false);
                  Alert.alert('In-App Call', `Connecting encrypted voice call to ${listing.seller.name}...`);
                }}
              >
                <Phone size={15} color="#FF6A00" />
                <Text style={styles.callPopoverText}>In-App Call</Text>
              </Pressable>
              <View style={styles.callPopoverDivider} />
              <Pressable
                style={styles.callPopoverOption}
                onPress={() => {
                  setShowCallPopover(false);
                  Linking.openURL(`tel:${listing.seller.phone}`);
                }}
              >
                <Phone size={15} color="#059669" />
                <Text style={styles.callPopoverText}>Call</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={styles.callSellerBtn}
            onPress={() => setShowCallPopover(!showCallPopover)}
          >
            <Phone size={16} color="#FFFFFF" />
            <Text style={styles.callSellerText}>Call Seller</Text>
          </Pressable>
        </View>
      </View>

      {/* Quick Offer Popup */}
      {showOfferModal && (
        <View style={styles.offerModalOverlay}>
          <View style={styles.offerModalContent}>
            <Text style={styles.offerModalTitle}>Make an Offer to {listing.seller.name}</Text>
            <Text style={styles.offerModalSub}>Listing price is ${listing.price}</Text>

            <View style={styles.quickOffersRow}>
              {[listing.price - 25, listing.price - 15, listing.price - 10].map((amt) => (
                <Pressable
                  key={amt}
                  style={[styles.quickOfferChip, customOffer === amt && styles.quickOfferChipActive]}
                  onPress={() => setCustomOffer(amt)}
                >
                  <Text style={[styles.quickOfferText, customOffer === amt && styles.quickOfferTextActive]}>
                    ${amt}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActionsRow}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setShowOfferModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.modalSubmitBtn}
                onPress={() => {
                  setShowOfferModal(false);
                  const conv = INITIAL_CONVERSATIONS.find(
                    (c) => c.listingId === listing.id || c.otherUser.id === listing.seller.id
                  );
                  router.push(`/chat/${conv ? conv.id : 'conv-1'}` as any);
                }}
              >
                <Text style={styles.modalSubmitText}>Send ${customOffer} Offer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Report Listing Modal to Admin */}
      {showReportModal && (
        <View style={styles.reportModalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => !isSubmittingReport && setShowReportModal(false)} />
          <View style={styles.reportModalCard}>
            <Pressable
              style={styles.reportModalCloseBtn}
              onPress={() => setShowReportModal(false)}
              disabled={isSubmittingReport}
            >
              <X size={18} color="#64748B" />
            </Pressable>

            <View style={styles.reportHeaderRow}>
              <View style={styles.reportIconCircle}>
                <AlertTriangle size={18} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reportModalTitle}>Report to Admin</Text>
                <Text style={styles.reportModalSubtitle}>Help keep Haraka marketplace safe</Text>
              </View>
            </View>

            <View style={styles.reportListingTargetBox}>
              <Image source={{ uri: listing.images[0] }} style={styles.reportTargetThumb} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.reportTargetId}>
                  ID #{listing.id === 'listing-airpods-pro-2' ? 'HK-849102' : `HK-${listing.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`}
                </Text>
                <Text style={styles.reportTargetTitle} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.reportTargetSeller}>Seller: {listing.seller.name}</Text>
              </View>
            </View>

            <Text style={styles.reportReasonLabel}>REASON FOR REPORT</Text>
            <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
              {[
                'Suspicious or fraudulent seller activity',
                'Counterfeit, stolen, or fake item',
                'Inappropriate or prohibited content',
                'Price or item condition is misleading',
                'Seller requested upfront mobile money deposit',
                'Duplicate listing or spam',
                'Other policy violation',
              ].map((reason) => {
                const isSelected = reportReason === reason;
                return (
                  <Pressable
                    key={reason}
                    style={[styles.reasonOptionBtn, isSelected && styles.reasonOptionBtnSelected]}
                    onPress={() => setReportReason(reason)}
                  >
                    <Text style={[styles.reasonOptionText, isSelected && styles.reasonOptionTextSelected]} numberOfLines={1}>
                      {reason}
                    </Text>
                    <View style={[styles.radioDot, isSelected && styles.radioDotSelected]}>
                      {isSelected && <View style={styles.radioDotInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.reportReasonLabel}>ADDITIONAL DETAILS (OPTIONAL)</Text>
            <TextInput
              value={reportDetails}
              onChangeText={setReportDetails}
              placeholder="Provide any details for admin review..."
              placeholderTextColor="#94A3B8"
              style={styles.reportTextInput}
              multiline
              numberOfLines={2}
            />

            <View style={styles.reportModalActions}>
              <Pressable
                style={styles.reportCancelBtn}
                onPress={() => setShowReportModal(false)}
                disabled={isSubmittingReport}
              >
                <Text style={styles.reportCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.reportSubmitBtn, isSubmittingReport && { opacity: 0.6 }]}
                disabled={isSubmittingReport}
                onPress={() => {
                  setIsSubmittingReport(true);
                  setTimeout(() => {
                    setIsSubmittingReport(false);
                    setShowReportModal(false);
                    Alert.alert(
                      'Report Submitted',
                      'Thank you. This listing has been flagged and submitted to Haraka Admin for safety review.'
                    );
                  }, 600);
                }}
              >
                <Text style={styles.reportSubmitBtnText}>
                  {isSubmittingReport ? 'Submitting...' : 'Submit to Admin'}
                </Text>
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
  topFloatingNav: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thumbStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  thumbBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
  },
  thumbBoxActive: {
    borderColor: '#FF6A00',
    transform: [{ scale: 1.05 }],
  },
  thumbBoxInactive: {
    borderColor: '#E2E8F0',
    opacity: 0.75,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  navCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  galleryContainer: {
    width: SCREEN_WIDTH,
    height: 320,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  mainGalleryImage: {
    width: '100%',
    height: '100%',
  },
  conditionImageBadgeWrap: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    zIndex: 20,
  },
  conditionImageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionImageBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
    letterSpacing: 0.3,
  },
  badgeBrandNew: {},
  badgeLikeNew: {},
  badgeRefurbished: {},
  badgeUsed: {},
  paginationDotsWrap: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FF6A00',
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cleanNegotiableText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  cleanVerifiedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
  },
  cleanFollowBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cleanFollowBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  thumbStrip: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  thumbItem: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  thumbItemActive: {
    borderColor: '#EA580C',
    transform: [{ scale: 1.08 }],
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  contentBody: {
    padding: 18,
  },
  priceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },
  originalPriceText: {
    fontSize: 15,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  negotiablePill: {
    marginTop: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  negotiableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  verifiedDealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  verifiedDealText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  specChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specChipLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  specChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  deliveryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  deliveryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  specsSection: {
    marginBottom: 20,
  },
  specsTable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  specRowEven: {
    backgroundColor: '#FFFFFF',
  },
  specRowOdd: {
    backgroundColor: '#F8FAFC',
  },
  specKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  specVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  descSection: {
    marginBottom: 22,
  },
  descText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  sellerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  sellerHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#CBD5E1',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  memberSinceText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  sellerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sellerStat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  statVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    height: '100%',
  },
  safetyBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 20,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A3412',
  },
  safetyList: {
    gap: 4,
  },
  safetyBullet: {
    fontSize: 11,
    color: '#7C2D12',
    lineHeight: 16,
  },
  similarSection: {
    marginTop: 6,
  },
  similarScroll: {
    gap: 12,
  },
  similarCard: {
    width: 140,
    marginRight: 12,
  },
  similarThumb: {
    width: 140,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
  },
  similarPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  similarTitle: {
    fontSize: 11,
    color: '#475569',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  offerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  offerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  callBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  offerModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  offerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  offerModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  offerModalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  quickOffersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickOfferChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  quickOfferChipActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  quickOfferText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  quickOfferTextActive: {
    color: '#EA580C',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Image 2 Audio Description Player */
  audioPlayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
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

  /* Attached Image Header & Card Styles */
  topHeaderBar: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  logoTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadgeMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF6A00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadgeMiniText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  headerTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    padding: 4,
  },
  headerUserAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  /* Badges over Gallery */
  conditionPillBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conditionPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  floatingHeartBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  paginationDotsRow: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDotPill: {
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6A00',
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  imageCounterPill: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  /* Info Card */
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceLeftGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  orangePriceText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FF6A00',
  },
  strikethroughPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  mintNegotiableBadge: {
    backgroundColor: 'rgba(110, 231, 183, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  mintNegotiableText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '800',
  },
  metaTextGreen: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },

  /* Seller Card */
  sellerAvatarWrap: {
    position: 'relative',
  },
  onlineBadgeDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedBadgePill: {
    backgroundColor: '#34D399',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  followBtn: {
    backgroundColor: '#E8EDF8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
  sellerHighlightsRow: {
    backgroundColor: '#F4F7FD',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  sellerHighlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  highlightText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  sellerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  viewListingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewListingsText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
  },
  activeNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activeNowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },

  audioCaptionText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
    marginTop: 8,
  },

  /* Specs Card */
  specsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  specGridCol: {
    width: '47%',
  },
  specGridFull: {
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  specLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  specValueGreen: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },

  /* Safe Tips */
  safeTipsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  safeTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  safeTipsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#9A3412',
  },
  safeTipsList: {
    gap: 8,
  },
  safeTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  safeTipText: {
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },

  /* Report Row Box */
  reportRowBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  listingIdText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },

  /* Bottom Bar Buttons */
  chatAndOfferBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  chatAndOfferText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  callSellerBtn: {
    flex: 1,
    backgroundColor: '#FF6A00',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  callSellerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* Call Options Popover */
  callPopoverContainer: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: 8,
    width: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 50,
  },
  callPopoverOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  callPopoverText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  callPopoverDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },

  /* Report Modal Styles */
  reportModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  reportModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  reportModalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 2,
  },
  reportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 24,
  },
  reportIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  reportModalSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  reportListingTargetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reportTargetThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  reportTargetId: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  reportTargetTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportTargetSeller: {
    fontSize: 10,
    color: '#64748B',
  },
  reportReasonLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  reasonOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 5,
    backgroundColor: '#FFFFFF',
  },
  reasonOptionBtnSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  reasonOptionText: {
    fontSize: 11,
    color: '#334155',
    flex: 1,
    marginRight: 6,
  },
  reasonOptionTextSelected: {
    color: '#9A3412',
    fontWeight: '700',
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#EA580C',
  },
  radioDotInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  reportTextInput: {
    fontSize: 11,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
    color: '#0F172A',
    minHeight: 48,
    textAlignVertical: 'top',
  },
  reportModalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  reportCancelBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  reportCancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  reportSubmitBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  reportSubmitBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
