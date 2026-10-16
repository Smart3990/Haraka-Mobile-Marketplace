import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Phone,
  Send,
  Paperclip,
  CheckCircle,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Eye,
  MessageSquare,
  X,
} from 'lucide-react-native';
import { INITIAL_CONVERSATIONS, INITIAL_LISTINGS, ChatMessage } from '../../src/lib/listingData';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const conversation =
    INITIAL_CONVERSATIONS.find((c) => c.id === id) ||
    INITIAL_CONVERSATIONS.find((c) => c.listingId === id) ||
    (() => {
      const matchedListing = INITIAL_LISTINGS.find((l) => l.id === id);
      if (matchedListing) {
        return {
          id: `conv-${matchedListing.id}`,
          listingId: matchedListing.id,
          listingTitle: matchedListing.title,
          listingPrice: matchedListing.price,
          listingCurrency: matchedListing.currency,
          listingImage: matchedListing.images[0],
          otherUser: {
            id: matchedListing.seller.id,
            name: matchedListing.seller.name,
            avatar: matchedListing.seller.avatar,
            isVerified: matchedListing.seller.isVerified,
            online: true,
            phone: matchedListing.seller.phone,
          },
          lastMessage: `Hello! Thanks for your interest in "${matchedListing.title}".`,
          lastMessageTime: 'Just now',
          unreadCount: 0,
          messages: [
            {
              id: `msg-${Date.now()}`,
              senderId: matchedListing.seller.id,
              text: `Hello! Thanks for your interest in "${matchedListing.title}". Feel free to make an offer or ask any questions.`,
              timestamp: 'Just now',
              isSeller: true,
            },
          ],
        };
      }
      return INITIAL_CONVERSATIONS[0];
    })();

  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);
  const [inputText, setInputText] = useState('');
  const [acceptedOfferIds, setAcceptedOfferIds] = useState<Record<string, boolean>>({
    'msg-mah-3': false,
  });

  const sendMessage = (textToSend?: string, isOffer = false, offerAmount?: number) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: 'Just now',
      isOffer,
      offerAmount,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');

    // Mock seller auto-response after 1.5 seconds
    setTimeout(() => {
      const sellerReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: conversation.otherUser.id,
        text: isOffer
          ? `Thanks for your offer of $${offerAmount}! Let's meet at Westlands Mall so you can test it.`
          : 'Thank you for reaching out! You can view it anytime today.',
        timestamp: 'Just now',
        isSeller: true,
      };
      setMessages((prev) => [...prev, sellerReply]);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>

        <View style={styles.userInfo}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: conversation.otherUser.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            {conversation.otherUser.online && <View style={styles.onlineBadge} />}
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{conversation.otherUser.name}</Text>
              {conversation.otherUser.isVerified && (
                <CheckCircle size={13} color="#16A34A" />
              )}
            </View>
            <Text style={styles.userStatus}>
              {conversation.otherUser.online ? 'Online now' : 'Active today'}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.callBtn}
          onPress={() => alert('Dialing seller phone...')}
        >
          <Phone size={18} color="#EA580C" />
        </Pressable>
      </View>

      {/* Pinned Listing Summary Bar */}
      <Pressable
        style={styles.pinnedListingBar}
        onPress={() => router.push(`/listing/${conversation.listingId}` as any)}
      >
        <Image
          source={{ uri: conversation.listingImage }}
          style={styles.pinnedThumb}
          contentFit="cover"
        />
        <View style={styles.pinnedDetails}>
          <Text style={styles.pinnedTitle} numberOfLines={1}>
            {conversation.listingTitle}
          </Text>
          <Text style={styles.pinnedPrice}>
            ${conversation.listingPrice.toLocaleString()}
          </Text>
        </View>
        <Text style={styles.viewAdLink}>View Ad</Text>
      </Pressable>

      {/* Safety Notice Strip */}
      <View style={styles.safetyStrip}>
        <ShieldCheck size={14} color="#15803D" />
        <Text style={styles.safetyStripText}>
          Haraka Buyer Protection: Meet in public places & verify item in person.
        </Text>
      </View>

      {/* Messages Feed */}
      <ScrollView
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';

          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isMe ? styles.messageRowMe : styles.messageRowOther,
              ]}
            >
              {!isMe && (
                <Image
                  source={{ uri: conversation.otherUser.avatar }}
                  style={styles.bubbleAvatar}
                  contentFit="cover"
                />
              )}

              {msg.isOffer ? (
                /* Image 4 Interactive Offer Card for Seller */
                <View style={styles.offerCardBox}>
                  {/* Image 4 Header: Thumbnail with OFFER PENDING Badge */}
                  <View style={styles.offerItemRow}>
                    <View style={styles.offerThumbWrap}>
                      <Image
                        source={{ uri: conversation.listingImage }}
                        style={styles.offerThumbImg}
                        contentFit="cover"
                      />
                      <View style={[
                        styles.offerPendingTag,
                        acceptedOfferIds[msg.id] ? styles.offerAcceptedTag : null,
                      ]}>
                        <Text style={styles.offerPendingTagText}>
                          {acceptedOfferIds[msg.id] ? 'ACCEPTED' : 'OFFER PENDING'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.offerItemDetails}>
                      <Text style={styles.offerItemTitle} numberOfLines={1}>
                        {conversation.listingTitle}
                      </Text>
                      <Text style={styles.offerItemPrice}>
                        GH₵ {conversation.listingPrice.toLocaleString()}
                      </Text>
                      <View style={styles.offerItemMeta}>
                        <Eye size={11} color="#64748B" />
                        <Text style={styles.offerMetaText}>56 views</Text>
                        <Text style={styles.offerMetaDot}>•</Text>
                        <Text style={styles.offerMetaHighlight}>
                          1 offer GH₵ {msg.offerAmount ? msg.offerAmount.toLocaleString() : '1,950'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Cash Offer Callout */}
                  <View style={styles.offerPriceBanner}>
                    <View>
                      <Text style={styles.offerPriceLabel}>OFFERED CASH PRICE</Text>
                      <Text style={styles.offerPriceVal}>
                        GH₵ {msg.offerAmount ? msg.offerAmount.toLocaleString() : '1,950'}
                      </Text>
                    </View>
                    <Text style={styles.cashPickupTag}>Cash on Pickup</Text>
                  </View>

                  <Text style={styles.offerNoteText}>"{msg.text}"</Text>

                  {/* Seller Action Controls */}
                  {acceptedOfferIds[msg.id] ? (
                    <View style={styles.acceptedBannerBox}>
                      <View style={styles.acceptedHeaderRow}>
                        <CheckCircle2 size={16} color="#059669" />
                        <Text style={styles.acceptedBannerTitle}>
                          Offer Accepted: GH₵ {msg.offerAmount ? msg.offerAmount.toLocaleString() : '1,950'}
                        </Text>
                      </View>
                      <Text style={styles.acceptedBannerSub}>
                        Deal confirmed! Coordinate meetup and cash on pickup in East Legon.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.offerActionsRow}>
                      <Pressable
                        style={styles.acceptOfferBtn}
                        onPress={() => {
                          setAcceptedOfferIds((prev) => ({ ...prev, [msg.id]: true }));
                          const acceptReply: ChatMessage = {
                            id: `msg-reply-${Date.now()}`,
                            senderId: 'me',
                            text: `🎉 You accepted the offer of GH₵ ${msg.offerAmount || 1950}! Ready for cash pickup in East Legon.`,
                            timestamp: 'Just now',
                            isSeller: true,
                          };
                          setMessages((prev) => [...prev, acceptReply]);
                        }}
                      >
                        <CheckCircle2 size={15} color="#064E3B" />
                        <Text style={styles.acceptOfferBtnText}>
                          Accept Offer (GH₵ {msg.offerAmount ? msg.offerAmount.toLocaleString() : '1,950'})
                        </Text>
                      </Pressable>

                      <Pressable
                        style={styles.declineOfferBtn}
                        onPress={() => {
                          const declineReply: ChatMessage = {
                            id: `msg-reply-${Date.now()}`,
                            senderId: 'me',
                            text: `Thank you for the offer! I can do GH₵ 2,050 minimum for pickup today.`,
                            timestamp: 'Just now',
                            isSeller: true,
                          };
                          setMessages((prev) => [...prev, declineReply]);
                        }}
                      >
                        <Text style={styles.declineOfferBtnText}>Counter</Text>
                      </Pressable>
                    </View>
                  )}

                  <Text style={styles.offerTimestampText}>{msg.timestamp}</Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isMe ? styles.messageTextMe : styles.messageTextOther,
                    ]}
                  >
                    {msg.text}
                  </Text>

                  <Text
                    style={[
                      styles.messageTime,
                      isMe ? styles.messageTimeMe : styles.messageTimeOther,
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Action Offer Chips */}
      <View style={styles.quickChipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <Pressable
            style={styles.quickChip}
            onPress={() => sendMessage('Is this still available?')}
          >
            <Text style={styles.quickChipText}>Is it available?</Text>
          </Pressable>

          <Pressable
            style={[styles.quickChip, styles.quickChipOffer]}
            onPress={() => sendMessage(`I offer $170 for quick cash pickup.`, true, 170)}
          >
            <Zap size={12} color="#EA580C" />
            <Text style={[styles.quickChipText, styles.quickChipTextOffer]}>Offer $170</Text>
          </Pressable>

          <Pressable
            style={[styles.quickChip, styles.quickChipOffer]}
            onPress={() => sendMessage(`I offer $175 for quick cash pickup.`, true, 175)}
          >
            <Zap size={12} color="#EA580C" />
            <Text style={[styles.quickChipText, styles.quickChipTextOffer]}>Offer $175</Text>
          </Pressable>

          <Pressable
            style={styles.quickChip}
            onPress={() => sendMessage('Can you deliver to my location?')}
          >
            <Text style={styles.quickChipText}>Can you deliver?</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Input Row */}
      <View style={styles.inputContainer}>
        <Pressable style={styles.attachmentBtn}>
          <Paperclip size={20} color="#64748B" />
        </Pressable>

        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => sendMessage()}
        />

        <Pressable
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim()}
        >
          <Send size={18} color={inputText.trim() ? '#EA580C' : '#94A3B8'} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginLeft: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CBD5E1',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  userStatus: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinnedListingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  pinnedThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  pinnedDetails: {
    flex: 1,
  },
  pinnedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  pinnedPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  viewAdLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  safetyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  safetyStripText: {
    fontSize: 10.5,
    color: '#15803D',
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageBubbleMe: {
    backgroundColor: '#EA580C',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  offerBubble: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: '#0F172A',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: '#94A3B8',
  },
  messageTimeOther: {
    color: '#94A3B8',
  },
  quickChipsBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickChipOffer: {
    backgroundColor: 'transparent',
    borderColor: '#EA580C',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickChipTextOffer: {
    color: '#EA580C',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  attachmentBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F1F5F9',
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 13.5,
    color: '#0F172A',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  offerCardBox: {
    width: '92%',
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FB923C',
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  offerItemRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  offerThumbWrap: {
    position: 'relative',
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
  },
  offerThumbImg: {
    width: '100%',
    height: '100%',
  },
  offerPendingTag: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: '#FF6A00',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offerAcceptedTag: {
    backgroundColor: '#059669',
  },
  offerPendingTagText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
  },
  offerItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  offerItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  offerItemPrice: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#B45309',
    marginTop: 1,
  },
  offerItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  offerMetaText: {
    fontSize: 10,
    color: '#64748B',
  },
  offerMetaDot: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  offerMetaHighlight: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9A3412',
  },
  offerPriceBanner: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerPriceLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.5,
  },
  offerPriceVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 1,
  },
  cashPickupTag: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#C2410C',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  offerNoteText: {
    fontSize: 11.5,
    color: '#334155',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    lineHeight: 16,
  },
  acceptedBannerBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 10,
    gap: 3,
  },
  acceptedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptedBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  acceptedBannerSub: {
    fontSize: 10.5,
    color: '#047857',
  },
  offerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
  },
  acceptOfferBtn: {
    flex: 1,
    backgroundColor: '#00E599',
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  acceptOfferBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#064E3B',
  },
  declineOfferBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineOfferBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  offerTimestampText: {
    fontSize: 9.5,
    color: '#94A3B8',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
});
