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
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Tag,
  Mic,
  Play,
  Pause,
  Square,
  Trash2,
  CheckCircle,
} from 'lucide-react-native';
import { CATEGORIES } from '../../src/lib/listingData';

export default function PostAdStep1Screen() {
  const router = useRouter();

  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const selectedCategoryObj = CATEGORIES.find((c) => c.slug === selectedCategory);
  const [selectedCondition, setSelectedCondition] = useState<'Brand New' | 'Like New' | 'Used - Good' | 'Refurbished' | ''>('');
  const [description, setDescription] = useState('');

  // Audio Description States
  const [hasAudioDescription, setHasAudioDescription] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(15);
  const [audioProgress, setAudioProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Live recording timer
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecordingAudio) {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            setIsRecordingAudio(false);
            setHasAudioDescription(true);
            setAudioDuration(60);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecordingAudio]);

  // Audio playback simulator
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 1) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 0.05;
        });
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio]);

  const startRecordingAudio = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setIsRecordingAudio(true);
  };

  const stopRecordingAudio = (save = true) => {
    setIsRecordingAudio(false);
    if (save) {
      setHasAudioDescription(true);
      setAudioDuration(Math.max(3, recordingSeconds || 14));
    }
  };

  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
    }
  };

  const deleteAudio = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setHasAudioDescription(false);
  };

  const addSamplePhoto = () => {
    if (photos.length < 8) {
      setPhotos((prev) => [
        ...prev,
        'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=600&q=80',
      ]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const selectCoverPhoto = (index: number) => {
    if (index === 0 || index >= photos.length) return;
    const newPhotos = [...photos];
    const [chosen] = newPhotos.splice(index, 1);
    newPhotos.unshift(chosen);
    setPhotos(newPhotos);
  };

  const handleNext = () => {
    if (photos.length === 0) {
      setValidationError('At least 1 photo is required so buyers can see your item.');
      return;
    }
    if (!title.trim() || title.trim().length < 5) {
      setValidationError('Ad title is required (minimum 5 characters).');
      return;
    }
    if (!selectedCategory) {
      setValidationError('Please choose a category for your ad.');
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      setValidationError('A detailed description is required (minimum 15 characters).');
      return;
    }
    setValidationError(null);
    router.push({
      pathname: '/post-ad/step2',
      params: {
        title,
        category: selectedCategory,
        condition: selectedCondition,
        description,
        photosCount: photos.length.toString(),
        photosJson: JSON.stringify(photos),
        coverPhoto: photos[0] || '',
        hasAudioDescription: hasAudioDescription.toString(),
        audioDuration: audioDuration.toString(),
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Post Free Ad</Text>
          <Text style={styles.stepIndicator}>Step 1 of 3: Details & Photos</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Stepper matching reference image */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperRelative}>
          <View style={[styles.connectorLine, styles.connectorLine1]} />
          <View style={[styles.connectorLine, styles.connectorLine2]} />

          <View style={styles.stepsRow}>
            {/* Step 1: Active with Vibrant Orange Circle and White 1 */}
            <View style={styles.stepColumn}>
              <View style={[styles.circle, styles.circleActive]}>
                <Text style={styles.circleNumberActive}>1</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelActive]}>Item Details</Text>
            </View>

            {/* Step 2: Pending with Soft Slate Circle and Number 2 */}
            <View style={styles.stepColumn}>
              <View style={[styles.circle, styles.circlePending]}>
                <Text style={styles.circleNumberPending}>2</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelPending]}>Pricing & Delivery</Text>
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
        {/* Photo Upload Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.label}>
              Photos ({photos.length}/8) <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={styles.hint}>Tap any photo to set Cover</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
            {/* Upload Button */}
            {photos.length < 8 && (
              <Pressable style={styles.addPhotoBtn} onPress={addSamplePhoto}>
                <Camera size={24} color="#EA580C" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </Pressable>
            )}

            {photos.map((uri, idx) => (
              <Pressable
                key={idx}
                style={[styles.photoThumbWrapper, idx === 0 && styles.photoThumbWrapperCover]}
                onPress={() => selectCoverPhoto(idx)}
              >
                <Image source={{ uri }} style={styles.photoThumb} contentFit="cover" />
                {idx === 0 ? (
                  <View style={styles.coverTag}>
                    <Text style={styles.coverTagText}>Cover</Text>
                  </View>
                ) : (
                  <View style={styles.setCoverTag}>
                    <Text style={styles.setCoverTagText}>Set Cover</Text>
                  </View>
                )}
                {photos.length > 1 && (
                  <Pressable
                    style={styles.deletePhotoBtn}
                    onPress={(e: any) => {
                      e?.stopPropagation?.();
                      removePhoto(idx);
                    }}
                  >
                    <X size={12} color="#FFFFFF" />
                  </Pressable>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Ad Title */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.label}>
              Ad Title <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={styles.counter}>{title.length}/70</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. iPhone 14 Pro 128GB Deep Purple"
            placeholderTextColor="#94A3B8"
            maxLength={70}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Dropdown */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Category <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <Pressable
            style={styles.dropdownTrigger}
            onPress={() => setShowCategoryPicker(true)}
          >
            <View style={styles.dropdownTriggerLeft}>
              <Tag size={17} color="#EA580C" />
              <Text
                style={
                  selectedCategoryObj
                    ? styles.dropdownTriggerValue
                    : styles.dropdownTriggerPlaceholder
                }
              >
                {selectedCategoryObj ? selectedCategoryObj.name : 'Select a Category...'}
              </Text>
            </View>
            <ChevronDown size={18} color="#64748B" />
          </Pressable>
        </View>

        {/* Condition Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Item Condition <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.conditionRow}>
            {(['Brand New', 'Like New', 'Used - Good', 'Refurbished'] as const).map((cond) => {
              const isSelected = selectedCondition === cond;
              return (
                <Pressable
                  key={cond}
                  style={[styles.conditionChip, isSelected && styles.conditionChipActive]}
                  onPress={() => setSelectedCondition(cond)}
                >
                  <Text style={[styles.conditionChipText, isSelected && styles.conditionChipTextActive]}>
                    {cond}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.label}>
              Description <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={styles.counter}>{description.length}/1000</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Mention key features, accessories included, reason for selling..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Audio Description Section */}
        <View style={styles.audioSectionCard}>
          <View style={styles.audioHeaderRow}>
            <View style={styles.audioIconCircle}>
              <Mic size={16} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.audioTitleRow}>
                <Text style={styles.audioTitle}>
                  Audio Description <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <Text style={styles.ghanaBadgeText}>Ghana Favorite</Text>
              </View>
              <Text style={styles.audioSubtitle}>
                Describe your item in your voice (English, Twi, Ga, Hausa)
              </Text>
            </View>
            {hasAudioDescription && (
              <View style={styles.attachedBadge}>
                <CheckCircle size={11} color="#059669" />
                <Text style={styles.attachedBadgeText}>Attached</Text>
              </View>
            )}
          </View>

          {isRecordingAudio ? (
            /* Active Recording View */
            <View style={styles.recordingCard}>
              <View style={styles.recordingLeft}>
                <View style={styles.recordingDot} />
                <View>
                  <Text style={styles.recordingTime}>
                    Recording: 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 01:00
                  </Text>
                  <Text style={styles.recordingSubtext}>Speak clearly about condition & price</Text>
                </View>
              </View>
              <View style={styles.recordingActions}>
                <Pressable
                  style={styles.cancelRecordBtn}
                  onPress={() => stopRecordingAudio(false)}
                >
                  <Text style={styles.cancelRecordText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.doneRecordBtn}
                  onPress={() => stopRecordingAudio(true)}
                >
                  <Square size={11} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.doneRecordText}>Done</Text>
                </Pressable>
              </View>
            </View>
          ) : hasAudioDescription ? (
            /* Attached Audio Player Card */
            <View style={styles.audioPlayerCard}>
              <View style={styles.playerTop}>
                <Pressable style={styles.playBtn} onPress={togglePlayAudio}>
                  {isPlayingAudio ? (
                    <Pause size={15} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
                  )}
                </Pressable>
                <View style={styles.waveformCol}>
                  <View style={styles.waveformBars}>
                    {[40, 70, 45, 90, 60, 100, 75, 50, 85, 65, 95, 45, 70, 80, 55, 90, 60, 40].map((h, i) => {
                      const isActive = i / 18 <= audioProgress;
                      return (
                        <View
                          key={i}
                          style={[
                            styles.waveBar,
                            { height: `${h * 0.7}%` },
                            isActive && styles.waveBarActive,
                          ]}
                        />
                      );
                    })}
                  </View>
                  <View style={styles.timerRow}>
                    <Text style={styles.timerText}>
                      00:{Math.round(audioProgress * audioDuration) < 10 ? '0' : ''}
                      {Math.round(audioProgress * audioDuration)}
                    </Text>
                    <Text style={styles.timerText}>
                      00:{audioDuration < 10 ? `0${audioDuration}` : audioDuration}
                    </Text>
                  </View>
                </View>

                <View style={styles.playerActions}>
                  <Pressable style={styles.reRecordBtn} onPress={startRecordingAudio}>
                    <Text style={styles.reRecordText}>Re-record</Text>
                  </Pressable>
                  <Pressable style={styles.deleteAudioBtn} onPress={deleteAudio}>
                    <Trash2 size={15} color="#94A3B8" />
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            /* Ready to Record Trigger */
            <Pressable style={styles.recordTriggerBtn} onPress={startRecordingAudio}>
              <View style={styles.recordIconCircle}>
                <Mic size={15} color="#FFFFFF" />
              </View>
              <Text style={styles.recordTriggerTitle}>Record Audio Description (Tap to Speak)</Text>
            </Pressable>
          )}
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
          <Text style={styles.nextBtnText}>Continue to Pricing (Step 2)</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Category Dropdown Modal Sheet */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowCategoryPicker(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Select Category</Text>
                <Text style={styles.sheetSubtitle}>Choose category for your listing</Text>
              </View>
              <Pressable
                onPress={() => setShowCategoryPicker(false)}
                hitSlop={8}
                style={styles.sheetCloseBtn}
              >
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryRow,
                      isSelected && styles.categoryRowActive,
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat.slug);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={styles.categoryRowLeft}>
                      <View style={[styles.categoryRowIconBox, isSelected && styles.categoryRowIconBoxActive]}>
                        <Tag size={16} color={isSelected ? '#FFFFFF' : '#1E293B'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.categoryRowTitle, isSelected && styles.categoryRowTitleActive]}>
                          {cat.name}
                        </Text>
                        <Text style={styles.categoryRowSubtitle}>
                          {cat.count.toLocaleString()}+ ads in Ghana
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Check size={18} color="#EA580C" strokeWidth={2.5} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    color: '#EA580C',
    fontWeight: '600',
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
    backgroundColor: '#E2E8F0',
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
  stepLabelActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  stepLabelPending: {
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  requiredAsterisk: {
    color: '#EF4444',
    fontWeight: '800',
  },
  hint: {
    fontSize: 11,
    color: '#94A3B8',
  },
  counter: {
    fontSize: 11,
    color: '#94A3B8',
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderStyle: 'dashed',
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginRight: 10,
  },
  addPhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  photoThumbWrapper: {
    width: 90,
    height: 90,
    borderRadius: 14,
    position: 'relative',
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  photoThumbWrapperCover: {
    borderWidth: 2.5,
    borderColor: '#FF6A00',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  coverTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#FF6A00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  setCoverTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCoverTagText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownTriggerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownTriggerPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '75%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  sheetCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  sheetList: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  categoryRowActive: {
    backgroundColor: '#FFF7ED',
  },
  categoryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  categoryRowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryRowIconBoxActive: {
    backgroundColor: '#EA580C',
  },
  categoryRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  categoryRowTitleActive: {
    color: '#C2410C',
    fontWeight: '800',
  },
  categoryRowSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  conditionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  conditionChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  conditionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  conditionChipTextActive: {
    color: '#FFFFFF',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7ED',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#C2410C',
    lineHeight: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 14,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  audioSectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  audioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audioTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  ghanaBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ghanaBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C2410C',
  },
  audioSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  attachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attachedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  recordTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  recordIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordTriggerTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  recordingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  recordingTime: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  recordingSubtext: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelRecordBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  cancelRecordText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  doneRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  doneRecordText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  audioPlayerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 10,
  },
  playerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformCol: {
    flex: 1,
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 20,
    marginBottom: 2,
  },
  waveBar: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    minHeight: 4,
  },
  waveBarActive: {
    backgroundColor: '#EA580C',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerText: {
    fontSize: 9.5,
    color: '#64748B',
  },
  playerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reRecordBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  reRecordText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  deleteAudioBtn: {
    padding: 4,
  },
});
